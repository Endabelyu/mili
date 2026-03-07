import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Edit2, Trash2, Loader2 } from 'lucide-react';
import type { Transaction, Category } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  onEdit?: () => void;
  onDelete?: () => void;
  style?: React.CSSProperties;
}
const getCategoryBadgeStyle = (categoryLabel?: string) => {
  const label = categoryLabel?.toLowerCase() || '';
  if (label.includes('food') || label.includes('grocery') || label.includes('dining')) {
    return 'bg-amber-100 text-amber-800 border-amber-200';
  }
  if (label.includes('transport') || label.includes('car') || label.includes('gas')) {
    return 'bg-blue-100 text-blue-800 border-blue-200';
  }
  if (label.includes('entertainment') || label.includes('fun')) {
    return 'bg-purple-100 text-purple-800 border-purple-200';
  }
  if (label.includes('shopping')) {
    return 'bg-pink-100 text-pink-800 border-pink-200';
  }
  if (label.includes('bill') || label.includes('utility')) {
    return 'bg-red-100 text-red-800 border-red-200';
  }
  if (label.includes('health') || label.includes('medical')) {
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  }
  if (label.includes('salary') || label.includes('wage')) {
    return 'bg-green-100 text-green-800 border-green-200';
  }
  if (label.includes('freelance')) {
    return 'bg-teal-100 text-teal-800 border-teal-200';
  }
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

export function TransactionItem({ transaction, category, onEdit, onDelete, style }: TransactionItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const isIncome = transaction.type === 'income';
  const Icon = isIncome ? ArrowUpRight : ArrowDownRight;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    if (onDelete) {
      setIsDeleting(true);
      try {
        await onDelete();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div
      className={`
        group flex items-center justify-between p-4 mb-3
        glass-card hover:bg-white/[0.05] transition-all duration-300
        cursor-pointer
        ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
      `}
      style={style}
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Icon with semantic styling */}
        <div
          className={`
            flex-shrink-0 w-12 h-12 rounded-[1.25rem] flex items-center justify-center
            bg-white/5 border border-[var(--card-border)]
            transition-transform duration-200 group-hover:scale-105
            ${isIncome
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-rose-400 bg-rose-500/10'
            }
          `}
        >
          {category?.icon ? (
            <span className="text-xl">{category.icon}</span>
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-[var(--text-primary)] truncate">
              {transaction.description || category?.label || 'Tanpa keterangan'}
            </p>
            <span className={`
              inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold
              border-2 border-slate-800 dark:border-[1px] ${getCategoryBadgeStyle(category?.label)}
            `}>
              {category?.label || 'Uncategorized'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mt-1 opacity-70">
            <span>{formatDate(transaction.date)}</span>
            {transaction.createdAt && (
              <>
                <span className="opacity-40">•</span>
                <span>{new Date(transaction.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Amount & Actions */}
      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        {/* Amount with semantic styling */}
        <span
          className={`
            font-black text-[1.1rem] tabular-nums tracking-tight
            ${isIncome ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}
          `}
        >
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </span>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            aria-label="Edit transaction"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Edit2 className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
            aria-label="Delete transaction"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
