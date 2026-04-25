import { useState } from 'react';
import { Edit2, Trash2, Loader2, MoreVertical } from 'lucide-react';
import type { Transaction, Category } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { CategoryIcon } from '../ui/CategoryIcon';
import { Alert } from '../ui/Alert';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  onEdit?: () => void;
  onDelete?: () => void;
  style?: React.CSSProperties;
}

export function TransactionItem({ transaction, category, onEdit, onDelete, style }: TransactionItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isIncome = transaction.type === 'income';

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setShowConfirm(false);
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
        group flex items-center justify-between p-4 bg-[var(--card)]
        transition-all duration-200 cursor-pointer border-b border-[var(--border)]
        active:bg-[var(--muted)] lg:hover:bg-[var(--muted)] relative
        ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
      `}
      style={style}
    >
      <div className="flex items-center gap-3 min-w-0 pr-4">
        <CategoryIcon category={transaction.categoryId} size="md" />

        <div className="min-w-0">
          <p className="font-bold text-[var(--text)] text-[14px] tracking-[-0.01em] truncate mb-0.5" title={transaction.description || category?.label}>
            {transaction.description || category?.label || 'Tanpa keterangan'}
          </p>
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-dim)] truncate">
            {timeString && <span className="tabular-nums">{timeString}</span>}
            {timeString && <span className="opacity-50">•</span>}
            <span className="capitalize">{category?.label || transaction.categoryId}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Amount */}
        <span
          className={`
            font-bold text-[15px] tracking-[-0.01em] whitespace-nowrap tabular-nums
            ${isIncome ? 'text-[var(--income)]' : 'text-[var(--text)]'}
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
            className="p-2 text-[var(--text-dim-2)] hover:text-[var(--accent)] hover:bg-[var(--accent-tint)] rounded-full transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="p-2 text-[var(--text-dim-2)] hover:text-[var(--expense)] hover:bg-[var(--expense)]/10 rounded-full transition-colors"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile menu indicator (just for visual hint that it's clickable) */}
        <div className="lg:hidden text-zinc-300">
           <MoreVertical className="w-5 h-5" />
        </div>
      </div>

      <Alert
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Hapus Transaksi?"
        message="Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak bisa dibatalkan."
        type="error"
        isConfirm={true}
        onConfirm={confirmDelete}
        confirmLabel="Hapus"
      />
    </div>
  );
}
