import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Sparkles } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter'),
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#fbfbf9]">
      <div className="w-full max-w-md space-y-8 flow-card p-8 sm:p-10 border-none shadow-sm animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center mb-4">
             <div className="w-16 h-16 rounded-3xl bg-[#ecfccb] flex items-center justify-center shadow-sm border border-white">
               <Sparkles className="w-8 h-8 text-[#65a30d]" />
             </div>
          </div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#1a1a2e]">Buat Akun Baru</h1>
          <p className="mt-2 text-sm font-medium text-[#71717a]">
            Sudah punya akun?{' '}
            <Link to="/auth/login" className="font-bold text-[#65a30d] hover:text-[#4d7c0f] transition-colors">
              Masuk
            </Link>
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-[#fef2f2] p-4 flex gap-2 items-start border border-[#fecaca]">
            <AlertCircle className="h-5 w-5 text-[#ef4444] flex-shrink-0" />
            <p className="text-sm font-bold text-[#b91c1c]">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-[#1a1a2e] mb-2">
              Nama Lengkap
            </label>
            <div className="mt-1 relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-40 text-[#1a1a2e]" />
              <Input
                id="name"
                type="text"
                autoComplete="name"
                className={`pl-10 h-12 bg-white ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Rizal Doe"
                {...register('name')}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-bold text-[#1a1a2e] mb-2">
              Alamat Email
            </label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-40 text-[#1a1a2e]" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                className={`pl-10 h-12 bg-white ${errors.email ? 'border-red-500' : ''}`}
                placeholder="anda@email.com"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-[#1a1a2e] mb-2">
              Kata Sandi
            </label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-40 text-[#1a1a2e]" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`pl-10 pr-10 h-12 bg-white ${errors.password ? 'border-red-500' : ''}`}
                placeholder="••••••••"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity text-[#1a1a2e]"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password ? (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>
            ) : (
              <p className="mt-1.5 text-xs font-medium text-[#71717a]">Minimal 8 karakter.</p>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-bold text-[#1a1a2e] mb-2">
              Konfirmasi Kata Sandi
            </label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-40 text-[#1a1a2e]" />
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`pl-10 h-12 bg-white ${errors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="••••••••"
                {...register('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full h-12 mt-2 shadow-md text-sm" disabled={isLoading}>
            {isLoading ? 'Mendaftar...' : 'Buat Akun FlowState'}
          </Button>
        </form>
      </div>
    </div>
  );
}
