import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { forgetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email wajib diisi');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await forgetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.body?.message || err?.message || 'Gagal mengirim email reset kata sandi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[#fbfbf9]">
      <div className="w-full max-w-md space-y-8 flow-card border-none shadow-sm p-8 sm:p-10 animate-fade-in">
        <div className="text-center">
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#1a1a2e]">Lupa Kata Sandi</h1>
          <p className="mt-2 text-sm font-medium text-[#71717a]">
            Masukkan alamat email Anda untuk menerima tautan reset kata sandi.
          </p>
        </div>

        {success ? (
          <div className="rounded-xl bg-[#f0fdf4] p-6 text-center border border-[#bbf7d0]">
            <CheckCircle2 className="mx-auto h-12 w-12 text-[#16a34a] mb-4" />
            <h3 className="text-lg font-bold text-[#15803d]">Email Terkirim!</h3>
            <p className="mt-2 text-sm font-medium text-[#16a34a]">
              Periksa kotak masuk Anda untuk instruksi menyetel ulang kata sandi.
            </p>
            <div className="mt-6">
              <Link to="/auth/login">
                <Button variant="outline" className="w-full border-[#bbf7d0] text-[#15803d] hover:bg-[#dcfce7]">
                  Kembali ke Masuk
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="rounded-xl bg-[#fef2f2] p-4 flex gap-2 items-start border border-[#fecaca]">
                <AlertCircle className="h-5 w-5 text-[#ef4444] flex-shrink-0" />
                <p className="text-sm font-bold text-[#b91c1c]">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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

              <div className="space-y-3">
                <Button type="submit" className="w-full h-12 shadow-sm text-sm" disabled={isLoading}>
                  {isLoading ? 'Mengirim...' : 'Kirim Tautan Reset'}
                </Button>
                
                <Link to="/auth/login" className="flex items-center justify-center text-sm font-bold text-[#a1a1aa] hover:text-[#1a1a2e] transition-colors py-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Masuk
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
