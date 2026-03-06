import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authClient } from '../lib/auth-client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      const { error: signUpError } = await authClient.signUp.email({
        email,
        password,
        name,
      });
      
      if (signUpError) {
        throw new Error(signUpError.message || 'An error occurred during sign up');
      }
      
      navigate('/auth/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass-card p-8 sm:p-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
          <p className="mt-2 text-sm opacity-80">
            Already have an account?{' '}
            <Link to="/auth/login" className="font-medium text-[var(--gradient-hero-start)] hover:text-[var(--gradient-hero-end)] transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium opacity-90">Full name</label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-70" />
                <Input id="name" name="name" type="text" required className="pl-10" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium opacity-90">Email address</label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-70" />
                <Input id="email" name="email" type="email" required className="pl-10" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium opacity-90">Password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-70" />
                <Input id="password" name="password" type={showPassword ? 'text' : 'password'} required className="pl-10 pr-10" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium opacity-90">Confirm password</label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-70" />
                <Input id="confirm-password" name="confirm-password" type={showPassword ? 'text' : 'password'} required className="pl-10 pr-10" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full flex justify-center py-2.5 px-4">
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </div>
    </div>
  );
}
