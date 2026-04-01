import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // keeping router-dom since that's what's imported here
import { useAuth } from '../hooks/useAuth';
import { transactionsApi, reportsApi } from '../api/client';
import { type Transaction } from '../types';
import {
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Receipt,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { CategoryIcon } from '../components/ui';

// ─── Types ───────────────────────────────────────────────────────────────────
interface SummaryStats {
  income: number;
  expenses: number;
  balance: number;
  savingsRate: number;
  transactionCount: number;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-zinc-200 rounded animate-shimmer ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in px-4 pt-4 lg:pt-8 w-full max-w-2xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div>
            <Skeleton className="h-6 w-32 mb-1" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <Skeleton className="h-[140px] rounded-[24px]" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-28 rounded-[24px]" />
        <Skeleton className="h-28 rounded-[24px]" />
      </div>
      <Skeleton className="h-40 rounded-[24px]" />
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
        const [txns, summaryData, monthly] = await Promise.all([
          transactionsApi.list({ limit: 5 }),
          reportsApi.summary(),
          reportsApi.monthly(),
        ]);

        setRecentTransactions(txns?.items || []);

        const income = summaryData?.income ?? 0;
        const expenses = summaryData?.expenses ?? 0;
        setSummary({
          income,
          expenses,
          balance: income - expenses,
          savingsRate: income > 0 ? Math.round(((income - expenses) / income) * 100) : 0,
          transactionCount: txns?.pagination?.total ?? 0,
        });

        // Transform monthly array for daily spending mini-chart
        const currentMonthly = Array.isArray(monthly) ? monthly : [];
        setMonthlyData(
          currentMonthly.map((v: any) => ({
            month: v.month,
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

  const firstName = user?.name ? user.name.split(' ')[0] : (user?.email?.split('@')[0] || 'Guest');

  // For the bar chart mockup
  const weeklyBars = [
    { day: 'M', value: 0.3 },
    { day: 'T', value: 0.5 },
    { day: 'W', value: 0.2 },
    { day: 'T', value: 0.8 }, // highest
    { day: 'F', value: 0.4 },
    { day: 'S', value: 0.9 },
    { day: 'S', value: 0.6 },
  ]; // Simulated weekly data since we don't have an API for it yet

  return (
    <div className="space-y-6 animate-fade-in pb-24 lg:pb-8 px-4 pt-4 lg:pt-8 w-full max-w-2xl mx-auto">

      {/* Inline Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/profile" className="w-12 h-12 rounded-full bg-[#ecfccb] border-2 border-white flex items-center justify-center text-[#4d7c0f] font-bold text-xl shadow-sm outline-none shrink-0 overflow-hidden">
             {user?.image ? <img src={user.image} className="w-full h-full object-cover" alt="Profile" /> : '🐻'}
          </Link>
          <div className="flex flex-col">
            <h1 className="text-[22px] font-extrabold text-[#1a1a2e] flex items-center gap-1.5 tracking-tight leading-tight">
              Hi, {firstName}! <Sparkles className="w-5 h-5 text-[#f59e0b] fill-[#f59e0b]" />
            </h1>
            <p className="text-[13px] font-medium text-[#71717a]">
              Selamat beraktivitas!
            </p>
          </div>
        </div>
        <button className="w-11 h-11 rounded-full bg-white border border-zinc-100 flex items-center justify-center text-[#1a1a2e] shadow-sm hover:bg-zinc-50 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
      </div>

      {/* Balance Hero Card */}
      {summary && (
        <div className="relative overflow-hidden rounded-[24px] p-6 text-[#1a1a2e] bg-[#f0fdf4] border border-[#dcfce7] shadow-sm group">
          <div className="relative z-10 flex flex-col items-start gap-1">
            <div className="flex justify-between items-center w-full mb-1">
              <p className="text-sm font-bold text-[#15803d]">Total Saldo</p>
              <span className="bg-[#a3e635] text-[#3f6212] px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase">
                ACTIVE
              </span>
            </div>
            <h2 className="text-[40px] font-extrabold tracking-tight mb-3 leading-none truncate w-full">
              {formatCurrency(summary.balance)}
            </h2>
            <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-[#15803d]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{summary.savingsRate}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions (Income / Expense) */}
      {summary && (
        <div className="grid grid-cols-2 gap-4">
          <Link to="/transactions?type=income" className="flow-card p-5 flex flex-col items-center text-center group hover:bg-[#f0fdf4] transition-colors border-none shadow-sm h-full">
            <div className="w-12 h-12 rounded-full bg-[#3b82f6] text-white flex items-center justify-center mb-3 shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-6 h-6" strokeWidth={2.5}/>
            </div>
            <p className="text-[15px] font-bold text-[#1a1a2e]">Pemasukan</p>
            <p className="text-[13px] text-[#71717a] font-medium">{formatCurrency(summary.income)}</p>
          </Link>

          <Link to="/transactions?type=expense" className="flow-card p-5 flex flex-col items-center text-center group hover:bg-[#fff1f2] transition-colors border-none shadow-sm h-full">
            <div className="w-12 h-12 rounded-full bg-[#f43f5e] text-white flex items-center justify-center mb-3 shadow-md shadow-rose-500/20 group-hover:scale-110 transition-transform">
              <ArrowDownRight className="w-6 h-6" strokeWidth={2.5}/>
            </div>
            <p className="text-[15px] font-bold text-[#1a1a2e]">Pengeluaran</p>
            <p className="text-[13px] text-[#71717a] font-medium">{formatCurrency(summary.expenses)}</p>
          </Link>
        </div>
      )}

      {/* Daily Spending Mini-Card */}
      {summary && summary.expenses > 0 && (
         <div className="flow-card p-5 border-none shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-6 z-10 relative">
              <div>
                <h3 className="text-base font-bold text-[#1a1a2e]">Pengeluaran 7 Hari</h3>
                <p className="text-sm text-[#71717a] font-medium">Minggu ini</p>
              </div>
              <div className="text-right">
                <p className="text-[22px] font-extrabold text-[#1a1a2e] leading-none mb-1">
                  {formatCurrency(summary.expenses / (monthlyData.length || 1))} {/* Rough approx for UI demo */}
                </p>
                <p className="text-[11px] font-bold text-[#ef4444]">Sesuai budget</p>
              </div>
            </div>

            {/* Simulated bar chart */}
            <div className="flex justify-between items-end h-24 gap-2 z-10 relative">
              {weeklyBars.map((bar, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-full bg-[#f4f4f5] rounded-t-sm rounded-b-sm relative flex items-end h-full">
                    <div 
                      className="w-full bg-[#1a1a2e] rounded-t-sm rounded-b-sm animate-slide-up" 
                      style={{ height: `${bar.value * 100}%`, animationDelay: `${i * 100}ms` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#a1a1aa]">{bar.day}</span>
                </div>
              ))}
            </div>
         </div>
      )}

      {/* Recent Transactions */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-[17px] font-bold text-[#1a1a2e]">Aktivitas Terbaru</h3>
          <Link to="/transactions" className="text-[13px] font-bold text-[#65a30d] hover:text-[#4d7c0f] transition-colors">
            Lihat Semua
          </Link>
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="flow-card p-8 text-center border-dashed border-2 border-zinc-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-zinc-100 flex items-center justify-center">
              <Receipt className="w-8 h-8 text-zinc-400" />
            </div>
            <h4 className="text-base font-bold mb-1 text-[#1a1a2e]">Belum ada transaksi</h4>
            <p className="text-sm text-[#71717a] mb-6 max-w-[200px] mx-auto">
              Mulai catat pengeluaran dan pemasukan Anda.
            </p>
            <Link to="/transactions?new=true">
              <button className="btn-primary w-full shadow-md">
                <Plus className="w-5 h-5" /> Catat Transaksi
              </button>
            </Link>
          </div>
        ) : (
          <div className="flow-card divide-y divide-zinc-100 border-none shadow-sm">
            {recentTransactions.map((tx, index) => (
              <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors animate-slide-in-bottom" style={{ animationDelay: `${index * 50}ms`}}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <CategoryIcon category={tx.categoryId} size="md" />
                  <div className="min-w-0 pr-2">
                    <p className="text-[15px] font-bold text-[#1a1a2e] truncate leading-tight mb-0.5">
                      {tx.description || tx.categoryId.charAt(0).toUpperCase() + tx.categoryId.slice(1)}
                    </p>
                    <p className="text-[12px] text-[#71717a] font-medium truncate capitalize">
                      {tx.categoryId}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                   <span className={`text-[15px] font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-[#16a34a]' : 'text-[#ef4444]'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                  <span className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                    {formatDate(tx.date).split(',')[0]} {/* Just show date/time string roughly */}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}