import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { transactionsApi, reportsApi } from '../api/client';
import { type Transaction } from '../types';
import {
  Bell,
  Plus,
  BarChart2,
  Building2,
  Smartphone,
  ArrowRightLeft,
  TrendingUp
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { CategoryIcon } from '../components/ui';

// ─── Skeleton ────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-8 px-4 pt-6 lg:pt-8 w-full max-w-2xl mx-auto animate-pulse">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="w-14 h-14 bg-zinc-200 rounded-full" />
          <div className="flex flex-col justify-center gap-2">
            <div className="w-24 h-5 bg-zinc-200 rounded-md" />
            <div className="w-32 h-4 bg-zinc-200 rounded-md" />
          </div>
        </div>
        <div className="w-12 h-12 bg-zinc-200 rounded-full" />
      </div>
      <div className="w-full h-48 bg-zinc-200 rounded-[40px]" />
      <div className="flex gap-4 overflow-hidden">
        <div className="w-48 h-48 bg-zinc-200 rounded-[40px] shrink-0" />
        <div className="w-48 h-48 bg-zinc-200 rounded-[40px] shrink-0" />
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [txns, summaryData] = await Promise.all([
          transactionsApi.list({ limit: 4 }),
          reportsApi.summary(),
        ]);
        setRecentTransactions(txns?.items || []);
        const income = summaryData?.income ?? 0;
        const expenses = summaryData?.expenses ?? 0;
        setBalance(income - expenses);
      } catch (e) {
        console.error('Dashboard load failed', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  const firstName = user?.name ? user.name.split(' ')[0] : (user?.email?.split('@')[0] || 'Buddy');

  // Hardcode static accounts for the UI demo based on mockups
  const bankAccounts = [
    {
      id: 1,
      name: 'MAIN BANK',
      balance: 8200.00,
      mask: '**** 4421',
      bgColor: 'bg-[#dcfce7]',
      brand: 'bg-[#1e293b]',
      icon: <Building2 className="w-6 h-6 text-[#fbbf24] fill-[#fbbf24]" />,
      pill: 'PRIMARY',
    },
    {
      id: 2,
      name: 'VENMO',
      balance: 450.80,
      mask: '@flowstate_u',
      bgColor: 'bg-[#fce7f3]',
      brand: 'bg-[#67e8f9]',
      icon: <Smartphone className="w-5 h-5 text-[#fb923c]" strokeWidth={2.5}/>,
      pill: null,
    }
  ];

  return (
    <div className="space-y-8 pb-32 lg:pb-8 pt-6 lg:pt-8 w-full max-w-2xl mx-auto px-4 sm:px-0">

      {/* Hero Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/profile" className="w-[52px] h-[52px] rounded-full bg-orange-100 border-[3px] border-white flex items-center justify-center text-2xl shadow-sm shrink-0 overflow-hidden">
             {user?.image ? <img src={user.image} className="w-full h-full object-cover" alt="Profile" /> : '🐻'}
          </Link>
          <div className="flex flex-col">
            <h1 className="text-[17px] font-extrabold text-[#1a1a2e] mb-0.5 tracking-tight">
              FlowState
            </h1>
            <p className="text-[13px] font-bold text-[#71717a]">
              Hi, {firstName}! ✨
            </p>
          </div>
        </div>
        <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#1a1a2e] shadow-sm hover:scale-105 transition-transform active:scale-95">
          <Bell className="w-5 h-5" strokeWidth={2.5}/>
        </button>
      </div>

      {/* Massive Pocket Money Card */}
      <div className="rounded-[40px] p-8 text-[#1a1a2e] bg-[var(--duit-green)] shadow-lg shadow-[#a3e635]/20 flex flex-col justify-between">
        <div className="flex flex-col items-start gap-1">
          <p className="text-[11px] font-extrabold tracking-widest text-[#3f6212] uppercase opacity-80 mb-1">
            Total Pocket Money
          </p>
          <h2 className="text-[44px] font-extrabold tracking-tight leading-none mb-8">
            {formatCurrency(balance || 12450.80)}
          </h2>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 bg-[#121021] text-white rounded-full py-4 px-6 flex items-center justify-center gap-2 font-bold text-[15px] active:scale-95 transition-transform">
            <div className="bg-white rounded-full p-0.5">
              <Plus className="w-4 h-4 text-black" strokeWidth={3}/>
            </div>
            Add Funds
          </button>
          <button className="w-14 bg-[#bced6b] rounded-full flex items-center justify-center active:scale-95 transition-transform shrink-0 shadow-sm border border-[#9ae243]">
             <BarChart2 className="w-5 h-5 text-black" strokeWidth={3}/>
          </button>
        </div>
      </div>

      {/* Accounts Horizontal Scroll */}
      <div>
        <div className="flex items-center justify-between mb-5 px-1">
          <h3 className="text-[19px] font-extrabold text-[#1a1a2e] tracking-tight">Your Accounts</h3>
          <Link to="/profile" className="text-[13px] font-bold text-[#84cc16] hover:opacity-80 transition-opacity">
            See All
          </Link>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {bankAccounts.map((account) => (
             <div key={account.id} className={`${account.bgColor} rounded-[40px] p-6 shrink-0 w-[200px] snap-center flex flex-col justify-between shadow-sm relative overflow-hidden h-[220px]`}>
               <div className="flex justify-between items-start w-full">
                 <div className={`w-12 h-12 rounded-xl ${account.brand} flex items-center justify-center`}>
                    {account.icon}
                 </div>
                 {account.pill && (
                   <span className="bg-white/80 backdrop-blur text-[#2563eb] text-[9px] font-extrabold px-3 py-1.5 rounded-full tracking-wider">
                     {account.pill}
                   </span>
                 )}
               </div>
               <div>
                  <p className="text-[11px] font-extrabold text-[#1a1a2e]/60 tracking-wider mb-1.5">{account.name}</p>
                  <p className="text-[26px] font-extrabold text-[#1e3a8a] tracking-tight leading-none mb-3">
                    ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] font-bold text-[#1e3a8a]/40 tracking-wider">{account.mask}</p>
               </div>
             </div>
          ))}
          {/* Add spacing at the end of scroll */}
          <div className="w-2 shrink-0" />
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-[19px] font-extrabold text-[#1a1a2e] tracking-tight mb-5 px-1">Recent Activity</h3>
        
        <div className="space-y-3">
          {recentTransactions.length > 0 ? recentTransactions.map((tx) => (
            <div key={tx.id} className="bg-white rounded-[32px] p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-full bg-[#f0f9ff] flex items-center justify-center text-[#0ea5e9]">
                    <CategoryIcon category={tx.categoryId} size="md" />
                 </div>
                 <div>
                   <p className="text-[15px] font-extrabold text-[#1a1a2e]">{tx.description || tx.categoryId}</p>
                   <p className="text-[12px] font-bold text-[#a1a1aa] mt-0.5">{formatDate(tx.date)}</p>
                 </div>
              </div>
              <span className={`text-[17px] font-extrabold tracking-tight ${tx.type === 'income' ? 'text-[#a3e635]' : 'text-[#1a1a2e]'}`}>
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
              </span>
            </div>
          )) : (
            // Mock Data if API is empty for immediate visual
            <>
              <div className="bg-white rounded-[32px] p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#e0f2fe] flex items-center justify-center">
                      <ArrowRightLeft className="w-6 h-6 text-[#0ea5e9]" strokeWidth={2.5}/>
                  </div>
                  <div>
                    <p className="text-[15px] font-extrabold text-[#1a1a2e]">Transfer to Venmo</p>
                    <p className="text-[12px] font-bold text-[#a1a1aa] mt-0.5">Today, 2:45 PM</p>
                  </div>
                </div>
                <span className="text-[17px] font-extrabold text-[#1a1a2e] tracking-tight">-$50.00</span>
              </div>
              <div className="bg-white rounded-[32px] p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#fef3c7] flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-[#f59e0b]" strokeWidth={2.5}/>
                  </div>
                  <div>
                    <p className="text-[15px] font-extrabold text-[#1a1a2e]">Savings Interest</p>
                    <p className="text-[12px] font-bold text-[#a1a1aa] mt-0.5">Yesterday</p>
                  </div>
                </div>
                <span className="text-[17px] font-extrabold text-[#84cc16] tracking-tight">+$12.40</span>
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}