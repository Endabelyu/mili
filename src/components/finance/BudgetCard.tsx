import { useState } from 'react';
import { Pencil, Trash2, AlertCircle, Target } from 'lucide-react';
import { Button } from '@app/components/ui/Button';
import { ConfirmDialog } from '@app/components/ui';
import type { Budget, Category } from '@app/types';

interface BudgetWithSpending extends Budget {
  category: Category;
  spent: string;
  remaining: string;
  percentageUsed: number;
}

interface BudgetCardProps {
  budget: BudgetWithSpending;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export function BudgetCard({ budget, onEdit, onDelete, isDeleting }: BudgetCardProps) {
  const limit = parseFloat(String(budget.limitAmount));
  const spent = parseFloat(String(budget.spent));
  const remaining = parseFloat(String(budget.remaining));
  const percentage = budget.percentageUsed;
  
  const [showConfirm, setShowConfirm] = useState(false);

  const getStatusColor = () => {
    if (percentage >= 100) return {
      bar: 'bg-gradient-to-r from-rose-500 to-rose-400',
      bg: 'glass-card border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
      iconBg: 'bg-rose-500/20 text-rose-400',
    };
    if (percentage >= 75) return {
      bar: 'bg-gradient-to-r from-amber-500 to-amber-400',
      bg: 'glass-card border-amber-500/30',
      iconBg: 'bg-amber-500/20 text-amber-400',
    };
    return {
      bar: 'bg-gradient-to-r from-[var(--gradient-hero-start)] to-[var(--gradient-hero-end)]',
      bg: 'glass-card border-[var(--gradient-hero-start)]/30',
      iconBg: 'bg-[var(--gradient-hero-start)]/20 text-[var(--gradient-hero-start)]',
    };
  };

  const status = getStatusColor();

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowConfirm(false);
    onDelete();
  };

  return (
    <>
      <div className={`relative ${status.bg} p-5 transition-transform hover:-translate-y-1 hover:shadow-lg`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${status.iconBg}`}>
              {budget.category.icon ? (
                <span className="text-2xl">{budget.category.icon}</span>
              ) : (
                <Target className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg text-[var(--text-primary)] tracking-tight">{budget.category.label}</h3>
              <p className="text-sm font-medium text-[var(--text-secondary)]">Terpakai Anggaran {percentage}%.</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-10 w-10 p-0 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="h-10 w-10 p-0 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              {isDeleting ? (
                <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-3 w-full bg-[var(--text-primary)]/10 rounded-full overflow-visible relative mb-2 shadow-inner">
          <div
            className={`h-full ${status.bar} rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
          {percentage >= 100 && (
             <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-rose-500 border-2 border-[var(--card-bg)] rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md z-10">
               !
             </div>
          )}
        </div>

        {/* Amounts */}
        <div className="flex justify-between mt-2 px-1">
          <p className="text-sm font-bold text-[var(--text-primary)]">
            {spent.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
          </p>
          <p className="text-sm font-bold text-[var(--text-secondary)]">
            {limit.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Budget?"
        message={`Are you sure you want to delete the budget for "${budget.category.label}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
