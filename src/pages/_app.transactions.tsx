import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-keys';
import { transactionsApi, reportsApi, accountsApi, type Transaction } from '../api/client';
import { usePreferences } from '../hooks/usePreferences';
import { ArrowLeft, MoreHorizontal, Filter, ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';
import { computeSummary } from '../lib/summary';

import { CategoryIcon } from '../components/ui/CategoryIcon';

// ─── Group transactions by date ──────────────────────────────────────────────
function groupByDate(items: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};
  for (const item of items) {
    const d = new Date(item.date);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a)) // newest first
    .map(([dateStr, txns]) => {
      const d = new Date(dateStr + 'T00:00:00');
      return {
        day: d.getDate(),
        month: d.toLocaleDateString('id-ID', { month: 'short' }).replace('.', ''),
        year: d.getFullYear(),
        transactions: txns,
      };
    });
}

// ─── Group transactions by week-of-month ─────────────────────────────────────
function groupByWeek(items: Transaction[]) {
  const groups: Record<number, { week: number; monthLabel: string; transactions: Transaction[] }> = {};
  for (const item of items) {
    const d = new Date(item.date);
    const weekOfMonth = Math.ceil(d.getDate() / 7);
    const monthLabel = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    if (!groups[weekOfMonth]) {
      groups[weekOfMonth] = { week: weekOfMonth, monthLabel, transactions: [] };
    }
    groups[weekOfMonth].transactions.push(item);
  }
  return Object.values(groups).sort((a, b) => b.week - a.week);
}

// ─── Compute category breakdown from transaction list ─────────────────────────
function computeCategoryBreakdown(items: Transaction[]) {
  const expenses = items.filter(tx => tx.type === 'expense');
  const totalExpenses = expenses.reduce((sum, tx) => sum + parseFloat(String(tx.amount)), 0);

  const catMap = new Map<string, { categoryId: string; label: string; color: string; amount: number }>();
  const defaultColors = ['#F79009', '#7F56D9', '#15803D', '#0BA5EC', '#F04438', '#EE46BC', '#334155', '#15B79E'];
  let colorIndex = 0;

  for (const tx of expenses) {
    const amount = parseFloat(String(tx.amount));
    const catId = tx.categoryId;
    const label = tx.category?.label || catId;
    const color = tx.category?.color || defaultColors[colorIndex % defaultColors.length];

    if (catMap.has(catId)) {
      catMap.get(catId)!.amount += amount;
    } else {
      catMap.set(catId, { categoryId: catId, label, color, amount });
      if (!tx.category?.color) colorIndex++;
    }
  }

  return Array.from(catMap.values())
    .sort((a, b) => b.amount - a.amount)
    .map(cat => ({
      ...cat,
      percentage: totalExpenses > 0 ? parseFloat(((cat.amount / totalExpenses) * 100).toFixed(2)) : 0,
    }));
}

export default function TransactionsPage() {
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly' | 'total'>('daily');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const search = searchParams.get('search') || undefined;
  const { formatMoney, t } = usePreferences();

  // Current month in YYYY-MM format
  const currentMonth = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  // Whether any filter is active (account or type filter, excluding view-based)
  const hasActiveFilter = filter !== 'all' || accountFilter !== 'all';

  // ─── Determine fetch params based on view ──────────────────────────────────
  const txnParams = useMemo(() => {
    const base = {
      type: filter === 'all' ? undefined : filter,
      account: accountFilter === 'all' ? undefined : accountFilter,
      search,
    };
    if (view === 'daily') {
      return { ...base, limit: 50 };
    }
    if (view === 'weekly' || view === 'monthly') {
      return { ...base, month: currentMonth, limit: 200 };
    }
    // total
    return { ...base, limit: 200 };
  }, [view, filter, accountFilter, search, currentMonth]);

  // Fetch transactions (display list)
  const { data: txnsData, isLoading: txnsLoading } = useQuery({
    queryKey: queryKeys.transactions.list(txnParams),
    queryFn: () => transactionsApi.list(txnParams),
  });

  // Fetch accounts for filter
  const { data: accountsData } = useQuery({
    queryKey: queryKeys.accounts.all,
    queryFn: () => accountsApi.list(),
  });

  // ─── Summary data strategy ─────────────────────────────────────────────────
  // When no active filter: use reportsApi.summary(currentMonth) — optimized BE query
  // When filter active: compute client-side from a full month fetch (BE max 200)
  const summaryTxnParams = useMemo(() => ({
    month: currentMonth,
    limit: 200,
    type: filter === 'all' ? undefined : filter,
    account: accountFilter === 'all' ? undefined : accountFilter,
  }), [currentMonth, filter, accountFilter]);

  const { data: summaryTxnsData, isLoading: summaryTxnsLoading } = useQuery({
    queryKey: queryKeys.transactions.list(summaryTxnParams),
    queryFn: () => transactionsApi.list(summaryTxnParams),
    enabled: hasActiveFilter,
  });

  const { data: summaryData, isLoading: summaryReportLoading } = useQuery({
    queryKey: queryKeys.reports.summary(currentMonth),
    queryFn: () => reportsApi.summary({ month: currentMonth }),
    enabled: !hasActiveFilter,
  });

  // ─── Computed summary values ───────────────────────────────────────────────
  const { income, expenses, balance, transfers, filteredCount, topCategories } = useMemo(() => {
    if (hasActiveFilter && summaryTxnsData?.items) {
      const items = summaryTxnsData.items;
      const s = computeSummary(items);
      const cats = computeCategoryBreakdown(items).slice(0, 5);
      return { ...s, topCategories: cats };
    }

    if (!hasActiveFilter && summaryData) {
      return {
        income: summaryData.income,
        expenses: summaryData.expenses,
        balance: summaryData.balance,
        transfers: 0,
        filteredCount: summaryData.transactionCount,
        topCategories: [] as ReturnType<typeof computeCategoryBreakdown>,
      };
    }

    return { income: 0, expenses: 0, balance: 0, transfers: 0, filteredCount: 0, topCategories: [] as ReturnType<typeof computeCategoryBreakdown> };
  }, [hasActiveFilter, summaryTxnsData, summaryData]);

  // ─── Category breakdown when no filter (use BE data) ──────────────────────
  const { data: catData, isLoading: catLoading } = useQuery({
    queryKey: queryKeys.reports.byCategory(currentMonth),
    queryFn: () => reportsApi.byCategory({ month: currentMonth }),
    enabled: !hasActiveFilter,
  });

  const displayCategories = hasActiveFilter ? topCategories : (catData?.slice(0, 5) ?? []);

  // ─── Loading state ─────────────────────────────────────────────────────────
  const summaryLoading = hasActiveFilter ? summaryTxnsLoading : (summaryReportLoading || catLoading);
  const isLoading = txnsLoading || summaryLoading;

  // ─── Group transactions for views ─────────────────────────────────────────
  const dateGroups = useMemo(() => {
    if (!txnsData?.items) return [];
    return groupByDate(txnsData.items);
  }, [txnsData]);

  const weekGroups = useMemo(() => {
    if (!txnsData?.items) return [];
    return groupByWeek(txnsData.items);
  }, [txnsData]);

  const allTransactions = txnsData?.items ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6 pb-10">
        <div className="flex items-center gap-4 pt-4">
          <div className="w-11 h-11 rounded-2xl skeleton" />
          <div className="h-10 w-48 rounded-lg skeleton" />
        </div>
        <div className="h-48 w-full rounded-[24px] skeleton shadow-sm" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 w-full rounded-[20px] skeleton border border-[var(--border)]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 animate-fade-in w-full max-w-full overflow-x-hidden">
      {/* Removed Redundant Top Navigation as per User Request */}

      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-2xl bg-[var(--muted)] text-[var(--text)] flex items-center justify-center hover:bg-[var(--border)] transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[28px] font-bold text-[var(--text)] tracking-[-0.03em]">Riwayat Transaksi</h1>
        </div>
        <button
          className="w-11 h-11 rounded-2xl bg-[var(--muted)] text-[var(--text)] flex items-center justify-center hover:bg-[var(--border)] transition-colors active:scale-95"
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-8 border-b border-[var(--border)] px-1">
        {(['daily', 'weekly', 'monthly', 'total'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`py-4 text-[15px] font-bold transition-all relative ${
              view === v
                ? 'text-[var(--text)]'
                : 'text-[var(--text-dim-2)] opacity-50'
            }`}
          >
            {v === 'daily' ? 'Harian' : v === 'weekly' ? 'Mingguan' : v === 'monthly' ? 'Bulanan' : 'Total'}
            {view === v && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent)] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Hero Card - Summary */}
      {filter !== 'all' ? (
        <div className="rounded-[32px] p-6 sm:p-8 border-[2.5px] border-[#0891B2]/30 bg-[#ECFEFF] shadow-sm animate-fade-in overflow-hidden w-full max-w-full">
          <div className="flex items-center justify-between gap-6">
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-[#0E7490]/70 uppercase tracking-widest flex items-center gap-2">
                {filter === 'income' && <ArrowUpCircle className="w-3.5 h-3.5 text-[#059669]" />}
                {filter === 'expense' && <ArrowDownCircle className="w-3.5 h-3.5 text-[#E11D48]" />}
                {filter === 'transfer' && <Wallet className="w-3.5 h-3.5 text-[#0891B2]" />}
                {filter === 'income' ? 'PEMASUKAN' : filter === 'expense' ? 'PENGELUARAN' : 'TRANSFER'}
              </p>
              <p className={`text-[28px] sm:text-[32px] font-bold tabular-nums ${
                filter === 'income' ? 'text-[#059669]' : filter === 'expense' ? 'text-[#E11D48]' : 'text-[#0891B2]'
              }`}>
                {formatMoney(filter === 'income' ? income : filter === 'expense' ? expenses : transfers, { short: false })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold text-[#0E7490]/70 uppercase tracking-widest">TRANSAKSI</p>
              <p className="text-[28px] sm:text-[32px] font-bold text-[#0891B2] tabular-nums">{filteredCount}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-[32px] p-6 sm:p-8 border-[2.5px] border-[#0891B2]/30 bg-[#ECFEFF] shadow-sm animate-fade-in overflow-hidden w-full max-w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4 lg:gap-8">
            <div className="space-y-1 sm:space-y-1.5 flex sm:flex-col items-center justify-between sm:items-start w-full">
              <p className="text-[11px] font-bold text-[#0E7490]/70 uppercase tracking-widest flex items-center gap-2 shrink-0">
                <ArrowUpCircle className="w-3.5 h-3.5 text-[#059669]" />
                MASUK
              </p>
              <p className="text-[20px] sm:text-[22px] font-bold text-[#059669] tabular-nums truncate max-w-[60%] sm:max-w-none text-right sm:text-left">
                {formatMoney(income, { short: false })}
              </p>
            </div>
            <div className="space-y-1 sm:space-y-1.5 flex sm:flex-col items-center justify-between sm:items-start w-full border-t sm:border-t-0 sm:border-x border-[#0891B2]/10 pt-3 sm:pt-0 sm:px-8">
              <p className="text-[11px] font-bold text-[#0E7490]/70 uppercase tracking-widest flex items-center gap-2 shrink-0">
                <ArrowDownCircle className="w-3.5 h-3.5 text-[#E11D48]" />
                KELUAR
              </p>
              <p className="text-[20px] sm:text-[22px] font-bold text-[#E11D48] tabular-nums truncate max-w-[60%] sm:max-w-none text-right sm:text-left">
                {formatMoney(expenses, { short: false })}
              </p>
            </div>
            <div className="space-y-1 sm:space-y-1.5 flex sm:flex-col items-center justify-between sm:items-start w-full border-t sm:border-t-0 pt-3 sm:pt-0 sm:pl-8">
              <p className="text-[11px] font-bold text-[#0E7490]/70 uppercase tracking-widest flex items-center gap-2 shrink-0">
                <Wallet className="w-3.5 h-3.5 text-[#0891B2]" />
                SALDO
              </p>
              <p className="text-[20px] sm:text-[22px] font-bold text-[#0891B2] tabular-nums truncate max-w-[60%] sm:max-w-none text-right sm:text-left">
                {formatMoney(balance, { short: false })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Pills */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1 w-full">
        {[
          { id: 'all', label: 'Semua' },
          { id: 'income', label: 'Pemasukan' },
          { id: 'expense', label: 'Pengeluaran' },
          { id: 'transfer', label: 'Transfer' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as 'all' | 'income' | 'expense' | 'transfer')}
            className={`px-6 py-2.5 rounded-2xl text-[14px] font-bold whitespace-nowrap transition-all active:scale-95 ${
              filter === item.id ? 'bg-[var(--text)] text-[var(--bg)] shadow-lg' : 'bg-[var(--muted)] text-[var(--text-dim-2)] hover:bg-[var(--border)]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Account Filter Pills */}
      {accountsData && accountsData.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1 w-full">
          <button
            onClick={() => setAccountFilter('all')}
            className={`px-4 py-1.5 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all active:scale-95 border ${
              accountFilter === 'all'
                ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                : 'bg-transparent text-[var(--text-dim-2)] border-[var(--border)] hover:bg-[var(--muted)]'
            }`}
          >
            Semua Akun
          </button>
          {accountsData.map((acc) => (
            <button
              key={acc.id}
              onClick={() => setAccountFilter(acc.id)}
              className={`px-4 py-1.5 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all active:scale-95 border ${
                accountFilter === acc.id
                  ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                  : 'bg-transparent text-[var(--text-dim-2)] border-[var(--border)] hover:bg-[var(--muted)]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: acc.color || 'var(--accent)' }} />
                {acc.name}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ─── Monthly View: Category Breakdown ──────────────────────────────── */}
      {view === 'monthly' && (
        <div className="animate-fade-in">
          {displayCategories.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[14px] font-bold text-[var(--text)] tracking-[-0.01em]">{t('txn.categoryBreakdown')}</h3>
              </div>
              <div className="flow-card p-4 space-y-4">
                {displayCategories.map((cat) => (
                  <div key={cat.categoryId} className="flex items-center gap-3">
                    <CategoryIcon
                      category={cat.label}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[13px] font-bold text-[var(--text)]">{cat.label}</span>
                        <span className="text-[13px] font-bold text-[var(--text)] tabular-nums">{formatMoney(cat.amount, { short: false })}</span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {displayCategories.length === 0 && (
            <div className="flow-card p-12 text-center">
              <p className="text-[48px] mb-4">📊</p>
              <p className="text-[16px] font-bold text-[var(--text)] mb-1">Tidak ada data pengeluaran</p>
              <p className="text-[13px] font-medium text-[var(--text-dim)]">Belum ada transaksi pengeluaran bulan ini.</p>
            </div>
          )}

          {/* Also show monthly transaction list */}
          <div className="mt-6 space-y-6">
            {dateGroups.map((group) => (
              <div key={`${group.day}-${group.month}-${group.year}`}>
                <div className="flex items-center gap-2.5 px-3 py-2">
                  <div className="text-[18px] font-bold text-[var(--text)] tracking-[-0.01em]">{group.day}</div>
                  <div>
                    <div className="text-[11px] text-[var(--text-dim)] font-bold tracking-[0.02em] uppercase">{group.month}</div>
                    <div className="text-[10px] text-[var(--text-dim-2)]">{group.year}</div>
                  </div>
                </div>
                <div className="flow-card">
                  {group.transactions.map((tx: Transaction) => (
                    <TransactionRow
                      key={tx.id}
                      categoryLabel={tx.category?.label || tx.categoryId}
                      categoryIcon={tx.category?.icon}
                      label={tx.description || tx.category?.label || tx.categoryId}
                      amount={parseFloat(String(tx.amount))}
                      isIncome={tx.type === 'income'}
                      formatMoney={formatMoney}
                      onClick={() => navigate(`?edit_transaction_id=${tx.id}`)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Daily View ─────────────────────────────────────────────────────── */}
      {view === 'daily' && (
        <div className="animate-fade-in space-y-6 content-auto">
          {dateGroups.length === 0 ? (
            <div className="flow-card p-12 text-center">
              <p className="text-[48px] mb-4">📭</p>
              <p className="text-[16px] font-bold text-[var(--text)] mb-1">{t('dashboard.noTransactions')}</p>
              <p className="text-[13px] font-medium text-[var(--text-dim)]">{t('transactions.noTransactionsDesc')}</p>
            </div>
          ) : (
            dateGroups.map((group) => (
              <div key={`${group.day}-${group.month}-${group.year}`}>
                <div className="flex items-center gap-2.5 px-3 py-2">
                  <div className="text-[18px] font-bold text-[var(--text)] tracking-[-0.01em]">{group.day}</div>
                  <div>
                    <div className="text-[11px] text-[var(--text-dim)] font-bold tracking-[0.02em] uppercase">{group.month}</div>
                    <div className="text-[10px] text-[var(--text-dim-2)]">{group.year}</div>
                  </div>
                </div>
                <div className="flow-card">
                  {group.transactions.map((tx: Transaction) => (
                    <TransactionRow
                      key={tx.id}
                      categoryLabel={tx.category?.label || tx.categoryId}
                      categoryIcon={tx.category?.icon}
                      label={tx.description || tx.category?.label || tx.categoryId}
                      amount={parseFloat(String(tx.amount))}
                      isIncome={tx.type === 'income'}
                      formatMoney={formatMoney}
                      onClick={() => navigate(`?edit_transaction_id=${tx.id}`)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── Weekly View ─────────────────────────────────────────────────────── */}
      {view === 'weekly' && (
        <div className="animate-fade-in space-y-6">
          {weekGroups.length === 0 ? (
            <div className="flow-card p-12 text-center">
              <p className="text-[48px] mb-4">📭</p>
              <p className="text-[16px] font-bold text-[var(--text)] mb-1">{t('dashboard.noTransactions')}</p>
              <p className="text-[13px] font-medium text-[var(--text-dim)]">{t('transactions.noTransactionsDesc')}</p>
            </div>
          ) : (
            weekGroups.map((group) => (
              <div key={group.week}>
                <div className="flex items-center gap-2.5 px-3 py-2">
                  <div className="text-[14px] font-bold text-[var(--text-dim)] tracking-[-0.01em] uppercase">
                    Minggu ke-{group.week}
                  </div>
                  <div className="text-[12px] text-[var(--text-dim-2)] font-medium">{group.monthLabel}</div>
                </div>
                <div className="flow-card">
                  {group.transactions.map((tx: Transaction) => (
                    <TransactionRow
                      key={tx.id}
                      categoryLabel={tx.category?.label || tx.categoryId}
                      categoryIcon={tx.category?.icon}
                      label={tx.description || tx.category?.label || tx.categoryId}
                      amount={parseFloat(String(tx.amount))}
                      isIncome={tx.type === 'income'}
                      formatMoney={formatMoney}
                      onClick={() => navigate(`?edit_transaction_id=${tx.id}`)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ─── Total View: flat list, no date grouping ─────────────────────────── */}
      {view === 'total' && (
        <div className="animate-fade-in">
          {allTransactions.length === 0 ? (
            <div className="flow-card p-12 text-center">
              <p className="text-[48px] mb-4">📭</p>
              <p className="text-[16px] font-bold text-[var(--text)] mb-1">{t('dashboard.noTransactions')}</p>
              <p className="text-[13px] font-medium text-[var(--text-dim)]">{t('transactions.noTransactionsDesc')}</p>
            </div>
          ) : (
            <div className="flow-card">
              {allTransactions.map((tx: Transaction) => (
                <TransactionRow
                  key={tx.id}
                  categoryLabel={tx.category?.label || tx.categoryId}
                  categoryIcon={tx.category?.icon}
                  label={tx.description || tx.category?.label || tx.categoryId}
                  amount={parseFloat(String(tx.amount))}
                  isIncome={tx.type === 'income'}
                  formatMoney={formatMoney}
                  onClick={() => navigate(`?edit_transaction_id=${tx.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Transaction Row Component ───────────────────────────────────────────────
function TransactionRow({ categoryLabel, categoryIcon, label, amount, isIncome, formatMoney, onClick }: {
  categoryLabel: string; categoryIcon?: string | null; label: string; amount: number; isIncome?: boolean;
  formatMoney: (amount: number | string, options?: { short?: boolean }) => string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--muted)] transition-all cursor-pointer group active:bg-[var(--border)]"
    >
      <CategoryIcon
        category={categoryLabel}
        icon={categoryIcon}
        size="lg"
      />
      <div className="flex-1 min-w-0 pr-2 sm:pr-4">
        <p className="text-[14px] sm:text-[15px] font-bold text-[var(--text)] truncate">{label}</p>
        <p className="text-[10px] sm:text-[11px] font-medium text-[var(--text-dim-2)] mt-0.5 opacity-60 uppercase tracking-wider">{categoryLabel}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-[15px] sm:text-[16px] font-bold tabular-nums ${isIncome ? 'text-[var(--income)]' : 'text-[var(--text)]'}`}>
          {isIncome ? '+' : '−'}{formatMoney(Math.abs(amount), { short: false })}
        </p>
        <button className="lg:opacity-0 lg:group-hover:opacity-100 mt-1">
          <MoreHorizontal className="w-4 h-4 text-[var(--text-dim-2)]" />
        </button>
      </div>
    </div>
  );
}
