import { useState } from 'react';
import { Link, useSearchParams, Form, useActionData, useNavigation, redirect, type ClientActionFunctionArgs } from 'react-router';
import { authApi } from '../api/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';

export async function clientAction({ request }: ClientActionFunctionArgs) {
  const formData = await request.formData();
  const email = String(formData.get('email') || '');
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    await authApi.login(email, password);
    return redirect('/');
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' };
  }
}

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  
  const actionData = useActionData<typeof clientAction>();
  const navigation = useNavigation();
  const isLoading = navigation.state !== 'idle';
  
  const registered = searchParams.get('registered') === 'true';
  const error = actionData?.error;
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass-card p-8 sm:p-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm opacity-80">
            Don&apos;t have an account?{' '}
            <Link to="/auth/register" className="font-medium text-[var(--gradient-hero-start)] hover:text-[var(--gradient-hero-end)] transition-colors">
              Sign up
            </Link>
          </p>
        </div>
        
        {registered && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Account created successfully! Please sign in.
                </p>
              </div>
            </div>
          </div>
        )}
        
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
        
        <Form method="post" className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium opacity-90">
                Email address
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-50" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium opacity-90">
                Password
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-50" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
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
                className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--gradient-hero-start)] focus:ring-[var(--gradient-hero-start)]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm opacity-90">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <Link to="/auth/forgot-password" className="font-medium text-[var(--gradient-hero-start)] hover:text-[var(--gradient-hero-end)] transition-colors">
                Forgot your password?
              </Link>
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </Form>
      </div>
    </div>
  );
}
