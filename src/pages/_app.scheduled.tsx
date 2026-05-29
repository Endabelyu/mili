import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, RefreshCw, X, ArrowLeft, Trash2 } from 'lucide-react';
import { Alert } from '../components/ui/Alert';
import { scheduledApi, categoriesApi, accountsApi, type ScheduledTransaction, type Category } from '../api/client';
import { usePreferences } from '../hooks/usePreferences';
import { CategoryIcon } from '../components/ui/CategoryIcon';

// ─── Status Toggle Component ──────────────────────────────────────────────────
function StatusToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${active ? 'bg-[var(--accent)]' : 'bg-[var(--muted)]'}`}
    >
      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${active ? 'translate-x-5' : 'translate-x-0 shadow-sm'}`} />
    </button>
  );
}

const FREQUENCIES = (t: (k: string) => string) => [
  { id: 'daily', label: t('scheduled.daily') },
  { id: 'weekly', label: t('scheduled.weekly') },
  { id: 'monthly', label: t('scheduled.monthly') },
  { id: 'yearly', label: t('scheduled.yearly') },
];

export default function ScheduledPage() {
  const { formatMoney, t } = usePreferences();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Alert Modal state
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isConfirm?: boolean;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }));

  // Form State
  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [nextRunDate, setNextRunDate] = useState('');

  const [selectedScheduled, setSelectedScheduled] = useState<ScheduledTransaction | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');

  const { data: scheduled = [] } = useQuery({
    queryKey: ['scheduled'],
    queryFn: () => scheduledApi.list(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.list(),
  });

  const filteredScheduled = statusFilter === 'all' ? scheduled : scheduled.filter(s => s.status === statusFilter);

  const createMutation = useMutation({
    mutationFn: (data: Omit<ScheduledTransaction, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status'>) =>
      scheduledApi.create(data as Omit<ScheduledTransaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      setAlertConfig({ isOpen: true, title: t('common.error'), message: err instanceof Error ? err.message : t('scheduled.saveError'), type: 'error' });
      setSaving(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<ScheduledTransaction>) =>
      scheduledApi.update(selectedScheduled!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      setAlertConfig({ isOpen: true, title: t('common.error'), message: err instanceof Error ? err.message : t('scheduled.updateError'), type: 'error' });
      setSaving(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => scheduledApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled'] });
      resetForm();
    },
    onError: (err: unknown) => {
      setAlertConfig({ isOpen: true, title: t('common.error'), message: err instanceof Error ? err.message : t('scheduled.deleteError'), type: 'error' });
      setSaving(false);
    },
  });

  const postMutation = useMutation({
    mutationFn: (id: string) => scheduledApi.post(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setSaving(false);
    },
    onError: (err: unknown) => {
      setAlertConfig({ isOpen: true, title: t('common.error'), message: err instanceof Error ? err.message : t('scheduled.postError'), type: 'error' });
      setSaving(false);
    },
  });

  const handlePost = (id: string) => {
    setAlertConfig({
      isOpen: true,
      title: t('scheduled.postConfirm'),
      message: '',
      type: 'warning',
      isConfirm: true,
      onConfirm: () => { closeAlert(); setSaving(true); postMutation.mutate(id); },
    });
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setType('expense');
    setAmount('');
    setCategoryId('');
    setAccountId('');
    setToAccountId('');
    setDescription('');
    setFrequency('monthly');
    setNextRunDate('');
    setSaving(false);
    setSelectedScheduled(null);
  };

  const handleSave = () => {
    let finalCatId = categoryId;
    if (type === 'transfer' && !finalCatId) {
      const transferCat = categories.find((c: Category) => c.id === 'transfer');
      if (transferCat) {
        finalCatId = transferCat.id;
      } else if (categories.length > 0) {
        finalCatId = categories[0].id;
      }
    }
    if (!amount || !finalCatId || !nextRunDate) return;
    setSaving(true);
    const payload = {
      type,
      amount: parseFloat(amount),
      categoryId: finalCatId,
      accountId: accountId || null,
      toAccountId: type === 'transfer' ? (toAccountId || null) : null,
      description: description || null,
      frequency,
      nextRunDate,
    };

    if (selectedScheduled) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (item: ScheduledTransaction) => {
    setSelectedScheduled(item);
    setType(item.type as 'income' | 'expense' | 'transfer');
    setAmount(String(item.amount));
    setCategoryId(item.categoryId);
    setAccountId(item.accountId || '');
    setToAccountId(item.toAccountId || '');
    setDescription(item.description || '');
    setFrequency(item.frequency as 'daily' | 'weekly' | 'monthly' | 'yearly');
    setNextRunDate(new Date(item.nextRunDate).toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (!selectedScheduled) return;
    setAlertConfig({
      isOpen: true,
      title: t('scheduled.deleteSchedule'),
      message: `${t('scheduled.deleteConfirm')} "${selectedScheduled.description || selectedScheduled.category?.label}"?`,
      type: 'error',
      isConfirm: true,
      onConfirm: () => { closeAlert(); setSaving(true); deleteMutation.mutate(selectedScheduled.id); },
    });
  };

  const totalMonthly = scheduled.reduce((acc, curr) => acc + parseFloat(String(curr.amount)), 0);

  const filteredCategories = categories.filter(c => c.type === type || c.type === 'both');

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.history.back()}
            className="w-11 h-11 rounded-2xl bg-[var(--muted)] text-[var(--text)] flex items-center justify-center hover:bg-[var(--border)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[28px] font-bold text-[var(--text)] tracking-[-0.03em]">{t('scheduled.title')}</h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-11 h-11 rounded-2xl bg-[var(--muted)] text-[var(--text)] flex items-center justify-center hover:bg-[var(--border)] transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="rounded-[24px] bg-[var(--card)] p-5 sm:p-6 border border-[var(--border)] shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-widest">{t('dashboard.income')}</p>
            <p className="text-[18px] font-bold text-[var(--income)]">{formatMoney(scheduled.filter(s => s.type === 'income').reduce((acc, curr) => acc + parseFloat(String(curr.amount)), 0))}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-widest">{t('dashboard.expense')}</p>
            <p className="text-[18px] font-bold text-[var(--expense)]">{formatMoney(scheduled.filter(s => s.type === 'expense').reduce((acc, curr) => acc + parseFloat(String(curr.amount)), 0))}</p>
          </div>
          <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-[var(--border)] pt-4 sm:pt-0 sm:pl-6">
            <p className="text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-widest">Total</p>
            <p className="text-[18px] font-bold text-[var(--text)]">{formatMoney(totalMonthly)}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
        {([{ id: 'all', label: t('scheduled.allSchedules') }, { id: 'active', label: t('scheduled.active') }, { id: 'paused', label: t('scheduled.paused') }] as { id: 'all' | 'active' | 'paused'; label: string }[]).map((item) => (
          <button
            key={item.id}
            onClick={() => setStatusFilter(item.id)}
            className={`px-6 py-2.5 rounded-2xl text-[14px] font-bold whitespace-nowrap transition-all active:scale-95 ${
              statusFilter === item.id ? 'bg-[var(--text)] text-[var(--bg)] shadow-lg' : 'bg-[var(--muted)] text-[var(--text-dim-2)] hover:bg-[var(--border)]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredScheduled.length === 0 ? (
          <div className="text-center py-20 px-6 bg-[var(--card)] rounded-[32px] border border-[var(--border)]">
            <div className="w-20 h-20 rounded-3xl bg-[var(--accent-tint)] text-[var(--accent)] flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-10 h-10" />
            </div>
            <h3 className="text-[20px] font-bold text-[var(--text)] mb-3">{t('scheduled.noSchedules')}</h3>
            <p className="text-[14px] text-[var(--text-dim-2)] mb-8 max-w-[320px] mx-auto leading-relaxed">{t('scheduled.noSchedulesDesc')}</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 rounded-2xl bg-[var(--text)] text-[var(--bg)] font-bold text-[15px] shadow-xl transition-all active:scale-95"
            >
              {t('scheduled.addSchedule')}
            </button>
          </div>
        ) : (
          <div className="flow-card">
            {filteredScheduled.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleEdit(item)}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--muted)]/40 transition-all cursor-pointer group active:bg-[var(--border)]"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
                  <CategoryIcon 
                    category={item.category?.label || item.categoryId} 
                    size="lg" 
                  />
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <p className="text-[16px] sm:text-[17px] font-bold text-[var(--text)] truncate">{item.description || item.category?.label}</p>
                      <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-[var(--accent-tint)] text-[var(--accent)] uppercase tracking-wider shrink-0">
                        {FREQUENCIES(t).find(f => f.id === item.frequency)?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-[13px] font-medium text-[var(--text-dim-2)] opacity-70">
                      <span className="truncate">
                        {item.type === 'transfer' 
                          ? `${item.account?.name || 'Cash'} → ${item.toAccount?.name || 'Account'}` 
                          : item.account?.name || 'Cash'}
                      </span>
                      <span>·</span>
                      <span className="whitespace-nowrap">{t('scheduled.dueDate')} {new Date(item.nextRunDate).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 shrink-0 pt-3 sm:pt-0 border-t border-[var(--border)]/50 sm:border-t-0">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePost(item.id); }}
                      disabled={saving}
                      className="px-3.5 py-2 rounded-xl bg-[var(--accent)] text-white text-[11px] font-bold hover:opacity-95 active:scale-95 transition-all shadow-sm"
                    >
                      {t('scheduled.payNow')}
                    </button>
                    <p className={`text-[17px] sm:text-[18px] font-bold tracking-tight ${item.type === 'income' ? 'text-[var(--income)]' : item.type === 'transfer' ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
                      {item.type === 'income' ? '+' : item.type === 'transfer' ? '' : '−'}{formatMoney(parseFloat(String(item.amount)))}
                    </p>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <StatusToggle 
                      active={item.status === 'active'} 
                      onToggle={() => {
                        updateMutation.mutate({ id: item.id, status: item.status === 'active' ? 'paused' : 'active' });
                      }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Add Schedule Modal ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in z-[190]" onClick={resetForm} />
          <div 
            className="relative z-[200] w-full max-w-[500px] bg-[var(--bg)] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-[var(--border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <h2 className="text-[18px] font-bold text-[var(--text)]">{selectedScheduled ? t('scheduled.editSchedule') : t('scheduled.addSchedule')}</h2>
              <div className="flex items-center gap-2">
                {selectedScheduled && (
                  <button 
                    onClick={handleDelete}
                    disabled={saving}
                    className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button 
                  onClick={resetForm} 
                  className="relative z-[210] w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--text)] hover:bg-[var(--border)] transition-all active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              {/* Type */}
              <div className="flex p-1 bg-[var(--muted)] rounded-[14px] w-fit mx-auto">
                {(['expense', 'income', 'transfer'] as const).map((tp) => (
                  <button
                    key={tp}
                    type="button"
                    onClick={() => { setType(tp); setCategoryId(''); }}
                    className={`px-4 py-1.5 text-[13px] font-bold rounded-[11px] transition-all ${
                      type === tp ? 'bg-[var(--card)] text-[var(--text)] shadow-sm' : 'text-[var(--text-dim-2)]'
                    }`}
                  >
                    {tp === 'expense' ? t('dashboard.expense') : tp === 'income' ? t('dashboard.income') : t('txn.transfer')}
                  </button>
                ))}
              </div>

              {/* Amount */}
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-[var(--text-dim-2)] uppercase">{t('txn.amount')}</label>
                <input
                  value={amount ? parseInt(amount, 10).toLocaleString('id-ID') : ''}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  inputMode="numeric"
                  className="w-full bg-[var(--muted)] border border-transparent focus:border-[#15803D] rounded-[16px] px-4 py-3.5 text-[15px] font-bold text-[var(--text)] outline-none tabular-nums"
                />
              </div>

              {/* Category */}
              {type !== 'transfer' && (
                <div className="space-y-3">
                  <label className="text-[13px] font-bold text-[var(--text-dim-2)] uppercase">{t('txn.category')}</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-[var(--muted)] border border-transparent focus:border-[#15803D] rounded-[16px] px-4 py-3.5 text-[15px] font-semibold text-[var(--text)] outline-none appearance-none"
                  >
                    <option value="">Pilih Kategori...</option>
                    {filteredCategories.map((c: Category) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Account fields */}
              <div className={`grid ${type === 'transfer' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                <div className="space-y-3">
                  <label className="text-[13px] font-bold text-[var(--text-dim-2)] uppercase">
                    {type === 'transfer' ? 'Dari Akun' : t('txn.account')}
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full bg-[var(--muted)] border border-transparent focus:border-[#15803D] rounded-[16px] px-4 py-3.5 text-[15px] font-semibold text-[var(--text)] outline-none appearance-none"
                  >
                    <option value="">Pilih...</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                {type === 'transfer' && (
                  <div className="space-y-3">
                    <label className="text-[13px] font-bold text-[var(--text-dim-2)] uppercase">Ke Akun</label>
                    <select
                      value={toAccountId}
                      onChange={(e) => setToAccountId(e.target.value)}
                      className="w-full bg-[var(--muted)] border border-transparent focus:border-[#15803D] rounded-[16px] px-4 py-3.5 text-[15px] font-semibold text-[var(--text)] outline-none appearance-none"
                    >
                      <option value="">Pilih...</option>
                      {accounts.filter(a => a.id !== accountId).map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Frequency */}
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-[var(--text-dim-2)] uppercase">{t('scheduled.frequency')}</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                  className="w-full bg-[var(--muted)] border border-transparent focus:border-[#15803D] rounded-[16px] px-4 py-3.5 text-[15px] font-semibold text-[var(--text)] outline-none appearance-none"
                >
                  {FREQUENCIES(t).map(f => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </div>

              {/* Next Run Date */}
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-[var(--text-dim-2)] uppercase">{type === 'expense' ? t('scheduled.startDateBill') : t('scheduled.startDate')}</label>
                <input
                  type="date"
                  value={nextRunDate}
                  onChange={(e) => setNextRunDate(e.target.value)}
                  className="w-full bg-[var(--muted)] border border-transparent focus:border-[#15803D] rounded-[16px] px-4 py-3.5 text-[15px] font-semibold text-[var(--text)] outline-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-[var(--text-dim-2)] uppercase">{t('txn.description')}</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Pembayaran Listrik Token"
                  className="w-full bg-[var(--muted)] border border-transparent focus:border-[#15803D] rounded-[16px] px-4 py-3.5 text-[15px] font-semibold text-[var(--text)] outline-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[var(--border)] shrink-0">
              <button
                onClick={handleSave}
                disabled={!amount || !categoryId || !accountId || !nextRunDate || saving}
                className="w-full py-4 rounded-[16px] bg-[#15803D] text-white font-bold text-[15px] flex items-center justify-center disabled:opacity-50"
              >
                {saving ? t('common.loading') : selectedScheduled ? t('scheduled.editSchedule') : t('scheduled.saveSchedule')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ─── Global Alert ─── */}
      <Alert
        isOpen={alertConfig.isOpen}
        onClose={closeAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        isConfirm={alertConfig.isConfirm}
        onConfirm={alertConfig.onConfirm}
        confirmLabel={t('common.delete')}
      />
    </div>
  );
}
