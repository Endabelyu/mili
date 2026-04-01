import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { ConfirmDialog } from '@app/components/ui';
import type { Budget, Category } from '@app/types';
import { formatCurrency } from '@app/lib/utils';
import { CategoryIcon } from '@app/components/ui/CategoryIcon';

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
  const percentage = Math.min(budget.percentageUsed, 100);
  
  const [showConfirm, setShowConfirm] = useState(false);

  // Dynamic colors for the progress bar based on category ID
  const getProgressBarColor = () => {
    // If over budget, make it red
    if (percentage >= 100) return 'bg-[#ef4444]';
    // Otherwise use category based coloring as defined in our styles
    const catName = budget.category?.label?.toLowerCase() || budget.categoryId.toLowerCase();
    
    if (catName.includes('food') || catName.includes('makan')) return 'bg-[#f59e0b]'; // amber
    if (catName.includes('shop') || catName.includes('belanja')) return 'bg-[#3b82f6]'; // blue
    if (catName.includes('fun') || catName.includes('hiburan')) return 'bg-[#a855f7]'; // purple
    if (catName.includes('transport')) return 'bg-[#06b6d4]'; // cyan
    if (catName.includes('health')) return 'bg-[#22c55e]'; // green
    if (catName.includes('bill')) return 'bg-[#f43f5e]'; // rose
    
    // Default green for typical goals
    return 'bg-[#a3e635]';
  };

  const getLightBarColor = () => {
    const color = getProgressBarColor();
    // Simply replacing bg with text for lighter tint approach 
    // Usually tailwind handles this with opacity, we'll use a standard light fill
    return `${color.replace('bg-', 'bg-')}/15`;
  };

  const progressBarColor = getProgressBarColor();
  const lightBarColor = getLightBarColor();

  const handleConfirmDelete = () => {
    setShowConfirm(false);
    onDelete();
  };

  const remaining = limit - spent;
  const isOverBudget = remaining < 0;

  return (
    <>
      <div 
        className="flow-card p-5 group cursor-pointer transition-transform hover:-translate-y-0.5 active:bg-zinc-50"
        onClick={onEdit}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 pr-2 flex-1 min-w-0">
             <CategoryIcon category={budget.categoryId} size="md" />
             <div className="min-w-0 flex-1">
               <h3 className="font-bold text-[#1a1a2e] text-[16px] truncate leading-tight mb-0.5">
                 {budget.category?.label || budget.categoryId}
               </h3>
               <p className="text-[13px] font-medium text-[#71717a] truncate">
                 Target: {formatCurrency(limit)}
               </p>
             </div>
          </div>
          <div className="text-right flex-shrink-0">
             <p className={`font-bold text-[17px] leading-tight mb-0.5 ${isOverBudget ? 'text-[#ef4444]' : 'text-[#3b82f6]'}`}>
               {formatCurrency(spent)}
             </p>
             <p className="text-[10px] uppercase font-bold tracking-wider text-[#a1a1aa]">
               TERPAKAI
             </p>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className={`h-3 w-full rounded-full overflow-hidden ${lightBarColor} my-3 relative`}>
          <div
            className={`h-full ${progressBarColor} rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider">
          <span className="text-[#65a30d]">
            {percentage.toFixed(0)}% TERPAKAI
          </span>
          <span className={isOverBudget ? 'text-[#ef4444]' : 'text-[#f59e0b]'}>
            {isOverBudget ? `LEBIH ${formatCurrency(Math.abs(remaining))}` : `SISA ${formatCurrency(remaining)}`}
          </span>
        </div>
        
        {/* Actions (appear on hover desktop) */}
        <div className="hidden lg:flex absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
            disabled={isDeleting}
            className="w-8 h-8 rounded-full bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50"
          >
            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Hapus Budget?"
        message={`Anda yakin ingin menghapus budget untuk kategori "${budget.category?.label}"?`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
