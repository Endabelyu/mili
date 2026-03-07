import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Sentry } from './lib/sentry';
import LoginPage from './pages/auth.login';
import DashboardPage from './pages/_app.dashboard';
import { AppLayout } from './components/layout/AppLayout';

// Lazy-loaded pages
const TransactionsPage = React.lazy(() => import('./pages/_app.transactions'));
const BudgetPage = React.lazy(() => import('./pages/_app.budget'));
const ReportsPage = React.lazy(() => import('./pages/_app.reports'));
const ProfilePage = React.lazy(() => import('./pages/_app.profile'));
const ProfileEditPage = React.lazy(() => import('./pages/_app.profile_.edit'));
const ProfileSecurityPage = React.lazy(() => import('./pages/_app.profile_.security'));
const SettingsPage = React.lazy(() => import('./pages/_app.settings'));
const RegisterPage = React.lazy(() => import('./pages/auth.register'));
const ForgotPasswordPage = React.lazy(() => import('./pages/auth.forgot-password'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="animate-pulse text-gray-400">Loading...</div>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <React.Suspense fallback={<div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <Sentry.ErrorBoundary
        fallback={({ error, resetError }) => (
          <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
            <h1 className="text-3xl font-bold mb-4 text-rose-500">Oops! Something went wrong.</h1>
            <p className="text-slate-300 mb-6 text-center max-w-md">
              We've encountered an unexpected error. Our team has been notified.
            </p>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 w-full max-w-lg mb-6 overflow-auto">
              <code className="text-sm font-mono text-rose-400">
                {(error instanceof Error ? error.message : String(error)) || 'Unknown render error'}
              </code>
            </div>
            <button
              onClick={() => resetError()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      >
        <Routes>
          {/* Auth routes — guests only */}
          <Route path="/auth/login"           element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/auth/register"        element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/auth/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
  
          {/* Protected app routes */}
          <Route path="/"                  element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/transactions"      element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
          <Route path="/budget"            element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
          <Route path="/reports"           element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/profile"           element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/profile/edit"      element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />
          <Route path="/profile/security"  element={<ProtectedRoute><ProfileSecurityPage /></ProtectedRoute>} />
          <Route path="/settings"          element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
  
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Sentry.ErrorBoundary>
    </React.Suspense>
  );
}
