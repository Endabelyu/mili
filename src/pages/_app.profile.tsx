import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth';
import { 
  ChevronRight,
  User,
  Lock, 
  LogOut,
  Mail,
  Smartphone,
  KeyRound,
  Shield,
  Camera,
  X,
  Check,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { Alert } from '../components/ui/Alert';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { formatName } from '../lib/utils';

// ─── Validation Schemas ──────────────────────────────────────────────────────

const editProfileSchema = z.object({
  name: z.string().min(1, 'Nama tidak boleh kosong.'),
});
type EditProfileFormValues = z.infer<typeof editProfileSchema>;

const securitySchema = z.object({
  currentPassword: z.string().min(1, 'Masukkan kata sandi saat ini.'),
  newPassword: z.string().min(8, 'Kata sandi baru minimal 8 karakter.'),
  confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi.'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Konfirmasi kata sandi tidak cocok.",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "Kata sandi baru harus berbeda.",
  path: ["newPassword"],
});
type SecurityFormValues = z.infer<typeof securitySchema>;

export default function ProfilePage() {
  const { user, updateUser, changePassword, logout } = useAuth();
  const navigate = useNavigate();

  // Modal visibility state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

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

  // Edit Profile form state
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: editErrors },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user?.name ?? '',
    },
  });

  const onEditSubmit = async (data: EditProfileFormValues) => {
    setEditError('');
    setIsEditLoading(true);
    try {
      await updateUser({ name: data.name });
      setEditSuccess(true);
      setTimeout(() => {
        setIsEditOpen(false);
        setEditSuccess(false);
      }, 1200);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setIsEditLoading(false);
    }
  };

  // Security form state
  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSecLoading, setIsSecLoading] = useState(false);
  const [secError, setSecError] = useState('');
  const [secSuccess, setSecSuccess] = useState(false);

  const {
    register: registerSec,
    handleSubmit: handleSubmitSec,
    reset: resetSec,
    formState: { errors: secErrors },
  } = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
  });

  const onSecSubmit = async (data: SecurityFormValues) => {
    setIsSecLoading(true);
    setSecError('');
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: false,
      });
      setSecSuccess(true);
      resetSec();
      setTimeout(() => {
        setIsSecurityOpen(false);
        setSecSuccess(false);
      }, 1500);
    } catch (err) {
      setSecError(err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setIsSecLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const PasswordInput = ({
    id,
    label,
    field,
    showKey,
    placeholder,
    errorMsg,
  }: {
    id: string;
    label: string;
    field: keyof SecurityFormValues;
    showKey: keyof typeof showPass;
    placeholder: string;
    errorMsg?: string;
  }) => (
    <div>
      <label htmlFor={id} className="block text-[13px] font-semibold text-[var(--text)] mb-2">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={showPass[showKey] ? 'text' : 'password'}
          {...registerSec(field)}
          placeholder={placeholder}
          className={`pr-12 ${errorMsg ? 'border-[var(--expense)]' : ''}`}
        />
        <button
          type="button"
          onClick={() => setShowPass(prev => ({ ...prev, [showKey]: !prev[showKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim-2)] hover:text-[var(--text)] transition-colors p-1"
        >
          {showPass[showKey] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {errorMsg && (
        <p className="mt-1 text-[12px] text-[var(--expense)] font-semibold">{errorMsg}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12 pt-6">
      <h1 className="text-[28px] font-bold text-[var(--text)] tracking-[-0.02em] ml-1">Profil</h1>

      {/* ─── Profile Header Card ─── */}
      <div className="flow-card p-6">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-[72px] h-[72px] rounded-[22px] bg-[#12B76A] flex items-center justify-center text-white text-[28px] font-bold shadow-lg shadow-[#12B76A20]">
              {formatName(user?.name)[0]}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-[var(--border)] flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-3.5 h-3.5 text-[var(--text-dim)]" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[18px] font-bold text-[var(--text)]">{formatName(user?.name)}</h2>
            <p className="text-[14px] font-medium text-[var(--text-dim-2)] opacity-70">{user?.email || 'arya@example.com'}</p>
            <p className="text-[12px] font-bold text-[var(--text-dim-2)] opacity-50 mt-1">Bergabung sejak Januari 2026</p>
          </div>
          <button onClick={() => setIsEditOpen(true)} className="text-[14px] font-bold text-[#12B76A] hover:underline">Edit</button>
        </div>
      </div>

      {/* ─── Informasi Akun ─── */}
      <div className="space-y-3">
        <h3 className="text-[14px] font-bold text-[var(--text)] ml-1">Informasi Akun</h3>
        <div className="flow-card divide-y divide-[var(--border)] overflow-hidden">
          <ProfileRow 
            icon={User} 
            color="bg-blue-50" 
            iconColor="text-blue-500"
            label="Nama Lengkap" 
            value={formatName(user?.name)} 
            onClick={() => setIsEditOpen(true)}
          />
          <ProfileRow 
            icon={Mail} 
            color="bg-emerald-50" 
            iconColor="text-emerald-500"
            label="Alamat Email" 
            value={user?.email || 'arya@example.com'} 
          />
          <ProfileRow 
            icon={Smartphone} 
            color="bg-orange-50" 
            iconColor="text-orange-500"
            label="Nomor Telepon" 
            value="+62 812-XXXX-XXXX" 
          />
        </div>
      </div>

      {/* ─── Keamanan ─── */}
      <div className="space-y-3">
        <h3 className="text-[14px] font-bold text-[var(--text)] ml-1">Keamanan</h3>
        <div className="flow-card divide-y divide-[var(--border)] overflow-hidden">
          <ProfileRow 
            icon={KeyRound} 
            color="bg-violet-50" 
            iconColor="text-violet-500"
            label="Ubah Kata Sandi" 
            subtext="Terakhir diubah 3 bulan lalu"
            onClick={() => setIsSecurityOpen(true)}
          />
          <ProfileRow 
            icon={Lock} 
            color="bg-slate-50" 
            iconColor="text-slate-500"
            label="PIN Aplikasi" 
            subtext="Aktif · 6 digit"
            onClick={() => setIsSecurityOpen(true)}
          />
          <ProfileRow 
            icon={Shield} 
            color="bg-emerald-50" 
            iconColor="text-emerald-500"
            label="Verifikasi 2 Langkah" 
            subtext={is2FAEnabled ? "Aktif" : "Belum aktif"}
            onClick={() => {
              if (!is2FAEnabled) {
                showConfirm(
                  'Aktifkan 2FA?', 
                  'Aktifkan Verifikasi 2 Langkah untuk keamanan tambahan?',
                  () => {
                    setIs2FAEnabled(true);
                    closeAlert();
                    setTimeout(() => showAlert('Berhasil', 'Verifikasi 2 Langkah telah diaktifkan.', 'success'), 400);
                  }
                );
              } else {
                showConfirm(
                  'Nonaktifkan 2FA?', 
                  'Apakah Anda yakin ingin menonaktifkan Verifikasi 2 Langkah?',
                  () => {
                    setIs2FAEnabled(false);
                    closeAlert();
                    setTimeout(() => showAlert('Berhasil', 'Verifikasi 2 Langkah telah dinonaktifkan.', 'info'), 400);
                  },
                  'error'
                );
              }
            }}
          />
        </div>
      </div>

      {/* ─── Quick Links ─── */}
      <div className="space-y-3">
        <h3 className="text-[14px] font-bold text-[var(--text)] ml-1">Lainnya</h3>
        <div className="flow-card divide-y divide-[var(--border)] overflow-hidden">
          <Link to="/settings" className="block">
            <div className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--muted)] transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-[14px] font-bold text-[var(--text)]">Pengaturan Aplikasi</p>
                <p className="text-[11px] font-medium text-[var(--text-dim-2)] opacity-60">Tampilan, bahasa, data & privasi</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-dim-2)] opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        </div>
      </div>

      {/* ─── Logout Button ─── */}
      <button 
        onClick={handleLogout}
        className="w-full h-14 rounded-2xl bg-white border border-[var(--border)] text-[15px] font-bold text-[#F04438] hover:bg-rose-50 transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Keluar
      </button>

      <div className="text-center">
        <p className="text-[12px] font-bold text-[var(--text-dim-2)] opacity-40">Saku v1.2.0 • PWA</p>
      </div>

      {/* ─── Edit Profile Modal ─── */}
      {isEditOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[90] backdrop-blur-sm animate-fade-in" onClick={() => setIsEditOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 lg:top-[10%] lg:bottom-auto lg:left-1/2 lg:-translate-x-1/2 lg:w-[500px] lg:rounded-[32px] bg-[var(--bg)] z-[100] flex flex-col animate-slide-up rounded-t-[32px] pb-safe">
            <div className="flex items-center justify-between p-4 shrink-0 border-b border-[var(--border)]">
              <h2 className="text-[16px] font-bold text-[var(--text)] pl-2">Edit Profil</h2>
              <button onClick={() => setIsEditOpen(false)} className="relative z-[110] w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--text)] hover:bg-[var(--border)] transition-all active:scale-95">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="flex justify-center mb-2">
                <div className="w-20 h-20 rounded-full p-0.5 flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)' }}>
                  <div className="w-full h-full rounded-full bg-orange-100 overflow-hidden border-2 border-[var(--card)] flex items-center justify-center">
                    {user?.image ? (
                      <img 
                        src={user.image} 
                        className="w-full h-full object-cover" 
                        alt="Foto profil Anda" 
                        width="80" 
                        height="80" 
                        loading="lazy" 
                        decoding="async" 
                      />
                    ) : (
                      <User className="w-8 h-8 text-[var(--accent)]" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--card)] shadow-sm flex items-center justify-center border border-[var(--border)]">
                    <Sparkles className="w-3.5 h-3.5 text-[#f59e0b] fill-[#f59e0b]" />
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[var(--text)] mb-2">
                    Nama Lengkap
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Masukkan nama Anda"
                    className={`h-12 ${editErrors.name ? 'border-[var(--expense)]' : ''}`}
                    autoFocus
                    {...registerEdit('name')}
                  />
                  {editErrors.name && (
                    <p className="mt-2 text-[12px] font-semibold text-[var(--expense)]">{editErrors.name.message}</p>
                  )}
                  {editError && !editErrors.name && (
                    <p className="mt-2 text-[12px] font-semibold text-[var(--expense)]">{editError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[var(--text)] mb-2">
                    Alamat Email
                  </label>
                  <Input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="h-12 opacity-60 cursor-not-allowed"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isEditLoading}
                    className={`w-full ${editSuccess ? 'bg-[var(--income)] hover:bg-[#12B76A]' : ''}`}
                  >
                    {isEditLoading ? 'Menyimpan...' : editSuccess ? (
                      <span className="flex items-center justify-center">
                        <Check className="w-5 h-5 mr-2" />
                        Tersimpan!
                      </span>
                    ) : (
                      'Simpan Perubahan'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ─── Security Modal ─── */}
      {isSecurityOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[90] backdrop-blur-sm animate-fade-in" onClick={() => setIsSecurityOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 lg:top-[10%] lg:bottom-auto lg:left-1/2 lg:-translate-x-1/2 lg:w-[500px] lg:rounded-[32px] bg-[var(--bg)] z-[100] flex flex-col animate-slide-up rounded-t-[32px] pb-safe">
            <div className="flex items-center justify-between p-4 shrink-0 border-b border-[var(--border)]">
              <h2 className="text-[16px] font-bold text-[var(--text)] pl-2">Keamanan</h2>
              <button onClick={() => setIsSecurityOpen(false)} className="relative z-[110] w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center text-[var(--text)] hover:bg-[var(--border)] transition-all active:scale-95">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              <form onSubmit={handleSubmitSec(onSecSubmit)} className="space-y-4">
                <PasswordInput
                  id="currentPassword"
                  label="Kata Sandi Saat Ini"
                  field="currentPassword"
                  showKey="current"
                  placeholder="Masukkan kata sandi saat ini"
                  errorMsg={secErrors.currentPassword?.message}
                />
                <PasswordInput
                  id="newPassword"
                  label="Kata Sandi Baru"
                  field="newPassword"
                  showKey="new"
                  placeholder="Minimal 8 karakter"
                  errorMsg={secErrors.newPassword?.message}
                />
                <PasswordInput
                  id="confirmPassword"
                  label="Konfirmasi Kata Sandi Baru"
                  field="confirmPassword"
                  showKey="confirm"
                  placeholder="Ulangi kata sandi baru"
                  errorMsg={secErrors.confirmPassword?.message}
                />

                {secError && (
                  <div className="p-4 rounded-xl border border-[var(--expense)] flex items-start gap-2" style={{ background: 'rgba(240,68,56,0.08)' }}>
                    <span className="text-[13px] font-semibold text-[var(--expense)]">{secError}</span>
                  </div>
                )}

                {secSuccess && (
                  <div className="p-4 rounded-xl border border-[var(--income)] flex items-center gap-2" style={{ background: 'rgba(18,183,106,0.08)' }}>
                    <Check className="w-5 h-5 text-[var(--income)] flex-shrink-0" />
                    <span className="text-[13px] font-semibold text-[var(--income)]">Kata sandi berhasil diubah!</span>
                  </div>
                )}

                <div className="pt-2">
                  <Button type="submit" disabled={isSecLoading} className="w-full">
                    {isSecLoading ? 'Menyimpan...' : 'Ubah Kata Sandi'}
                  </Button>
                </div>
              </form>
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
      />
    </div>
  );
}

// ─── Profile Row Component ───────────────────────────────────────────────────
function ProfileRow({ icon: Icon, color, iconColor, label, value, subtext, href, onClick }: {
  icon: React.ElementType;
  color: string;
  iconColor: string;
  label: string;
  value?: string;
  subtext?: string;
  href?: string;
  onClick?: () => void;
}) {
  const content = (
    <div 
      onClick={onClick}
      className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--muted)] transition-colors cursor-pointer group"
    >
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <p className="text-[14px] font-bold text-[var(--text)]">{label}</p>
        {subtext && <p className="text-[11px] font-medium text-[var(--text-dim-2)] opacity-60">{subtext}</p>}
      </div>
      <div className="flex items-center gap-3">
        {value && <p className="text-[13px] font-bold text-[var(--text-dim-2)] opacity-70">{value}</p>}
        <ChevronRight className="w-4 h-4 text-[var(--text-dim-2)] opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );

  if (href) return <Link to={href} className="block">{content}</Link>;
  return content;
}
