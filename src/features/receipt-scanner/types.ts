/**
 * Receipt OCR — Shared Types
 *
 * Used by:
 * - Claude Haiku 4.5 Vision API response
 * - Tesseract.js fallback parser
 * - ReceiptPreview editable card
 */

export interface LineItem {
  name: string;
  qty: number;
  unit_price: number;
  subtotal: number;
}

export interface ReceiptData {
  store_name: string;
  /** ISO 8601 date, e.g. "2026-04-30" */
  date: string;
  items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  /** e.g. "QRIS", "Cash", "Debit" */
  payment_method: string;
  /** e.g. "IDR" */
  currency: string;
}
