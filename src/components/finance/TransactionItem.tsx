import { useState } from 'react';
import { Edit2, Trash2, Loader2, MoreVertical } from 'lucide-react';
import type { Transaction, Category } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { CategoryIcon } from '../ui/CategoryIcon';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  onEdit?: () => void;
  onDelete?: () => void;
  style?: React.CSSProperties;
}

export function TransactionItem({ transaction, category, onEdit, onDelete, style }: TransactionItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const isIncome = transaction.type === 'income';

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Hapus transaksi ini?')) return;

    if (onDelete) {
      setIsDeleting(true);
      try {
        await onDelete();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const timeString = transaction.createdAt 
    ? new Date(transaction.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div
      onClick={onEdit}
      className={`
        group flex items-center justify-between p-4 bg-white
        transition-all duration-200 cursor-pointer
        active:bg-zinc-50 lg:hover:bg-zinc-50 relative
        ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
      `}
      style={style}
    >
      <div className="flex items-center gap-3 min-w-0 pr-4">
        <CategoryIcon category={transaction.categoryId} size="md" />

        <div className="min-w-0">
          <p className="font-bold text-[#1a1a2e] text-[15px] truncate mb-0.5" title={transaction.description || category?.label}>
            {transaction.description || category?.label || 'Tanpa keterangan'}
          </p>
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#71717a] truncate">
            {timeString && <span>{timeString}</span>}
            {timeString && <span className="opacity-50">•</span>}
            <span className="capitalize">{category?.label || transaction.categoryId}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Amount */}
        <span
          className={`
            font-bold text-[16px] whitespace-nowrap
            ${isIncome ? 'text-[#16a34a]' : 'text-[#1a1a2e]'}
          `}
        >
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </span>

        {/* Desktop Hover Actions */}
        <div className="hidden lg:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            disabled={isDeleting}
            className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile menu indicator (just for visual hint that it's clickable) */}
        <div className="lg:hidden text-zinc-300">
           <MoreVertical className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
