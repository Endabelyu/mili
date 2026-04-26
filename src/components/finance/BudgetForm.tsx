import { useState, useEffect, useRef } from 'react';
import { Button, Input } from '@app/components/ui';
import { budgetsApi } from '@app/api/client';
import { usePreferences } from '@app/hooks/usePreferences';
import { Tag, Calendar, Target, Loader2 } from 'lucide-react';
import type { Budget, Category } from '@app/types';

interface BudgetWithSpending extends Budget {
  category?: Category;
  spent?: string | number;
  remaining?: string | number;
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
  const { currency } = usePreferences();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!budget?.id;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    budget?.categoryId || ''
  );
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!validateForm(formData)) return;

    setIsSubmitting(true);
    try {
      const categoryId = formData.get('categoryId') as string;
      const limitAmount = formData.get('limitAmount') as string;
      const month = formData.get('month') as string;

      if (isEditing && budget?.id) {
        await budgetsApi.update(budget.id, { limitAmount });
      } else {
        await budgetsApi.create({ categoryId, limitAmount, month });
      }

      onSuccess();
    } catch (err) {
      console.error('Failed to save budget', err);
      setErrors({ form: 'Failed to save budget. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Category Select */}
      <div className="space-y-1.5" ref={categoryDropdownRef}>
        <label className="block text-[13px] font-bold text-[var(--text)] mb-1.5 ml-1">
          Category
        </label>
        <div className="relative">
          <button
            type="button"
            disabled={isEditing}
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className={`
              w-full rounded-[16px] border border-transparent px-4 py-3.5 text-[15px] font-semibold text-left
              bg-[var(--muted)] flex items-center justify-between
              transition-all duration-200
              focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)]
              ${errors.categoryId ? 'border-red-300' : ''}
              ${isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center text-[18px]">
                {selectedCategory ? selectedCategory.icon || '📦' : <Tag className="w-4 h-4 text-gray-400" />}
              </div>
              <span className={selectedCategory ? 'text-[var(--text)]' : 'text-[var(--text-dim-2)]'}>
                {selectedCategory ? selectedCategory.label : 'Select a category'}
              </span>
            </div>
            <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <input type="hidden" name="categoryId" value={selectedCategoryId} />

          {/* Custom Dropdown List */}
          {isCategoryDropdownOpen && !isEditing && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-xl z-[100] overflow-hidden animate-fade-in">
              <div className="max-h-[260px] overflow-y-auto py-2">
                {availableCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId(category.id);
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={`
                      w-full px-4 py-3 flex items-center gap-3 text-[14px] font-bold text-left transition-colors
                      ${selectedCategoryId === category.id ? 'bg-[var(--accent-tint)] text-[var(--accent)]' : 'text-[var(--text)] hover:bg-[var(--muted)]'}
                    `}
                  >
                    <span className="text-[18px] w-6 flex justify-center">{category.icon || '📦'}</span>
                    <span>{category.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {errors.categoryId && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1 ml-1">
            <span className="w-1 h-1 rounded-full bg-red-500" />
            {errors.categoryId}
          </p>
        )}
        {isEditing && (
          <p className="mt-1 text-xs text-[var(--text-secondary)] ml-1">
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
            <span className="text-[16px] font-bold text-blue-500">
              {currency === 'IDR' ? 'Rp' : '$'}
            </span>
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
          {(currency === 'IDR' 
            ? [50000, 100000, 200000, 500000, 1000000, 2000000] 
            : [50, 100, 200, 500, 1000, 2000]
          ).map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => {
                const input = document.getElementById('limitAmount') as HTMLInputElement;
                if (input) {
                  input.value = amount.toString();
                }
              }}
              className="px-3 py-1.5 text-[13px] font-bold text-[var(--text-secondary)] bg-[var(--muted)] hover:bg-[var(--border)] rounded-lg transition-colors border border-[var(--border)]"
            >
              {currency === 'IDR' ? (amount / 1000) + 'rb' : '$' + amount}
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
