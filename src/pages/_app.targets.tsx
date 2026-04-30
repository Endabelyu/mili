import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Target as TargetIcon, X, Check, Edit2, Trash2, Pin, Clock, ArrowLeft } from 'lucide-react';
import { Alert } from '../components/ui/Alert';
import { targetsApi, type Target } from '../api/client';
import { usePreferences } from '../hooks/usePreferences';
import { CategoryIcon } from '../components/ui/CategoryIcon';

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
      <div className="absolute inset-0 flex items-center justify-center">
        <CategoryIcon 
          category="target" 
          icon={icon} 
          size="md" 
        />
      </div>
    </div>
  );
}

const EMOJI_LIST = [
  'category_savings', 
  'category_travel', 
  'category_wedding', 
  'category_investment', 
  'category_education', 
  'category_shopping', 
  'category_transport', 
  'category_general'
];

export default function TargetsPage() {
  const { formatMoney, t } = usePreferences();
  const navigate = useNavigate();
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
  const [color, setColor] = useState('#15803D');
  const [icon, setIcon] = useState('category_savings');
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
    setColor('#15803D');
    setIcon('category_savings');
    setSelectedTarget(null);
    setSaving(false);
    setIsModalOpen(false);
    setIsEditModalOpen(false);
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
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-2xl bg-[var(--muted)] text-[var(--text)] flex items-center justify-center hover:bg-[var(--border)] transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[28px] font-bold text-[var(--text)] tracking-[-0.03em]">{t('target.title')}</h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-11 h-11 rounded-2xl bg-[var(--muted)] text-[var(--text)] flex items-center justify-center hover:bg-[var(--border)] transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--card)] p-5 rounded-[24px] border border-[var(--border)] shadow-sm">
          <p className="text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-widest mb-1">{t('target.active')}</p>
          <p className="text-[24px] font-bold text-[var(--text)]">{activeTargets.length}</p>
        </div>
        <div className="bg-[var(--card)] p-5 rounded-[24px] border border-[var(--border)] shadow-sm">
          <p className="text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-widest mb-1">{t('target.completed')}</p>
          <p className="text-[24px] font-bold text-[var(--text)]">{completedTargets.length}</p>
        </div>
      </div>

      <div className="flex items-center gap-8 border-b border-[var(--border)] px-1">
        <button 
          onClick={() => setActiveTab('active')}
          className={`py-4 text-[15px] font-bold transition-all relative ${activeTab === 'active' ? 'text-[var(--text)]' : 'text-[var(--text-dim-2)] opacity-50'}`}
        >
          {t('target.activeTab')}
          {activeTab === 'active' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent)] rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`py-4 text-[15px] font-bold transition-all relative ${activeTab === 'completed' ? 'text-[var(--text)]' : 'text-[var(--text-dim-2)] opacity-50'}`}
        >
          {t('target.completedTab')}
          {activeTab === 'completed' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent)] rounded-t-full" />}
        </button>
      </div>

      <div className="space-y-4">
        {targets.length === 0 ? (
          <div className="text-center py-20 px-6 bg-[var(--card)] rounded-[32px] border border-[var(--border)]">
            <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-6">
              <TargetIcon className="w-10 h-10" />
            </div>
            <h3 className="text-[20px] font-bold text-[var(--text)] mb-3">{t('target.noTargets')}</h3>
            <p className="text-[14px] text-[var(--text-dim-2)] mb-8 max-w-[300px] mx-auto leading-relaxed">{t('target.noTargetsDesc')}</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 rounded-2xl bg-[var(--text)] text-[var(--bg)] font-bold text-[15px] shadow-xl transition-all active:scale-95"
            >
              {t('target.addTarget')}
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
                const progress = Math.min(Math.round((current / total) * 100), 100);

              return (
                <div key={target.id} className="flow-card p-6 flex flex-col gap-6 relative group transition-all hover:shadow-xl border-transparent hover:border-[var(--income)]/20">
                  <div className="flex items-center gap-5">
                    <CircularProgress percentage={progress} color={target.color} icon={target.icon} />
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[15px] sm:text-[18px] font-bold text-[var(--text)] leading-tight">{target.name}</h4>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[var(--text-dim-2)] opacity-60 flex-shrink-0" />
                        <span className="text-[12px] font-medium text-[var(--text-dim-2)]">
                          {target.deadline ? new Date(target.deadline).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : t('target.noDeadline')}
                        </span>
                      </div>
                    </div>

                    <div className="absolute top-6 right-6 flex items-center gap-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(target)} className="p-2.5 rounded-xl bg-[var(--muted)] text-[var(--text-dim-2)] hover:text-[var(--accent)] transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => showConfirm(t('target.deleteConfirmTitle'), t('target.deleteConfirmMessage'), () => { deleteMutation.mutate(target.id); closeAlert(); }, 'error')}
                        className="p-2.5 rounded-xl bg-[var(--muted)] text-[var(--text-dim-2)] hover:text-[var(--expense)] transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[11px] font-bold text-[var(--text-dim-2)] uppercase tracking-widest">{t('target.progress')}</p>
                      <p className="text-[11px] font-bold text-[var(--text)]">{progress}%</p>
                    </div>
                    <div className="w-full h-2.5 bg-[var(--muted)] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700 ease-out" 
                        style={{ width: `${progress}%`, backgroundColor: target.color }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[13px] font-bold">
                      <span className="text-[var(--text-dim-2)]">{formatMoney(current)}</span>
                      <span className="text-[var(--text-dim-2)]">{formatMoney(total)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {(isModalOpen || isEditModalOpen) && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[90] backdrop-blur-sm animate-fade-in" onClick={resetForm} />
          <div 
            className="fixed inset-x-0 bottom-0 lg:top-[10%] lg:bottom-auto lg:left-1/2 lg:-translate-x-1/2 lg:w-[500px] lg:rounded-[32px] bg-[var(--bg)] z-[100] flex flex-col animate-slide-up rounded-t-[32px] pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 shrink-0 border-b border-[var(--border)]">
              <h2 className="text-[16px] font-bold text-[var(--text)] pl-2">{selectedTarget ? t('target.editTarget') : t('target.addTarget')}</h2>
              <button 
                onClick={resetForm} 
                className="relative z-[210] w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--text)] hover:bg-[var(--border)] transition-all active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-3">
                <label className="text-[13px] font-bold text-[var(--text-dim-2)] uppercase">Emoji</label>
                <div className="flex gap-2.5 flex-wrap">
                  {EMOJI_LIST.map((e) => (
                    <button
                      key={e}
                      onClick={() => setIcon(e)}
                      className={`text-[24px] w-12 h-12 rounded-[16px] flex items-center justify-center border transition-all ${
                        icon === e ? 'border-[#15803D] bg-[#15803D]/5 scale-110' : 'border-[var(--border)] hover:bg-[var(--muted)]'
                      }`}
                    >
                      <CategoryIcon category="target" icon={e} size="lg" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[13px] font-bold text-[var(--text-dim-2)] uppercase">{t('target.dreamName')}</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Beli iPhone 15 Pro, Dana Darurat"
                  className="w-full bg-[var(--muted)] border border-transparent focus:border-[#15803D] rounded-[16px] px-4 py-3.5 text-[15px] font-semibold text-[var(--text)] outline-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[13px] font-bold text-[var(--text-dim-2)] uppercase">{t('target.amount')}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-bold text-[var(--text-dim-2)]">Rp</span>
                  <input
                    value={targetAmount ? parseInt(targetAmount, 10).toLocaleString('id-ID') : ''}
                    onChange={(e) => setTargetAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    inputMode="numeric"
                    className="w-full bg-[var(--muted)] border border-transparent focus:border-[#15803D] rounded-[16px] pl-11 pr-4 py-3.5 text-[15px] font-bold text-[var(--text)] outline-none tabular-nums"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[13px] font-bold text-[var(--text-dim-2)] uppercase">{t('target.collectedSoFar')}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-bold text-[var(--text-dim-2)]">Rp</span>
                  <input
                    value={collectedAmount ? parseInt(collectedAmount, 10).toLocaleString('id-ID') : ''}
                    onChange={(e) => setCollectedAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    inputMode="numeric"
                    className="w-full bg-[var(--muted)] border border-transparent focus:border-[#15803D] rounded-[16px] pl-11 pr-4 py-3.5 text-[15px] font-bold text-[var(--text)] outline-none tabular-nums"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[13px] font-bold text-[var(--text-dim-2)] uppercase">{t('target.deadline')}</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-[var(--muted)] border border-transparent focus:border-[#15803D] rounded-[16px] px-4 py-3.5 text-[15px] font-semibold text-[var(--text)] outline-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[13px] font-bold text-[var(--text-dim-2)] uppercase">{t('target.color')}</label>
                <div className="flex gap-3 flex-wrap">
                  {['#15803D', '#0BA5EC', '#7F56D9', '#F04438', '#F79009', '#EE46BC'].map((c) => (
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
                disabled={!name || !targetAmount || saving}
                className="w-full py-4 rounded-[16px] bg-[var(--accent)] text-white font-bold text-[15px] flex items-center justify-center disabled:opacity-50 transition-all active:scale-95"
              >
                {saving ? t('common.loading') : t('target.saveTarget')}
              </button>
            </div>
          </div>
        </>
      )}

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
