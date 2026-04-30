import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-keys';
import { transactionsApi, reportsApi, type Transaction } from '../api/client';
import { usePreferences } from '../hooks/usePreferences';
import { ArrowLeft, MoreHorizontal, Filter, ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';

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

export default function TransactionsPage() {
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly' | 'total'>('daily');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const search = searchParams.get('search') || undefined;
  const { formatMoney, t } = usePreferences();

  // Fetch real transactions
  const { data: txnsData, isLoading: txnsLoading } = useQuery({
    queryKey: queryKeys.transactions.list({ limit: 50, search, type: filter === 'all' ? undefined : filter }),
    queryFn: () => transactionsApi.list({ limit: 50, search, type: filter === 'all' ? undefined : filter }),
  });

  // Fetch real summary
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: queryKeys.reports.summary(),
    queryFn: () => reportsApi.summary(),
  });

  // Fetch category breakdown
  const { data: catData, isLoading: catLoading } = useQuery({
    queryKey: queryKeys.reports.byCategory(),
    queryFn: () => reportsApi.byCategory(),
  });

  const isLoading = txnsLoading || summaryLoading || catLoading;

  // Group transactions by date for daily view
  const dateGroups = useMemo(() => {
    if (!txnsData?.items) return [];
    return groupByDate(txnsData.items);
  }, [txnsData]);

  const income = summaryData?.income ?? 0;
  const expenses = summaryData?.expenses ?? 0;
  const balance = summaryData?.balance ?? 0;
  const topCategories = catData?.slice(0, 5) ?? [];

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
    <div className="space-y-6 pb-10 animate-fade-in">
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
      <div className="rounded-[32px] bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] p-8 text-white shadow-xl shadow-[var(--accent)]/20">
        <div className="grid grid-cols-3 gap-8">
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold opacity-70 uppercase tracking-widest flex items-center gap-2">
              <ArrowUpCircle className="w-3.5 h-3.5" />
              Masuk
            </p>
            <p className="text-[20px] font-bold">{formatMoney(income)}</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold opacity-70 uppercase tracking-widest flex items-center gap-2">
              <ArrowDownCircle className="w-3.5 h-3.5" />
              Keluar
            </p>
            <p className="text-[20px] font-bold">{formatMoney(expenses)}</p>
          </div>
          <div className="space-y-1.5 border-l border-white/10 pl-8">
            <p className="text-[11px] font-bold opacity-70 uppercase tracking-widest flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5" />
              Saldo
            </p>
            <p className="text-[20px] font-bold">{formatMoney(balance)}</p>
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
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

      {view === 'monthly' && (
        <div className="animate-fade-in">
          {/* Category Breakdown — real data */}
          {topCategories.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[14px] font-bold text-[var(--text)] tracking-[-0.01em]">{t('txn.categoryBreakdown')}</h3>
              </div>
              <div className="flow-card p-4 space-y-4">
                {topCategories.map((cat) => (
                  <div key={cat.categoryId} className="flex items-center gap-3">
                    <CategoryIcon 
                      category={cat.label} 
                      size="md" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[13px] font-bold text-[var(--text)]">{cat.label}</span>
                        <span className="text-[13px] font-bold text-[var(--text)] tabular-nums">{formatMoney(cat.amount)}</span>
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
        </div>
      )}

      {view === 'daily' && (
        <div className="animate-fade-in space-y-6 content-auto">
          {dateGroups.length === 0 ? (
            <div className="flow-card p-12 text-center">
              <p className="text-[48px] mb-4">📭</p>
              <p className="text-[16px] font-bold text-[var(--text)] mb-1">Belum ada transaksi</p>
              <p className="text-[13px] font-medium text-[var(--text-dim)]">Mulai catat pengeluaran dan pemasukan Anda</p>
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
    </div>
  );
}

// ─── Transaction Row Component ───────────────────────────────────────────────
function TransactionRow({ categoryLabel, categoryIcon, label, amount, isIncome, formatMoney, onClick }: {
  categoryLabel: string; categoryIcon?: string | null; label: string; amount: number; isIncome?: boolean;
  formatMoney: (n: number) => string;
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
          {isIncome ? '+' : '−'}{formatMoney(Math.abs(amount))}
        </p>
        <button className="lg:opacity-0 lg:group-hover:opacity-100 mt-1">
          <MoreHorizontal className="w-4 h-4 text-[var(--text-dim-2)]" />
        </button>
      </div>
    </div>
  );
}
