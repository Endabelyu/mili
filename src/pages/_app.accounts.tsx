import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Wallet, CreditCard, Landmark, Coins, TrendingUp, Check, Trash2 } from 'lucide-react';
import { accountsApi } from '../api/client';
import { queryKeys } from '../lib/query-keys';
import { usePreferences } from '../hooks/usePreferences';
import type { Account } from '../types';

// ─── Donut Chart Component ───────────────────────────────────────────────────
interface Segment {
  label: string;
  value: number;
  color: string;
}

function NetWorthDonut({ value, segments }: { value: string; segments: Segment[] }) {
  const total = segments.reduce((acc, s) => acc + s.value, 0);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  return (
    <div className="relative w-[180px] h-[180px] flex items-center justify-center shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--muted)" strokeWidth="6" />
        
        {total > 0 ? (
          segments.map((s, i) => {
            const percentage = s.value / total;
            const strokeDashoffset = circumference - percentage * circumference;
            const rotation = (currentOffset / total) * 360;
            currentOffset += s.value;

            return (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={s.color}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ 
                  transform: `rotate(${rotation}deg)`, 
                  transformOrigin: '50% 50%',
                  transition: 'all 1s ease-out'
                }}
              />
            );
          })
        ) : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <p className="text-[9px] font-bold text-[var(--text-dim-2)] uppercase tracking-[0.12em] leading-none mb-1">Kekayaan Bersih</p>
        <p className="text-[18px] font-bold text-[var(--text)] tracking-tighter tabular-nums leading-none">{value}</p>
      </div>
    </div>
  );
}


const ACCOUNT_TYPES = [
  { id: 'bank', label: 'Bank', icon: Landmark },
  { id: 'e-wallet', label: 'E-Wallet', icon: Wallet },
  { id: 'cash', label: 'Tunai (Cash)', icon: Coins },
  { id: 'investment', label: 'Investasi', icon: TrendingUp },
  { id: 'credit-card', label: 'Kartu Kredit', icon: CreditCard },
];

export default function AccountsPage() {
  const { formatMoney } = usePreferences();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('bank');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState('#15803D');

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: queryKeys.accounts.all,
    queryFn: () => accountsApi.list(),
  });

  const assets = accounts.reduce((acc, curr) => {
    const b = parseFloat(String(curr.balance));
    return b > 0 ? acc + b : acc;
  }, 0);

  const liabilities = Math.abs(accounts.reduce((acc, curr) => {
    const b = parseFloat(String(curr.balance));
    return b < 0 ? acc + b : acc;
  }, 0));

  const totalBalance = assets - liabilities;

  const createMutation = useMutation({
    mutationFn: (data: Omit<Account, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
      accountsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      handleCloseModal();
    },
    onError: () => setSaving(false),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Account>) =>
      accountsApi.update(editingAccount!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      handleCloseModal();
    },
    onError: () => setSaving(false),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => accountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      handleCloseModal();
    },
    onError: () => setSaving(false),
  });

  const handleSave = () => {
    if (!name) return;
    setSaving(true);
    
    const payload = {
      name,
      type,
      balance: balance || '0',
      currency: 'IDR',
      color,
      isDefault: editingAccount ? editingAccount.isDefault : accounts.length === 0,
    };

    if (editingAccount) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = () => {
    if (!editingAccount) return;
    if (window.confirm(`Apakah Anda yakin ingin menghapus akun "${editingAccount.name}"?`)) {
      setSaving(true);
      deleteMutation.mutate(editingAccount.id);
    }
  };

  const handleEdit = (acc: Account) => {
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setBalance(String(acc.balance));
    setColor(acc.color);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
    setName('');
    setBalance('');
    setType('bank');
    setColor('#15803D');
    setSaving(false);
  };

  const handleBalanceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setBalance(raw);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-10">
        <div className="h-24 skeleton rounded-2xl" />
        <div className="h-64 skeleton rounded-2xl" />
      </div>
    );
  }

  // Group accounts by type
  const grouped = accounts.reduce((acc, curr) => {
    if (!acc[curr.type]) acc[curr.type] = [];
    acc[curr.type].push(curr);
    return acc;
  }, {} as Record<string, Account[]>);

  // Prepare dynamic chart segments
  const typeMap: Record<string, { label: string; color: string }> = {
    'bank': { label: 'Bank', color: '#7F56D9' },
    'e-wallet': { label: 'E-Wallet', color: '#0BA5EC' },
    'cash': { label: 'Tunai', color: '#F79009' },
    'investment': { label: 'Investasi', color: '#EE46BC' },
    'credit-card': { label: 'Kartu Kredit', color: '#F04438' },
  };

  const chartSegments: Segment[] = Object.entries(grouped)
    .map(([type, items]) => {
      const balance = items.reduce((sum, item) => sum + parseFloat(String(item.balance)), 0);
      return {
        label: typeMap[type]?.label || type,
        value: balance,
        color: typeMap[type]?.color || '#15803D'
      };
    })
    .filter(s => s.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between pt-4">
        <h1 className="text-[32px] font-bold text-[var(--text)] tracking-[-0.03em]">Akun</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-11 h-11 rounded-2xl bg-[var(--muted)] text-[var(--text)] flex items-center justify-center hover:bg-[var(--border)] transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Hero Card - High Fidelity Donut Chart */}
      <div className="flow-card p-8 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <NetWorthDonut value={formatMoney(totalBalance)} segments={chartSegments} />
          
          <div className="w-full flex-1 grid grid-cols-2 gap-x-6 gap-y-3 mt-4 md:mt-0">
            {chartSegments.length > 0 ? (
              chartSegments.map((s, i) => (
                <LegendItem 
                  key={i} 
                  color={s.color} 
                  label={s.label} 
                  percentage={`${((s.value / totalBalance) * 100).toFixed(1)}%`} 
                />
              ))
            ) : (
              <div className="col-span-full py-4 text-center">
                <p className="text-[13px] font-bold text-[var(--text-dim-2)] opacity-60">Belum ada data rekening untuk ditampilkan</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-[var(--border)] border-dashed">
          <div>
            <p className="text-[12px] font-bold text-[var(--text-dim-2)] uppercase tracking-wider mb-2">Aset</p>
            <p className="text-[22px] font-bold text-[#15803D]">{formatMoney(assets)}</p>
          </div>
          <div>
            <p className="text-[12px] font-bold text-[var(--text-dim-2)] uppercase tracking-wider mb-2">Kewajiban</p>
            <p className="text-[22px] font-bold text-[#F04438]">{formatMoney(liabilities)}</p>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      {accounts.length === 0 ? (
        <div className="text-center py-20 px-6 bg-[var(--card)] rounded-[32px] border border-[var(--border)]">
          <div className="w-20 h-20 rounded-3xl bg-[#15803D]/10 text-[#15803D] flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10" />
          </div>
          <h3 className="text-[20px] font-bold text-[var(--text)] mb-3">Belum ada akun</h3>
          <p className="text-[14px] text-[var(--text-dim-2)] mb-8 max-w-[300px] mx-auto leading-relaxed">Tambahkan akun bank, e-wallet, atau aset Anda untuk mulai melacak kekayaan Anda.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-4 rounded-2xl bg-[var(--text)] text-[var(--bg)] font-bold text-[15px] shadow-xl transition-all active:scale-95"
          >
            Tambah Akun Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {ACCOUNT_TYPES.map(({ id, label, icon: Icon }) => {
            const items = grouped[id];
            if (!items || items.length === 0) return null;
            
            return (
              <div key={id} className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Icon className="w-5 h-5 text-[var(--text-dim)]" />
                  <h3 className="text-[16px] font-bold text-[var(--text)]">{label} <span className="opacity-40 ml-1 text-[14px]">({items.length})</span></h3>
                </div>
                <div className="flow-card divide-y divide-[var(--border)] overflow-hidden">
                  {items.map((acc) => (
                    <div 
                      key={acc.id} 
                      onClick={() => handleEdit(acc)}
                      className="flex items-center gap-5 p-5 hover:bg-[var(--muted)] transition-colors cursor-pointer group"
                    >
                      <div className="w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: `${acc.color}15` }}>
                        <Icon className="w-7 h-7" style={{ color: acc.color }} strokeWidth={2} />
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <p className="text-[16px] font-bold text-[var(--text)] truncate">{acc.name}</p>
                          {acc.isDefault && (
                            <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-[#15803D]/10 text-[#15803D] uppercase tracking-wider">Utama</span>
                          )}
                        </div>
                        <p className="text-[12px] font-medium text-[var(--text-dim-2)] opacity-60 mt-1">
                          {acc.type === 'bank' ? 'Bank' : acc.type === 'e-wallet' ? 'E-Wallet' : acc.type === 'cash' ? 'Tunai' : acc.type === 'investment' ? 'Investasi' : 'Kartu Kredit'}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-[18px] font-bold text-[var(--text)] tracking-tight tabular-nums">{formatMoney(parseFloat(String(acc.balance)))}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Add/Edit Account Modal ─── */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[90] backdrop-blur-sm animate-fade-in" onClick={handleCloseModal} />
          <div className="fixed inset-x-0 bottom-0 lg:top-[10%] lg:bottom-auto lg:left-1/2 lg:-translate-x-1/2 lg:w-[500px] lg:rounded-[32px] bg-[var(--bg)] z-[100] flex flex-col animate-slide-up rounded-t-[32px] pb-safe">
            <div className="flex items-center justify-between p-4 shrink-0 border-b border-[var(--border)]">
              <h2 className="text-[16px] font-bold text-[var(--text)] pl-2">{editingAccount ? 'Ubah Akun' : 'Tambah Akun'}</h2>
              <div className="flex items-center gap-2">
                {editingAccount && (
                  <button 
                    onClick={handleDelete}
                    disabled={saving}
                    className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button onClick={handleCloseModal} className="relative z-[110] w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--text)] hover:bg-[var(--border)] transition-all active:scale-95">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              {/* Type */}
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-[var(--text-dim-2)] uppercase">Jenis Akun</label>
                <div className="grid grid-cols-2 gap-3">
                  {ACCOUNT_TYPES.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setType(id as Account['type'])}
                      className={`flex items-center gap-3 p-3 rounded-[16px] border transition-all ${
                        type === id 
                          ? 'border-[#15803D] bg-[#15803D]/5' 
                          : 'border-[var(--border)] hover:bg-[var(--muted)]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${type === id ? 'text-[#15803D]' : 'text-[var(--text-dim)]'}`} />
                      <span className={`text-[13px] font-bold ${type === id ? 'text-[#15803D]' : 'text-[var(--text)]'}`}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-[var(--text-dim-2)] uppercase">Nama Akun</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: BCA Tahapan, OVO, Dompet"
                  className="w-full bg-[var(--muted)] border border-transparent focus:border-[#15803D] rounded-[16px] px-4 py-3.5 text-[15px] font-semibold text-[var(--text)] outline-none"
                />
              </div>

              {/* Balance */}
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-[var(--text-dim-2)] uppercase">{editingAccount ? 'Saldo Saat Ini' : 'Saldo Awal'}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-bold text-[var(--text-dim-2)]">Rp</span>
                  <input
                    value={balance ? parseInt(balance).toLocaleString('id-ID') : ''}
                    onChange={handleBalanceInput}
                    placeholder="0"
                    inputMode="numeric"
                    className="w-full bg-[var(--muted)] border border-transparent focus:border-[#15803D] rounded-[16px] pl-12 pr-4 py-3.5 text-[15px] font-bold text-[var(--text)] outline-none tabular-nums"
                  />
                </div>
              </div>

              {/* Color */}
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-[var(--text-dim-2)] uppercase">Warna</label>
                <div className="flex gap-3 flex-wrap">
                  {['#15803D', '#0BA5EC', '#7F56D9', '#F04438', '#F79009', '#EE46BC', '#334155'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${color === c ? 'scale-110 ring-2 ring-offset-2 ring-offset-[var(--bg)]' : ''}`}
                      style={{ backgroundColor: c, borderColor: c }}
                    >
                      {color === c && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[var(--border)] shrink-0">
              <button
                onClick={handleSave}
                disabled={!name || saving}
                className="w-full py-4 rounded-[16px] bg-[var(--accent)] text-white font-bold text-[15px] flex items-center justify-center disabled:opacity-50 transition-all active:scale-95"
              >
                {saving ? 'Menyimpan...' : editingAccount ? 'Simpan Perubahan' : 'Simpan Akun'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function LegendItem({ color, label, percentage }: { color: string; label: string; percentage: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-[4px]" style={{ backgroundColor: color }} />
        <span className="text-[13px] font-bold text-[var(--text-dim-2)]">{label}</span>
      </div>
      <span className="text-[13px] font-bold text-[var(--text)] tracking-tight">{percentage}</span>
    </div>
  );
}
