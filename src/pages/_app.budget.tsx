import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-keys';
import { budgetsApi, categoriesApi } from '../api/client';
import { Plus, X, ArrowLeft, Target, Wallet, TrendingUp } from 'lucide-react';
import { usePreferences } from '../hooks/usePreferences';
import { BudgetForm } from '../components/finance/BudgetForm';

// ─── Circular Usage Gauge ───────────────────────────────────────────────────
function UsageGauge({ percentage }: { percentage: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="relative w-[150px] h-[150px] flex items-center justify-center shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} fill="transparent" stroke="rgba(255,255,255,0.15)" strokeWidth="12" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="transparent"
          stroke="white"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <p className="text-[32px] font-bold tracking-tight leading-none">{percentage}%</p>
        <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60">Digunakan</p>
      </div>
    </div>
  );
}

// ─── Fallback emoji map (keyed by BE category.id) ───────────────────────────
const FALLBACK_EMOJI: Record<string, string> = {
  salary: '💰', freelance: '💻', investments: '📈', gifts: '🎁', 'other-income': '💵',
  food: '🍜', transport: '🚗', housing: '🏠', utilities: '💡', entertainment: '🎬',
  shopping: '🛍️', healthcare: '💊', education: '📚', travel: '✈️', 'other-expense': '📦',
};

export default function BudgetPage() {
  const { formatMoney, t } = usePreferences();

  // Get current YYYY-MM
  const currentMonth = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const { data: budgetsData, isLoading: budgetsLoading } = useQuery({
    queryKey: queryKeys.budgets.list(currentMonth),
    queryFn: () => budgetsApi.list({ month: currentMonth }),
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);

  const budgets = budgetsData || [];
  const categories = categoriesData || [];
  const isLoading = budgetsLoading || categoriesLoading;

  // Calculate totals
  const totals = useMemo(() => {
    let totalLimit = 0;
    let totalSpent = 0;

    for (const b of budgets) {
      totalLimit += parseFloat(String(b.limitAmount));
      totalSpent += parseFloat(String(b.spent));
    }

    const remaining = Math.max(0, totalLimit - totalSpent);
    const percentage = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

    return { totalLimit, totalSpent, remaining, percentage };
  }, [budgets]);

  // totals calculation remains


  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse pb-10">
        <div className="h-8 w-40 bg-[var(--muted)] rounded-lg" />
        <div className="h-[200px] bg-[var(--muted)] rounded-[16px]" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-[var(--muted)] rounded-[16px]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Removed Redundant Top Navigation as per User Request */}

      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-4">
          <button className="w-11 h-11 rounded-2xl bg-[var(--muted)] text-[var(--text)] flex items-center justify-center hover:bg-[var(--border)] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-[28px] font-bold text-[var(--text)] tracking-[-0.03em] leading-tight">{t('budget.title')}</h1>
            <p className="text-[13px] font-medium text-[var(--text-dim-2)] opacity-60">
              {new Date().toLocaleDateString(t('settings.language') === 'Bahasa' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <button 
          onClick={() => { setSelectedBudget(null); setIsModalOpen(true); }}
          className="w-11 h-11 rounded-2xl bg-[var(--muted)] text-[var(--text)] flex items-center justify-center hover:bg-[var(--border)] transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Hero Card - Green Summary with Gauge */}
      <div className="rounded-[32px] bg-gradient-to-br from-[#12B76A] to-[#0E9355] p-8 text-white shadow-xl shadow-[#12B76A]/20 flex flex-col md:flex-row items-center gap-10">
        <UsageGauge percentage={totals.percentage} />

        <div className="flex-1 grid grid-cols-2 gap-y-6 gap-x-8 w-full border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0 md:pl-10">
          <div className="space-y-1">
            <p className="text-[11px] font-bold opacity-60 uppercase tracking-widest flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5" />
              {t('budget.budget')}
            </p>
            <p className="text-[22px] font-bold tracking-tight">{formatMoney(totals.totalLimit)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold opacity-60 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Sisa
            </p>
            <p className="text-[22px] font-bold tracking-tight">{formatMoney(totals.remaining)}</p>
          </div>
          <div className="col-span-2 pt-4 border-t border-white/5">
            <p className="text-[11px] font-bold opacity-60 uppercase tracking-widest mb-1">Rata-rata harian</p>
            <p className="text-[15px] font-bold">
              {formatMoney(Math.round(totals.totalSpent / Math.max(1, new Date().getDate())))} <span className="text-[12px] opacity-60 font-medium">/ hari</span>
            </p>
          </div>
        </div>
      </div>

      {/* ─── Category List ─── */}
      <div className="space-y-5">
        <h3 className="text-[16px] font-bold text-[var(--text)] px-1">{t('budget.perCategory')}</h3>
        {budgets.length === 0 ? (
          <div className="text-center py-20 px-6 bg-[var(--card)] rounded-[32px] border border-[var(--border)]">
            <div className="w-20 h-20 rounded-3xl bg-[#12B76A]/10 text-[#12B76A] flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10" />
            </div>
            <h3 className="text-[20px] font-bold text-[var(--text)] mb-3">Belum ada anggaran</h3>
            <p className="text-[14px] text-[var(--text-dim-2)] mb-8 max-w-[320px] mx-auto leading-relaxed">Buat anggaran untuk memantau pengeluaran Anda per kategori setiap bulannya.</p>
            <button 
              onClick={() => { setSelectedBudget(null); setIsModalOpen(true); }}
              className="px-8 py-4 rounded-2xl bg-[var(--text)] text-[var(--bg)] font-bold text-[15px] shadow-xl transition-all active:scale-95"
            >
              Set Anggaran Pertama
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget: any) => {
              const spent = parseFloat(budget.spent);
              const limit = parseFloat(budget.limitAmount);
              const pct = budget.percentageUsed;
              const cat = budget.category;
              const emoji = cat?.icon || FALLBACK_EMOJI[budget.categoryId] || '📦';
              const color = cat?.color || '#12B76A';
              const label = cat?.label || budget.categoryId;

              return (
                <div 
                  key={budget.id} 
                  className="flow-card p-6 cursor-pointer hover:shadow-xl transition-all active:scale-[0.98]"
                  onClick={() => { setSelectedBudget(budget); setIsModalOpen(true); }}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-[20px] flex items-center justify-center text-[28px] shrink-0 bg-[var(--muted)] border border-[var(--border)]">
                      {emoji}
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[17px] font-bold text-[var(--text)] truncate">{label}</p>
                        <p className={`text-[17px] font-bold ${pct > 90 ? 'text-[#F04438]' : 'text-[var(--text)]'}`}>
                          {pct}%
                        </p>
                      </div>
                      <p className="text-[13px] font-bold text-[var(--text-dim-2)] opacity-70 mb-4">
                        {formatMoney(spent)} <span className="opacity-40 font-medium">dari</span> {formatMoney(limit)}
                      </p>
                      <div className="h-3 w-full bg-[var(--muted)] rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-700 ease-out" 
                          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Add/Edit Budget Modal ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in z-[190]" onClick={() => setIsModalOpen(false)} />
          <div 
            className="relative z-[200] w-full max-w-[500px] bg-[var(--bg)] rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-[var(--border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <h2 className="text-[18px] font-bold text-[var(--text)]">
                {selectedBudget ? 'Edit Anggaran' : 'Tambah Anggaran'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="relative z-[210] w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--text)] hover:bg-[var(--border)] transition-all active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
              <BudgetForm
                budget={selectedBudget}
                categories={categories}
                currentMonth={currentMonth}
                onSuccess={() => {
                  setIsModalOpen(false);
                  // Refresh is handled by tanstack-query auto-invalidations or we can do it manually if needed
                }}
                onCancel={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
