import { useState, useEffect, useRef, useMemo } from 'react';
import { Button, Input } from '@app/components/ui';
import { budgetsApi, categoriesApi } from '@app/api/client';
import { usePreferences } from '@app/hooks/usePreferences';
import { Tag, Calendar, Target, Loader2, Search, Trash2 } from 'lucide-react';
import type { Budget, Category } from '@app/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CategoryIcon } from '../ui/CategoryIcon';
import { queryKeys } from '@app/lib/query-keys';

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
  const { currency, t } = usePreferences();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!budget?.id;

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [limitRaw, setLimitRaw] = useState<string>(
    budget?.limitAmount ? Math.round(parseFloat(budget.limitAmount.toString())).toString() : ''
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    budget?.categoryId || ''
  );
  const [recurring, setRecurring] = useState(budget?.recurring !== false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const categorySearchRef = useRef<HTMLInputElement>(null);
  const monthInputRef = useRef<HTMLInputElement>(null);

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

  const filteredDropdownCategories = useMemo(() => {
    if (!categorySearch.trim()) return availableCategories;
    const q = categorySearch.toLowerCase();
    return availableCategories.filter(c => c.label.toLowerCase().includes(q));
  }, [availableCategories, categorySearch]);

  // Auto-focus search when dropdown opens
  useEffect(() => {
    if (isCategoryDropdownOpen) {
      setCategorySearch('');
      setTimeout(() => categorySearchRef.current?.focus(), 100);
    }
  }, [isCategoryDropdownOpen]);

  const validateForm = (formData: FormData): boolean => {
    const newErrors: Record<string, string> = {};

    const categoryId = formData.get('categoryId') as string;
    if (!categoryId) {
      newErrors.categoryId = t('budget.validationCategory');
    }

    const limitAmount = limitRaw.replace(/\./g, '').replace(/,/g, '');
    if (!limitAmount || isNaN(parseFloat(limitAmount)) || parseFloat(limitAmount) <= 0) {
      newErrors.limitAmount = t('budget.validationAmount');
    }

    const month = formData.get('month') as string;
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      newErrors.month = t('budget.validationMonth');
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
      const limitAmount = limitRaw.replace(/\./g, '').replace(/,/g, '');
      const month = formData.get('month') as string;

      if (isEditing && budget?.id) {
        await budgetsApi.update(budget.id, { limitAmount, recurring });
      } else {
        await budgetsApi.create({ categoryId, limitAmount, month, recurring });
      }

      onSuccess();
    } catch (err) {
      console.error('Failed to save budget', err);
      setErrors({ form: t('budget.saveFailed') });
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
              <div className="shrink-0">
                {selectedCategory ? (
                  <CategoryIcon 
                    category={selectedCategory.label} 
                    icon={selectedCategory.icon} 
                    size="md" 
                  />
                ) : (
                  <Tag className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <span className={selectedCategory ? 'text-[var(--text)]' : 'text-[var(--text-dim-2)]'}>
                {selectedCategory ? selectedCategory.label : t('budget.selectCategory')}
              </span>
            </div>
            <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <input type="hidden" name="categoryId" value={selectedCategoryId} />

          {/* Custom Dropdown Grid */}
          {isCategoryDropdownOpen && !isEditing && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--card)] border border-[var(--border)] rounded-[24px] shadow-xl z-[100] overflow-hidden animate-fade-in p-4">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim-2)]" />
                <input
                  ref={categorySearchRef}
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder={t('common.searchCategory')}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--muted)] text-[14px] font-medium text-[var(--text)] placeholder:text-[var(--text-dim-2)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>
              <div className="max-h-[250px] overflow-y-auto grid grid-cols-3 gap-2 p-1">
                {filteredDropdownCategories.map((category) => (
                  <div key={category.id} className="relative group/cat">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(category.id);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`
                        w-full flex flex-col items-center justify-center p-3 rounded-2xl transition-all
                        ${selectedCategoryId === category.id
                          ? 'bg-[var(--accent-tint)] ring-1 ring-[var(--accent)]'
                          : 'hover:bg-[var(--muted)] border border-transparent'}
                      `}
                    >
                      <CategoryIcon
                        category={category.label}
                        icon={category.icon}
                        size="md"
                        label={category.label}
                      />
                    </button>
                    {category.isOwn && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCategoryMutation.mutate(category.id);
                          if (selectedCategoryId === category.id) setSelectedCategoryId('');
                        }}
                        disabled={deleteCategoryMutation.isPending}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 text-white opacity-0 group-hover/cat:opacity-100 transition-opacity flex items-center justify-center"
                        title="Hapus kategori"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
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
        <div
          className="relative group"
          onClick={() => { if (!isEditing) monthInputRef.current?.showPicker?.(); }}
        >
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Calendar className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
          </div>
          <Input
            ref={monthInputRef}
            id="month"
            name="month"
            type="month"
            defaultValue={budget?.month || currentMonth}
            disabled={isEditing}
            className={`
              pl-10 cursor-pointer
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
            type="text"
            inputMode="numeric"
            placeholder={currency === 'IDR' ? '0' : '0.00'}
            value={limitRaw ? new Intl.NumberFormat(currency === 'IDR' ? 'id-ID' : 'en-US').format(Number(limitRaw)) : ''}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '');
              setLimitRaw(digits);
            }}
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
              onClick={() => setLimitRaw(amount.toString())}
              className="px-3 py-1.5 text-[13px] font-bold text-[var(--text-secondary)] bg-[var(--muted)] hover:bg-[var(--border)] rounded-lg transition-colors border border-[var(--border)]"
            >
              {currency === 'IDR' ? (amount / 1000) + 'rb' : '$' + amount}
            </button>
          ))}
        </div>
      </div>

      {/* Recurring Toggle */}
      <div className="flex items-center justify-between py-3 px-1">
        <div>
          <p className="text-[14px] font-bold text-[var(--text)]">{t('budget.repeatMonthly')}</p>
          <p className="text-[12px] text-[var(--text-dim-2)]">{t('budget.repeatMonthlyDesc')}</p>
        </div>
        <button
          type="button"
          onClick={() => setRecurring(!recurring)}
          className={`w-12 h-7 rounded-full transition-colors relative ${recurring ? 'bg-[#15803D]' : 'bg-gray-300'}`}
        >
          <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${recurring ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
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
