import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const registered = searchParams.get('registered') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email dan kata sandi diperlukan');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.body?.message || err?.message || 'Email atau kata sandi tidak valid');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#fbfbf9]">
      <div className="w-full max-w-md space-y-8 flow-card p-8 sm:p-10 border-none shadow-sm animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center mb-4">
             <div className="w-16 h-16 rounded-3xl bg-[#a3e635] flex items-center justify-center shadow-lg shadow-[#a3e635]/20">
               <Sparkles className="w-8 h-8 text-[#3f6212]" />
             </div>
          </div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#1a1a2e]">Selamat Datang</h1>
          <p className="mt-2 text-sm font-medium text-[#71717a]">
            Belum punya akun?{' '}
            <Link to="/auth/register" className="font-bold text-[#65a30d] hover:text-[#4d7c0f] transition-colors">
              Daftar sekarang
            </Link>
          </p>
        </div>

        {registered && (
          <div className="rounded-xl bg-[#f0fdf4] p-4 border border-[#bbf7d0]">
            <p className="text-sm font-bold text-[#16a34a]">
              Akun berhasil dibuat! Silakan masuk.
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-[#fef2f2] p-4 flex gap-2 items-start border border-[#fecaca]">
            <AlertCircle className="h-5 w-5 text-[#ef4444] flex-shrink-0" />
            <p className="text-sm font-bold text-[#b91c1c]">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-[#1a1a2e] mb-2">
                Alamat Email
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-40 text-[#1a1a2e]" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="pl-10 h-12 bg-white"
                  placeholder="anda@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-[#1a1a2e] mb-2">
                Kata Sandi
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-40 text-[#1a1a2e]" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="pl-10 pr-10 h-12 bg-white"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity text-[#1a1a2e]"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-300 bg-white text-[#65a30d] focus:ring-[#65a30d]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-[#1a1a2e]">
                Ingat saya
              </label>
            </div>
            <Link
              to="/auth/forgot-password"
              className="text-sm font-bold text-[#65a30d] hover:text-[#4d7c0f] transition-colors"
            >
              Lupa kata sandi?
            </Link>
          </div>

          <Button type="submit" className="w-full h-12 text-sm shadow-md" disabled={isLoading}>
            {isLoading ? 'Memasukkan...' : 'Masuk'}
          </Button>
        </form>
      </div>
    </div>
  );
}
