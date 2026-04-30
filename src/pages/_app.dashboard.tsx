import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { transactionsApi, reportsApi, targetsApi, scheduledApi, accountsApi, budgetsApi, type Transaction, type ScheduledTransaction, type Target, type Budget } from '../api/client';
import { queryKeys } from '../lib/query-keys';
import { usePreferences } from '../hooks/usePreferences';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatName } from '../lib/utils';
import type { Account } from '../types';
import { CategoryIcon } from '../components/ui/CategoryIcon';




// ─── Main Page ───────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, formatMoney, language } = usePreferences();

  const { data: txnsData, isLoading: txnsLoading } = useQuery({
    queryKey: queryKeys.transactions.list({ limit: 5 }),
    queryFn: () => transactionsApi.list({ limit: 5 }),
    enabled: !!user,
  });

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: queryKeys.reports.summary(),
    queryFn: () => reportsApi.summary(),
    enabled: !!user,
  });

  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: currentMonthData } = useQuery({
    queryKey: queryKeys.reports.summary(currentMonth),
    queryFn: () => reportsApi.summary({ month: currentMonth }),
    enabled: !!user,
  });

  const { data: targetsData, isLoading: targetsLoading } = useQuery({
    queryKey: ['targets'],
    queryFn: () => targetsApi.list(),
    enabled: !!user,
  });

  const { data: catData, isLoading: catLoading } = useQuery({
    queryKey: queryKeys.reports.byCategory(),
    queryFn: () => reportsApi.byCategory(),
    enabled: !!user,
  });
  
  const { data: budgetsData, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetsApi.list(),
    enabled: !!user,
  });

  const { data: scheduledData, isLoading: scheduledLoading } = useQuery({
    queryKey: ['scheduled'],
    queryFn: () => scheduledApi.list(),
    enabled: !!user,
  });

  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.list(),
    enabled: !!user,
  });

  const recentTransactions = txnsData?.items || [];
  const targets = targetsData || [];
  const budgets = budgetsData || [];
  const scheduled = scheduledData || [];
  const topCategories = catData?.slice(0, 3) || [];
  const accounts = accountsData || [];
  
  const income = summaryData?.income ?? 0;
  const expenses = summaryData?.expenses ?? 0;
  const balance = summaryData?.balance ?? 0;

  const totalAssets = accounts.reduce((acc: number, curr: Account) => {
    const val = parseFloat(String(curr.balance));
    return val > 0 ? acc + val : acc;
  }, 0);

  const totalLiabilities = Math.abs(accounts.reduce((acc: number, curr: Account) => {
    const val = parseFloat(String(curr.balance));
    return val < 0 ? acc + val : acc;
  }, 0));

  const netWorth = totalAssets - totalLiabilities;
  
  // Calculate Growth (MoM)
  const currentMonthFlow = currentMonthData?.balance ?? 0;
  const previousNetWorth = netWorth - currentMonthFlow;
  const growth = previousNetWorth > 0 ? (currentMonthFlow / previousNetWorth) * 100 : (currentMonthFlow > 0 ? 100 : 0);
  const isPositive = growth > 0;
  const isNegative = growth < 0;

  const currentMonthName = new Date().toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short', year: 'numeric' });

  return (
    <div className="space-y-8 animate-fade-in pb-10 content-auto">
      
      {/* ─── Hero Header ─── */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[var(--text)] tracking-[-0.02em]">{formatName(user?.name)}</h1>
        <p className="text-[12px] font-bold text-[var(--text-dim-2)] opacity-60 mt-1 uppercase tracking-[0.15em]">Mengalirkan Ketenangan Finansial</p>
      </div>

      {/* ─── Net Worth Hero Card (Real Data) ─── */}
      <div className="relative rounded-[32px] p-8 border-[2.5px] border-[#0891B2]/40 bg-[#CFFAFE]/30 text-[#0E7490] overflow-hidden shadow-sm">
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-[12px] font-bold text-[#0E7490]/60 tracking-[0.05em] uppercase">{t('dashboard.netWorth')}</p>
            <p className="text-[32px] sm:text-[44px] font-bold tracking-[-0.03em] mt-1 tabular-nums text-[#0891B2]">{formatMoney(netWorth)}</p>
            <div className="flex flex-wrap gap-4 mt-4 text-[12px] font-bold">
              <span className="text-[#0E7490]/50">{t('dashboard.assets')} <span className="text-[#0E7490] tabular-nums">{formatMoney(totalAssets)}</span></span>
              {totalLiabilities > 0 && (
                <span className="text-[#0E7490]/50">{t('dashboard.liabilities')} <span className="text-[#0E7490] tabular-nums">{formatMoney(totalLiabilities)}</span></span>
              )}
            </div>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${
            isPositive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 
            isNegative ? 'bg-rose-500/10 border-rose-500/20 text-rose-600' : 
            'bg-gray-500/10 border-gray-500/20 text-gray-600'
          }`}>
            {isPositive ? <TrendingUp className="w-[12px] h-[12px]" /> : 
             isNegative ? <TrendingDown className="w-[12px] h-[12px]" /> : 
             <Minus className="w-[12px] h-[12px]" />}
            {isPositive ? '+' : ''}{growth.toFixed(1)}%
          </div>
        </div>
        {/* Subtle Wave Chart Placeholder */}
        <div className="absolute bottom-0 left-0 w-full h-24 opacity-10 pointer-events-none">
          <svg viewBox="0 0 400 100" className="w-full h-full preserve-3d">
             <path d="M0 80 Q 100 70, 200 85 T 400 75 L 400 100 L 0 100 Z" fill="#0891B2" />
          </svg>
        </div>
      </div>

      {/* ─── Monthly Cash Flow (Real Data) ─── */}
      <div className="rounded-[24px] p-6 border-[2.5px] border-[#0891B2]/30 bg-[#ECFEFF] shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-[14px] font-bold text-[#0E7490] tracking-[-0.01em]">{t('dashboard.cashFlow')}</h2>
          <span className="text-[12px] font-bold text-[#0E7490] opacity-60 uppercase tracking-widest">{currentMonthName}</span>
        </div>
        {summaryLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-12 rounded-xl bg-[#CFFAFE] animate-pulse"></div>
              <div className="h-12 rounded-xl bg-[#CFFAFE] animate-pulse"></div>
              <div className="h-12 rounded-xl bg-[#CFFAFE] animate-pulse"></div>
            </div>
            <div className="h-2 rounded-full w-full bg-[#CFFAFE] animate-pulse"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
              <div>
                <p className="text-[10px] sm:text-[11px] font-bold text-[#0E7490]/70 uppercase mb-1">{t('dashboard.income')}</p>
                <p className="text-[14px] sm:text-[20px] font-bold text-[#059669] tabular-nums truncate">{formatMoney(income)}</p>
              </div>
              <div className="text-center border-x border-[#0891B2]/10 px-2">
                <p className="text-[10px] sm:text-[11px] font-bold text-[#0E7490]/70 uppercase mb-1">{t('dashboard.expense')}</p>
                <p className="text-[14px] sm:text-[20px] font-bold text-[#E11D48] tabular-nums truncate">{formatMoney(expenses)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] sm:text-[11px] font-bold text-[#0E7490]/70 uppercase mb-1">{t('dashboard.balance')}</p>
                <p className={`text-[14px] sm:text-[20px] font-bold tabular-nums truncate ${balance >= 0 ? 'text-[#059669]' : 'text-[#E11D48]'}`}>
                  {formatMoney(balance)}
                </p>
              </div>
            </div>
            <div className="h-2.5 w-full rounded-full bg-[#CFFAFE] overflow-hidden flex shadow-inner">
              {income === 0 && expenses === 0 ? (
                <div className="h-full bg-[#A5F3FC] w-full" />
              ) : (
                <>
                  <div className="h-full bg-[#10B981]" style={{ width: `${(income / (income + expenses)) * 100}%` }} />
                  <div className="h-full bg-[#EF4444]" style={{ width: `${(expenses / (income + expenses)) * 100}%` }} />
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* ─── Pinned Targets & Budgets (Real Data) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Targets */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-[var(--text)]">{t('dashboard.pinnedTargets')}</h3>
            <Link to="/targets" className="text-[12px] font-bold text-[var(--accent)] hover:underline">{t('common.viewAll')}</Link>
          </div>
          
          {targetsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flow-card p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl skeleton" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 rounded w-1/3 skeleton" />
                      <div className="h-2 rounded w-1/4 skeleton" />
                    </div>
                  </div>
                  <div className="h-1.5 w-full rounded-full skeleton" />
                </div>
              ))}
            </div>
          ) : targets.length === 0 ? (
            <div className="text-center py-10 px-6 bg-[var(--card)] rounded-[20px] border border-[var(--border)]">
              <p className="text-[13px] font-bold text-[var(--text)] mb-1">Belum ada target</p>
              <p className="text-[11px] text-[var(--text-dim-2)]">Mulai tentukan mimpi finansial Anda sekarang.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {targets.slice(0, 3).map((t: Target) => {
                const progress = Math.min(Math.round((parseFloat(String(t.currentAmount)) / parseFloat(String(t.targetAmount))) * 100), 100);
                return (
                  <TargetCard 
                    key={t.id}
                    categoryLabel={t.name}
                    categoryIcon={t.icon}
                    color={t.color} 
                    label={t.name} 
                    progress={progress} 
                    collected={formatMoney(parseFloat(String(t.currentAmount)))} 
                    target={formatMoney(parseFloat(String(t.targetAmount)))} 
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* Right Column: Budgets */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-[var(--text)]">{t('budget.title')}</h3>
            <Link to="/budget" className="text-[12px] font-bold text-[var(--accent)] hover:underline">{t('common.viewAll')}</Link>
          </div>

          {budgetsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flow-card p-5 space-y-4">
                  <div className="h-4 rounded w-1/3 skeleton" />
                  <div className="h-2 rounded w-full skeleton" />
                </div>
              ))}
            </div>
          ) : budgets.length === 0 ? (
            <div className="text-center py-10 px-6 bg-[var(--card)] rounded-[20px] border border-[var(--border)]">
              <p className="text-[13px] font-bold text-[var(--text)] mb-1">Belum ada anggaran</p>
              <p className="text-[11px] text-[var(--text-dim-2)]">Buat anggaran per kategori untuk mengontrol belanja.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {budgets.slice(0, 3).map((b: Budget) => {
                const spent = parseFloat(String(b.spent || 0));
                const limit = parseFloat(String(b.limitAmount || 0));
                const pct = b.percentageUsed || 0;
                const cat = b.category;
                const label = cat?.label || b.categoryId;
                const color = cat?.color || 'var(--accent)';

                return (
                  <div 
                    key={b.id} 
                    className="flow-card p-5 cursor-pointer hover:shadow-lg transition-all active:scale-[0.98]"
                    onClick={() => window.location.href = '/budget'}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <CategoryIcon 
                        category={label} 
                        icon={cat?.icon}
                        size="sm" 
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold text-[var(--text)] truncate">{label}</p>
                        <p className="text-[12px] font-bold mt-0.5" style={{ color: color }}>{pct}%</p>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--muted)] rounded-full overflow-hidden mb-3">
                      <div 
                        className="h-full rounded-full transition-all duration-700 ease-out" 
                        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} 
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-[var(--text-dim)]">{formatMoney(spent)}</span>
                      <span className="text-[var(--text-dim-2)] opacity-60">{formatMoney(limit)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ─── Top Categories (Real Data) ─── */}
        <section>
          <h2 className="text-[14px] font-bold text-[var(--text)] mb-4">{t('dashboard.topCategories')}</h2>
          <div className="flow-card p-6">
            {catLoading ? (
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col items-center gap-2 animate-pulse">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--muted)]" />
                    <div className="w-12 h-2 rounded-full bg-[var(--muted)]" />
                  </div>
                ))}
              </div>
            ) : topCategories.length === 0 ? (
              <div className="text-center py-6 text-[var(--text-dim)]">
                <p className="text-[13px] font-bold mb-1">Belum ada data pengeluaran</p>
                <p className="text-[11px]">Catat pengeluaran untuk melihat kategori teratas.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-6">
                {topCategories.map((cat: { categoryId: string; label: string; amount: number; percentage: number; color: string; }) => (
                  <div key={cat.categoryId} className="flex flex-col items-center group">
                    <CategoryIcon 
                      category={cat.label} 
                      size="lg" 
                      label={cat.label}
                    />
                    <p className="text-[12px] font-bold text-[var(--text)] mt-1 tabular-nums">{formatMoney(cat.amount)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ─── Upcoming Bills (Real Data) ─── */}
        <section>
          <h2 className="text-[14px] font-bold text-[var(--text)] mb-4">{t('dashboard.upcomingBills')}</h2>
          <div className="flow-card divide-y divide-[var(--border)]">
            {scheduledLoading ? (
              <div className="space-y-4 p-5">
                {[1, 2].map(i => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl skeleton" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 rounded w-1/4 skeleton" />
                      <div className="h-2 rounded w-1/2 skeleton" />
                    </div>
                    <div className="h-4 w-20 rounded skeleton" />
                  </div>
                ))}
              </div>
            ) : scheduled.length === 0 ? (
              <div className="text-center py-11 text-[var(--text-dim)]">
                <p className="text-[13px] font-bold mb-1">Belum ada tagihan mendatang</p>
                <p className="text-[11px]">Tambahkan transaksi terjadwal.</p>
              </div>
            ) : (
              scheduled.slice(0, 3).map((item: ScheduledTransaction) => {
                const diff = new Date(item.nextRunDate).getTime() - new Date().getTime();
                const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                const dueStr = days > 0 ? `${days} hari lagi` : days === 0 ? 'Hari ini' : `${Math.abs(days)} hari lalu`;
                return (
                  <BillItem 
                    key={item.id}
                    categoryLabel={item.category?.label || item.categoryId}
                    categoryIcon={item.category?.icon}
                    label={item.description || item.category?.label || 'Tagihan'} 
                    amount={formatMoney(parseFloat(String(item.amount)))} 
                    due={dueStr} 
                  />
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* ─── Recent Transactions (Real Data) ─── */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h2 className="text-[14px] font-bold text-[var(--text)]">{t('dashboard.recentTransactions')}</h2>
          <Link to="/transactions" className="text-[12px] font-bold text-[var(--accent)] hover:underline">{t('common.viewAll')}</Link>
        </div>
        <div className="flow-card divide-y divide-[var(--border)] overflow-hidden">
          {txnsLoading ? (
            <div className="space-y-4 p-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl skeleton" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 rounded w-1/4 skeleton" />
                    <div className="h-3 rounded w-1/2 skeleton" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-dim)]">
              <p className="text-[24px] mb-2">💸</p>
              <p className="text-[13px] font-bold mb-1">Belum ada transaksi</p>
            </div>
          ) : (
            recentTransactions.map((tx: Transaction) => {
              const isIncome = tx.type === 'income';
              return (
                <div 
                  key={tx.id} 
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--muted)] transition-colors cursor-pointer group"
                  onClick={() => navigate(`?edit_transaction_id=${tx.id}`)}
                >
                  <CategoryIcon 
                    category={tx.category?.label || tx.categoryId} 
                    icon={tx.category?.icon} 
                    size="lg" 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[var(--text)] truncate">{tx.description || tx.category?.label}</p>
                    <p className="text-[12px] font-medium text-[var(--text-dim)] mt-0.5 opacity-70">
                      {tx.category?.label || tx.categoryId}
                    </p>
                  </div>
                  <span className={`text-[15px] font-bold tabular-nums ${isIncome ? 'text-[var(--income)]' : 'text-[var(--text)]'}`}>
                    {isIncome ? '+' : '−'}{formatMoney(Math.abs(parseFloat(String(tx.amount))))}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

// ─── Shared Mockup Components ────────────────────────────────────────────────
function TargetCard({ categoryLabel, categoryIcon, color, label, progress, collected, target }: { categoryLabel: string; categoryIcon?: string | null; color: string; label: string; progress: number; collected: string; target: string; }) {
  return (
    <div className="flow-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <CategoryIcon 
          category={categoryLabel} 
          icon={categoryIcon} 
          size="sm" 
        />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-[var(--text)] truncate">{label}</p>
          <p className="text-[12px] font-bold mt-0.5" style={{ color: color }}>{progress}%</p>
        </div>
      </div>
      <div className="h-1.5 w-full bg-[var(--muted)] rounded-full overflow-hidden mb-3">
        <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color }} />
      </div>
      <div className="flex justify-between items-center text-[11px] font-bold">
        <span className="text-[var(--text-dim)]">{collected}</span>
        <span className="text-[var(--text-dim-2)] opacity-60">{target}</span>
      </div>
    </div>
  );
}

function BillItem({ categoryLabel, categoryIcon, label, amount, due }: { categoryLabel: string; categoryIcon?: string | null; label: string; amount: string; due: string; }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <CategoryIcon 
        category={categoryLabel} 
        icon={categoryIcon} 
        size="md" 
      />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-[var(--text)]">{label}</p>
        <p className="text-[11px] font-bold text-[var(--text-dim-2)] opacity-70 mt-0.5">{due}</p>
      </div>
      <p className="text-[13px] font-bold text-[var(--text)] tabular-nums">{amount}</p>
    </div>
  );
}