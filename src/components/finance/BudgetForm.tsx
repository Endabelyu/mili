import { useState, useEffect } from 'react';
import { useFetcher } from 'react-router';
import { Button, Input } from '@app/components/ui';
import { Loader2, DollarSign, Tag, Calendar, Target } from 'lucide-react';
import type { Budget, Category } from '@app/types';

interface BudgetWithSpending extends Budget {
  category?: Category;
  spent?: string;
  remaining?: string;
  percentageUsed?: number;
}

interface BudgetFormProps {
  budget?: BudgetWithSpending | null;
  categories: Category[];
  currentMonth: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BudgetForm({ budget, categories, currentMonth, onSuccess, onCancel }: BudgetFormProps) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state !== 'idle';
  const isEditing = !!budget?.id;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    budget?.categoryId || ''
  );

  // Update selected category when budget changes
  useEffect(() => {
    if (budget?.categoryId) {
      setSelectedCategoryId(budget.categoryId);
    }
  }, [budget?.categoryId]);

  // Get available categories (not already budgeted for this month, unless editing)
  const availableCategories = categories.filter(c => {
    if (isEditing && c.id === budget?.categoryId) return true;
    return true; // Allow any category selection
  });

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  const validateForm = (formData: FormData): boolean => {
    const newErrors: Record<string, string> = {};

    const categoryId = formData.get('categoryId') as string;
    if (!categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    const limitAmount = formData.get('limitAmount') as string;
    if (!limitAmount || isNaN(parseFloat(limitAmount)) || parseFloat(limitAmount) <= 0) {
      newErrors.limitAmount = 'Please enter a valid amount greater than 0';
    }

    const month = formData.get('month') as string;
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      newErrors.month = 'Please select a valid month';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!validateForm(formData)) return;

    const data = {
      intent: isEditing ? 'update' : 'create',
      id: budget?.id || '',
      categoryId: formData.get('categoryId') as string,
      limitAmount: formData.get('limitAmount') as string,
      month: formData.get('month') as string,
    };

    fetcher.submit(data, {
      method: 'POST',
      encType: 'application/json',
    });

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Category Select */}
      <div>
        <label htmlFor="categoryId" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
          Category
        </label>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Tag className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
          </div>
          <select
            id="categoryId"
            name="categoryId"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            disabled={isEditing}
            className={`
              w-full rounded-lg border px-10 py-2.5 text-sm
              bg-[var(--card-bg)] backdrop-blur-md appearance-none cursor-pointer
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-[var(--gradient-hero-start)]/20 focus:border-[var(--gradient-hero-start)]
              ${errors.categoryId ? 'border-red-300 focus:border-red-500' : 'border-[var(--card-border)]'}
              ${isEditing ? 'bg-white/10 dark:bg-black/20 cursor-not-allowed' : ''}
            `}
          >
            <option value="" disabled>Select a category</option>
            {availableCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon && `${category.icon} `}{category.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {errors.categoryId && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-red-500" />
            {errors.categoryId}
          </p>
        )}
        {isEditing && (
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Category cannot be changed when editing. Delete and recreate to change categories.
          </p>
        )}
      </div>

      {/* Month Input */}
      <div>
        <label htmlFor="month" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
          Month
        </label>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Calendar className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
          </div>
          <Input
            id="month"
            name="month"
            type="month"
            defaultValue={budget?.month || currentMonth}
            disabled={isEditing}
            className={`
              pl-10
              ${errors.month ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}
              ${isEditing ? 'bg-white/10 dark:bg-black/20 cursor-not-allowed' : ''}
            `}
          />
        </div>
        {errors.month && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-red-500" />
            {errors.month}
          </p>
        )}
      </div>

      {/* Limit Amount Input */}
      <div>
        <label htmlFor="limitAmount" className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
          Budget Limit
        </label>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <DollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <Input
            id="limitAmount"
            name="limitAmount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            defaultValue={budget?.limitAmount ? parseFloat(budget.limitAmount.toString()).toFixed(2) : ''}
            className={`
              pl-11 pr-4 py-2.5 text-lg font-semibold
              ${errors.limitAmount ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}
            `}
          />
          {/* Focus indicator ring */}
          <div className="absolute inset-0 rounded-md pointer-events-none opacity-0 group-focus-within:opacity-100 ring-2 ring-blue-500/20 transition-opacity duration-200" />
        </div>
        {errors.limitAmount ? (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-red-500" />
            {errors.limitAmount}
          </p>
        ) : (
          <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
            Set the maximum amount you want to spend in this category
          </p>
        )}
      </div>

      {/* Quick Amount Buttons */}
      <div>
        <p className="text-xs font-medium text-[var(--text-secondary)] mb-2">Quick select</p>
        <div className="flex flex-wrap gap-2">
          {[50, 100, 200, 500, 1000].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => {
                const input = document.getElementById('limitAmount') as HTMLInputElement;
                if (input) {
                  input.value = amount.toString();
                }
              }}
              className="px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/40 rounded-lg transition-colors"
            >
              ${amount}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 h-11"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || availableCategories.length === 0}
          className="flex-1 h-11 bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isEditing ? 'Updating...' : 'Saving...'}
            </>
          ) : (
            <>
              <Target className="w-4 h-4 mr-2" />
              {isEditing ? 'Update Budget' : 'Set Budget'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
