import '../styles/animations.css';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { budgetsApi, categoriesApi } from '../api/client';
import { type Budget, type Category } from '../types';
import { Modal } from '../components/ui';
import { BudgetCard } from '../components/finance/BudgetCard';
import { BudgetForm } from '../components/finance/BudgetForm';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { Rocket, Wallet } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { CategoryIcon } from '../components/ui';

export const meta = () => [
  { title: 'Budget | Finance Tracker' },
];

interface BudgetWithSpending extends Budget {
  category: Category;
  spent: string;
  remaining: string;
  percentageUsed: number;
}

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

function calculateSummary(budgets: BudgetWithSpending[]) {
  return budgets.reduce(
    (acc, budget) => {
      const limit = Number(budget.limitAmount);
      const spent = Number(budget.spent);
      acc.totalBudgeted += limit;
      acc.totalSpent += spent;
      return acc;
    },
    { totalBudgeted: 0, totalSpent: 0 }
  );
}

export default function BudgetPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [budgets, setBudgets] = useState<BudgetWithSpending[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const currentMonth = searchParams.get('month') || getCurrentMonth();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadData = async () => {
      try {
        const [budgetsData, categoriesData] = await Promise.all([
          budgetsApi.list({ month: currentMonth }),
          categoriesApi.list(),
        ]);

        if (isMounted) {
          setBudgets(budgetsData as BudgetWithSpending[]);
          setCategories(categoriesData);
        }
      } catch (err) {
        console.error('Failed to load budget data', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [currentMonth]);

  const handleDelete = async (id: string) => {
    try {
      await budgetsApi.delete(id);
      setBudgets(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('Failed to delete budget', err);
    }
  };
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithSpending | null>(null);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsModalOpen(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('new');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const summary = calculateSummary(budgets);
  const overallPercentage = summary.totalBudgeted > 0
    ? Math.round((summary.totalSpent / summary.totalBudgeted) * 100)
    : 0;
  
  const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both');
  const budgetedCategoryIds = new Set(budgets.map(b => b.categoryId));
  const categoriesWithoutBudget = expenseCategories.filter(c => !budgetedCategoryIds.has(c.id));
  
  useKeyboardShortcuts([
    { key: 'n', ctrl: true, meta: true, handler: () => setIsModalOpen(true) },
    { key: 'Escape', handler: () => { if (isModalOpen) { setIsModalOpen(false); setEditingBudget(null); } } },
  ]);
  
  if (isLoading) {
      return <div className="p-8 animate-pulse text-center text-zinc-400 font-medium">Memuat budget...</div>;
  }
  
  const dateObj = new Date(currentMonth + '-01');
  const monthName = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 pb-24 md:pb-8 max-w-2xl mx-auto px-4 pt-4 lg:pt-8 w-full animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#ecfccb] border-2 border-white flex items-center justify-center shadow-sm shrink-0">
             <Wallet className="w-6 h-6 text-[#65a30d]" />
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold text-[#1a1a2e] tracking-tight">Anggaran</h1>
            <p className="text-sm font-medium text-[#71717a]">Kelola keuangan bulan {monthName}</p>
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

      {/* Encouragement Buddy Card */}
      <div className="flow-card p-5 relative overflow-hidden bg-[#fbfbf9] border-[#f0f0ea]">
         <div className="flex gap-4 relative z-10">
           <div className="w-[72px] h-[72px] flex-shrink-0 bg-[#a3e635] rounded-full flex items-center justify-center text-[40px] shadow-sm border-[4px] border-white shadow-[#a3e635]/20">
             🐻
           </div>
           <div className="flex-1 mt-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#65a30d]">
                  Bulan {monthName}
                </span>
                {overallPercentage <= 80 && (
                   <span className="w-2 h-2 rounded-full bg-[#84cc16]"></span>
                )}
              </div>
              <h3 className="font-extrabold text-[#1a1a2e] text-[20px] mb-1 leading-tight">
                {overallPercentage > 100 
                  ? "Oops, sedikit over!" 
                  : overallPercentage > 80 
                    ? "Hati-hati pengeluaran" 
                    : "Anda luar biasa!"}
              </h3>
              <p className="text-[#71717a] text-[13px] font-medium leading-snug">
                {overallPercentage > 100 
                  ? "Total pengeluaran sudah melebih anggaran."
                  : `Anda baru menggunakan ${overallPercentage}% dari total anggaran. Pertahankan!`} 🚀
              </p>
           </div>
         </div>
      </div>

      {/* Summary Chips */}
      {summary.totalBudgeted > 0 && (
         <div className="flex gap-3">
           <div className="flex-1 flow-card py-3 px-4 flex items-center gap-3 border-none shadow-sm shadow-[#ecfccb]/50 bg-[#ecfccb]/30">
             <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
               <Wallet className="w-4 h-4 text-[#3b82f6]" />
             </div>
             <div>
               <p className="text-[10px] uppercase font-bold tracking-wider text-[#3f6212]">TERPAKAI</p>
               <p className="font-extrabold text-[#1a1a2e] text-[15px]">{formatCurrency(summary.totalSpent)}</p>
             </div>
           </div>
           
           <div className="flex-1 flow-card py-3 px-4 flex items-center gap-3 border-none shadow-sm shadow-[#f3e8ff]/50 bg-[#f3e8ff]/40">
             <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
               <Rocket className="w-4 h-4 text-[#a855f7]" />
             </div>
             <div>
               <p className="text-[10px] uppercase font-bold tracking-wider text-[#7e22ce]">ANGGARAN</p>
               <p className="font-extrabold text-[#1a1a2e] text-[15px]">{formatCurrency(summary.totalBudgeted)}</p>
             </div>
           </div>
         </div>
      )}

      {/* Active Budgets */}
      {budgets.length > 0 && (
        <div className="pt-2 max-w-[100vw]">
          <div className="flex items-center justify-between mb-3 px-1">
             <h2 className="text-[17px] font-bold text-[#1a1a2e]">Anggaran Aktif</h2>
             <span className="text-[13px] font-bold text-[#a1a1aa]">{budgets.length} Kategori</span>
          </div>
          <div className="space-y-4">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onEdit={() => setEditingBudget(budget)}
                onDelete={() => handleDelete(budget.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Categories without Budget */}
      {categoriesWithoutBudget.length > 0 && (
         <div className="pt-4 pb-12">
           <h2 className="text-[15px] font-bold text-[#1a1a2e] mb-3 px-1">Buat Anggaran Baru</h2>
           <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
             {categoriesWithoutBudget.map((category) => (
               <div
                 key={category.id}
                 className="flow-card p-3 border-dashed border-2 bg-transparent hover:bg-zinc-50 cursor-pointer flex flex-col items-center justify-center text-center gap-2"
                 onClick={() => {
                   setEditingBudget({
                     id: '',
                     categoryId: category.id,
                     category,
                     month: currentMonth,
                     limitAmount: '0',
                     spent: '0',
                     remaining: '0',
                     percentageUsed: 0,
                     userId: '',
                     createdAt: new Date(),
                   } as BudgetWithSpending);
                   setIsModalOpen(true);
                 }}
               >
                 <CategoryIcon category={category.id} size="md" />
                 <div>
                   <h3 className="font-bold text-[#1a1a2e] text-[13px]">{category.label}</h3>
                   <p className="text-[11px] font-medium text-[#71717a]">Tambah +</p>
                 </div>
               </div>
             ))}
           </div>
         </div>
      )}
      
      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        title={editingBudget?.id ? 'Edit Anggaran' : 'Set Anggaran Baru'}
      >
        <BudgetForm
          budget={editingBudget}
          categories={expenseCategories as any}
          currentMonth={currentMonth}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingBudget(null);
          }}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingBudget(null);
          }}
        />
      </Modal>
    </div>
  );
}
