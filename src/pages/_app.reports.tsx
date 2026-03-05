import '../styles/animations.css';
import { useState, useMemo } from 'react';
import { type LoaderFunctionArgs, type MetaFunction } from 'react-router';
import { useLoaderData, useSearchParams } from 'react-router';
import { requireSession } from '@app/lib/auth.server';
import { useKeyboardShortcuts } from '@app/hooks/useKeyboardShortcuts';
import { getFinancialSummary, getExpensesByCategory, getMonthlyTrend } from '@server/lib/services/reports.server';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  Calendar,
  Loader2,
  DollarSign,
  Percent,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  LayoutGrid,
  List,
} from 'lucide-react';
import { ChartSkeleton, StatCardSkeleton } from '@app/components/ui';

// ============================================================================
// META
// ============================================================================

export const meta: MetaFunction = () => {
  return [
    { title: 'Reports & Analytics | Finance Tracker' },
    { name: 'description', content: 'Track your financial health and spending patterns' },
  ];
};

// Types matching the API response
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

interface LoaderData {
  summary: ReportSummary;
  categories: CategoryBreakdown[];
  monthly: MonthlyData[];
}


// Helper functions
function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getCurrentMonth(): string {
  return formatDateForInput(new Date()).slice(0, 7);
}

function formatMonthLabel(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  const session = await requireSession(request);

  const url = new URL(request.url);
  const month = url.searchParams.get('month') || undefined;

  try {
    const [summary, categories, monthly] = await Promise.all([
      getFinancialSummary(session.userId, month),
      getExpensesByCategory(session.userId, month),
      getMonthlyTrend(session.userId, 6),
    ]);

    return Response.json({ summary, categories, monthly });
  } catch (error) {
    console.error('Reports loader error:', error);
    return Response.json(
      {
        summary: { income: 0, expenses: 0, balance: 0, savingsRate: 0, transactionCount: 0 },
        categories: [],
        monthly: [],
      },
      { status: 500 }
    );
  }
}

// Loading skeleton component
function ChartLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );
}

// Reports Skeleton
function ReportsSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded mb-2 animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Stats Overview Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <ChartSkeleton height="h-64 md:h-80" />
        <ChartSkeleton height="h-64 md:h-80" />
        <div className="lg:col-span-2">
          <ChartSkeleton height="h-64 md:h-80" />
        </div>
      </div>
    </div>
  );
}

// Stat card component
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color: 'green' | 'red' | 'blue' | 'purple';
}

function StatCard({ title, value, icon, trend, trendValue, color }: StatCardProps) {
  const colorStyles = {
    green: 'glass-card dark:bg-emerald-950/20 text-emerald-500 dark:text-emerald-400',
    red: 'glass-card dark:bg-rose-950/20 text-rose-500 dark:text-rose-400',
    blue: 'glass-card dark:bg-blue-950/20 text-[#5c4a44] dark:text-blue-400',
    purple: 'glass-card dark:bg-purple-950/20 text-[#5c4a44] dark:text-purple-400',
  };

  const iconBgStyles = {
    green: 'bg-emerald-500/20 text-emerald-500',
    red: 'bg-rose-500/20 text-rose-500',
    blue: 'bg-[var(--text-primary)]/10 text-[#5c4a44]',
    purple: 'bg-[var(--text-primary)]/10 text-[#5c4a44]',
  };

  return (
    <div className={`rounded-[2rem] border border-[var(--card-border)] p-4 md:p-5 ${colorStyles[color]} transition-transform duration-200 hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm font-medium opacity-80 truncate">{title}</p>
          <p className="text-lg md:text-2xl font-bold mt-1">{value}</p>
          {trend && trendValue && (
            <div className={`hidden md:flex items-center gap-1 mt-2 text-xs font-medium`}>
              {trend === 'up' ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : trend === 'down' ? (
                <ArrowDownRight className="w-3 h-3" />
              ) : null}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgStyles[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Custom tooltip for charts
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: number;
    payload: CategoryBreakdown;
  }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg shadow-lg border border-[var(--card-border)] p-3">
        <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium text-gray-900">
              {typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const { summary, categories, monthly } = useLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'charts' | 'list'>('charts');

  const currentMonth = searchParams.get('month') || getCurrentMonth();

  // Process monthly data for charts
  const monthlyChartData = useMemo(() => {
    return monthly.map((m) => ({
      ...m,
      monthLabel: formatMonthLabel(m.month),
      savingsRate: m.income > 0 ? ((m.income - m.expenses) / m.income) * 100 : 0,
    }));
  }, [monthly]);

  // Calculate totals for pie chart center
  const totalExpenses = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.amount, 0);
  }, [categories]);

  // Keyboard shortcut: Escape to clear month filter
  useKeyboardShortcuts([
    {
      key: 'Escape',
      handler: () => {
        // Clear month filter on escape
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('month');
        setSearchParams(newParams);
      },
    },
  ]);

  const handleMonthChange = (value: string) => {
    setIsLoading(true);
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set('month', value);
    } else {
      newParams.delete('month');
    }
    setSearchParams(newParams);
    setTimeout(() => setIsLoading(false), 300);
  };

  // Determine savings trend
  const savingsTrend = useMemo(() => {
    if (monthlyChartData.length < 2) return { trend: 'neutral' as 'up' | 'down' | 'neutral', value: 'No data' };
    const current = monthlyChartData[monthlyChartData.length - 1];
    const previous = monthlyChartData[monthlyChartData.length - 2];
    const diff = current.savingsRate - previous.savingsRate;
    return {
      trend: (diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral') as 'up' | 'down' | 'neutral',
      value: `${Math.abs(diff).toFixed(1)}% vs last month`,
    };
  }, [monthlyChartData]);

  if (isLoading) {
    return <ReportsSkeleton />;
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-20 md:pb-0">
      {/* Consolidated Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="hidden md:block">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your financial health and spending patterns
          </p>
        </div>
        
        <div className="md:hidden flex justify-between items-center w-full">
            <p className="text-sm font-medium text-gray-600">
                {new Date(currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('charts')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'charts' ? 'bg-[var(--text-primary)]/10 text-[#5c4a44]' : 'text-gray-500 hover:bg-[#5c4a44]/5'}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[var(--text-primary)]/10 text-[#5c4a44]' : 'text-gray-500 hover:bg-[#5c4a44]/5'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
        </div>

        {/* Date Controls */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div className="relative">
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="h-10 px-3 pr-8 text-sm rounded-lg border border-[var(--card-border)]
                bg-white dark:bg-[#1E1F26] text-[#5c4a44] dark:text-white appearance-none cursor-pointer touch-target
                focus:outline-none focus:ring-2 focus:ring-[var(--gradient-hero-start)]/20 focus:border-[#5c4a44]
                transition-all duration-200"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4" data-walkthrough="reports-stats">
        <StatCard
          title="Income"
          value={formatCurrency(summary.income)}
          icon={<TrendingUp className="w-4 h-4 md:w-5 md:h-5" />}
          color="green"
        />
        <StatCard
          title="Expenses"
          value={formatCurrency(summary.expenses)}
          icon={<TrendingUp className="w-4 h-4 md:w-5 md:h-5 rotate-180" />}
          color="red"
        />
        <StatCard
          title="Balance"
          value={formatCurrency(summary.balance)}
          icon={<Wallet className="w-4 h-4 md:w-5 md:h-5" />}
          color="blue"
        />
        <StatCard
          title="Savings"
          value={formatPercentage(summary.savingsRate)}
          icon={<Percent className="w-4 h-4 md:w-5 md:h-5" />}
          trend={savingsTrend.trend}
          trendValue={savingsTrend.value}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Income vs Expenses Trend */}
          <div className="glass-card rounded-[2rem] border border-[var(--card-border)] p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-10 h-10 rounded-lg bg-[var(--text-primary)]/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#5c4a44]" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900">Income vs Expenses</h2>
                <p className="text-xs md:text-sm text-gray-500">Last 6 months trend</p>
              </div>
            </div>

            {monthlyChartData.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No data available</p>
              </div>
            ) : (
              <div className="h-48 md:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#5c4a44" strokeOpacity={0.1} />
                    <XAxis
                      dataKey="monthLabel"
                      tick={{ fontSize: 11, fill: '#5c4a44', opacity: 0.6 }}
                      axisLine={{ stroke: '#5c4a44', strokeOpacity: 0.15 }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#5c4a44', opacity: 0.6 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={30}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px', color: '#5c4a44' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="income"
                      name="Income"
                      stroke="#4a9473"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: '#FAF0E6' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      name="Expenses"
                      stroke="#c0544a"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: '#FAF0E6' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Spending by Category */}
          <div className="glass-card rounded-[2rem] border border-[var(--card-border)] p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-10 h-10 rounded-lg bg-[var(--text-primary)]/10 flex items-center justify-center">
                <PieChartIcon className="w-5 h-5 text-[#5c4a44]" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900">Spending by Category</h2>
                <p className="text-xs md:text-sm text-gray-500">
                  {currentMonth} breakdown
                </p>
              </div>
            </div>

            {categories.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No expense data for this month</p>
              </div>
            ) : (
              <div className="h-48 md:h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="amount"
                    >
                      {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#6b7280'} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload: CategoryBreakdown }> }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="glass-card rounded-lg shadow-lg border border-[var(--card-border)] p-3">
                              <p className="text-sm font-medium text-gray-900">{data.label}</p>
                              <p className="text-sm text-[#5c4a44]">
                                {formatCurrency(data.amount)} ({data.percentage}%)
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={40}
                      iconType="circle"
                      formatter={(value) => <span className="text-xs md:text-sm text-gray-600">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center total */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-base md:text-lg font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Savings Rate Over Time */}
          <div className="glass-card rounded-[2rem] border border-[var(--card-border)] p-4 md:p-6 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#4a9473]/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900">Savings Rate Over Time</h2>
                <p className="text-xs md:text-sm text-gray-500">Monthly savings percentage trend</p>
              </div>
            </div>

            {monthlyChartData.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No data available</p>
              </div>
            ) : (
              <div className="h-48 md:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4a9473" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4a9473" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#5c4a44" strokeOpacity={0.1} />
                    <XAxis
                      dataKey="monthLabel"
                      tick={{ fontSize: 11, fill: '#5c4a44', opacity: 0.6 }}
                      axisLine={{ stroke: '#5c4a44', strokeOpacity: 0.15 }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#5c4a44', opacity: 0.6 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${value.toFixed(0)}%`}
                      domain={[0, 'auto']}
                    />
                    <Tooltip
                      content={({ active, payload, label }: { active?: boolean; payload?: ReadonlyArray<{ value: number }>; label?: string | number }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="glass-card rounded-lg shadow-lg border border-[var(--card-border)] p-3">
                              <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
                              <p className="text-sm text-emerald-500 font-medium">
                                Savings Rate: {payload[0].value.toFixed(1)}%
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="savingsRate"
                      name="Savings Rate"
                      stroke="#4a9473"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSavings)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Legend for reference line */}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-[#4a9473] rounded" />
                <span className="text-gray-600">Your Savings Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-[#4a9473]/30 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #4a9473 0, #4a9473 4px, transparent 4px, transparent 8px)' }} />
                <span className="text-gray-600">Recommended (20%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
