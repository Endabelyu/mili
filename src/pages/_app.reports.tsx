import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { ChartSkeleton, StatCardSkeleton, TipCard } from '../components/ui';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Wallet,
  Rocket
} from 'lucide-react';
import { reportsApi } from '../api/client';
import { formatCurrency } from '../lib/utils';

export const meta = () => [
  { title: 'Reports & Analytics | Finance Tracker' },
];

interface ReportSummary {
  income: number;
  expenses: number;
  balance: number;
  savingsRate: number;
  transactionCount: number;
}

interface CategoryBreakdown {
  categoryId: string;
  label: string;
  color: string;
  amount: number;
  percentage: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getCurrentMonth(): string {
  return formatDateForInput(new Date()).slice(0, 7);
}

function formatMonthLabel(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('id-ID', { month: 'short' });
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

// ─── Skeletons ───────────────────────────────────────────────────────────────
function ReportsSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in px-4 pt-4 lg:pt-8 w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-zinc-200 rounded mb-2 animate-shimmer" />
          <div className="h-4 w-64 bg-zinc-200 rounded animate-shimmer" />
        </div>
        <div className="h-10 w-32 bg-zinc-200 rounded animate-shimmer" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <ChartSkeleton height="h-64" />
        <ChartSkeleton height="h-64" />
        <div className="lg:col-span-2">
          <ChartSkeleton height="h-64" />
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'green' | 'red' | 'blue' | 'purple';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorStyles = {
    green: 'bg-[#f0fdf4] text-[#15803d] border-[#dcfce7]',
    red: 'bg-[#fff1f2] text-[#be123c] border-[#ffe4e6]',
    blue: 'bg-[#eff6ff] text-[#1d4ed8] border-[#dbeafe]',
    purple: 'bg-[#faf5ff] text-[#7e22ce] border-[#f3e8ff]',
  };

  const iconBgStyles = {
    green: 'bg-[#15803d]/10 text-[#15803d]',
    red: 'bg-[#be123c]/10 text-[#e11d48]',
    blue: 'bg-[#1d4ed8]/10 text-[#2563eb]',
    purple: 'bg-[#7e22ce]/10 text-[#9333ea]',
  };

  const iconColors = {
    green: 'text-[#15803d]',
    red: 'text-[#e11d48]',
    blue: 'text-[#2563eb]',
    purple: 'text-[#9333ea]',
  };

  return (
    <div className={`rounded-[24px] border p-4 transition-transform duration-200 hover:-translate-y-0.5 ${colorStyles[color]}`}>
      <div className="flex flex-col gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconBgStyles[color]}`}>
          {/* Inject color into icon if it supports classname */}
          <div className={iconColors[color]}>
             {icon}
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider opacity-60 mb-0.5">{title}</p>
          <p className="text-[18px] md:text-[20px] font-extrabold tracking-tight truncate">{value}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="flow-card p-3 shadow-lg border border-zinc-100 z-50 rounded-[16px]">
        <p className="text-sm font-bold text-[#1a1a2e] mb-2">{label}</p>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-[13px] font-medium">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[#71717a]">{entry.name}:</span>
            <span className="text-[#1a1a2e]">
              {typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  
  // FlowState reference suggests simple views without complex tabs if possible, 
  // but we will keep `viewMode` state just in case, though heavily leaning on charts.

  const [summary, setSummary] = useState<ReportSummary>({ income: 0, expenses: 0, balance: 0, savingsRate: 0, transactionCount: 0 });
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [monthly, setMonthly] = useState<MonthlyData[]>([]);

  const currentMonth = searchParams.get('month') || getCurrentMonth();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadData = async () => {
      try {
        const [sumData, catData, monData] = await Promise.all([
          reportsApi.summary(currentMonth ? { month: currentMonth } as any : undefined),
          reportsApi.byCategory(currentMonth ? { month: currentMonth } as any : undefined),
          reportsApi.monthly(),
        ]);

        if (!isMounted) return;

        setSummary({
          income: sumData.income ?? 0,
          expenses: sumData.expenses ?? 0,
          balance: (sumData.income ?? 0) - (sumData.expenses ?? 0),
          savingsRate: sumData.income > 0 ? (((sumData.income - sumData.expenses) / sumData.income) * 100) : 0,
          transactionCount: sumData.transactionCount ?? 0,
        });

        const categoryArr = [...catData];
        const totalCat = categoryArr.reduce((acc, curr) => acc + curr.amount, 0);
        
        // Use FlowState pleasing semantic colors for the first few categories
        const predefinedColors = ['#f59e0b', '#3b82f6', '#22c55e', '#a855f7', '#06b6d4', '#f43f5e', '#ec4899', '#64748b'];

        categoryArr.forEach((c, idx) => {
          c.percentage = totalCat > 0 ? Number(((c.amount / totalCat) * 100).toFixed(1)) : 0;
          c.color = predefinedColors[idx % predefinedColors.length];
        });

        setCategories(categoryArr.sort((a,b) => b.amount - a.amount));

        const monthlyArr = monData.map(data => ({
          month: data.month,
          income: data.income ?? 0,
          expenses: data.expenses ?? 0,
          balance: (data.income ?? 0) - (data.expenses ?? 0)
        })).slice(-6);
        setMonthly(monthlyArr);

      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [currentMonth]);

  const monthlyChartData = useMemo(() => {
    return monthly.map((m) => ({
      ...m,
      monthLabel: formatMonthLabel(m.month),
      savingsRate: m.income > 0 ? ((m.income - m.expenses) / m.income) * 100 : 0,
    }));
  }, [monthly]);

  const totalExpenses = useMemo(() => categories.reduce((sum, cat) => sum + cat.amount, 0), [categories]);

  useKeyboardShortcuts([
    {
      key: 'Escape',
      handler: () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('month');
        setSearchParams(newParams);
      },
    },
  ]);

  if (isLoading) return <ReportsSkeleton />;
  
  const topCategoryStr = categories.length > 0 ? categories[0].label : '';

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-24 md:pb-8 max-w-3xl mx-auto px-4 pt-4 lg:pt-8 w-full">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#ecfccb] border-2 border-white flex items-center justify-center shadow-sm shrink-0">
             <BarChart3 className="w-6 h-6 text-[#65a30d]" />
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold text-[#1a1a2e] tracking-tight">Analitik</h1>
            <p className="text-sm font-medium text-[#71717a]">Laporan keuangan Anda</p>
          </div>
        </div>
        
        <input 
          type="month" 
          value={currentMonth}
          onChange={(e) => {
            const newParams = new URLSearchParams(searchParams);
            newParams.set('month', e.target.value);
            setSearchParams(newParams);
          }}
          className="bg-zinc-100 text-[#1a1a2e] font-bold px-3 py-2 rounded-xl text-sm border-none outline-none focus:ring-2 focus:ring-[#a3e635]"
        />
      </div>

      {categories.length > 0 && (
         <TipCard 
           title="Wawasan Otomatis"
           message={`Pengeluaran terbesar bulan ini jatuh pada kategori ${topCategoryStr} (${categories[0].percentage}%)`}
           icon="💡"
         />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          title="Pemasukan"
          value={formatCurrency(summary.income)}
          icon={<TrendingUp className="w-4 h-4" />}
          color="green"
        />
        <StatCard
          title="Pengeluaran"
          value={formatCurrency(summary.expenses)}
          icon={<TrendingUp className="w-4 h-4 rotate-180" />}
          color="red"
        />
        <StatCard
          title="Sisa Saldo"
          value={formatCurrency(summary.balance)}
          icon={<Wallet className="w-4 h-4" />}
          color="blue"
        />
        <StatCard
          title="Tabungan"
          value={formatPercentage(summary.savingsRate)}
          icon={<Rocket className="w-4 h-4" />}
          color="purple"
        />
      </div>

      {/* Charts Box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-6">
        
        {/* Income vs Expenses Bar Chart (Using LineChart component here with styling adjustments) */}
        <div className="flow-card p-5 border border-zinc-100 shadow-sm flex flex-col h-full">
          <h2 className="text-[17px] font-bold text-[#1a1a2e] mb-1">Pemasukan vs Pengeluaran</h2>
          <p className="text-[13px] font-medium text-[#71717a] mb-6">6 bulan terakhir</p>
          
          {monthlyChartData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-[#a1a1aa] font-medium text-sm">
              Belum ada data
            </div>
          ) : (
            <div className="h-56 mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyChartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="monthLabel" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} tickMargin={10} />
                  <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} tickFormatter={(val: number) => `${(val/1000)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="income" name="Pemasukan" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorInc)" />
                  <Area type="monotone" dataKey="expenses" name="Pengeluaran" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pie Chart: Spend Breakdown */}
        <div className="flow-card p-5 border border-zinc-100 shadow-sm flex flex-col h-full">
          <h2 className="text-[17px] font-bold text-[#1a1a2e] mb-1">Kategori Pengeluaran</h2>
          <p className="text-[13px] font-medium text-[#71717a] mb-6">Bulan ini</p>
          
          {categories.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-[#a1a1aa] font-medium text-sm">
              Belum ada pengeluaran
            </div>
          ) : (
            <div className="flex-1 flex flex-col pt-2">
              <div className="h-44 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categories} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="amount" stroke="none">
                      {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Tooltip content={({ active, payload }: any) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="flow-card p-3 shadow-lg border border-zinc-100 rounded-[16px]">
                            <p className="text-sm font-bold text-[#1a1a2e]">{data.label}</p>
                            <p className="text-[13px] font-medium text-[#71717a] mt-1">
                              {formatCurrency(data.amount)} ({data.percentage}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#a1a1aa] mb-0.5">TOTAL</p>
                  <p className="text-[15px] font-extrabold text-[#1a1a2e] leading-none">
                     {totalExpenses > 1000000 
                       ? `${(totalExpenses / 1000000).toFixed(1)}jt` 
                       : totalExpenses > 1000 
                          ? `${(totalExpenses / 1000).toFixed(0)}rb`
                          : formatCurrency(totalExpenses)
                     }
                  </p>
                </div>
              </div>

              {/* Minimal Legend below pie chart */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-3 mt-6">
                {categories.slice(0, 4).map(cat => (
                   <div key={cat.categoryId} className="flex items-center gap-2 min-w-0">
                     <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                     <span className="text-[12px] font-medium text-[#71717a] truncate">{cat.label}</span>
                     <span className="text-[12px] font-bold text-[#1a1a2e] ml-auto">{cat.percentage}%</span>
                   </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
