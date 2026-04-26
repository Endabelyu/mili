import { useState, useRef, useEffect, useMemo } from 'react';
import { X, Check, ChevronRight, Home, Delete, Plus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, transactionsApi, accountsApi, type Transaction } from '../../api/client';
import { queryKeys } from '../../lib/query-keys';
import { usePreferences } from '../../hooks/usePreferences';

// ─── Fallback emoji map (keyed by BE category.id) ───────────────────────────
const FALLBACK_EMOJI: Record<string, string> = {
  salary: '💰', freelance: '💻', investments: '📈', gifts: '🎁', 'other-income': '💵',
  food: '🍜', transport: '🚗', housing: '🏠', utilities: '💡', entertainment: '🎬',
  shopping: '🛍️', healthcare: '💊', education: '📚', travel: '✈️', 'other-expense': '📦',
};

// ─── Pastel background map ───────────────────────────────────────────────────
const CAT_BG: Record<string, string> = {
  salary: 'bg-emerald-50', freelance: 'bg-blue-50', investments: 'bg-emerald-50',
  gifts: 'bg-pink-50', 'other-income': 'bg-lime-50',
  food: 'bg-orange-50', transport: 'bg-violet-50', housing: 'bg-orange-50',
  utilities: 'bg-sky-50', entertainment: 'bg-blue-50', shopping: 'bg-rose-50',
  healthcare: 'bg-rose-50', education: 'bg-indigo-50', travel: 'bg-teal-50',
  'other-expense': 'bg-gray-50',
};

// ─── Amount formatting helper ────────────────────────────────────────────────
function formatDisplay(val: string): string {
  const num = parseInt(val || '0', 10);
  if (isNaN(num) || num === 0) return '0';
  return num.toLocaleString('id-ID');
}

export function NewTransactionModal() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { t } = usePreferences();
  
  const [type, setType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAccountSelect, setShowAccountSelect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = searchParams.get('new_transaction') === 'true';

  const handleClose = () => {
    // Remove the ?new_transaction=true from URL without going back in history
    searchParams.delete('new_transaction');
    navigate({ search: searchParams.toString() }, { replace: true });
    // Reset state after close animation (approx)
    setTimeout(() => {
      setAmount('');
      setDescription('');
      setSelectedCategory(null);
    }, 300);
  };

  // Fetch real categories from BE
  const { data: categories } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => categoriesApi.list(),
    enabled: isOpen, // Only fetch when modal is open
  });

  // Fetch accounts from BE
  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.list(),
    enabled: isOpen,
  });

  // Set default account if none selected
  useEffect(() => {
    if (accounts && accounts.length > 0 && !selectedAccount) {
      const defaultAcc = accounts.find(a => a.isDefault) || accounts[0];
      setSelectedAccount(defaultAcc.id);
    }
  }, [accounts, selectedAccount]);

  // Filter categories by type
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    const targetType = type === 'transfer' ? 'expense' : type;
    return categories.filter(c => c.type === targetType || c.type === 'both');
  }, [categories, type]);

  // Auto-focus desktop input
  useEffect(() => {
    if (isOpen && window.innerWidth >= 1024 && inputRef.current) {
      // Small delay to let modal animate in before focusing
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ── Save mutation ──
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('📦');

  const addCategoryMutation = useMutation({
    mutationFn: (data: { label: string; color: string; icon: string; type: string }) => categoriesApi.create(data),
    onSuccess: (newCat) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setSelectedCategory(newCat.id);
      setIsAddingCategory(false);
      setNewCatLabel('');
    },
  });

  const handleAddCategory = () => {
    if (!newCatLabel) return;
    addCategoryMutation.mutate({
      label: newCatLabel,
      color: '#12B76A', // default green
      icon: newCatEmoji,
      type: type === 'transfer' ? 'expense' : type,
    });
  };

  const saveMutation = useMutation({
    mutationFn: (data: { type: string; amount: string; categoryId: string; accountId?: string; description?: string; date: string }) =>
      transactionsApi.create(data as Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>),
    onSuccess: () => {
      // Invalidate all related queries so pages refresh
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      handleClose();
      setSaving(false);
    },
    onError: (err) => {
      console.error('Failed to save transaction:', err);
      setSaving(false);
    },
  });

  const handleSave = () => {
    if (!amount || amount === '0' || !selectedCategory) return;
    setSaving(true);

    const txType = type === 'transfer' ? 'expense' : type;
    saveMutation.mutate({
      type: txType,
      amount: amount, // BE accepts string and converts
      categoryId: selectedCategory,
      accountId: selectedAccount || undefined,
      description: description || undefined,
      date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    });
  };

  // ── Keypad handler (mobile/tablet only) ──
  const handleKeypad = (key: string) => {
    if (key === 'backspace') {
      setAmount((prev) => prev.slice(0, -1));
      return;
    }
    if (key === '.' && amount.includes('.')) return;
    if (amount.length >= 15) return;
    setAmount((prev) => prev + key);
  };

  // ── Desktop keyboard input handler ──
  const handleDesktopInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setAmount(raw);
  };

  if (!isOpen) return null;

  const amountColor = type === 'expense' ? 'text-[#F04438]' : 'text-[#12B76A]';
  const displayAmount = formatDisplay(amount);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 z-[90] animate-fade-in backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal / Sheet */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSave(); }}
        className="fixed inset-x-0 bottom-0 top-8 lg:inset-auto lg:top-[5%] lg:bottom-[5%] lg:left-1/2 lg:-translate-x-1/2 lg:w-[480px] lg:h-[90vh] lg:rounded-[32px] lg:shadow-2xl bg-[var(--bg)] z-[100] flex flex-col animate-slide-up overflow-hidden rounded-t-[32px]"
      >
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between p-4 shrink-0">
          <button 
            type="button"
            onClick={handleClose} 
            aria-label="Tutup modal"
            className="relative z-[110] w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--text)] transition-colors hover:bg-[var(--border)] active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex p-1 bg-[var(--muted)] rounded-[14px]">
            {(['expense', 'income', 'transfer'] as const).map((tp) => (
              <button
                key={tp}
                type="button"
                onClick={() => { setType(tp); setSelectedCategory(null); }}
                className={`px-4 py-1.5 text-[13px] font-bold rounded-[11px] transition-all ${
                  type === tp ? 'bg-[var(--card)] text-[var(--text)] shadow-sm' : 'text-[var(--text-dim-2)]'
                }`}
              >
                {tp === 'expense' ? t('txn.newExpense') : tp === 'income' ? t('txn.newIncome') : t('txn.transfer')}
              </button>
            ))}
          </div>

        </div>

        {/* ─── Amount Display ─── */}
        <div className="flex flex-col items-center justify-center py-2 lg:py-4 px-6 shrink-0">
          <p className="text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-widest mb-2 opacity-60">{t('txn.amount')}</p>

          {/* Desktop: real keyboard input */}
          <div className="hidden lg:flex items-baseline gap-1.5">
            <span className={`text-[32px] font-bold ${amountColor}`}>Rp</span>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              value={displayAmount === '0' && amount === '' ? '' : displayAmount}
              onChange={handleDesktopInput}
              placeholder="0"
              className={`text-[56px] font-bold tracking-[-0.04em] tabular-nums bg-transparent outline-none border-none text-center max-w-[400px] ${amountColor} placeholder:opacity-40`}
              style={{ caretColor: type === 'expense' ? '#F04438' : '#12B76A' }}
            />
          </div>

          {/* Mobile/Tablet: display only */}
          <div className="flex lg:hidden items-baseline gap-1.5">
            <span className={`text-[20px] font-bold ${amountColor}`}>Rp</span>
            <span className={`text-[40px] font-bold tracking-[-0.04em] tabular-nums ${amountColor}`}>
              {displayAmount}
            </span>
          </div>
        </div>

        {/* ─── Scrollable Content Area ─── */}
        <div className="flex-1 overflow-y-auto pb-10">
          {/* Details Section */}
          <div className="px-6 space-y-3 relative">
          <button 
            onClick={() => setShowAccountSelect(!showAccountSelect)}
            className="w-full flow-card p-4 flex items-center gap-4 text-left relative z-10"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: accounts?.find(a => a.id === selectedAccount)?.color ? `${accounts.find(a => a.id === selectedAccount)?.color}15` : 'rgba(18,183,106,0.08)' }}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: accounts?.find(a => a.id === selectedAccount)?.color || '#12B76A' }}>
                <Home className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-wider mb-0.5">{t('txn.account')}</p>
              <p className="text-[15px] font-bold text-[var(--text)] truncate">
                {accounts?.find(a => a.id === selectedAccount)?.name || 'Pilih Akun...'}
              </p>
            </div>
            <ChevronRight className={`w-5 h-5 text-[var(--text-dim-2)] opacity-50 transition-transform ${showAccountSelect ? 'rotate-90' : ''}`} />
          </button>

          {/* Account Select Dropdown */}
          {showAccountSelect && accounts && accounts.length > 0 && (
            <div className="absolute top-[68px] left-6 right-6 bg-[var(--card)] rounded-2xl shadow-xl border border-[var(--border)] z-20 overflow-hidden animate-fade-in">
              <div className="max-h-[200px] overflow-y-auto">
                {accounts.map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => { setSelectedAccount(acc.id); setShowAccountSelect(false); }}
                    className="w-full flex items-center gap-3 p-4 hover:bg-[var(--muted)] transition-colors border-b border-[var(--border)] last:border-0"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: acc.color }}>
                      <Home className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[14px] font-bold text-[var(--text)] truncate">{acc.name}</span>
                    {selectedAccount === acc.id && <Check className="w-4 h-4 text-[#12B76A] ml-auto" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>
          )}

            <div className="flow-card p-4 relative z-0">
              <p className="text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-wider mb-1">{t('txn.description')}</p>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('txn.descriptionPlaceholder')}
                className="w-full bg-transparent text-[15px] font-medium text-[var(--text)] focus:outline-none placeholder:text-[var(--text-dim-2)] placeholder:opacity-40"
              />
            </div>

            {/* ─── Category Grid (from real BE data) ─── */}
            <div className="px-6 pt-6 pb-20">
              <p className="text-[14px] font-bold text-[var(--text)] mb-5">{t('txn.category')}</p>
              {filteredCategories.length > 0 ? (
                <div className="grid grid-cols-4 gap-y-8 gap-x-4">
                  {filteredCategories.map((cat) => {
                    const emoji = cat.icon || FALLBACK_EMOJI[cat.id] || '📦';
                    const bg = CAT_BG[cat.id] || 'bg-gray-50';
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className="flex flex-col items-center gap-2.5 group"
                      >
                        <div className={`w-14 h-14 rounded-[20px] transition-all flex items-center justify-center text-[24px] shadow-sm ${
                          selectedCategory === cat.id
                            ? 'bg-[#12B76A] scale-110 ring-2 ring-[#12B76A] ring-offset-2 ring-offset-[var(--bg)]'
                            : `${bg} group-hover:scale-105`
                        }`}>
                          <span className={selectedCategory === cat.id ? 'grayscale brightness-200' : ''}>{emoji}</span>
                        </div>
                        <span className={`text-[12px] font-bold transition-colors text-center leading-tight ${
                          selectedCategory === cat.id ? 'text-[var(--text)]' : 'text-[var(--text-dim-2)]'
                        }`}>
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                  
                  {/* Add Category Button */}
                  <button
                    onClick={() => setIsAddingCategory(true)}
                    className="flex flex-col items-center gap-2.5 group"
                  >
                    <div className="w-14 h-14 rounded-[20px] bg-[var(--muted)] flex items-center justify-center text-[24px] shadow-sm group-hover:scale-105 transition-all text-[var(--text-dim-2)] border border-dashed border-[var(--border)]">
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-[12px] font-bold text-[var(--text-dim-2)] text-center leading-tight">
                      Lainnya
                    </span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-pulse flex gap-4">
                    {[1,2,3,4].map(i => <div key={i} className="w-14 h-14 rounded-[20px] bg-[var(--muted)]" />)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Sticky Bottom Section (Keypad + Footer) ─── */}
        <div className="shrink-0 bg-[var(--bg)] border-t border-[var(--border)] z-[110] shadow-[0_-15px_40px_rgba(0,0,0,0.08)]">
          <div className="lg:hidden grid grid-cols-3 gap-1.5 p-3 bg-[var(--muted)]/30">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleKeypad(key)}
                aria-label={key === 'backspace' ? 'Hapus' : key}
                className="h-14 flex items-center justify-center text-[24px] font-bold text-[var(--text)] bg-[var(--card)] active:bg-[var(--border)] rounded-2xl shadow-sm border border-[var(--border)]/50 transition-all active:scale-[0.97]"
              >
                {key === 'backspace' ? <Delete className="w-6 h-6 text-[#F04438]" /> : key}
              </button>
            ))}
          </div>
          
          {/* Footer Section */}
          <div className="p-5 bg-[var(--bg)] pb-safe">
            <button
              onClick={handleSave}
              disabled={!amount || amount === '0' || !selectedCategory || saving}
              className="w-full h-15 rounded-[20px] bg-[#12B76A] text-white font-bold text-[16px] shadow-2xl shadow-[#12B76A40] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-5 h-5" strokeWidth={3} />
              )}
              {saving ? t('common.loading') : t('txn.saveTransaction')}
            </button>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
          .animate-fade-in { animation: fade-in 0.3s ease-out; }
          .pb-safe { padding-bottom: max(env(safe-area-inset-bottom), 8px); }
        `}} />

        {/* ─── Add Category Overlay Modal ─── */}
        {isAddingCategory && (
          <div className="absolute inset-0 z-[150] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsAddingCategory(false)} />
            <div className="relative w-full bg-[var(--card)] rounded-[24px] p-6 shadow-2xl animate-fade-in border border-[var(--border)]">
              <h3 className="text-[18px] font-bold text-[var(--text)] mb-4">Tambah Kategori</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-wider mb-2 block">Nama Kategori</label>
                  <input 
                    autoFocus
                    value={newCatLabel}
                    onChange={(e) => setNewCatLabel(e.target.value)}
                    placeholder="Misal: Langganan, Pulsa..."
                    className="w-full bg-[var(--muted)] border border-transparent focus:border-[#12B76A] rounded-[16px] px-4 py-3.5 text-[15px] font-semibold text-[var(--text)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-wider mb-2 block">Emoji</label>
                  <div className="flex gap-2">
                    {['📦', '🎁', '🎮', '💡', '🏠', '🛒'].map(e => (
                      <button 
                        key={e}
                        onClick={() => setNewCatEmoji(e)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-[20px] transition-all ${newCatEmoji === e ? 'bg-[#12B76A] scale-110' : 'bg-[var(--muted)] hover:bg-[var(--border)]'}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setIsAddingCategory(false)}
                    className="flex-1 py-3 rounded-xl bg-[var(--muted)] text-[var(--text)] font-bold text-[14px]"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleAddCategory}
                    disabled={!newCatLabel || addCategoryMutation.isPending}
                    className="flex-2 py-3 px-6 rounded-xl bg-[#12B76A] text-white font-bold text-[14px] disabled:opacity-50"
                  >
                    {addCategoryMutation.isPending ? '...' : 'Tambah'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </>
  );
}
