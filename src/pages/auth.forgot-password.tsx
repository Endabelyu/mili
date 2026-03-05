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
    <div className="min-h-screen flex text-gray-900 bg-gray-50 dark:bg-[#0A0A0E] dark:text-gray-100 selection:bg-blue-500/30">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full">
        <div className="mx-auto w-full max-w-sm lg:w-[380px] relative z-20">
          <Link to="/auth/login" className="mb-8 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
          </Link>

          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Finance Tracker</h1>
          </div>

          <div className="bg-white/90 dark:bg-white/5 backdrop-blur-3xl rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-white/10 relative overflow-hidden">
            <h2 className="text-2xl font-semibold mb-2">Reset Password</h2>
            <p className="text-sm text-gray-500 mb-8">Enter your email address to receive a password reset link.</p>

            {error && (
              <div className="mb-6 rounded-2xl bg-red-50 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                <Mail className="mx-auto h-10 w-10 text-green-500 mb-4" />
                <h3 className="text-lg font-medium text-green-800 mb-2">Check your email</h3>
                <p className="text-sm text-green-700 mb-6">If an account exists, a reset link has been sent.</p>
                <Link to="/auth/login" className="inline-flex w-full justify-center rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white">
                  Return to login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-200">Email address</label>
                  <div className="mt-2 relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input type="email" required className="block w-full rounded-2xl border-0 py-3.5 pl-11 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 px-4 bg-white/50" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting} className="flex w-full justify-center rounded-2xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-blue-500 disabled:opacity-70">
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
