import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Semua form wajib diisi');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok');
      return;
    }
    if (formData.password.length < 8) {
      setError('Kata sandi harus minimal 8 karakter');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      navigate('/auth/login?registered=true');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-[#1a1a2e] mb-2">
              Nama Lengkap
            </label>
            <div className="mt-1 relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-40 text-[#1a1a2e]" />
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="pl-10 h-12 bg-white"
                placeholder="Rizal Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

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
                value={formData.email}
                onChange={handleChange}
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
                autoComplete="new-password"
                required
                className="pl-10 pr-10 h-12 bg-white"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity text-[#1a1a2e]"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="mt-1.5 text-xs font-medium text-[#71717a]">Minimal 8 karakter.</p>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-bold text-[#1a1a2e] mb-2">
              Konfirmasi Kata Sandi
            </label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-40 text-[#1a1a2e]" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="pl-10 h-12 bg-white"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 mt-2 shadow-md text-sm" disabled={isLoading}>
            {isLoading ? 'Mendaftar...' : 'Buat Akun FlowState'}
          </Button>
        </form>
      </div>
    </div>
  );
}
