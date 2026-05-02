import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-keys';
import { budgetsApi, categoriesApi, type Budget } from '../api/client';
import { Plus, X, ArrowLeft, Target } from 'lucide-react';
import { usePreferences } from '../hooks/usePreferences';
import { BudgetForm } from '../components/finance/BudgetForm';
import { CategoryIcon } from '../components/ui/CategoryIcon';




export default function BudgetPage() {
  const { formatMoney, t } = usePreferences();
  const navigate = useNavigate();

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
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

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

    const remaining = totalLimit - totalSpent;
    const percentage = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

    return { totalLimit, totalSpent, remaining, percentage };
  }, [budgets]);

  // totals calculation remains


  if (isLoading) {
    return (
      <div className="space-y-6 pb-10">
        <div className="h-8 w-40 skeleton rounded-lg" />
        <div className="h-[200px] skeleton rounded-[16px]" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 skeleton rounded-[16px]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Removed Redundant Top Navigation as per User Request */}

      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-2xl bg-[var(--muted)] text-[var(--text)] flex items-center justify-center hover:bg-[var(--border)] transition-colors active:scale-95"
          >
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

      {/* Summary Card - White Style to match Transactions */}
      <div className="rounded-[24px] bg-[var(--card)] p-6 border border-[var(--border)] shadow-sm flex items-center gap-8">
        <div className="relative w-[100px] h-[100px] flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="transparent" stroke="var(--muted)" strokeWidth="10" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="transparent"
              stroke="#15803D"
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 42}
              strokeDashoffset={2 * Math.PI * 42 - (Math.min(totals.percentage, 100) / 100) * (2 * Math.PI * 42)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[20px] font-bold text-[var(--text)] leading-none">{totals.percentage > 999 ? '>999%' : `${totals.percentage}%`}</p>
            <p className="text-[9px] font-bold text-[var(--text-dim-2)] uppercase tracking-wider mt-1">Sisa</p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-4 border-l border-[var(--border)] pl-8">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-widest">Total Anggaran</p>
            <p className="text-[18px] font-bold text-[var(--text)] tabular-nums">{formatMoney(totals.totalLimit)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-widest">Terpakai</p>
            <p className="text-[18px] font-bold text-[var(--expense)] tabular-nums">{formatMoney(totals.totalSpent)}</p>
          </div>
          <div className="space-y-1 col-span-2 pt-2 border-t border-[var(--border)]">
            <p className="text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-widest">Sisa Saldo</p>
            <p className={`text-[18px] font-bold ${totals.remaining >= 0 ? 'text-[var(--income)]' : 'text-[var(--expense)]'} tabular-nums`}>{formatMoney(totals.remaining)}</p>
          </div>
        </div>
      </div>

      {/* ─── Category List ─── */}
      <div className="space-y-5">
        <h3 className="text-[16px] font-bold text-[var(--text)] px-1">{t('budget.perCategory')}</h3>
        {budgets.length === 0 ? (
          <div className="text-center py-20 px-6 bg-[var(--card)] rounded-[32px] border border-[var(--border)]">
            <div className="w-20 h-20 rounded-3xl bg-[#15803D]/10 text-[#15803D] flex items-center justify-center mx-auto mb-6">
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
            {budgets.map((budget: Budget) => {
              const spent = parseFloat(String(budget.spent || 0));
              const limit = parseFloat(String(budget.limitAmount || 0));
              const pct = budget.percentageUsed || 0;
              const cat = budget.category;
              const color = cat?.color || '#15803D';
              const label = cat?.label || budget.categoryId;

              return (
                <div 
                  key={budget.id} 
                  className="flow-card p-6 cursor-pointer hover:shadow-xl transition-all active:scale-[0.98]"
                  onClick={() => { setSelectedBudget(budget); setIsModalOpen(true); }}
                >
                  <div className="flex items-center gap-5">
                    <CategoryIcon 
                      category={label} 
                      icon={cat?.icon} 
                      size="lg" 
                    />
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-[17px] font-bold text-[var(--text)] truncate">{label}</p>
                        <p className={`text-[17px] font-bold ${pct > 90 ? 'text-[#F04438]' : 'text-[var(--text)]'}`}>
                          {pct > 999 ? '>999%' : `${pct}%`}
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
        <>
          <div className="fixed inset-0 bg-black/40 z-[90] backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)} />
          <div 
            className="fixed inset-x-0 bottom-0 lg:top-1/2 lg:bottom-auto lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-[500px] lg:rounded-[32px] bg-[var(--bg)] z-[100] flex flex-col animate-slide-up rounded-t-[32px] overflow-hidden"
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
        </>
      )}
    </div>
  );
}
