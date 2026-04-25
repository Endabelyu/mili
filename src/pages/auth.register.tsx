import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  password: z.string()
    .min(8, 'Kata sandi minimal 8 karakter')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/, 
      'Kata sandi harus mengandung kombinasi huruf besar, huruf kecil, angka, dan simbol (@$!%*?&#)'),
  confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi kata sandi tidak cocok",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError('');
    setIsLoading(true);
    
    try {
      await authRegister({
        name: data.name,
        email: data.email,
        password: data.password
      });
      navigate('/auth/login?registered=true');
    } catch (err: any) {
      setError(err?.body?.message || err?.message || 'Gagal mendaftar. Email mungkin sudah digunakan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-[420px] space-y-8 flow-card p-8 sm:p-10 animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
              <User className="w-7 h-7" />
            </div>
          </div>
          <h1 className="text-[24px] font-bold tracking-[-0.02em] text-[var(--text)]">Buat Akun Baru</h1>
          <p className="mt-2 text-[13px] text-[var(--text-dim)]">
            Sudah punya akun?{' '}
            <Link to="/auth/login" className="font-semibold text-[var(--accent)] hover:opacity-80 transition-opacity">
              Masuk
            </Link>
          </p>
        </div>

        {error && (
          <div className="rounded-xl p-4 flex gap-2 items-start" style={{ background: 'rgba(240,68,56,0.08)', border: '1px solid rgba(240,68,56,0.2)' }}>
            <AlertCircle className="h-4 w-4 text-[var(--expense)] flex-shrink-0 mt-0.5" />
            <p className="text-[13px] font-medium text-[var(--expense)]">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div>
            <label htmlFor="name" className="block text-[13px] font-medium text-[var(--text)] mb-2">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-dim-2)]" />
              <Input
                id="name"
                type="text"
                autoComplete="name"
                className={`pl-10 ${errors.name ? 'border-[var(--expense)]' : ''}`}
                placeholder="Rizal Doe"
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-[12px] text-[var(--expense)] font-medium">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-[13px] font-medium text-[var(--text)] mb-2">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-dim-2)]" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                className={`pl-10 ${errors.email ? 'border-[var(--expense)]' : ''}`}
                placeholder="anda@email.com"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-[12px] text-[var(--expense)] font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-[13px] font-medium text-[var(--text)] mb-2">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-dim-2)]" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`pl-10 pr-10 ${errors.password ? 'border-[var(--expense)]' : ''}`}
                placeholder="••••••••"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim-2)] hover:text-[var(--text)] transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password ? (
              <p className="mt-1 text-[12px] text-[var(--expense)] font-medium">{errors.password.message}</p>
            ) : (
              <p className="mt-1 text-[11px] text-[var(--text-dim-2)]">Minimal 8 karakter (Huruf besar, kecil, angka, & simbol).</p>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-[13px] font-medium text-[var(--text)] mb-2">
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-dim-2)]" />
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`pl-10 ${errors.confirmPassword ? 'border-[var(--expense)]' : ''}`}
                placeholder="••••••••"
                {...register('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-[12px] text-[var(--expense)] font-medium">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full mt-2" disabled={isLoading}>
            {isLoading ? 'Mendaftar...' : 'Buat Akun Saku'}
          </Button>
        </form>
      </div>
    </div>
  );
}
