import { useState } from 'react';
import { Button, Input } from '@app/components/ui';
import { Loader2, DollarSign, Calendar, Tag, FileText, Landmark } from 'lucide-react';
import { transactionsApi } from '@app/api/client';
import type { Transaction, Category, Account } from '@app/types';

interface TransactionFormProps {
  transaction?: Transaction | null;
  categories: Category[];
  accounts?: Account[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function TransactionForm({ transaction, categories, accounts = [], onSuccess, onCancel }: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!transaction;

  const [type, setType] = useState<'income' | 'expense' | 'transfer'>((transaction?.type as 'income' | 'expense' | 'transfer') || 'expense');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter categories by selected type
  const availableCategories = categories.filter(c => {
    if (type === 'transfer') return c.id === 'transfer' || c.type === 'both';
    return c.type === type || c.type === 'both';
  });

  const validateForm = (formData: FormData): boolean => {
    const newErrors: Record<string, string> = {};

    const amount = formData.get('amount') as string;
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    const categoryId = formData.get('categoryId') as string;
    if (!categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    const date = formData.get('date') as string;
    if (!date) {
      newErrors.date = 'Please select a date';
    }

    if (type === 'transfer') {
      const accountId = formData.get('accountId') as string;
      const toAccountId = formData.get('toAccountId') as string;
      if (!accountId || !toAccountId) {
        newErrors.form = 'Please select both source and destination accounts';
      } else if (accountId === toAccountId) {
        newErrors.form = 'Source and destination accounts must be different';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!validateForm(formData)) return;

    setIsSubmitting(true);
    try {
      const amount = formData.get('amount') as string;
      const categoryId = formData.get('categoryId') as string;
      const accountId = (formData.get('accountId') as string) || undefined;
      const toAccountId = (formData.get('toAccountId') as string) || undefined;
      const description = (formData.get('description') as string) || '';
      const date = formData.get('date') as string;

      const payload = { type, amount, categoryId, accountId, toAccountId, description, date };

      if (isEditing && transaction?.id) {
        await transactionsApi.update(transaction.id, payload as Partial<Transaction>);
      } else {
        await transactionsApi.create(payload as Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>);
      }

      onSuccess();
    } catch (err) {
      console.error('Failed to save transaction', err);
      setErrors({ form: 'Failed to save transaction. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors.form && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium">
          {errors.form}
        </div>
      )}

      {/* Type Selection */}
      <div>
        <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2.5">
          Transaction Type
        </label>
        <div className="grid grid-cols-3 gap-2 p-1 bg-[var(--card-bg)] backdrop-blur-md rounded-xl border border-[var(--card-border)]">
          {(['expense', 'income', 'transfer'] as const).map((tp) => (
            <button
              key={tp}
              type="button"
              onClick={() => setType(tp)}
              className={`
                relative flex items-center justify-center gap-2 py-2 px-2 rounded-lg text-xs font-bold
                transition-all duration-200 ease-out
                ${type === tp
                  ? `bg-[var(--card-bg)] shadow-sm ring-1 ${tp === 'expense' ? 'text-rose-500 ring-rose-500/20' : tp === 'income' ? 'text-emerald-500 ring-emerald-500/20' : 'text-blue-500 ring-blue-500/20'}`
                  : 'text-[var(--text-primary)]/60 hover:text-[var(--text-primary)]'
                }
              `}
            >
              <span className="capitalize">{tp}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Account Selection */}
      <div className={`grid ${type === 'transfer' ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
        <div>
          <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
            {type === 'transfer' ? 'From Account' : 'Account'}
          </label>
          <div className="relative">
            <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              name="accountId"
              defaultValue={transaction?.accountId || ''}
              className="w-full rounded-xl border-2 pl-10 pr-4 py-2.5 text-sm bg-[var(--card-bg)] text-[var(--text-primary)] border-[#5c4a44]/15 focus:border-[#5c4a44] outline-none"
            >
              <option value="">Select Account</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>
        </div>

        {type === 'transfer' && (
          <div>
            <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
              To Account
            </label>
            <div className="relative">
              <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
              <select
                name="toAccountId"
                defaultValue={transaction?.toAccountId || ''}
                className="w-full rounded-xl border-2 pl-10 pr-4 py-2.5 text-sm bg-[var(--card-bg)] text-[var(--text-primary)] border-blue-500/20 focus:border-blue-500 outline-none"
              >
                <option value="">Target Account</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Amount Input */}
      <div>
        <label htmlFor="amount" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
          Amount
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <DollarSign className={`w-5 h-5 ${type === 'income' ? 'text-emerald-500' : type === 'transfer' ? 'text-blue-500' : 'text-rose-500'}`} />
          </div>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            defaultValue={transaction?.amount ? parseFloat(transaction.amount.toString()) : ''}
            className="pl-11 pr-4 py-2.5 text-lg font-semibold border border-[var(--card-border)] bg-[var(--card-bg)] focus:border-[#5c4a44]"
          />
        </div>
        {errors.amount && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.amount}</p>}
      </div>

      {/* Category Selection Grid */}
      <div className="space-y-3">
        <label className="block text-[13px] font-bold text-[var(--text)] mb-2.5 ml-1">
          {t('txn.category')}
        </label>
        <div className="bg-[var(--muted)]/30 rounded-[24px] p-4 border border-[var(--border)]">
          <div className="grid grid-cols-3 gap-3 max-h-[280px] overflow-y-auto p-1">
            {availableCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  const input = document.getElementById('categoryId') as HTMLInputElement;
                  if (input) input.value = category.id;
                  // Force a re-render if needed or just use state
                }}
                className={`
                  flex flex-col items-center justify-center p-3 rounded-2xl transition-all
                  hover:bg-[var(--muted)] border border-transparent
                `}
              >
                <CategoryIcon 
                  category={category.label} 
                  icon={category.icon} 
                  size="md" 
                  label={category.label}
                />
              </button>
            ))}
          </div>
          <input type="hidden" id="categoryId" name="categoryId" defaultValue={transaction?.categoryId || ''} />
        </div>
        {errors.categoryId && <p className="mt-1 text-xs text-rose-500 font-medium ml-1">{errors.categoryId}</p>}
      </div>

      {/* Date Input */}
      <div>
        <label htmlFor="date" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
          Date
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="date"
            name="date"
            type="date"
            defaultValue={transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : today}
            className="pl-10 text-[var(--text-primary)] border border-[var(--card-border)] bg-[var(--card-bg)]"
          />
        </div>
        {errors.date && <p className="mt-1 text-xs text-rose-500 font-medium">{errors.date}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
          Description
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="description"
            name="description"
            type="text"
            placeholder="e.g., Grocery shopping..."
            defaultValue={transaction?.description || ''}
            className="pl-10 text-[var(--text-primary)] border border-[var(--card-border)] bg-[var(--card-bg)]"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
        <Button type="button" onClick={onCancel} disabled={isSubmitting} className="flex-1 bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--border)]">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || availableCategories.length === 0}
          className={`flex-1 font-bold text-white ${type === 'income' ? 'bg-emerald-600' : type === 'transfer' ? 'bg-blue-600' : 'bg-rose-600'}`}
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? 'Update' : `Add ${type}`}
        </Button>
      </div>
    </form>
  );
}
