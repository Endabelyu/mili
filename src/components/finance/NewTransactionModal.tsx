import { useState, useRef, useEffect, useMemo } from 'react';
import { X, Check, Home, Trash2, Plus, AlertCircle, Calendar, Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, transactionsApi, accountsApi, type Transaction } from '../../api/client';
import { queryKeys } from '../../lib/query-keys';
import { usePreferences } from '../../hooks/usePreferences';
import { CategoryIcon } from '../ui/CategoryIcon';
import { MobileDatePicker } from '../ui/MobileDatePicker';


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
  const [amount, setAmount] = useState(searchParams.get('amount') || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [toAccountId, setToAccountId] = useState<string | null>(null);
  const [description, setDescription] = useState(searchParams.get('description') || '');
  const [date, setDate] = useState(searchParams.get('date') || new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAccountSelect, setShowAccountSelect] = useState(false);
  const [showToAccountSelect, setShowToAccountSelect] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = searchParams.get('new_transaction') === 'true' || searchParams.get('edit_transaction_id') !== null;
  const editId = searchParams.get('edit_transaction_id');

  const handleClose = () => {
    // Remove the ?new_transaction=true from URL without going back in history
    searchParams.delete('new_transaction');
    searchParams.delete('edit_transaction_id');
    searchParams.delete('amount');
    searchParams.delete('description');
    navigate({ search: searchParams.toString() }, { replace: true });
    // Reset state after close animation (approx)
    setTimeout(() => {
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().slice(0, 10));
      setSelectedCategory(null);
      setToAccountId(null);
      setShowDeleteConfirm(false);
      setDeleting(false);
      setCategorySearch('');
    }, 300);
  };

  // Fetch transaction if editing
  const { data: txnData, isError: isTxnError } = useQuery({
    queryKey: ['transactions', editId],
    queryFn: () => transactionsApi.get(editId!),
    enabled: !!editId && !deleting && !showDeleteConfirm,
    retry: false,
  });

  // Handle fetch error (e.g. 404)
  useEffect(() => {
    if (isTxnError && editId) {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      handleClose();
    }
  }, [isTxnError, editId]);

  // Populate state when editing
  useEffect(() => {
    if (txnData && editId) {
      setType(txnData.type as 'expense' | 'income' | 'transfer');
      setAmount(String(Math.abs(parseFloat(String(txnData.amount))).toFixed(0)));
      setSelectedCategory(txnData.categoryId ?? null);
      setSelectedAccount(txnData.accountId ?? null);
      setToAccountId(txnData.toAccountId ?? null);
      setDescription(txnData.description || '');
      if (txnData.date) {
        setDate(new Date(txnData.date).toISOString().slice(0, 10));
      }
    }
  }, [txnData, editId]);

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
    if (accounts && accounts.length > 0) {
      if (!selectedAccount) {
        const defaultAcc = accounts.find(a => a.isDefault) || accounts[0];
        setSelectedAccount(defaultAcc.id);
      }
      // For transfer, set a default toAccount that is different from selectedAccount
      if (type === 'transfer' && !toAccountId) {
        const otherAcc = accounts.find(a => a.id !== selectedAccount) || accounts[1] || accounts[0];
        setToAccountId(otherAcc.id);
      }
    }
  }, [accounts, selectedAccount, type, toAccountId]);

  // Filter categories by type
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (type === 'transfer') {
      return categories;
    }
    return categories.filter(c => c.type === type || c.type === 'both');
  }, [categories, type]);

  const searchedCategories = useMemo(() => {
    if (!categorySearch.trim()) return filteredCategories;
    const q = categorySearch.toLowerCase();
    return filteredCategories.filter(c => c.label.toLowerCase().includes(q));
  }, [filteredCategories, categorySearch]);

  // Auto-select category if transfer and only one available
  useEffect(() => {
    if (type === 'transfer' && !selectedCategory && categories) {
      const transferCat = categories.find(c => c.id === 'transfer');
      if (transferCat) setSelectedCategory(transferCat.id);
    }
  }, [type, categories, selectedCategory]);

  // Sync from URL params (for Scanner)
  useEffect(() => {
    const urlAmount = searchParams.get('amount');
    const urlDesc = searchParams.get('description');
    const urlDate = searchParams.get('date');
    if (urlAmount) setAmount(urlAmount);
    if (urlDesc) setDescription(urlDesc);
    if (urlDate) setDate(urlDate);
  }, [searchParams]);

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
      if (window.innerWidth >= 1024) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    onError: () => {},
  });

  const handleAddCategory = () => {
    if (!newCatLabel) return;
    addCategoryMutation.mutate({
      label: newCatLabel,
      color: '#15803D', // default green
      icon: newCatEmoji,
      type: type === 'transfer' ? 'expense' : type,
    });
  };

  const saveMutation = useMutation({
    mutationFn: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => transactionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      handleClose();
      setSaving(false);
    },
    onError: () => setSaving(false),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Transaction>) => transactionsApi.update(editId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      handleClose();
      setSaving(false);
    },
    onError: () => setSaving(false),
  });

  const deleteMutation = useMutation({
    mutationFn: () => transactionsApi.delete(editId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      handleClose();
      setDeleting(false);
    },
    onError: () => setDeleting(false),
  });

  const handleSave = () => {
    if (!amount || amount === '0' || !selectedCategory) return;
    if (type === 'transfer' && (!selectedAccount || !toAccountId || selectedAccount === toAccountId)) return;
    
    setSaving(true);

    const payload = {
      type: type,
      amount: amount, 
      categoryId: selectedCategory,
      accountId: selectedAccount || undefined,
      toAccountId: toAccountId || undefined,
      description: description || null,
      date: date || new Date().toISOString().slice(0, 10),
    };

    if (editId) {
      updateMutation.mutate(payload);
    } else {
      saveMutation.mutate(payload);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setDeleting(true);
    deleteMutation.mutate();
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

  const amountColor = type === 'expense' ? 'text-[#F04438]' : 'text-[#15803D]';
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
            aria-label={t('common.closeModal')}
            className="relative z-[110] w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--text)] transition-colors hover:bg-[var(--border)] active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex p-1 bg-[var(--muted)] rounded-[14px]">
            {editId ? (
              <span className="px-6 py-1.5 text-[14px] font-bold text-[var(--text)]">
                {t('txn.editTransaction')}
              </span>
            ) : (
              (['expense', 'income', 'transfer'] as const).map((tp) => (
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
              ))
            )}
          </div>

          {editId ? (
            <button 
              type="button"
              onClick={handleDelete}
              className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center transition-all active:scale-95"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-10" />
          )}

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
              aria-label={t('txn.amount')}
              className={`text-[56px] font-bold tracking-[-0.04em] tabular-nums bg-transparent outline-none border-none text-center max-w-[400px] ${amountColor} placeholder:opacity-40`}
              style={{ caretColor: type === 'expense' ? '#F04438' : '#15803D' }}
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
            {/* Account Selector(s) */}
            <div className={`grid ${type === 'transfer' ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
              {/* From Account */}
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => { setShowAccountSelect(!showAccountSelect); setShowToAccountSelect(false); }}
                  className="w-full flow-card p-4 flex flex-col gap-1 text-left relative z-10"
                >
                  <p className="text-[10px] font-bold text-[var(--text-dim-2)] uppercase tracking-wider">
                    {type === 'transfer' ? t('common.fromAccount') : t('txn.account')}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: accounts?.find(a => a.id === selectedAccount)?.color || '#15803D' }}>
                      <Home className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-[14px] font-bold text-[var(--text)] truncate">
                      {accounts?.find(a => a.id === selectedAccount)?.name || t('common.select')}
                    </p>
                  </div>
                </button>

                {/* From Account Dropdown */}
                {showAccountSelect && accounts && accounts.length > 0 && (
                  <div className="absolute top-[105%] left-0 right-0 bg-[var(--card)] rounded-2xl shadow-xl border border-[var(--border)] z-[20] overflow-hidden animate-fade-in">
                    <div className="max-h-[200px] overflow-y-auto">
                      {accounts.map(acc => (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => { setSelectedAccount(acc.id); setShowAccountSelect(false); }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-[var(--muted)] transition-colors border-b border-[var(--border)] last:border-0"
                        >
                          <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: acc.color }}>
                            <Home className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-[13px] font-bold text-[var(--text)] truncate">{acc.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* To Account (Transfer Only) */}
              {type === 'transfer' && (
                <div className="relative">
                  <button 
                    type="button"
                    onClick={() => { setShowToAccountSelect(!showToAccountSelect); setShowAccountSelect(false); }}
                    className="w-full flow-card p-4 flex flex-col gap-1 text-left relative z-10 border-blue-500/20"
                  >
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Ke Akun</p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: accounts?.find(a => a.id === toAccountId)?.color || '#2E90FA' }}>
                        <Home className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-[14px] font-bold text-[var(--text)] truncate">
                        {accounts?.find(a => a.id === toAccountId)?.name || t('common.select')}
                      </p>
                    </div>
                  </button>

                  {/* To Account Dropdown */}
                  {showToAccountSelect && accounts && accounts.length > 0 && (
                    <div className="absolute top-[105%] left-0 right-0 bg-[var(--card)] rounded-2xl shadow-xl border border-[var(--border)] z-[20] overflow-hidden animate-fade-in">
                      <div className="max-h-[200px] overflow-y-auto">
                        {accounts.map(acc => (
                          <button
                            key={acc.id}
                            type="button"
                            disabled={acc.id === selectedAccount}
                            onClick={() => { setToAccountId(acc.id); setShowToAccountSelect(false); }}
                            className={`w-full flex items-center gap-3 p-3 hover:bg-[var(--muted)] transition-colors border-b border-[var(--border)] last:border-0 ${acc.id === selectedAccount ? 'opacity-30' : ''}`}
                          >
                            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: acc.color }}>
                              <Home className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-[13px] font-bold text-[var(--text)] truncate">{acc.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>


            <MobileDatePicker
              value={date ? new Date(date) : undefined}
              onChange={(newDate) => {
                // Adjust for timezone offset to format consistently
                const offset = newDate.getTimezoneOffset();
                const adjusted = new Date(newDate.getTime() - offset * 60 * 1000);
                setDate(adjusted.toISOString().slice(0, 10));
              }}
              renderTrigger={(open) => (
                <div 
                  className="flow-card p-4 relative cursor-pointer z-0"
                  onClick={open}
                >
                  <p className="text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-wider mb-1">{t('txn.date')}</p>
                  <div className="relative flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[var(--text-dim-2)] shrink-0" />
                    <span className="text-[15px] font-medium text-[var(--text)]">
                      {date ? new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : t('common.select')}
                    </span>
                  </div>
                </div>
              )}
            />

            <div className="flow-card p-4 relative z-0">
              <p className="text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-wider mb-1">{t('txn.description')}</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('txn.descriptionPlaceholder')}
                aria-label={t('txn.description')}
                rows={3}
                maxLength={5000}
                className="w-full bg-transparent text-[15px] font-medium text-[var(--text)] focus:outline-none placeholder:text-[var(--text-dim-2)] placeholder:opacity-40 resize-none min-h-[90px]"
              />
            </div>

            {/* ─── Category Grid (from real BE data) ─── */}
            <div className="px-6 pt-6 pb-20">
              <p className="text-[14px] font-bold text-[var(--text)] mb-3">{t('txn.category')}</p>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim-2)]" />
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder={t('common.searchCategory')}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--muted)] text-[14px] font-medium text-[var(--text)] placeholder:text-[var(--text-dim-2)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>
              {searchedCategories.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-y-6 gap-x-2 sm:gap-x-4">
                  {searchedCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        if (window.innerWidth >= 1024) inputRef.current?.focus();
                      }}
                      className="flex flex-col items-center gap-2 group w-full"
                    >
                      <div className={`transition-all ${
                        selectedCategory === cat.id ? 'scale-110 ring-2 ring-[#15803D] ring-offset-2 ring-offset-[var(--bg)] rounded-[20px] bg-[var(--accent-tint)]' : 'group-hover:scale-105'
                      }`}>
                        <CategoryIcon 
                          category={cat.label} 
                          icon={cat.icon} 
                          size="lg" 
                          label={cat.label}
                        />
                      </div>
                    </button>
                  ))}
                  
                  {/* Add Category Button */}
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(true)}
                    className="flex flex-col items-center gap-2 group w-full"
                  >
                    <div className="w-12 h-12 rounded-[16px] bg-[var(--muted)] flex items-center justify-center text-[24px] shadow-sm group-hover:scale-105 transition-all text-[var(--text-dim-2)] border border-dashed border-[var(--border)]">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-[var(--text-dim-2)] text-center leading-[1.2] h-7 flex items-start justify-center max-w-[64px]">
                      Lainnya
                    </span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-y-6 gap-x-2 sm:gap-x-4">
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
                      <div className="w-12 h-12 rounded-[16px] bg-[var(--muted)]" />
                      <div className="w-10 h-2.5 rounded-full bg-[var(--muted)]" />
                    </div>
                  ))}
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
                {key === 'backspace' ? <Trash2 className="w-6 h-6 text-[#F04438]" /> : key}
              </button>
            ))}
          </div>
          
          {/* Footer Section */}
          <div className="p-5 bg-[var(--bg)] pb-safe">
            <button
              type="button"
              onClick={handleSave}
              disabled={!amount || amount === '0' || !selectedCategory || saving}
              className="w-full h-15 rounded-[20px] bg-[#15803D] text-white font-bold text-[16px] shadow-2xl shadow-[#15803D40] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-5 h-5" strokeWidth={3} />
              )}
              {saving ? t('common.loading') : editId ? t('txn.updateTransaction') : t('txn.saveTransaction')}
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
                    className="w-full bg-[var(--muted)] border border-transparent focus:border-[#15803D] rounded-[16px] px-4 py-3.5 text-[15px] font-semibold text-[var(--text)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-wider mb-2 block">Emoji</label>
                  <div className="flex gap-3 flex-wrap">
                    {['📦', '🎁', '🎮', '💡', '🏠', '🛒', '🍜', '🚗', '💊', '📚'].map(e => (
                      <button 
                        key={e}
                        type="button"
                        onClick={() => setNewCatEmoji(e)}
                        className={`transition-all ${newCatEmoji === e ? 'scale-110 ring-2 ring-[#15803D] ring-offset-2 ring-offset-[var(--card)] rounded-[14px]' : 'opacity-60 hover:opacity-100'}`}
                      >
                        <CategoryIcon 
                          category="new" 
                          icon={e} 
                          size="lg" 
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(false)}
                    className="flex-1 py-3 rounded-xl bg-[var(--muted)] text-[var(--text)] font-bold text-[14px]"
                  >
                    {t('common.cancel')}
                  </button>
                  <button 
                    type="button"
                    onClick={handleAddCategory}
                    disabled={!newCatLabel || addCategoryMutation.isPending}
                    className="flex-2 py-3 px-6 rounded-xl bg-[#15803D] text-white font-bold text-[14px] disabled:opacity-50"
                  >
                    {addCategoryMutation.isPending ? '...' : 'Tambah'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Delete Confirmation Overlay ─── */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-[160] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md animate-fade-in" onClick={() => setShowDeleteConfirm(false)} />
            <div className="relative w-full bg-[var(--card)] rounded-[28px] p-6 shadow-2xl animate-fade-in border border-[var(--border)] overflow-hidden">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-3xl bg-red-50 flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-[20px] font-bold text-[var(--text)] mb-2">{t('txn.deleteTransaction')}</h3>
                <p className="text-[14px] text-[var(--text-dim)] font-medium mb-8">{t('txn.deleteConfirm')}</p>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="py-3.5 rounded-2xl bg-[var(--muted)] text-[var(--text)] font-bold text-[15px] transition-all active:scale-95"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="py-3.5 rounded-2xl bg-red-500 text-white font-bold text-[15px] shadow-lg shadow-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {deleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    {t('common.delete')}
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
