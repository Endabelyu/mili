import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, Wallet } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      // Simulate API call for now since we don't have the forgot password endpoint typed out
      await new Promise(resolve => setTimeout(resolve, 800));
      setSuccess(true);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass-card p-8 sm:p-10">
        <div className="mx-auto w-full max-w-sm lg:w-[380px] relative z-20">
          <Link to="/auth/login" className="mb-8 inline-flex items-center text-sm font-medium opacity-70 hover:opacity-100 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
          </Link>

          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--gradient-hero-start)] to-[var(--gradient-hero-end)]">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Finance Tracker</h1>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-2">Reset Password</h2>
            <p className="text-sm opacity-80 mb-8">Enter your email address to receive a password reset link.</p>

            {error && (
              <div className="mb-6 rounded-2xl bg-red-50 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success ? (
              <div className="border border-[var(--gradient-success-start)] rounded-2xl p-6 text-center" style={{ background: 'var(--card-bg)' }}>
                <Mail className="mx-auto h-10 w-10 text-[var(--gradient-success-end)] mb-4" />
                <h3 className="text-lg font-medium mb-2">Check your email</h3>
                <p className="text-sm opacity-80 mb-6">If an account exists, a reset link has been sent.</p>
                <Link to="/auth/login" className="btn btn-primary w-full">
                  Return to login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium opacity-90">Email address</label>
                  <div className="mt-2 relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-70" />
                    <input type="email" required className="input pl-11" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full shadow-lg disabled:opacity-70">
                  {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...</> : 'Send reset link'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
