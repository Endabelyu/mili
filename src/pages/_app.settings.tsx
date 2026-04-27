import { useState } from 'react';
import { usePreferences, LANGUAGE_OPTIONS, CURRENCY_OPTIONS } from '../hooks/usePreferences';
import type { Language, Currency } from '../hooks/usePreferences';
import {
  Sun,
  Moon,
  Bell,
  Shield,
  ChevronRight,
  Globe,
  Coins,
  Download,
  Upload,
  Cloud,
  Trash2,
  Star,
  Info,
  Settings as SettingsIcon,
  Check,
  X,
} from 'lucide-react';
import { Alert } from '../components/ui/Alert';

import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '../api/client';

export default function SettingsPage() {
  const { language, setLanguage, currency, setCurrency, isDark, toggleDark, t } = usePreferences();

  // Sheet state for language/currency pickers
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

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

  const showAlert = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setAlertConfig({ isOpen: true, title, message, type });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'warning' | 'error' = 'warning') => {
    setAlertConfig({ isOpen: true, title, message, type, isConfirm: true, onConfirm });
  };

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }));

  // Labels derived from current preferences
  const currentLangLabel = LANGUAGE_OPTIONS.find(l => l.value === language)?.nativeLabel || 'Bahasa Indonesia';
  const currentCurrencyLabel = CURRENCY_OPTIONS.find(c => c.value === currency)?.label || 'Rupiah (Rp)';

  // Query all transactions for CSV Export
  const { data } = useQuery({
    queryKey: ['transactions', 'all'],
    queryFn: () => transactionsApi.list({ limit: 1000 }),
  });
  const transactions = data?.items || [];

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      showAlert('Gagal Ekspor', 'Tidak ada data transaksi untuk diekspor.', 'error');
      return;
    }
    const headers = ['Tanggal', 'Jenis', 'Jumlah', 'Kategori', 'Keterangan'];
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString('id-ID'),
      t.type === 'expense' ? 'Pengeluaran' : 'Pemasukan',
      t.amount,
      t.category?.label || t.categoryId,
      t.description || ''
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transaksi_saku_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAll = () => {
    showConfirm(
      'Hapus Semua Data?', 
      'Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak bisa dibatalkan.',
      () => {
        closeAlert();
        setTimeout(() => {
          showAlert('Sukses', 'Data sedang diproses untuk dihapus... (Simulasi sukses)', 'success');
        }, 500);
      },
      'error'
    );
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 pt-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] font-bold text-[var(--text)] tracking-[-0.02em] ml-1">{t('settings.title')}</h1>
        <p className="text-[14px] font-medium text-[var(--text-dim)] ml-1">{t('settings.subtitle')}</p>
      </div>

      {/* ─── Theme Selector ─── */}
      <div className="space-y-3">
        <h3 className="text-[14px] font-bold text-[var(--text)] ml-1">{t('settings.appearance')}</h3>
        <div className="flow-card p-5">
          <p className="text-[13px] font-bold text-[var(--text)] mb-4">{t('settings.appTheme')}</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { if (isDark) toggleDark(); }}
              className={`flex flex-col items-center gap-2.5 p-4 rounded-[16px] border-2 transition-all ${
                !isDark
                  ? 'border-[#12B76A] bg-[rgba(18,183,106,0.08)] text-[#12B76A]'
                  : 'border-[var(--border)] text-[var(--text-dim)] hover:bg-[var(--muted)]'
              }`}
            >
              <Sun className="w-6 h-6" />
              <span className="text-[12px] font-bold text-center leading-tight">{t('settings.lightMode')}</span>
            </button>
            <button
              type="button"
              onClick={() => { if (!isDark) toggleDark(); }}
              className={`flex flex-col items-center gap-2.5 p-4 rounded-[16px] border-2 transition-all ${
                isDark
                  ? 'border-[#12B76A] bg-[rgba(18,183,106,0.08)] text-[#12B76A]'
                  : 'border-[var(--border)] text-[var(--text-dim)] hover:bg-[var(--muted)]'
              }`}
            >
              <Moon className="w-6 h-6" />
              <span className="text-[12px] font-bold text-center leading-tight">{t('settings.darkMode')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Preferences ─── */}
      <div className="space-y-3">
        <h3 className="text-[14px] font-bold text-[var(--text)] ml-1">{t('settings.preferences')}</h3>
        <div className="flow-card divide-y divide-[var(--border)] overflow-hidden">
          {/* Language — opens picker */}
          <button onClick={() => setShowLangPicker(true)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[var(--muted)] transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0 pr-2 text-left">
              <p className="text-[14px] font-bold text-[var(--text)]">{t('settings.language')}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-[13px] font-bold text-[var(--text-dim-2)] opacity-70">{currentLangLabel}</p>
              <ChevronRight className="w-4 h-4 text-[var(--text-dim-2)] opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>

          {/* Currency — opens picker */}
          <button onClick={() => setShowCurrencyPicker(true)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[var(--muted)] transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0 pr-2 text-left">
              <p className="text-[14px] font-bold text-[var(--text)]">{t('settings.currency')}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-[13px] font-bold text-[var(--text-dim-2)] opacity-70">{currentCurrencyLabel}</p>
              <ChevronRight className="w-4 h-4 text-[var(--text-dim-2)] opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>

          {/* Dark Mode Toggle */}
          <div className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--muted)] transition-colors cursor-pointer" onClick={toggleDark}>
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5 text-slate-500" />
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-[14px] font-bold text-[var(--text)]">{t('settings.darkMode')}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <input type="checkbox" checked={isDark} onChange={toggleDark} className="sr-only peer" />
              <div className="w-11 h-6 bg-[var(--muted)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#12B76A]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* ─── Notifications ─── */}
      <div className="space-y-3">
        <h3 className="text-[14px] font-bold text-[var(--text)] ml-1">{t('settings.notifications')}</h3>
        <div className="flow-card divide-y divide-[var(--border)] overflow-hidden">
          <SettingToggleRow
            icon={Bell}
            color="bg-blue-50"
            iconColor="text-blue-500"
            label={t('settings.pushNotif')}
            subtext={t('settings.pushNotifDesc')}
            defaultChecked={true}
          />
        </div>
      </div>

      {/* ─── Data & Privacy ─── */}
      <div className="space-y-3">
        <h3 className="text-[14px] font-bold text-[var(--text)] ml-1">{t('settings.dataPrivacy')}</h3>
        <div className="flow-card divide-y divide-[var(--border)] overflow-hidden">
          <SettingRow icon={Download} color="bg-slate-50" iconColor="text-slate-500" label={t('settings.exportData')} value={t('settings.exportDataDesc')} onClick={handleExportCSV} />
          <SettingRow icon={Upload} color="bg-orange-50" iconColor="text-orange-500" label={t('settings.importData')} value={t('settings.importDataDesc')} onClick={() => showAlert('Dalam Pengembangan', 'Fitur Impor Data sedang dalam tahap pengembangan.', 'info')} />
          <SettingToggleRow icon={Cloud} color="bg-emerald-50" iconColor="text-emerald-500" label={t('settings.autoBackup')} subtext={t('settings.autoBackupDesc')} defaultChecked={true} />
          <SettingRow icon={Trash2} color="bg-rose-50" iconColor="text-rose-500" label={t('settings.deleteAll')} labelColor="text-rose-600" subtext={t('settings.deleteAllDesc')} onClick={handleDeleteAll} />
        </div>
      </div>

      {/* ─── About ─── */}
      <div className="space-y-3">
        <h3 className="text-[14px] font-bold text-[var(--text)] ml-1">{t('settings.about')}</h3>
        <div className="flow-card divide-y divide-[var(--border)] overflow-hidden">
          <SettingRow icon={Shield} color="bg-slate-50" iconColor="text-slate-500" label={t('settings.privacy')} subtext={t('settings.privacyDesc')} />
          <SettingRow icon={Star} color="bg-amber-50" iconColor="text-amber-500" label={t('settings.rate')} />
          <SettingRow 
            icon={Info} 
            color="bg-blue-50" 
            iconColor="text-blue-500" 
            label={t('settings.aboutApp')} 
            onClick={() => showAlert(
              'Tentang Mili', 
              'Mili berasal dari bahasa Jawa yang artinya "mengalir" (seperti frasa "banyu mili"). Ini adalah filosofi rezeki yang terus mengalir tanpa henti, bergerak alami membawa kelancaran dan ketenangan hidup. Di Mili, kami mengalirkan keteraturan pada pemasukan dan pengeluaran Anda.', 
              'info'
            )}
          />
        </div>
      </div>

      {/* ─── Version Footer ─── */}
      <div className="flow-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
            <SettingsIcon className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <p className="text-[14px] font-bold leading-tight text-[var(--text)]">{t('settings.appVersion')}</p>
            <p className="text-[12px] font-medium text-[var(--text-dim)] mt-0.5">{t('settings.alwaysUpdated')}</p>
          </div>
        </div>
        <span className="text-[12px] font-bold text-[var(--income)] bg-[rgba(18,183,106,0.08)] px-2.5 py-1 rounded-lg">v2.0.0</span>
      </div>

      {/* ─── Language Picker Sheet ─── */}
      {showLangPicker && (
        <PickerSheet
          title={t('settings.language')}
          onClose={() => setShowLangPicker(false)}
          options={LANGUAGE_OPTIONS.map(l => ({ value: l.value, label: l.nativeLabel, sublabel: l.label }))}
          selected={language}
          onSelect={(val) => { setLanguage(val as Language); setShowLangPicker(false); }}
        />
      )}

      {/* ─── Currency Picker Sheet ─── */}
      {showCurrencyPicker && (
        <PickerSheet
          title={t('settings.currency')}
          onClose={() => setShowCurrencyPicker(false)}
          options={CURRENCY_OPTIONS.map(c => ({ value: c.value, label: c.label }))}
          selected={currency}
          onSelect={(val) => { setCurrency(val as Currency); setShowCurrencyPicker(false); }}
        />
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
      />
    </div>
  );
}

// ─── Setting Row (static with chevron) ───────────────────────────────────────
function SettingRow({ icon: Icon, color, iconColor, label, value, subtext, labelColor, onClick }: {
  icon: React.ElementType; color: string; iconColor: string; label: string;
  value?: string; subtext?: string; labelColor?: string; onClick?: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--muted)] transition-colors cursor-pointer group"
    >
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <p className={`text-[14px] font-bold ${labelColor || 'text-[var(--text)]'}`}>{label}</p>
        {subtext && <p className="text-[11px] font-medium text-[var(--text-dim-2)] opacity-60">{subtext}</p>}
      </div>
      <div className="flex items-center gap-3">
        {value && <p className="text-[13px] font-bold text-[var(--text-dim-2)] opacity-70">{value}</p>}
        <ChevronRight className="w-4 h-4 text-[var(--text-dim-2)] opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

// ─── Setting Toggle Row ──────────────────────────────────────────────────────
function SettingToggleRow({ icon: Icon, color, iconColor, label, subtext, defaultChecked }: {
  icon: React.ElementType; color: string; iconColor: string; label: string;
  subtext?: string; defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked ?? false);
  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--muted)] transition-colors cursor-pointer" onClick={() => setChecked(!checked)}>
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-[14px] font-bold text-[var(--text)]">{label}</p>
        {subtext && <p className="text-[11px] font-medium text-[var(--text-dim-2)] opacity-60">{subtext}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
        <input type="checkbox" checked={checked} onChange={() => setChecked(!checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-[var(--muted)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#12B76A]"></div>
      </label>
    </div>
  );
}

// ─── Picker Sheet (modal overlay for language/currency selection) ─────────────
function PickerSheet({ title, onClose, options, selected, onSelect }: {
  title: string;
  onClose: () => void;
  options: { value: string; label: string; sublabel?: string }[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end lg:items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Sheet */}
      <div
        className="relative bg-[var(--card)] rounded-t-[24px] lg:rounded-[24px] w-full max-w-[420px] p-6 pb-safe animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[18px] font-bold text-[var(--text)]">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--text-dim)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-left ${
                selected === opt.value
                  ? 'bg-[rgba(18,183,106,0.08)]'
                  : 'hover:bg-[var(--muted)]'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className={`text-[15px] font-bold ${selected === opt.value ? 'text-[#12B76A]' : 'text-[var(--text)]'}`}>
                  {opt.label}
                </p>
                {opt.sublabel && (
                  <p className="text-[12px] font-medium text-[var(--text-dim-2)] mt-0.5">{opt.sublabel}</p>
                )}
              </div>
              {selected === opt.value && (
                <div className="w-6 h-6 rounded-full bg-[#12B76A] flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .pb-safe { padding-bottom: max(env(safe-area-inset-bottom), 16px); }
      `}} />
    </div>
  );
}
