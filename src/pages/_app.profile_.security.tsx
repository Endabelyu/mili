import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { type MetaFunction, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Shield, ArrowLeft, Check, Eye, EyeOff } from 'lucide-react';

export const meta: MetaFunction = () => [
  { title: 'Keamanan | Finance Tracker' },
];

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

export default function SecurityPage() {
  const { changePassword } = useAuth();
  const navigate = useNavigate();
  
  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
  });

  const onSubmit = async (data: SecurityFormValues) => {
    setIsLoading(true);
    setError('');
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: false,
      });
      setSuccess(true);
      reset();
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Coba lagi.');
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
          {...register(field)}
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
    <div className="max-w-xl mx-auto space-y-6 pb-28 md:pb-8 pt-4 lg:pt-8 px-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="icon-btn"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-[20px] font-bold text-[var(--text)] tracking-[-0.02em]">Keamanan</h1>
        </div>
      </div>

      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 rounded-full bg-[var(--muted)] border-4 border-[var(--card)] shadow-sm flex items-center justify-center">
          <Shield className="w-10 h-10 text-[var(--accent)]" />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flow-card p-6 space-y-5">
        <PasswordInput
          id="currentPassword"
          label="Kata Sandi Saat Ini"
          field="currentPassword"
          showKey="current"
          placeholder="Masukkan kata sandi saat ini"
          errorMsg={errors.currentPassword?.message}
        />
        <PasswordInput
          id="newPassword"
          label="Kata Sandi Baru"
          field="newPassword"
          showKey="new"
          placeholder="Minimal 8 karakter"
          errorMsg={errors.newPassword?.message}
        />
        <PasswordInput
          id="confirmPassword"
          label="Konfirmasi Kata Sandi Baru"
          field="confirmPassword"
          showKey="confirm"
          placeholder="Ulangi kata sandi baru"
          errorMsg={errors.confirmPassword?.message}
        />

        {error && (
          <div className="p-4 rounded-xl border border-[var(--expense)] flex items-start gap-2" style={{ background: 'rgba(240,68,56,0.08)' }}>
            <span className="text-[13px] font-semibold text-[var(--expense)]">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl border border-[var(--income)] flex items-center gap-2" style={{ background: 'rgba(18,183,106,0.08)' }}>
            <Check className="w-5 h-5 text-[var(--income)] flex-shrink-0" />
             <span className="text-[13px] font-semibold text-[var(--income)]">Kata sandi berhasil diubah!</span>
          </div>
        )}

        <div className="pt-2">
           <Button type="submit" disabled={isLoading} className="w-full">
             {isLoading ? 'Menyimpan...' : 'Ubah Kata Sandi'}
           </Button>
        </div>
      </form>

      <p className="text-center text-[12px] font-medium text-[var(--text-dim)] px-4 pt-2 pb-8">
        Setelah mengubah kata sandi, sesi di perangkat ini tetap berjalan.
      </p>
    </div>
  );
}
