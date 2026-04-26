import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-keys';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { transactionsApi } from '../api/client';
import { usePreferences } from '../hooks/usePreferences';

// ─── Fallback emoji map ──────────────────────────────────────────────────────
const FALLBACK_EMOJI: Record<string, string> = {
  salary: '💰', freelance: '💻', investments: '📈', gifts: '🎁', 'other-income': '💵',
  food: '🍜', transport: '🚗', housing: '🏠', utilities: '💡', entertainment: '🎬',
  shopping: '🛍️', healthcare: '💊', education: '📚', travel: '✈️', 'other-expense': '📦',
};

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { t, formatMoney, language } = usePreferences();
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');

  // Get current YYYY-MM
  const currentMonth = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  // We fetch all transactions for the current month to derive both Category data AND Daily data
  const { data: txnsData, isLoading: txnsLoading } = useQuery({
    queryKey: queryKeys.transactions.list({ month: currentMonth, limit: 100 }),
    queryFn: () => transactionsApi.list({ month: currentMonth, limit: 100 }),
  });

  const isLoading = txnsLoading;
  const transactions = txnsData?.items || [];

  // Filter transactions by active tab (income/expense)
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => tx.type === activeTab);
  }, [transactions, activeTab]);

  // Aggregate by category
  const categories = useMemo(() => {
    const catMap = new Map<string, { label: string; amount: number; emoji: string; color: string }>();
    const colors = ['#F79009', '#7F56D9', '#12B76A', '#0BA5EC', '#F04438', '#EE46BC', '#334155', '#15B79E', '#A16207', '#4F46E5'];

    let colorIndex = 0;
    filteredTransactions.forEach(tx => {
      const amount = parseFloat(String(tx.amount));
      const catId = tx.categoryId;
      const label = tx.category?.label || catId;
      const emoji = tx.category?.icon || FALLBACK_EMOJI[catId] || '📦';
      const catColor = tx.category?.color || colors[colorIndex % colors.length];

      if (catMap.has(catId)) {
        catMap.get(catId)!.amount += amount;
      } else {
        catMap.set(catId, { label, amount, emoji, color: catColor });
        if (!tx.category?.color) colorIndex++;
      }
    });

    return Array.from(catMap.values()).sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  const totalAmount = categories.reduce((sum, c) => sum + c.amount, 0);

  // Aggregate by day for bar chart
  const dailyData = useMemo(() => {
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const dayMap = new Map<number, number>();

    // Initialize all days with 0
    for (let i = 1; i <= daysInMonth; i++) {
      dayMap.set(i, 0);
    }

    filteredTransactions.forEach(tx => {
      const day = new Date(tx.date).getDate();
      dayMap.set(day, dayMap.get(day)! + parseFloat(String(tx.amount)));
    });

    return Array.from(dayMap.entries()).map(([day, amount]) => ({ day, amount }));
  }, [filteredTransactions]);

  if (isLoading) {
    return (
      <div className="space-y-6 pb-10">
        <div className="h-8 w-32 skeleton rounded-lg" />
        <div className="h-12 skeleton rounded-[14px]" />
        <div className="h-[300px] skeleton rounded-[16px]" />
        <div className="h-[250px] skeleton rounded-[16px]" />
      </div>
    );
  }

  const currentMonthName = new Date().toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] font-bold text-[var(--text)] tracking-[-0.02em]">{t('analytics.title')}</h1>
        <p className="text-[14px] font-medium text-[var(--text-dim)]">{currentMonthName}</p>
      </div>

      {/* ─── Tab Switcher ─── */}
      <div className="flex p-1 bg-[var(--muted)] rounded-[14px] w-full">
        <button
          onClick={() => setActiveTab('expense')}
          className={`flex-1 py-2 text-[14px] font-bold rounded-[11px] transition-all ${
            activeTab === 'expense' ? 'bg-[var(--card)] text-[var(--text)] shadow-sm' : 'text-[var(--text-dim)]'
          }`}
        >
          {t('dashboard.expense')}
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`flex-1 py-2 text-[14px] font-bold rounded-[11px] transition-all ${
            activeTab === 'income' ? 'bg-[var(--card)] text-[var(--text)] shadow-sm' : 'text-[var(--text-dim)]'
          }`}
        >
          {t('dashboard.income')}
        </button>
      </div>

      {/* ─── Doughnut Chart Card ─── */}
      <section className="flow-card p-8">
        <div className="text-center mb-6">
          <p className="text-[11px] font-bold text-[var(--text-dim)] uppercase tracking-[0.05em] mb-1">
            {activeTab === 'expense' ? t('dashboard.expense').toUpperCase() : t('dashboard.income').toUpperCase()} • {t('analytics.thisMonth')}
          </p>
          <p className="text-[32px] font-bold text-[var(--text)] tracking-[-0.02em] tabular-nums">
            {formatMoney(totalAmount)}
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-[200px] h-[200px] relative shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories.length > 0 ? categories : [{ amount: 1, color: 'var(--muted)' }]}
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="amount"
                  stroke="none"
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[24px] font-bold text-[var(--text)] leading-none">{categories.length}</p>
              <p className="text-[12px] font-bold text-[var(--text-dim-2)] mt-1 uppercase">{t('analytics.categories')}</p>
            </div>
          </div>

          <div className="flex-1 w-full space-y-4">
            {categories.slice(0, 5).map((cat) => (
              <div key={cat.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-[14px] font-bold text-[var(--text)]">{cat.label}</span>
                </div>
                <span className="text-[14px] font-bold text-[var(--text-dim-2)] tabular-nums">
                  {((cat.amount / (totalAmount || 1)) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Daily Activity Bar Chart ─── */}
      <section className="flow-card p-8">
        <h3 className="text-[14px] font-bold text-[var(--text)] mb-6">{t('analytics.daily')}</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--text-dim-2)', fontWeight: 600 }}
                interval={4}
              />
              <YAxis axisLine={false} tickLine={false} hide />
              <Tooltip
                cursor={{ fill: 'var(--muted)', radius: 4 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[var(--card)] p-2 rounded-lg border border-[var(--border)] shadow-sm">
                        <p className="text-[12px] font-bold text-[var(--text)]">{formatMoney(payload[0].value as number)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="amount"
                fill={activeTab === 'expense' ? '#F04438' : '#12B76A'}
                radius={[4, 4, 0, 0]}
                barSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ─── Category Ranking ─── */}
      <section>
        <h3 className="text-[14px] font-bold text-[var(--text)] mb-4">{t('analytics.categoryRanking')}</h3>
        <div className="flow-card divide-y divide-[var(--border)]">
          {categories.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-dim)]">
              <p className="text-[24px] mb-2">📊</p>
              <p className="text-[13px] font-bold mb-1">Belum ada data</p>
            </div>
          ) : (
            categories.map((cat, i) => {
              const pct = ((cat.amount / (totalAmount || 1)) * 100).toFixed(1);
              return (
                <div key={cat.label} className="flex items-center gap-4 px-6 py-5">
                  <span className="text-[13px] font-bold text-[var(--text-dim-2)] w-5 text-center tabular-nums">{i + 1}</span>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[22px] shrink-0" style={{ backgroundColor: `${cat.color}15` }}>
                    {cat.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[14px] font-bold text-[var(--text)]">{cat.label}</p>
                      <div className="flex items-center gap-3">
                        <p className="text-[14px] font-bold text-[var(--text)] tabular-nums">
                          {activeTab === 'expense' ? '−' : '+'}{formatMoney(cat.amount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                      </div>
                      <span className="text-[11px] font-bold text-[var(--text-dim-2)] tabular-nums w-10 text-right">{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
