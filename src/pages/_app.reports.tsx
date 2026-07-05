import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-keys';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { transactionsApi, reportsApi } from '../api/client';
import { usePreferences } from '../hooks/usePreferences';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { CategoryIcon } from '../components/ui/CategoryIcon';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Return an array of the last `count` months as "YYYY-MM" strings, newest first. */
function buildMonthOptions(count: number): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    options.push({ value, label });
  }
  return options;
}

function formatMonthLabel(yyyyMm: string): string {
  const [y, m] = yyyyMm.split('-');
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface MonthSummary {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { t, formatMoney } = usePreferences();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');

  // ─── Month picker state ───────────────────────────────────────────────────
  const monthOptions = useMemo(() => buildMonthOptions(12), []);

  const currentMonth = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);

  const handlePrevMonth = useCallback(() => {
    setSelectedMonth(prev => {
      const idx = monthOptions.findIndex(o => o.value === prev);
      if (idx < monthOptions.length - 1) return monthOptions[idx + 1].value;
      return prev;
    });
  }, [monthOptions]);

  const handleNextMonth = useCallback(() => {
    setSelectedMonth(prev => {
      const idx = monthOptions.findIndex(o => o.value === prev);
      if (idx > 0) return monthOptions[idx - 1].value;
      return prev;
    });
  }, [monthOptions]);

  const selectedMonthLabel = useMemo(
    () => monthOptions.find(o => o.value === selectedMonth)?.label ?? selectedMonth,
    [monthOptions, selectedMonth],
  );

  const isCurrentMonth = selectedMonth === currentMonth;
  const isOldestMonth = selectedMonth === monthOptions[monthOptions.length - 1]?.value;

  // ─── Transactions for selected month ─────────────────────────────────────
  const { data: txnsData, isLoading: txnsLoading } = useQuery({
    queryKey: queryKeys.transactions.list({ month: selectedMonth, limit: 500 }),
    queryFn: () => transactionsApi.list({ month: selectedMonth, limit: 500 }),
  });

  const transactions = txnsData?.items ?? [];

  // Filter transactions by active tab (income/expense)
  const filteredTransactions = useMemo(
    () => transactions.filter(tx => tx.type === activeTab),
    [transactions, activeTab],
  );

  // Aggregate by category
  const categories = useMemo(() => {
    const catMap = new Map<string, { label: string; amount: number; icon: string | null | undefined; color: string }>();
    const colors = ['#F79009', '#7F56D9', '#15803D', '#0BA5EC', '#F04438', '#EE46BC', '#334155', '#15B79E', '#A16207', '#4F46E5'];
    let colorIndex = 0;

    filteredTransactions.forEach(tx => {
      const amount = parseFloat(String(tx.amount));
      const catId = tx.categoryId;
      const label = tx.category?.label ?? catId;
      const icon = tx.category?.icon;
      const catColor = tx.category?.color ?? colors[colorIndex % colors.length];

      if (catMap.has(catId)) {
        catMap.get(catId)!.amount += amount;
      } else {
        catMap.set(catId, { label, amount, icon, color: catColor });
        if (!tx.category?.color) colorIndex++;
      }
    });

    return Array.from(catMap.values()).sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  const totalAmount = categories.reduce((sum, c) => sum + c.amount, 0);

  // ─── Income / expense / net for selected month ────────────────────────────
  const { totalIncome, totalExpenses, netGrowth, savingsRate } = useMemo(() => {
    const income = transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + parseFloat(String(tx.amount)), 0);
    const expenses = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + parseFloat(String(tx.amount)), 0);
    const net = income - expenses;
    const rate = income > 0 ? Math.max(0, (net / income) * 100) : 0;
    return { totalIncome: income, totalExpenses: expenses, netGrowth: net, savingsRate: rate };
  }, [transactions]);

  // Aggregate by day for area chart — uses selectedMonth to get correct daysInMonth
  const dailyData = useMemo(() => {
    const [yr, mo] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(yr, mo, 0).getDate();
    const dayMap = new Map<number, number>();
    for (let i = 1; i <= daysInMonth; i++) dayMap.set(i, 0);

    filteredTransactions.forEach(tx => {
      const day = new Date(tx.date).getDate();
      dayMap.set(day, (dayMap.get(day) ?? 0) + parseFloat(String(tx.amount)));
    });

    return Array.from(dayMap.entries()).map(([day, amount]) => ({ day, amount }));
  }, [filteredTransactions, selectedMonth]);

  // ─── Multi-month trend (12 months) ───────────────────────────────────────
  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: queryKeys.reports.monthly(12),
    queryFn: () => reportsApi.monthly({ months: 12 }),
  });

  const trendData = useMemo<MonthSummary[]>(() => {
    if (!monthlyData) return [];
    return [...monthlyData]
      .reverse()
      .map(item => ({
        month: formatMonthLabel(item.month),
        income: item.income,
        expenses: item.expenses,
        balance: item.balance,
      }));
  }, [monthlyData]);

  const peakExpenseMonth = useMemo(() => {
    if (!trendData.length) return null;
    return trendData.reduce((max, m) => (m.expenses > max.expenses ? m : max), trendData[0]);
  }, [trendData]);

  // ─── Month comparison ─────────────────────────────────────────────────────
  const [compMonthA, setCompMonthA] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [compMonthB, setCompMonthB] = useState<string>(() => {
    const d = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const compDataA = useMemo(
    () => monthlyData?.find(m => m.month === compMonthA) ?? null,
    [monthlyData, compMonthA],
  );
  const compDataB = useMemo(
    () => monthlyData?.find(m => m.month === compMonthB) ?? null,
    [monthlyData, compMonthB],
  );

  // ─── Loading skeleton ─────────────────────────────────────────────────────
  if (txnsLoading) {
    return (
      <div className="space-y-6 pb-10">
        <div className="h-8 w-32 skeleton rounded-lg" />
        <div className="h-12 skeleton rounded-[14px]" />
        <div className="h-[300px] skeleton rounded-[16px]" />
        <div className="h-[250px] skeleton rounded-[16px]" />
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in pb-10">

      {/* ─── Header ─── */}
      <div className="flex items-center gap-4 pt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-2xl bg-[var(--muted)] text-[var(--text)] flex items-center justify-center hover:bg-[var(--border)] transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-[28px] font-bold text-[var(--text)] tracking-[-0.02em] leading-tight">{t('analytics.title')}</h1>
          <p className="text-[12px] font-bold text-[var(--text-dim-2)] opacity-60 uppercase tracking-[0.1em]">Analisis Arus Kas Anda</p>
        </div>
      </div>

      {/* ─── Month Picker ─── */}
      <div className="flex items-center justify-between bg-[var(--card)] p-2 rounded-[20px] border border-[var(--border)] shadow-sm">
        <button
          type="button"
          onClick={handlePrevMonth}
          disabled={isOldestMonth}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[var(--muted)] transition-colors disabled:opacity-30"
          title="Bulan sebelumnya"
        >
          <ChevronLeft className="w-5 h-5 text-[var(--text)]" />
        </button>

        <div className="flex flex-col items-center">
          <p className="text-[15px] font-bold text-[var(--text)] capitalize">{selectedMonthLabel}</p>
          {isCurrentMonth && (
            <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">Bulan ini</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          disabled={isCurrentMonth}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[var(--muted)] transition-colors disabled:opacity-30"
          title="Bulan berikutnya"
        >
          <ChevronRight className="w-5 h-5 text-[var(--text)]" />
        </button>
      </div>

      {/* ─── Financial Pulse ─── */}
      <div className="relative rounded-[32px] p-8 border-[2.5px] border-[#0891B2]/20 bg-[#CFFAFE]/10 overflow-hidden group">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h2 className="text-[14px] font-bold text-[#0E7490] tracking-[0.05em] uppercase mb-1">Denyut Finansial</h2>
            <p className="text-[13px] text-[#0E7490]/70 font-medium max-w-[320px]">
              {totalAmount > 0
                ? `Alur ${activeTab === 'expense' ? t('reports.cashFlowExpense') : t('reports.cashFlowIncome')} ${t('reports.cashFlowSuffix')} ${totalAmount > 1000000 ? t('reports.cashFlowHigh') : t('reports.cashFlowNormal')}. ${t('reports.cashFlowTip')}`
                : t('reports.noCashFlow')}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] font-bold text-[#0E7490]/50 uppercase tracking-widest mb-1">Rasio Menabung</p>
            <p className="text-[32px] font-bold text-[#0891B2] tracking-[-0.03em] tabular-nums">{savingsRate.toFixed(1)}%</p>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold mt-1 ${
              savingsRate >= 20
                ? 'bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]'
                : savingsRate > 0
                ? 'bg-[#F79009]/10 border border-[#F79009]/20 text-[#F79009]'
                : 'bg-[#F04438]/10 border border-[#F04438]/20 text-[#F04438]'
            }`}>
              {savingsRate >= 20 ? 'Lancar' : savingsRate > 0 ? 'Perhatian' : 'Defisit'}
            </div>
          </div>
        </div>
        {/* Subtle Wave Decoration */}
        <div className="absolute -bottom-1 left-0 w-full h-12 opacity-[0.07] pointer-events-none group-hover:opacity-10 transition-opacity">
          <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0 80 Q 100 60, 200 85 T 400 70 L 400 100 L 0 100 Z" fill="#0891B2" />
          </svg>
        </div>
      </div>

      {/* ─── Asset Growth Card ─── */}
      <div className={`rounded-[24px] p-6 border-[2px] ${
        netGrowth >= 0
          ? 'border-[#10B981]/25 bg-[#ECFDF5]/60'
          : 'border-[#F04438]/25 bg-[#FEF2F2]/60'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] mb-1 ${netGrowth >= 0 ? 'text-[#059669]' : 'text-[#DC2626]'}"
              style={{ color: netGrowth >= 0 ? '#059669' : '#DC2626' }}
            >
              Pertumbuhan Aset
            </p>
            <p className="text-[11px] text-[var(--text-dim-2)] font-medium">Tabungan bulan ini</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              {netGrowth >= 0
                ? <TrendingUp className="w-5 h-5 text-[#10B981]" />
                : <TrendingDown className="w-5 h-5 text-[#F04438]" />
              }
              <p className={`text-[28px] font-bold tracking-[-0.02em] tabular-nums ${
                netGrowth >= 0 ? 'text-[#10B981]' : 'text-[#F04438]'
              }`}>
                {netGrowth >= 0 ? '+' : ''}{formatMoney(netGrowth)}
              </p>
            </div>
            <div className="flex items-center gap-4 justify-end text-[11px] font-bold text-[var(--text-dim-2)]">
              <span>Masuk: <span className="text-[#10B981]">{formatMoney(totalIncome)}</span></span>
              <span>Keluar: <span className="text-[#F04438]">{formatMoney(totalExpenses)}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tab Switcher ─── */}
      <div className="flex p-1 bg-[var(--muted)] rounded-[14px] w-full">
        <button
          type="button"
          onClick={() => setActiveTab('expense')}
          className={`flex-1 py-2 text-[14px] font-bold rounded-[11px] transition-all ${
            activeTab === 'expense' ? 'bg-[var(--card)] text-[var(--text)] shadow-sm' : 'text-[var(--text-dim)]'
          }`}
        >
          {t('dashboard.expense')}
        </button>
        <button
          type="button"
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
            {activeTab === 'expense' ? t('dashboard.expense').toUpperCase() : t('dashboard.income').toUpperCase()} • {isCurrentMonth ? t('analytics.thisMonth') : selectedMonthLabel}
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

      {/* ─── Daily Activity Chart ─── */}
      <section className="flow-card p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[14px] font-bold text-[var(--text)]">{t('analytics.daily')}</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeTab === 'expense' ? '#F04438' : '#10B981' }} />
            <span className="text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-widest">{activeTab === 'expense' ? 'Arus Keluar' : 'Arus Masuk'}</span>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeTab === 'expense' ? '#F04438' : '#10B981'} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={activeTab === 'expense' ? '#F04438' : '#10B981'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'var(--text-dim-2)', fontWeight: 600 }}
                interval={4}
              />
              <YAxis axisLine={false} tickLine={false} hide />
              <Tooltip
                cursor={{ stroke: 'var(--accent)', strokeWidth: 1, strokeDasharray: '4 4' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[var(--card)] p-3 rounded-2xl border border-[var(--border)] shadow-xl animate-in zoom-in-95 duration-200">
                        <p className="text-[10px] font-bold text-[var(--text-dim-2)] uppercase tracking-widest mb-1">Tanggal {payload[0].payload.day}</p>
                        <p className="text-[14px] font-bold text-[var(--text)] tabular-nums">{formatMoney(payload[0].value as number)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke={activeTab === 'expense' ? '#F04438' : '#10B981'}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorAmount)"
                animationDuration={1500}
              />
            </AreaChart>
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
              <p className="text-[13px] font-bold mb-1">{t('reports.noData')}</p>
            </div>
          ) : (
            categories.map((cat, i) => {
              const pct = ((cat.amount / (totalAmount || 1)) * 100).toFixed(1);
              return (
                <div key={cat.label} className="flex items-center gap-4 px-6 py-5">
                  <span className="text-[13px] font-bold text-[var(--text-dim-2)] w-5 text-center tabular-nums">{i + 1}</span>
                  <CategoryIcon category={cat.label} icon={cat.icon} size="md" />
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

      {/* ─── Monthly Trend (12-month all-time view) ─── */}
      <section className="flow-card p-8">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="text-[14px] font-bold text-[var(--text)]">Tren Bulanan</h3>
            <p className="text-[11px] text-[var(--text-dim-2)] mt-0.5">12 bulan terakhir</p>
          </div>
          {peakExpenseMonth && (
            <div className="text-right">
              <p className="text-[10px] font-bold text-[var(--text-dim-2)] uppercase tracking-widest">Pengeluaran tertinggi</p>
              <p className="text-[12px] font-bold text-[#F04438]">{peakExpenseMonth.month}</p>
            </div>
          )}
        </div>

        {monthlyLoading ? (
          <div className="flex items-center gap-2 text-slate-400 py-8 justify-center">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm font-inter">Memuat tren...</span>
          </div>
        ) : trendData.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Belum ada data bulanan.</p>
          </div>
        ) : (
          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'var(--text-dim-2)', fontWeight: 600 }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={45}
                />
                <YAxis axisLine={false} tickLine={false} hide />
                <Tooltip
                  cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const inc = payload.find(p => p.dataKey === 'income')?.value as number | undefined;
                      const exp = payload.find(p => p.dataKey === 'expenses')?.value as number | undefined;
                      return (
                        <div className="bg-[var(--card)] p-3 rounded-2xl border border-[var(--border)] shadow-xl animate-in zoom-in-95 duration-200 min-w-[160px]">
                          <p className="text-[10px] font-bold text-[var(--text-dim-2)] uppercase tracking-widest mb-2">{label}</p>
                          {inc !== undefined && (
                            <div className="flex justify-between gap-4 mb-1">
                              <span className="text-[12px] font-bold text-[#10B981]">Masuk</span>
                              <span className="text-[12px] font-bold text-[var(--text)] tabular-nums">{formatMoney(inc)}</span>
                            </div>
                          )}
                          {exp !== undefined && (
                            <div className="flex justify-between gap-4">
                              <span className="text-[12px] font-bold text-[#F04438]">Keluar</span>
                              <span className="text-[12px] font-bold text-[var(--text)] tabular-nums">{formatMoney(exp)}</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingTop: 8 }}
                  formatter={(value) => value === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                />
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={18} />
                <Bar dataKey="expenses" fill="#F04438" radius={[4, 4, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* ─── Month Comparison ─── */}
      <section className="flow-card p-8">
        <h3 className="text-[14px] font-bold text-[var(--text)] mb-1">Bandingkan Bulan</h3>
        <p className="text-[11px] text-[var(--text-dim-2)] mb-5">Pilih dua bulan untuk dibandingkan</p>

        {/* Selectors */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div>
            <label htmlFor="comp-month-a" className="block text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-widest mb-1.5">
              Bulan A
            </label>
            <select
              id="comp-month-a"
              value={compMonthA}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCompMonthA(e.target.value)}
              className="w-full px-3 py-2.5 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[13px] font-bold text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 appearance-none cursor-pointer"
            >
              {monthOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="comp-month-b" className="block text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-widest mb-1.5">
              Bulan B
            </label>
            <select
              id="comp-month-b"
              value={compMonthB}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCompMonthB(e.target.value)}
              className="w-full px-3 py-2.5 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[13px] font-bold text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 appearance-none cursor-pointer"
            >
              {monthOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {monthlyLoading ? (
          <div className="flex items-center gap-2 text-slate-400 justify-center py-6">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Memuat perbandingan...</span>
          </div>
        ) : (!compDataA && !compDataB) ? (
          <div className="text-center py-8">
            <p className="text-[13px] text-[var(--text-dim-2)]">Data tidak tersedia untuk bulan yang dipilih.</p>
          </div>
        ) : (
          <>
            {/* Stat cards comparison */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {(
                [
                  { key: 'income' as const, label: 'Pemasukan', color: '#10B981' },
                  { key: 'expenses' as const, label: 'Pengeluaran', color: '#F04438' },
                  { key: 'balance' as const, label: 'Selisih', color: '#7F56D9' },
                ] as const
              ).map(({ key, label, color }) => {
                const valA = compDataA?.[key] ?? 0;
                const valB = compDataB?.[key] ?? 0;
                // For balance/income: higher is better. For expenses: lower is better.
                const aBetter = key === 'expenses' ? valA <= valB : valA >= valB;
                return (
                  <div key={key} className="bg-[var(--muted)] rounded-[16px] p-3 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color }}>{label}</p>
                    <div className={`text-[12px] font-bold tabular-nums mb-1 rounded-lg px-2 py-0.5 ${aBetter ? 'bg-[#10B981]/10 text-[#10B981]' : 'text-[var(--text-dim-2)]'}`}>
                      {formatMoney(valA)}
                    </div>
                    <div className="text-[10px] font-bold text-[var(--text-dim-2)] mb-1">vs</div>
                    <div className={`text-[12px] font-bold tabular-nums rounded-lg px-2 py-0.5 ${!aBetter ? 'bg-[#10B981]/10 text-[#10B981]' : 'text-[var(--text-dim-2)]'}`}>
                      {formatMoney(valB)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Month labels for context */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <p className="text-[11px] font-bold text-[var(--text-dim-2)]">
                <span className="inline-block w-2 h-2 rounded-full bg-[#10B981] mr-1.5 align-middle" />
                {formatMonthLabel(compMonthA)}
              </p>
              <p className="text-[11px] font-bold text-[var(--text-dim-2)]">
                <span className="inline-block w-2 h-2 rounded-full bg-[var(--text-dim-2)] mr-1.5 align-middle" />
                {formatMonthLabel(compMonthB)}
              </p>
            </div>

            {/* Bar chart comparison */}
            {(compDataA || compDataB) && (
              <div className="h-48 w-full mt-5">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        label: 'Pemasukan',
                        A: compDataA?.income ?? 0,
                        B: compDataB?.income ?? 0,
                      },
                      {
                        label: 'Pengeluaran',
                        A: compDataA?.expenses ?? 0,
                        B: compDataB?.expenses ?? 0,
                      },
                      {
                        label: 'Selisih',
                        A: compDataA?.balance ?? 0,
                        B: compDataB?.balance ?? 0,
                      },
                    ]}
                    margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
                    barGap={4}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: 'var(--text-dim-2)', fontWeight: 600 }}
                    />
                    <YAxis axisLine={false} tickLine={false} hide />
                    <Tooltip
                      cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[var(--card)] p-3 rounded-2xl border border-[var(--border)] shadow-xl animate-in zoom-in-95 duration-200 min-w-[170px]">
                              <p className="text-[10px] font-bold text-[var(--text-dim-2)] uppercase tracking-widest mb-2">{label}</p>
                              {payload.map(p => (
                                <div key={p.dataKey} className="flex justify-between gap-4 mb-1">
                                  <span className="text-[11px] font-bold" style={{ color: p.color }}>
                                    {p.dataKey === 'A' ? formatMonthLabel(compMonthA) : formatMonthLabel(compMonthB)}
                                  </span>
                                  <span className="text-[11px] font-bold text-[var(--text)] tabular-nums">{formatMoney(p.value as number)}</span>
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="A" name={formatMonthLabel(compMonthA)} fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="B" name={formatMonthLabel(compMonthB)} fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </section>

    </div>
  );
}
