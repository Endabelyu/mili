import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Format email tidak valid'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { forgetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setError('');
    setIsLoading(true);
    try {
      await forgetPassword(data.email);
      setSuccess(true);
    } catch (err) {
      const e = err as any;
      setError(e?.body?.message || err?.message || 'Gagal mengirim email reset kata sandi');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-[420px] space-y-8 flow-card p-8 sm:p-10 animate-fade-in">
        <div className="text-center">
          <h1 className="text-[24px] font-bold tracking-[-0.02em] text-[var(--text)]">Lupa Kata Sandi</h1>
          <p className="mt-2 text-[13px] text-[var(--text-dim)]">
            Masukkan alamat email Anda untuk menerima tautan reset kata sandi.
          </p>
        </div>

        {success ? (
          <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(18,183,106,0.08)', border: '1px solid rgba(18,183,106,0.2)' }}>
            <CheckCircle2 className="mx-auto h-10 w-10 text-[var(--income)] mb-4" />
            <h3 className="text-[16px] font-bold text-[var(--income)]">Email Terkirim!</h3>
            <p className="mt-2 text-[13px] text-[var(--income)] opacity-80">
              Periksa kotak masuk Anda untuk instruksi menyetel ulang kata sandi.
            </p>
            <div className="mt-5">
              <Link to="/auth/login">
                <Button variant="outline" className="w-full">
                  Kembali ke Masuk
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="rounded-xl p-4 flex gap-2 items-start" style={{ background: 'rgba(240,68,56,0.08)', border: '1px solid rgba(240,68,56,0.2)' }}>
                <AlertCircle className="h-4 w-4 text-[var(--expense)] flex-shrink-0 mt-0.5" />
                <p className="text-[13px] font-medium text-[var(--expense)]">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
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

              <div className="space-y-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Mengirim...' : 'Kirim Tautan Reset'}
                </Button>
                
                <Link to="/auth/login" className="flex items-center justify-center text-[13px] font-medium text-[var(--text-dim)] hover:text-[var(--text)] transition-colors py-2">
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
