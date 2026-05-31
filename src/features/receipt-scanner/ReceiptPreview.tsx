/**
 * ReceiptPreview — Editable confirmation card for scanned receipt data
 *
 * Shows parsed receipt info (store, items, total) in an editable format
 * before committing to the transaction form. Users can correct OCR mistakes.
 */

import { useState } from 'react';
import { Check, RotateCcw, Store, Receipt, CreditCard, Calendar } from 'lucide-react';
import type { ReceiptData } from './types';
import { usePreferences } from '../../hooks/usePreferences';

interface ReceiptPreviewProps {
  data: ReceiptData;
  scanMode: 'free' | 'ai' | null;
  onConfirm: (data: ReceiptData) => void;
  onRescan: () => void;
}

export function ReceiptPreview({ data, scanMode, onConfirm, onRescan }: ReceiptPreviewProps) {
  const { t } = usePreferences();
  const [editData, setEditData] = useState<ReceiptData>(data);

  const updateField = <K extends keyof ReceiptData>(key: K, value: ReceiptData[K]) => {
    setEditData(prev => ({ ...prev, [key]: value }));
  };

  const handleTotalChange = (val: string) => {
    const numeric = parseInt(val.replace(/\D/g, ''), 10) || 0;
    updateField('total', numeric);
  };

  const formatMoney = (val: number) => {
    if (!val || isNaN(val)) return 'Rp 0';
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  return (
    <div className="flex flex-col gap-4 p-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-[#15803D]" />
          <span className="text-[12px] font-bold text-white/60 uppercase tracking-widest">
            Hasil Scan
          </span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          scanMode === 'ai'
            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        }`}>
          {scanMode === 'ai' ? '🤖 AI' : '🆓 Gratis'}
        </span>
      </div>

      {/* Store + Date */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
          <Store className="w-4 h-4 text-white/30 shrink-0" />
          <input
            type="text"
            value={editData.store_name || ''}
            onChange={e => updateField('store_name', e.target.value)}
            className="bg-transparent text-white text-[14px] font-bold w-full outline-none placeholder:text-white/20"
            placeholder="Nama Toko"
          />
        </div>
        <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
          <Calendar className="w-4 h-4 text-white/30 shrink-0" />
          <input
            type="date"
            value={editData.date || ''}
            onChange={e => updateField('date', e.target.value)}
            className="bg-transparent text-white text-[14px] font-medium w-full outline-none"
          />
        </div>
      </div>

      {/* Items */}
      {editData.items && editData.items.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider px-1">Item</p>
          <div className="bg-white/5 rounded-xl border border-white/10 divide-y divide-white/5 overflow-hidden">
            {editData.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-[13px] text-white/80 font-medium truncate flex-1">
                  {item.qty > 1 ? `${item.qty}× ` : ''}{item.name}
                </span>
                <span className="text-[12px] text-white/50 font-bold tabular-nums ml-3">
                  {item.subtotal > 0 ? formatMoney(item.subtotal) : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total (editable) */}
      <div className="flex items-center justify-between bg-[#15803D]/10 rounded-xl px-4 py-3 border border-[#15803D]/30">
        <span className="text-[12px] font-bold text-[#15803D] uppercase tracking-wider">Total</span>
        <div className="flex items-center gap-1">
          <span className="text-[14px] text-[#15803D] font-bold">Rp</span>
          <input
            type="text"
            inputMode="numeric"
            value={editData.total?.toLocaleString('id-ID') || '0'}
            onChange={e => handleTotalChange(e.target.value)}
            className="bg-transparent text-[18px] font-bold text-[#15803D] w-32 text-right outline-none tabular-nums"
          />
        </div>
      </div>

      {/* Payment method */}
      {editData.payment_method && editData.payment_method !== 'Unknown' && (
        <div className="flex items-center gap-2 px-1">
          <CreditCard className="w-3.5 h-3.5 text-white/30" />
          <span className="text-[11px] text-white/40 font-medium">{editData.payment_method}</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 mt-2">
        <button
          onClick={onRescan}
          className="flex-1 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-[13px] font-bold text-white/60 transition-all active:scale-[0.96] hover:bg-white/10"
        >
          <RotateCcw className="w-4 h-4" />
          {t('scan.rescan')}
        </button>
        <button
          onClick={() => onConfirm(editData)}
          className="flex-[2] h-11 rounded-xl bg-[#15803D] flex items-center justify-center gap-2 text-[13px] font-bold text-white transition-all active:scale-[0.96] shadow-lg shadow-[#15803D30] hover:bg-[#0f9d5b]"
        >
          <Check className="w-4 h-4" />
          {t('scan.saveTransaction')}
        </button>
      </div>
    </div>
  );
}
