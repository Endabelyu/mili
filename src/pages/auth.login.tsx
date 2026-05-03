import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const registered = searchParams.get('registered') === 'true';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError('');
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      const e = err as Record<string, unknown>;
      const body = e?.body as Record<string, unknown> | undefined;
      setError(
        (body?.message as string) || (e instanceof Error ? e.message : 'Email atau kata sandi tidak valid')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-[420px] space-y-8 flow-card p-8 sm:p-10 animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center mb-0">
            <img src="/icon-192.png" className="w-40 h-40 object-contain -my-10" alt="Logo Mili" />
          </div>
          <h1 className="text-[24px] font-bold tracking-[-0.02em] text-[var(--text)]">Selamat Datang di Mili</h1>
          <p className="mt-2 text-[11px] font-bold text-[var(--text-dim-2)] opacity-60 uppercase tracking-[0.2em]">Mengalirkan Ketenangan Finansial</p>
          <p className="mt-5 text-[13px] text-[var(--text-dim)]">
            Belum punya akun?{' '}
            <Link to="/auth/register" className="font-semibold text-[var(--accent)] hover:opacity-80 transition-opacity">
              Daftar sekarang
            </Link>
          </p>
        </div>

        {registered && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(18,183,106,0.08)', border: '1px solid rgba(18,183,106,0.2)' }}>
            <p className="text-[13px] font-medium text-[var(--income)]">
              Akun berhasil dibuat! Silakan masuk.
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-xl p-4 flex gap-2 items-start" style={{ background: 'rgba(240,68,56,0.08)', border: '1px solid rgba(240,68,56,0.2)' }}>
            <AlertCircle className="h-4 w-4 text-[var(--expense)] flex-shrink-0 mt-0.5" />
            <p className="text-[13px] font-medium text-[var(--expense)]">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <div className="space-y-4">
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
                  autoComplete="current-password"
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
              {errors.password && (
                <p className="mt-1 text-[12px] text-[var(--expense)] font-medium">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-[var(--border)]"
                style={{ accentColor: 'var(--accent)' }}
              />
              <label htmlFor="remember-me" className="ml-2 block text-[13px] text-[var(--text)]">
                Ingat saya
              </label>
            </div>
            <Link
              to="/auth/forgot-password"
              className="text-[13px] font-semibold text-[var(--accent)] hover:opacity-80 transition-opacity"
            >
              Lupa kata sandi?
            </Link>
          </div>

          <Button type="submit" className="w-full flex items-center justify-center gap-2" disabled={isLoading}>
            {isLoading ? (
              <>
                Sedang proses masuk...
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </>
            ) : (
              'Masuk'
            )}
          </Button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-[var(--border)]"></div>
            <span className="flex-shrink mx-4 text-[12px] text-[var(--text-dim-2)] uppercase font-bold">Atau</span>
            <div className="flex-grow border-t border-[var(--border)]"></div>
          </div>

          <button
            type="button"
            onClick={async () => {
              const { signIn } = await import('../lib/auth-client');
              await signIn.social({
                provider: 'google',
                callbackURL: window.location.origin
              });
            }}
            className="w-full py-3.5 rounded-[16px] bg-[var(--muted)] border border-[var(--border)] hover:bg-[var(--border)] flex items-center justify-center gap-3 text-[14px] font-bold text-[var(--text)] transition-colors"
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Masuk dengan Google
          </button>
        </form>
      </div>
    </div>
  );
}
