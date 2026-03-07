import '../styles/animations.css';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { transactionsApi, categoriesApi } from '../api/client';
import { type Transaction, type Category } from '../types';
import { TransactionItem } from '../components/finance/TransactionItem';
import { TransactionForm } from '../components/finance/TransactionForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../lib/utils';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { Plus, Search, ArrowLeft, ArrowRight, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export const meta = () => {
  return [
    { title: 'Transactions | Finance Tracker' },
    { name: 'description', content: 'View and manage your transactions' },
  ];
};



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
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const currentType = searchParams.get('type') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentMonth = searchParams.get('month') || getCurrentMonth();
  const currentSearch = searchParams.get('search') || '';
  const page = Number(searchParams.get('page') || '1');

  // Fetch data on parameters change
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadData = async () => {
      try {
        const [transData, catData] = await Promise.all([
          transactionsApi.list({
            page,
            type: currentType || undefined,
            category: currentCategory || undefined,
            month: searchParams.get('month') ?? undefined, // not default to currentMonth string? wait, we use current month if missing or not? The loader uses `|| undefined`. Let's just use `currentMonth`.
            // Wait, we can pass exactly what's needed.
            search: currentSearch || undefined,
          } as any),
          categoriesApi.list(),
        ]);

        if (isMounted) {
          setTransactions(transData.items);
          setCategories(catData);
          if (transData.pagination) setPagination(transData.pagination);
        }
      } catch (err) {
        console.error('Failed to load transactions', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [page, currentType, currentCategory, searchParams.get('month'), currentSearch, refreshKey]);
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
  
  const handleDelete = async (transaction: Transaction) => {
    try {
      await transactionsApi.delete(transaction.id);
      setTransactions(prev => prev.filter(t => t.id !== transaction.id));
    } catch (err) {
      console.error('Failed to delete transaction', err);
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
        {[
          { label: 'Pemasukan', amount: totals.income, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Pengeluaran', amount: totals.expense, icon: TrendingDown, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { label: 'Selisih', amount: Math.abs(netAmount), icon: Wallet, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card group hover:bg-white/[0.04] transition-all p-5">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] opacity-80">{stat.label}</p>
                <p className="text-xl font-extrabold text-[var(--text-primary)] mt-0.5">{formatCurrency(stat.amount)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Filters Overlay on Tablet/Desktop, Stacked on Mobile */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-[2]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={currentSearch}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="input pl-12 h-12"
          />
        </div>
        <div className="flex gap-2 flex-1">
          <select
            value={currentType}
            onChange={(e) => updateFilters({ type: e.target.value })}
            className="input flex-1 h-12 py-0 px-4 text-sm appearance-none cursor-pointer"
          >
            <option value="">Semua</option>
            <option value="income">Masuk</option>
            <option value="expense">Keluar</option>
          </select>
          <input
            type="month"
            value={currentMonth}
            onChange={(e) => updateFilters({ month: e.target.value })}
            className="input flex-1 h-12 py-0 px-4 text-sm appearance-none cursor-pointer"
          />
        </div>
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
            {transactions.map((transaction) => {
              const category = categories.find(c => c.id === transaction.categoryId);
              return (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  category={category}
                  onEdit={() => handleEdit(transaction)}
                  onDelete={() => handleDelete(transaction)}
                />
              );
            })}
            
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
            setRefreshKey(k => k + 1);
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
