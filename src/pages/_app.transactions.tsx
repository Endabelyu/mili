import '../styles/animations.css';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { transactionsApi, categoriesApi } from '../api/client';
import { type Transaction, type Category } from '../types';
import { TransactionItem } from '../components/finance/TransactionItem';
import { TransactionForm } from '../components/finance/TransactionForm';
import { Modal, DateGroupHeader, TipCard, FilterPills, Button } from '../components/ui';
import { Search, Plus } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export const meta = () => [
  { title: 'Transactions | Finance Tracker' },
];

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export default function TransactionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const currentType = searchParams.get('type') || 'all';
  const currentMonth = searchParams.get('month') || getCurrentMonth();
  
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadData = async () => {
      try {
        const [transData, catData] = await Promise.all([
          transactionsApi.list({
            limit: 100, // Load more for local grouping
            type: currentType !== 'all' ? currentType : undefined,
            month: currentMonth,
          } as any),
          categoriesApi.list(),
        ]);

        if (isMounted) {
          setTransactions(transData.items || []);
          setCategories(catData);
        }
      } catch (err) {
        console.error('Failed to load transactions', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [currentType, currentMonth, refreshKey]);

  useKeyboardShortcuts([
    {
      key: 'n', ctrl: true, meta: true,
      handler: () => setIsModalOpen(true),
    },
    {
      key: 'Escape',
      handler: () => { if (isModalOpen) setIsModalOpen(false); },
    },
  ]);
  
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsModalOpen(true);
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('new');
        return newParams;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    const todayStr = formatDate(new Date().toISOString());

    transactions.forEach(t => {
      const dateStr = formatDate(t.date);
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(t);
    });

    return Object.entries(groups).map(([date, items]) => ({
      date,
      isToday: date === todayStr,
      items
    }));
  }, [transactions]);

  if (isLoading) {
    return <div className="p-8 animate-pulse text-center text-zinc-400 font-medium">Memuat transaksi...</div>;
  }
  
  // Format month name for header
  const dateObj = new Date(currentMonth + '-01');
  const monthName = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4 md:space-y-6 pb-24 md:pb-8 max-w-2xl mx-auto px-4 pt-4 lg:pt-8 w-full animate-fade-in">

      {/* Inline Header (Desktop & Mobile) */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-[22px] font-extrabold text-[#1a1a2e] tracking-tight">{monthName}</h1>
          <p className="text-sm font-medium text-[#71717a]">Riwayat Transaksi</p>
        </div>
        <input 
          type="month" 
          value={currentMonth}
          onChange={(e) => {
            const newParams = new URLSearchParams(searchParams);
            newParams.set('month', e.target.value);
            setSearchParams(newParams);
          }}
          className="bg-zinc-100 text-[#1a1a2e] font-bold px-3 py-2 rounded-xl text-sm border-none outline-none focus:ring-2 focus:ring-[#a3e635]"
        />
      </div>

      {/* Filter Pills */}
      <FilterPills
        activeValue={currentType}
        onChange={(val) => {
          const newParams = new URLSearchParams(searchParams);
          if (val === 'all') newParams.delete('type');
          else newParams.set('type', val);
          setSearchParams(newParams);
        }}
        options={[
          { label: 'Semua ▾', value: 'all' },
          { label: 'Pengeluaran', value: 'expense' },
          { label: 'Pemasukan', value: 'income' },
        ]}
      />

      {/* Buddy Tip */}
      <TipCard
        title="Insight Bulan Ini"
        message={`Anda lebih banyak mengalokasikan dana ke kategori Makanan di bulan ${monthName.split(' ')[0]}.`}
        actionText="LIHAT INSIGHT"
        icon="🐻"
      />

      {/* Transactions List */}
      <div className="flow-card divide-y divide-zinc-100 border border-zinc-100 overflow-hidden shadow-sm mt-4">
        {groupedTransactions.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-50 flex items-center justify-center">
              <Search className="w-8 h-8 text-zinc-300" />
            </div>
            <h3 className="text-[16px] font-bold text-[#1a1a2e] mb-1">Belum ada transaksi</h3>
            <p className="text-sm font-medium text-[#71717a]">Catat pengeluaran pertamamu bulan ini!</p>
            <Button onClick={() => setIsModalOpen(true)} className="mt-6 shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Catat Transaksi
            </Button>
          </div>
        ) : (
          groupedTransactions.map(group => (
            <div key={group.date} className="bg-white">
              <DateGroupHeader date={group.date} isToday={group.isToday} />
              <div className="divide-y divide-zinc-50">
                {group.items.map((transaction) => {
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
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        title={editingTransaction ? 'Edit Transaksi' : 'Catat Transaksi'}
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
