import { useState } from 'react';
import { type MetaFunction } from 'react-router';
import { useNavigate } from 'react-router';
import { authClient } from '@app/lib/auth-client';
import { Input } from '@app/components/ui/Input';
import { Button } from '@app/components/ui/Button';
import { Shield, ArrowLeft, Check, Eye, EyeOff } from 'lucide-react';

export const meta: MetaFunction = () => [
  { title: 'Keamanan | Finance Tracker' },
];

export default function SecurityPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const validate = (): string | null => {
    if (!form.currentPassword) return 'Masukkan kata sandi saat ini.';
    if (form.newPassword.length < 8) return 'Kata sandi baru minimal 8 karakter.';
    if (form.newPassword !== form.confirmPassword) return 'Konfirmasi kata sandi tidak cocok.';
    if (form.currentPassword === form.newPassword) return 'Kata sandi baru harus berbeda.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const result = await authClient.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        revokeOtherSessions: false,
      });
      if (result.error) {
        setError(result.error.message ?? 'Gagal mengubah kata sandi.');
      } else {
        setSuccess(true);
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => navigate('/profile'), 1500);
      }
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordInput = ({
    id,
    label,
    field,
    showKey,
    placeholder,
  }: {
    id: string;
    label: string;
    field: keyof typeof form;
    showKey: keyof typeof showPass;
    placeholder: string;
  }) => (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={showPass[showKey] ? 'text' : 'password'}
          value={form[field]}
          onChange={handleChange(field)}
          placeholder={placeholder}
          className="pr-11"
        />
        <button
          type="button"
          onClick={() => setShowPass(prev => ({ ...prev, [showKey]: !prev[showKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          {showPass[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-28 animate-fade-in pt-2">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--text-primary)]/5 hover:bg-[var(--text-primary)]/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[var(--text-primary)]" />
        </button>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">Keamanan</h1>
      </div>

      {/* Icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-2xl bg-[var(--gradient-hero-start)]/20 border-2 border-[var(--gradient-hero-start)]/30 flex items-center justify-center">
          <Shield className="w-9 h-9 text-[var(--gradient-hero-start)]" />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
        <PasswordInput
          id="currentPassword"
          label="Kata Sandi Saat Ini"
          field="currentPassword"
          showKey="current"
          placeholder="Masukkan kata sandi saat ini"
        />
        <PasswordInput
          id="newPassword"
          label="Kata Sandi Baru"
          field="newPassword"
          showKey="new"
          placeholder="Minimal 8 karakter"
        />
        <PasswordInput
          id="confirmPassword"
          label="Konfirmasi Kata Sandi Baru"
          field="confirmPassword"
          showKey="confirm"
          placeholder="Ulangi kata sandi baru"
        />

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-500 flex items-center gap-2">
            <Check className="w-4 h-4" />
            Kata sandi berhasil diubah!
          </div>
        )}

        <Button type="submit" isLoading={isLoading} className="w-full">
          Ubah Kata Sandi
        </Button>
      </form>

      <p className="text-center text-xs text-[var(--text-secondary)] px-4">
        Setelah mengubah kata sandi, Anda akan tetap masuk di perangkat ini.
      </p>
    </div>
  );
}
