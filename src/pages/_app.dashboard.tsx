import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { transactionsApi, reportsApi } from '../api/client';
import { type Transaction } from '../types';
import {
  TrendingUp, TrendingDown, ArrowRight, Receipt, Plus,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────
interface SummaryStats {
  income: number;
  expenses: number;
  balance: number;
  savingsRate: number;
  transactionCount: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatCurrency(amount: number | string) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
}

function formatDate(dateStr: string | Date) {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in px-4 pt-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-40 rounded-[2rem]" />
      <div className="grid grid-cols-4 gap-3"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; income: number; expenses: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const now = new Date();
        const fromISO = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
        const toISO = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

        const [txns, summaryData, monthly] = await Promise.all([
          transactionsApi.list({ limit: 5 }),
          reportsApi.summary({ from: fromISO, to: toISO }),
          reportsApi.monthly(),
        ]);

        setRecentTransactions(txns);

        const income = (summaryData as any).income ?? 0;
        const expenses = (summaryData as any).expenses ?? 0;
        setSummary({
          income,
          expenses,
          balance: income - expenses,
          savingsRate: income > 0 ? Math.round(((income - expenses) / income) * 100) : 0,
          transactionCount: txns.length,
        });

        // Transform monthly map into array for recharts
        setMonthlyData(
          Object.entries(monthly as Record<string, any>).map(([month, v]: [string, any]) => ({
            month,
            income: v.income ?? 0,
            expenses: v.expenses ?? 0,
          }))
        );
      } catch (e) {
        console.error('Dashboard load failed', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  const firstName = user?.name ? user.name.split(' ')[0] : 'User';

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-24 md:pb-6 px-4 pt-4 max-w-lg mx-auto lg:max-w-none">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-1">
            Selamat pagi <span className="text-lg">👋</span>
          </p>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mt-0.5">{firstName}</h1>
        </div>
        <Link to="/profile" className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-2xl shadow-inner cursor-pointer hover:border-[var(--text-primary)]/30 transition-colors">
          😎
        </Link>
      </div>

      {/* Hero Card */}
      {summary && (
        <div className="relative overflow-hidden rounded-[2rem] p-6 text-white shadow-2xl shadow-blue-500/20 bg-gradient-to-br from-[var(--gradient-hero-start)] to-[var(--gradient-hero-end)]">
          <div className="relative z-10">
            <p className="text-[10px] font-bold tracking-widest uppercase text-white/80 mb-1">Total Saldo</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">{formatCurrency(summary.balance)}</h2>
            <p className="text-xs text-white/80 mb-6">Semua akun • Bulan ini</p>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[10px] flex items-center gap-1 text-white/80 uppercase font-bold"><TrendingUp className="w-3 h-3"/>Masuk</p>
                <p className="text-sm font-bold mt-0.5">+{formatCurrency(summary.income)}</p>
              </div>
              <div>
                <p className="text-[10px] flex items-center gap-1 text-white/80 uppercase font-bold"><TrendingDown className="w-3 h-3"/>Keluar</p>
                <p className="text-sm font-bold mt-0.5">-{formatCurrency(summary.expenses)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3 pt-2">
        {[
          { label: 'Keluar', icon: TrendingDown, color: 'text-[var(--gradient-danger-start)]', route: '/transactions?type=expense' },
          { label: 'Masuk', icon: TrendingUp, color: 'text-[var(--gradient-success-start)]', route: '/transactions?type=income' },
          { label: 'Transfer', icon: ArrowRight, color: 'text-[var(--gradient-hero-start)]', route: '/transactions' },
          { label: 'Laporan', icon: Receipt, color: 'text-[var(--text-secondary)]', route: '/reports' },
        ].map(action => (
          <Link key={action.label} to={action.route} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-[1.25rem] glass-card flex items-center justify-center hover:scale-105 transition-transform">
              <action.icon className={`w-6 h-6 ${action.color}`} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] font-semibold text-[var(--text-secondary)]">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Monthly Chart */}
      {monthlyData.length > 0 && (
        <div className="glass-card p-4">
          <h3 className="text-base font-bold text-[var(--text-primary)] mb-4">Tren Bulanan</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="income" stroke="#22c55e" fill="rgba(34,197,94,0.1)" name="Income" />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="rgba(239,68,68,0.1)" name="Expenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Terbaru</h3>
          <Link to="/transactions" className="text-xs font-semibold text-[var(--gradient-hero-start)] opacity-80 hover:opacity-100 transition-opacity flex items-center gap-1">
            Lihat Semua <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentTransactions.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 flex items-center justify-center">
              <Receipt className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="text-sm font-medium mb-1">No transactions yet</h4>
            <Link to="/transactions">
              <button className="mt-2 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5 mx-auto">
                <Plus className="w-4 h-4" /> Add Transaction
              </button>
            </Link>
          </div>
        ) : (
          <div className="glass-card divide-y divide-[var(--text-primary)]/10">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 px-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 text-lg">
                    {tx.type === 'income' ? '📈' : '📉'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description || tx.categoryId}</p>
                    <p className="text-xs text-gray-500">{formatDate(tx.date)} • {tx.categoryId}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold whitespace-nowrap ml-4 ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}