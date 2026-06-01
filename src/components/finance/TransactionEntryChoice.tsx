import { X, Edit3, Scan, ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePreferences } from '../../hooks/usePreferences';

export function TransactionEntryChoice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = usePreferences();
  const isOpen = searchParams.get('add_options') === 'true';

  const handleClose = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('add_options');
    navigate({ search: newParams.toString() }, { replace: true });
  };

  const handleChoice = (type: 'manual' | 'scan') => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('add_options');
    if (type === 'manual') {
      newParams.set('new_transaction', 'true');
    } else {
      newParams.set('scan', 'true');
    }
    navigate({ search: newParams.toString() }, { replace: true });
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-[120] animate-fade-in backdrop-blur-md"
        onClick={handleClose}
      />

      <div className="fixed inset-x-4 bottom-8 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[400px] bg-[var(--bg)] z-[130] flex flex-col animate-slide-up rounded-[32px] overflow-hidden shadow-2xl border border-[var(--border)]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2">
          <h2 className="text-[20px] font-bold text-[var(--text)]">{t('txn.addTransaction')}</h2>
          <button
            onClick={handleClose}
            aria-label={t('common.closeModal')}
            className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--text)] transition-colors hover:bg-[var(--border)] active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <button
            onClick={() => handleChoice('manual')}
            className="w-full flex items-center gap-4 p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[#15803D] hover:bg-[#15803D05] transition-all group active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-xl bg-[rgba(18,183,106,0.1)] text-[#15803D] flex items-center justify-center shrink-0">
              <Edit3 className="w-6 h-6" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-[16px] font-bold text-[var(--text)]">{t('txn.manualInput')}</h3>
              <p className="text-[12px] font-medium text-[var(--text-dim-2)] opacity-70">{t('txn.manualInputDesc')}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-[var(--text-dim-2)] opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => handleChoice('scan')}
            className="w-full flex items-center gap-4 p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[#15803D] hover:bg-[#15803D05] transition-all group active:scale-[0.98]"
          >
            <div className="w-12 h-12 rounded-xl bg-[rgba(18,183,106,0.1)] text-[#15803D] flex items-center justify-center shrink-0">
              <Scan className="w-6 h-6" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-[16px] font-bold text-[var(--text)]">{t('txn.scanReceipt')}</h3>
              <p className="text-[12px] font-medium text-[var(--text-dim-2)] opacity-70">{t('txn.scanReceiptDesc')}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-[var(--text-dim-2)] opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </button>
        </div>

        <div className="px-6 pb-8">
          <p className="text-[11px] text-center text-[var(--text-dim-2)] opacity-50">
            {t('scan.chooseMethod')}
          </p>
        </div>
      </div>
    </>
  );
}
