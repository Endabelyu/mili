import '../styles/animations.css';
import { useState, useEffect } from 'react';
import { type LoaderFunctionArgs, type ActionFunctionArgs, type MetaFunction } from 'react-router';
import { useLoaderData, useSearchParams, useNavigation, useFetcher } from 'react-router';
import { requireSession } from '@app/lib/auth.server';
import { TransactionItem } from '@app/components/finance/TransactionItem';
import { TransactionForm } from '@app/components/finance/TransactionForm';
import { Modal } from '@app/components/ui/Modal';
import { Button } from '@app/components/ui/Button';
import { Input } from '@app/components/ui/Input';
import { useKeyboardShortcuts } from '@app/hooks/useKeyboardShortcuts';
import { Plus, Search, Filter, ArrowLeft, ArrowRight, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import type { Transaction, Category } from '@app/types';
import { listCategories } from '@server/lib/services/categories.server';
import { listTransactions, deleteTransaction, createTransaction, updateTransaction } from '@server/lib/services/transactions.server';

export const meta: MetaFunction = () => {
  return [
    { title: 'Transactions | Finance Tracker' },
    { name: 'description', content: 'View and manage your transactions' },
  ];
};

interface LoaderData {
  transactions: Transaction[];
  categories: Category[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
}

export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  const session = await requireSession(request);
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const page = Number(searchParams.get('page') || '1');
  const type = searchParams.get('type') as 'income' | 'expense' | undefined || undefined;
  const category = searchParams.get('category') || undefined;
  const month = searchParams.get('month') || undefined;
  const search = searchParams.get('search') || undefined;

  try {
    const [transactionsData, categoriesData] = await Promise.all([
      listTransactions({ userId: session.userId, page, type, category, month, search }),
      listCategories(),
    ]);

    return Response.json({
      transactions: transactionsData.items,
      categories: categoriesData,
      pagination: transactionsData.pagination,
    });
  } catch (error) {
    console.error('Transactions loader error:', error);
    return Response.json({
      transactions: [],
      categories: [],
      pagination: { page: 1, totalPages: 1, total: 0, limit: 20 },
    }, { status: 500 });
  }
}

export async function action({ request }: ActionFunctionArgs): Promise<Response> {
  const session = await requireSession(request);
  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  if (intent === 'create') {
    try {
      const transaction = await createTransaction({
        userId: session.userId,
        type: formData.get('type') as 'income' | 'expense',
        amount: formData.get('amount') as string,
        categoryId: formData.get('categoryId') as string,
        description: formData.get('description') as string | undefined,
        date: formData.get('date') as string,
      });
      return Response.json({ success: true, transaction });
    } catch (error) {
      const err = error as { status?: number; message?: string };
      return Response.json({ error: err.message || 'Failed to create transaction' }, { status: err.status || 500 });
    }
  }

  if (intent === 'update') {
    const id = formData.get('id') as string;
    if (!id) return Response.json({ error: 'Transaction ID required' }, { status: 400 });
    
    try {
      const transaction = await updateTransaction(id, session.userId, {
        type: formData.get('type') as 'income' | 'expense' | undefined,
        amount: formData.get('amount') as string | undefined,
        categoryId: formData.get('categoryId') as string | undefined,
        description: formData.get('description') as string | undefined,
        date: formData.get('date') as string | undefined,
      });
      return Response.json({ success: true, transaction });
    } catch (error) {
      const err = error as { status?: number; message?: string };
      return Response.json({ error: err.message || 'Failed to update transaction' }, { status: err.status || 500 });
    }
  }

  if (intent === 'delete') {
    const id = formData.get('id') as string;
    try {
      await deleteTransaction(id, session.userId);
      return Response.json({ success: true });
    } catch (error) {
      const err = error as { status?: number; message?: string };
      return Response.json({ error: err.message || 'Failed to delete transaction' }, { status: err.status || 500 });
    }
  }

  return Response.json({ error: 'Unknown intent' }, { status: 400 });
}

function calculateTotals(transactions: Transaction[]) {
  return transactions.reduce(
    (acc, t) => {
      const amount = parseFloat(t.amount.toString());
      if (t.type === 'income') acc.income += amount;
      else acc.expense += amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );
}

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export default function TransactionsPage() {
  const { transactions, categories, pagination } = useLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';
  const fetcher = useFetcher();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  
  const currentType = searchParams.get('type') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentMonth = searchParams.get('month') || getCurrentMonth();
  const currentSearch = searchParams.get('search') || '';
  
  const totals = calculateTotals(transactions);
  const netAmount = totals.income - totals.expense;
  
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
        if (isModalOpen) setIsModalOpen(false);
      },
    },
  ]);
  
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsModalOpen(true);
      // Remove it from URL without causing navigation jump
      setSearchParams(
        prev => {
          const newParams = new URLSearchParams(prev);
          newParams.delete('new');
          return newParams;
        },
        { replace: true }
      );
    }
  }, [searchParams, setSearchParams]);
  
  const updateFilters = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
      else newParams.delete(key);
    });
    setSearchParams(newParams);
  };
  
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };
  
  const handleDelete = (transaction: Transaction) => {
    setDeletingTransaction(transaction);
  };
  
  const confirmDelete = () => {
    if (deletingTransaction) {
      fetcher.submit(
        { intent: 'delete', id: deletingTransaction.id },
        { method: 'POST' }
      );
      setDeletingTransaction(null);
    }
  };
  
  if (isLoading) {
    return <div className="space-y-6 animate-fade-in"><p>Loading...</p></div>;
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="hidden md:flex flex-col gap-4 md:gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] tracking-tight">Transactions</h1>
            <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-0.5">
              Manage your income and expenses
              <span className="hidden sm:inline opacity-60 ml-2">(Cmd/Ctrl+N to add new)</span>
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="hidden md:flex h-11 px-6 shadow-sm hover:shadow transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">Income</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">${totals.income.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">Expenses</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">${totals.expense.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--text-primary)]/10`}>
              <Wallet className={`w-5 h-5 text-[var(--text-primary)]`} />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">Net</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">${Math.abs(netAmount).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <Input
            type="text"
            placeholder="Search transactions..."
            value={currentSearch}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10"
          />
        </div>
        <select
          value={currentType}
          onChange={(e) => updateFilters({ type: e.target.value })}
          className="px-4 py-3 border border-[var(--card-border)] rounded-2xl text-sm bg-[var(--card-bg)] backdrop-blur-md text-[var(--text-primary)] outline-none focus:border-[var(--gradient-hero-start)] min-h-[44px] appearance-none"
        >
          <option value="" className="bg-[var(--app-bg-start)] text-[var(--text-primary)]">All Types</option>
          <option value="income" className="bg-[var(--app-bg-start)] text-[var(--text-primary)]">Income</option>
          <option value="expense" className="bg-[var(--app-bg-start)] text-[var(--text-primary)]">Expense</option>
        </select>
        <select
          value={currentCategory}
          onChange={(e) => updateFilters({ category: e.target.value })}
          className="px-4 py-3 border border-[var(--card-border)] rounded-2xl text-sm bg-[var(--card-bg)] backdrop-blur-md text-[var(--text-primary)] outline-none focus:border-[var(--gradient-hero-start)] min-h-[44px] appearance-none"
        >
          <option value="" className="bg-[var(--app-bg-start)] text-[var(--text-primary)]">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id} className="bg-[var(--app-bg-start)] text-[var(--text-primary)]">{c.label}</option>
          ))}
        </select>
        <input
          type="month"
          value={currentMonth}
          onChange={(e) => updateFilters({ month: e.target.value })}
          className="px-4 py-3 border border-[var(--card-border)] rounded-2xl text-sm bg-[var(--card-bg)] backdrop-blur-md text-[var(--text-primary)] outline-none focus:border-[var(--gradient-hero-start)] min-h-[44px] appearance-none"
        />
      </div>
      
      {/* Transactions List */}
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-16 px-4 glass-card">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--text-primary)]/5 flex items-center justify-center">
              <Search className="w-8 h-8 text-[var(--text-secondary)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No transactions found</h3>
            <p className="text-[var(--text-secondary)] mb-6">Get started by adding your first transaction.</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        ) : (
          <>
            {transactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onEdit={() => handleEdit(transaction)}
                onDelete={() => handleDelete(transaction)}
              />
            ))}
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilters({ page: String(pagination.page - 1) })}
                  disabled={pagination.page <= 1}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-[var(--text-secondary)]">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilters({ page: String(pagination.page + 1) })}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        title={editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
      >
        <TransactionForm
          transaction={editingTransaction}
          categories={categories}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingTransaction(null);
          }}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingTransaction(null);
          }}
        />
      </Modal>
      
    </div>
  );
}
