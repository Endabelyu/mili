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
      <label htmlFor={id} className="block text-sm font-bold text-[#1a1a2e] mb-2">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={showPass[showKey] ? 'text' : 'password'}
          {...register(field)}
          placeholder={placeholder}
          className={`pr-12 h-12 bg-white ${errorMsg ? 'border-red-500' : 'border-zinc-200 focus:border-[var(--text-primary)] focus:ring-[var(--text-primary)]'}`}
        />
        <button
          type="button"
          onClick={() => setShowPass(prev => ({ ...prev, [showKey]: !prev[showKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-[#1a1a2e] transition-colors p-1"
        >
          {showPass[showKey] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {errorMsg && (
        <p className="mt-1 text-xs text-red-500 font-medium">{errorMsg}</p>
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
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#f4f4f5] hover:bg-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#1a1a2e]" />
        </button>
        <div>
          <h1 className="text-[20px] font-extrabold text-[#1a1a2e] tracking-tight">Keamanan</h1>
        </div>
      </div>

      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 rounded-full bg-[#fbfbf9] border-4 border-white shadow-sm flex items-center justify-center">
          <Shield className="w-10 h-10 text-[#a3e635]" />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flow-card p-6 space-y-5 border-none shadow-sm bg-white">
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
          <div className="p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] flex items-start gap-2">
            <span className="text-[13px] font-bold text-[#ef4444]">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center gap-2">
            <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0" />
             <span className="text-[13px] font-bold text-[#16a34a]">Kata sandi berhasil diubah!</span>
          </div>
        )}

        <div className="pt-2">
           <Button type="submit" disabled={isLoading} className="w-full h-12 text-sm shadow-md">
             {isLoading ? 'Menyimpan...' : 'Ubah Kata Sandi'}
           </Button>
        </div>
      </form>

      <p className="text-center text-[12px] font-medium text-[#a1a1aa] px-4 pt-2 pb-8">
        Setelah mengubah kata sandi, sesi di perangkat ini tetap berjalan.
      </p>
    </div>
  );
}
