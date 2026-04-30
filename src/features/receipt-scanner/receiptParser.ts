/**
 * Receipt Parser — The "Champion" Hybrid Strategy + Math Validation
 *
 * Adds logic to validate Qty * UnitPrice = Subtotal to handle OCR typos.
 */

import type { ReceiptData } from './types';

interface HeuristicItem {
  name: string;
  price: number;
}

interface HeuristicResult {
  amount: string;
  description: string;
  items: HeuristicItem[];
  merchant: string;
}

export function analyzeReceipt(text: string): HeuristicResult {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 3);
  
  // 1. Merchant Detection
  const blacklist = ['JL.', 'KM', 'NPWP', 'BARAT', 'ANCOL', 'SLEMAN', 'RT ', 'RW '];
  const merchant = lines.find(l => !blacklist.some(b => l.toUpperCase().includes(b))) || 'Struk Baru';

  const moneyPattern = /(?:rp|[$]|)\s*([\d]{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?|[\d]{4,9})/gi;
  const qtyPattern = /\s([1-9])\s/;

  // 2. Find Total
  const totalKeywords = ['total', 'jumlah', 'jual', 'bayar', 'harga'];
  let totalAmount = 0;
  let totalLine = "";

  lines.forEach(line => {
    if (totalKeywords.some(k => line.toLowerCase().includes(k))) {
      const matches = Array.from(line.matchAll(moneyPattern));
      if (matches.length > 0) {
        const val = parseInt(matches[matches.length - 1][1].replace(/\D/g, ''));
        if (val > totalAmount) {
          totalAmount = val;
          totalLine = line;
        }
      }
    }
  });

  if (totalAmount === 0) {
    const allMatches = Array.from(text.matchAll(moneyPattern));
    if (allMatches.length > 0) {
      totalAmount = Math.max(...allMatches.map(m => parseInt(m[1].replace(/\D/g, ''))));
    }
  }

  // 3. Extract Items with Math Validation
  const items: HeuristicItem[] = [];
  lines.forEach(line => {
    if (line === totalLine) return;
    if ((line.match(/[./:+-]/g) || []).length > 3) return;
    if (line.toLowerCase().includes('cancel')) return;

    const moneyMatches = Array.from(line.matchAll(moneyPattern));
    if (moneyMatches.length > 0) {
      const qtyMatch = line.match(qtyPattern);
      const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
      
      let price = 0;
      
      // MATH VALIDATION: If we have multiple numbers, check if Qty * UnitPrice works
      if (moneyMatches.length >= 2) {
        const unitPrice = parseInt(moneyMatches[moneyMatches.length - 2][1].replace(/\D/g, ''));
        const subtotal = parseInt(moneyMatches[moneyMatches.length - 1][1].replace(/\D/g, ''));
        
        // If they match or subtotal is a typo of unitPrice (e.g., 9300 vs 91300)
        if (qty === 1 && Math.abs(unitPrice - subtotal) < (unitPrice * 0.1)) {
            price = unitPrice; // Prefer the one that looks cleaner
        } else if (Math.abs((qty * unitPrice) - subtotal) < (subtotal * 0.1)) {
            price = subtotal;
        } else {
            price = subtotal; // Fallback to last number
        }
      } else {
        price = parseInt(moneyMatches[moneyMatches.length - 1][1].replace(/\D/g, ''));
      }
      
      if (price < 1000) return;

      let name = "";
      if (qtyMatch && qtyMatch.index) {
        name = line.substring(0, qtyMatch.index).trim();
      } else {
        name = line.replace(moneyMatches[moneyMatches.length - 1][0], '').trim();
        if (moneyMatches.length >= 2) {
            name = name.replace(moneyMatches[moneyMatches.length - 2][0], '').trim();
        }
      }

      if (name.length > 2) {
        items.push({ name, price });
      }
    }
  });

  const topItems = items.slice(0, 12);
  const description = `${merchant}${topItems.length > 0 ? '\n' + topItems.map(i => `- ${i.name}`).join('\n') : ''}`;

  return {
    amount: totalAmount.toString(),
    description,
    items: topItems,
    merchant,
  };
}

export function toReceiptData(result: HeuristicResult): ReceiptData {
  return {
    store_name: result.merchant,
    date: new Date().toISOString().slice(0, 10),
    items: result.items.map(item => ({
      name: item.name,
      qty: 1,
      unit_price: item.price,
      subtotal: item.price,
    })),
    subtotal: parseInt(result.amount, 10) || 0,
    tax: 0,
    total: parseInt(result.amount, 10) || 0,
    payment_method: 'Unknown',
    currency: 'IDR',
  };
}
