import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Target as TargetIcon, X, Check, Edit2, Trash2, Pin, Clock } from 'lucide-react';
import { Alert } from '../components/ui/Alert';
import { targetsApi, type Target } from '../api/client';
import { usePreferences } from '../hooks/usePreferences';

// ─── Circular Progress Component ──────────────────────────────────────────────
function CircularProgress({ percentage, color, icon }: { percentage: number; color: string; icon: string }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-[84px] h-[84px] flex items-center justify-center shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--muted)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[28px]">
        {icon}
      </div>
    </div>
  );
}

const EMOJI_LIST = ['🎯', '🏠', '🚗', '✈️', '💻', '🎓', '💍', '💼', '🏖️', '📈'];

export default function TargetsPage() {
  const { formatMoney } = usePreferences();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState('#12B76A');
  const [icon, setIcon] = useState('🎯');
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  // Alert Modal state
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isConfirm?: boolean;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'warning' | 'error' = 'warning') => {
    setAlertConfig({ isOpen: true, title, message, type, isConfirm: true, onConfirm });
  };

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }));

  const { data: targets = [], isLoading } = useQuery({
    queryKey: ['targets'],
    queryFn: () => targetsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Target, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status'>) =>
      targetsApi.create(data as Omit<Target, 'id' | 'userId' | 'createdAt' | 'updatedAt'>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: () => setSaving(false),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Target>) => targetsApi.update(selectedTarget!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
      setIsEditModalOpen(false);
      resetForm();
    },
    onError: () => setSaving(false),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => targetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
    }
  });

  const resetForm = () => {
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setDeadline('');
    setColor('#12B76A');
    setIcon('🎯');
    setSelectedTarget(null);
    setSaving(false);
  };

  const handleSave = () => {
    if (!name || !targetAmount) return;
    setSaving(true);
    const payload = {
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount || '0'),
      deadline: deadline || null,
      color,
      icon,
    };
    createMutation.mutate(payload);
  };

  const handleUpdate = () => {
    if (!name || !targetAmount) return;
    setSaving(true);
    const payload = {
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount || '0'),
      deadline: deadline || null,
      color,
      icon,
    };
    updateMutation.mutate(payload);
  };

  const openEditModal = (target: Target) => {
    setSelectedTarget(target);
    setName(target.name);
    setTargetAmount(String(target.targetAmount));
    setCurrentAmount(String(target.currentAmount));
    setDeadline(target.deadline ? new Date(target.deadline).toISOString().split('T')[0] : '');
    setColor(target.color);
    setIcon(target.icon);
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-10">
        <div className="h-24 skeleton rounded-2xl" />
        <div className="h-64 skeleton rounded-2xl" />
      </div>
    );
  }

  const totalCurrent = targets.reduce((acc, curr) => acc + parseFloat(String(curr.currentAmount)), 0);
  const totalTarget = targets.reduce((acc, curr) => acc + parseFloat(String(curr.targetAmount)), 0);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Removed Redundant Top Navigation as per User Request */}

      <div className="flex items-center justify-between pt-4">
        <h1 className="text-[32px] font-bold text-[var(--text)] tracking-[-0.03em]">Target</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-11 h-11 rounded-2xl bg-[var(--muted)] text-[var(--text)] flex items-center justify-center hover:bg-[var(--border)] transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Summary Card - White Style to match Transactions */}
      <div className="rounded-[24px] bg-[var(--card)] p-6 border border-[var(--border)] shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)]">
          <div className="space-y-1 flex-1">
            <p className="text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-widest">Terkumpul</p>
            <p className="text-[22px] font-bold text-[var(--income)] tabular-nums">{formatMoney(totalCurrent)}</p>
          </div>
          <div className="space-y-1 flex-1 pt-4 sm:pt-0 sm:pl-6">
            <p className="text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-widest">Total Target</p>
            <p className="text-[22px] font-bold text-[var(--text)] tabular-nums">{formatMoney(totalTarget)}</p>
          </div>
          <div className="space-y-1 flex-1 pt-4 sm:pt-0 sm:pl-6">
            <p className="text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-widest">Progres</p>
            <p className="text-[22px] font-bold text-[var(--income)] tabular-nums">
              {totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-[var(--border)] px-1">
        <button 
          onClick={() => setActiveTab('active')}
          className={`py-4 text-[15px] font-bold transition-all relative ${activeTab === 'active' ? 'text-[var(--text)]' : 'text-[var(--text-dim-2)] opacity-50'}`}
        >
          Aktif
          {activeTab === 'active' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#12B76A] rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`py-4 text-[15px] font-bold transition-all relative ${activeTab === 'completed' ? 'text-[var(--text)]' : 'text-[var(--text-dim-2)] opacity-50'}`}
        >
          Selesai
        </button>
      </div>

      {/* List Section */}
      <div className="space-y-4">
        {targets.length > 0 && (
          <div className="flex items-center gap-2 px-1 pt-2">
            <Pin className="w-4 h-4 text-[var(--income)] rotate-45" />
            <h3 className="text-[16px] font-bold text-[var(--text)]">Target Disematkan</h3>
          </div>
        )}

        {targets.length === 0 ? (
          <div className="text-center py-20 px-6 bg-[var(--card)] rounded-[32px] border border-[var(--border)]">
            <div className="w-20 h-20 rounded-3xl bg-[#12B76A]/10 text-[#12B76A] flex items-center justify-center mx-auto mb-6">
              <TargetIcon className="w-10 h-10" />
            </div>
            <h3 className="text-[20px] font-bold text-[var(--text)] mb-3">Belum ada target</h3>
            <p className="text-[14px] text-[var(--text-dim-2)] mb-8 max-w-[300px] mx-auto leading-relaxed">Tentukan impian finansial Anda sekarang dan capai perlahan bersama Saku.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 rounded-2xl bg-[var(--text)] text-[var(--bg)] font-bold text-[15px] shadow-xl transition-all active:scale-95"
            >
              Buat Target Pertama
            </button>
          </div>
        ) : (
          <div className="grid gap-5">
            {targets
              .filter(target => {
                const current = parseFloat(String(target.currentAmount));
                const total = parseFloat(String(target.targetAmount));
                const isCompleted = current >= total;
                return activeTab === 'completed' ? isCompleted : !isCompleted;
              })
              .map((target) => {
                const current = parseFloat(String(target.currentAmount));
                const total = parseFloat(String(target.targetAmount));
                const progress = Math.min((current / total) * 100, 100);

              return (
                <div key={target.id} className="flow-card p-6 flex flex-col gap-6 relative group transition-all hover:shadow-xl hover:shadow-[#12B76A05] border-transparent hover:border-[var(--income)]/20">
                  <div className="flex items-center gap-5">
                    <CircularProgress percentage={progress} color={target.color} icon={target.icon} />
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[15px] sm:text-[18px] font-bold text-[var(--text)] leading-tight">{target.name}</h4>
                      <p className="text-[13px] font-medium text-[var(--text-dim-2)] mt-1 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 opacity-60" />
                        <span>
                          {target.deadline ? (() => {
                            const now = new Date();
                            const dl = new Date(target.deadline);
                            const diffTime = dl.getTime() - now.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            if (diffDays <= 0) return 'Tenggat lewat';
                            const diffMonths = (dl.getFullYear() - now.getFullYear()) * 12 + (dl.getMonth() - now.getMonth());
                            if (diffMonths <= 0) return `${diffDays} hari lagi`;
                            return `${diffMonths} bulan lagi`;
                          })() : 'Selamanya'}
                          {target.deadline && ` · ${new Date(target.deadline).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}`}
                        </span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-[22px] font-bold" style={{ color: target.color }}>{progress.toFixed(0)}%</p>
                    </div>

                    {/* Actions on hover */}
                    <div className="absolute top-6 right-6 flex items-center gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(target)} className="p-2.5 rounded-xl bg-[var(--muted)] text-[var(--text-dim-2)] hover:text-[var(--accent)] transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => showConfirm('Hapus Target?', 'Hapus target ini?', () => { deleteMutation.mutate(target.id); closeAlert(); }, 'error')}
                        className="p-2.5 rounded-xl bg-[var(--muted)] text-[var(--text-dim-2)] hover:text-[var(--expense)] transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="w-full h-2.5 bg-[var(--muted)] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700 ease-out" 
                        style={{ width: `${progress}%`, backgroundColor: target.color }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[13px] font-bold">
                      <span className="text-[var(--text-dim-2)]">Terkumpul: <span className="text-[var(--text)]">{formatMoney(current)}</span></span>
                      <span className="text-[var(--text-dim-2)]">Target: <span className="text-[var(--text)]">{formatMoney(total)}</span></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Add/Edit Modals ─── */}
      {(isModalOpen || isEditModalOpen) && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[90] backdrop-blur-sm animate-fade-in" onClick={resetForm} />
          <div 
            className="fixed inset-x-0 bottom-0 lg:top-[10%] lg:bottom-auto lg:left-1/2 lg:-translate-x-1/2 lg:w-[500px] lg:rounded-[32px] bg-[var(--bg)] z-[100] flex flex-col animate-slide-up rounded-t-[32px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <h2 className="text-[18px] font-bold text-[var(--text)]">{isEditModalOpen ? 'Edit Target' : 'Tambah Target'}</h2>
              <button 
                onClick={resetForm} 
                className="relative z-[210] w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--text)] hover:bg-[var(--border)] transition-all active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              {/* Icon Picker */}
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-[var(--text-dim-2)] uppercase">Emoji</label>
                <div className="flex gap-2.5 flex-wrap">
                  {EMOJI_LIST.map((e) => (
                    <button
                      key={e}
                      onClick={() => setIcon(e)}
                      className={`text-[24px] w-12 h-12 rounded-[14px] flex items-center justify-center border transition-all ${
                        icon === e ? 'border-[#12B76A] bg-[#12B76A]/5 scale-110' : 'border-[var(--border)] hover:bg-[var(--muted)]'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-[var(--text-dim-2)] uppercase">Nama Impian</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Liburan ke Bali, Beli iPhone"
                  className="w-full bg-[var(--muted)] border border-transparent focus:border-[#12B76A] rounded-[16px] px-4 py-3.5 text-[15px] font-semibold text-[var(--text)] outline-none"
                />
              </div>

              {/* Target Amount */}
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-[var(--text-dim-2)] uppercase">Target Jumlah</label>
                <input
                  value={targetAmount ? parseInt(targetAmount, 10).toLocaleString('id-ID') : ''}
                  onChange={(e) => setTargetAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  inputMode="numeric"
                  className="w-full bg-[var(--muted)] border border-transparent focus:border-[#12B76A] rounded-[16px] px-4 py-3.5 text-[15px] font-bold text-[var(--text)] outline-none tabular-nums"
                />
              </div>

              {/* Current Amount */}
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-[var(--text-dim-2)] uppercase">Terkumpul Saat Ini</label>
                <input
                  value={currentAmount ? parseInt(currentAmount, 10).toLocaleString('id-ID') : ''}
                  onChange={(e) => setCurrentAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  inputMode="numeric"
                  className="w-full bg-[var(--muted)] border border-transparent focus:border-[#12B76A] rounded-[16px] px-4 py-3.5 text-[15px] font-bold text-[var(--text)] outline-none tabular-nums"
                />
              </div>

              {/* Deadline */}
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-[var(--text-dim-2)] uppercase">Tenggat Waktu</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-[var(--muted)] border border-transparent focus:border-[#12B76A] rounded-[16px] px-4 py-3.5 text-[15px] font-semibold text-[var(--text)] outline-none"
                />
              </div>

              {/* Color */}
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-[var(--text-dim-2)] uppercase">Warna</label>
                <div className="flex gap-3 flex-wrap">
                  {['#12B76A', '#0BA5EC', '#7F56D9', '#F04438', '#F79009', '#EE46BC'].map((c) => (
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
                onClick={isEditModalOpen ? handleUpdate : handleSave}
                disabled={!name || !targetAmount || saving}
                className="w-full py-4 rounded-[16px] bg-[#12B76A] text-white font-bold text-[15px] flex items-center justify-center disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Target'}
              </button>
            </div>
          </div>
        </>
      )}
      {/* ─── Global Alert ─── */}
      <Alert
        isOpen={alertConfig.isOpen}
        onClose={closeAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        isConfirm={alertConfig.isConfirm}
        onConfirm={alertConfig.onConfirm}
        confirmLabel="Hapus"
      />
    </div>
  );
}
