import '../styles/animations.css';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { budgetsApi, categoriesApi } from '../api/client';
import { type Budget, type Category } from '../types';
import { Button, Input, Modal } from '../components/ui';
import { BudgetCard } from '../components/finance/BudgetCard';
import { BudgetForm } from '../components/finance/BudgetForm';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { Plus, Calendar, Target, TrendingUp, Wallet, AlertCircle } from 'lucide-react';

export const meta = () => {
  return [
    { title: 'Budget | Finance Tracker' },
    { name: 'description', content: 'Set and track your spending limits by category' },
  ];
};

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
      acc.totalRemaining += parseFloat(budget.remaining);
      if (budget.percentageUsed >= 100) acc.overBudgetCount++;
      else if (budget.percentageUsed >= 90) acc.nearLimitCount++;
      return acc;
    },
    { totalBudgeted: 0, totalSpent: 0, totalRemaining: 0, overBudgetCount: 0, nearLimitCount: 0 }
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
          setBudgets(budgetsData as any);
          setCategories(categoriesData as any);
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

  // Handle ?new=true to open modal automatically
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsModalOpen(true);
      // Clean up the URL
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
    {
      key: 'n',
      ctrl: true,
      meta: true,
      handler: () => setIsModalOpen(true),
    },
    {
      key: 'Escape',
      handler: () => {
        if (isModalOpen) {
          setIsModalOpen(false);
          setEditingBudget(null);
        }
      },
    },
  ]);
  
  const updateMonth = (newMonth: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (newMonth) newParams.set('month', newMonth);
    else newParams.delete('month');
    setSearchParams(newParams);
  };
  
  if (isLoading) {
    return <div className="space-y-6 animate-fade-in"><p>Loading...</p></div>;
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] tracking-tight">Budget</h1>
            <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-0.5">
              Track spending limits
              <span className="hidden sm:inline text-[var(--text-secondary)] opacity-60 ml-2">(Cmd/Ctrl+N to add new)</span>
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="hidden md:flex h-11 px-6 shadow-sm hover:shadow transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Set Budget
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] mb-2">
            <Calendar className="w-4 h-4" />
            Select Month
          </label>
          <Input
            type="month"
            value={currentMonth}
            onChange={(e) => updateMonth(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">Total Budgeted</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">${summary.totalBudgeted.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">Total Spent</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">${summary.totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${summary.totalRemaining >= 0 ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
              <Wallet className={`w-5 h-5 ${summary.totalRemaining >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
            </div>
            <div>
              <p className={`text-sm font-medium ${summary.totalRemaining >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {summary.totalRemaining >= 0 ? 'Remaining' : 'Over Budget'}
              </p>
              <p className={`text-xl font-bold text-[var(--text-primary)]`}>
                ${Math.abs(summary.totalRemaining).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {budgets.length > 0 && (
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Overall Budget Usage</h3>
            <span className={`text-sm font-bold ${
              overallPercentage > 90 ? 'text-[var(--gradient-danger-start)]' :
              overallPercentage > 75 ? 'text-amber-500' : 'text-[var(--gradient-success-start)]'
            }`}>
              {overallPercentage}%
            </span>
          </div>
          <div className="h-3 bg-[var(--text-primary)]/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercentage > 90 ? 'bg-[var(--gradient-danger-start)]' :
                overallPercentage > 75 ? 'bg-amber-500' : 'bg-[var(--gradient-success-start)]'
              }`}
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {budgets.length === 0 && categoriesWithoutBudget.length === 0 ? (
          <div className="text-center py-16 px-4 glass-card">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--text-primary)]/5 flex items-center justify-center">
              <Target className="w-8 h-8 text-[var(--text-secondary)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No budgets set</h3>
            <p className="text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
              Start tracking your spending by setting budget limits for your expense categories.
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Set your first budget
            </Button>
          </div>
        ) : (
          <>
            {budgets.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Active Budgets
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
            
            {categoriesWithoutBudget.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Categories Without Budgets
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {categoriesWithoutBudget.map((category) => (
                    <div
                      key={category.id}
                      className="glass-card p-4 hover:border-[var(--text-primary)]/20 transition-colors cursor-pointer border-dashed"
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {category.icon && <span className="text-2xl">{category.icon}</span>}
                          <div>
                            <h3 className="font-semibold text-gray-700">{category.label}</h3>
                            <p className="text-sm text-[var(--text-secondary)]">No limit set</p>
                          </div>
                        </div>
                        <Plus className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        title={editingBudget?.id ? 'Edit Budget' : 'Set Budget'}
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
