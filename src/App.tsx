import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Sentry } from './lib/sentry';
import LoginPage from './pages/auth.login';
import DashboardPage from './pages/_app.dashboard';
import { AppLayout } from './components/layout/AppLayout';
import { ConsentBanner } from './components/ui/ConsentBanner';
import OnboardingOverlay from './components/OnboardingOverlay';

// Lazy-loaded pages
const TransactionsPage = React.lazy(() => import('./pages/_app.transactions'));
const BudgetPage = React.lazy(() => import('./pages/_app.budget'));
const ReportsPage = React.lazy(() => import('./pages/_app.reports'));
const ProfilePage = React.lazy(() => import('./pages/_app.profile'));
const AccountsPage = React.lazy(() => import('./pages/_app.accounts'));
const TargetsPage = React.lazy(() => import('./pages/_app.targets'));
const CalendarPage = React.lazy(() => import('./pages/_app.calendar'));
const ScheduledPage = React.lazy(() => import('./pages/_app.scheduled'));
const NotificationsPage = React.lazy(() => import('./pages/_app.notifications'));
const ScanPage = React.lazy(() => import('./pages/_app.scan'));
const RewardsPage = React.lazy(() => import('./pages/_app.rewards'));
const SubscriptionPage = React.lazy(() => import('./pages/_app.subscription'));
const ProfileEditPage = React.lazy(() => import('./pages/_app.profile_.edit'));
const ProfileSecurityPage = React.lazy(() => import('./pages/_app.profile_.security'));
const SettingsPage = React.lazy(() => import('./pages/_app.settings'));
const RegisterPage = React.lazy(() => import('./pages/auth.register'));
const ForgotPasswordPage = React.lazy(() => import('./pages/auth.forgot-password'));
const DeveloperFeedbacksPage = React.lazy(() => import('./pages/_app.developer.feedbacks'));
const DeveloperAnalyticsPage = React.lazy(() => import('./pages/_app.developer.analytics'));

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

function DeveloperRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <div className="animate-pulse text-gray-400">Loading...</div>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (user?.role !== 'developer' && user?.email !== 'endabelyuproject@gmail.com') return <Navigate to="/" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

import { useToastContext } from './components/ui/ToastProvider';

function GlobalToastListener() {
  const { showError } = useToastContext();

  React.useEffect(() => {
    const handleAppError = (e: Event) => {
      const customEvent = e as CustomEvent;
      showError(customEvent.detail?.message || 'Terjadi kesalahan pada sistem');
    };
    window.addEventListener('app-error', handleAppError);
    return () => window.removeEventListener('app-error', handleAppError);
  }, [showError]);

  return null;
}

export default function App() {
  return (
    <React.Suspense fallback={<div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <GlobalToastListener />
      <Sentry.ErrorBoundary
        fallback={({ error, resetError }) => (
          <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF7F2] text-[var(--text)] p-4">
            <h1 className="text-3xl font-bold mb-4 text-[#F04438]">Oops! Something went wrong.</h1>
            <p className="text-[var(--text-dim)] mb-6 text-center max-w-md">
              We've encountered an unexpected error. Our team has been notified.
            </p>
            <div className="bg-white p-4 rounded-lg border border-[var(--border)] w-full max-w-lg mb-6 overflow-auto">
              <code className="text-sm font-mono text-[#F04438]">
                {error instanceof Error ? error.message : String(error)}
              </code>
            </div>
            <button
              onClick={() => resetError()}
              className="px-6 py-2 bg-[#15803D] text-white rounded-xl font-bold transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      >
        <OnboardingOverlay />
        <ConsentBanner />
        <Routes>
          {/* Auth routes — guests only */}
          <Route path="/auth/login"           element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/auth/register"        element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/auth/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
  
          {/* Protected app routes */}
          <Route path="/"                  element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/transactions"      element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
          <Route path="/budget"            element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
          <Route path="/analytics"         element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/reports"           element={<Navigate to="/analytics" replace />} />
          <Route path="/profile"           element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/scheduled"         element={<ProtectedRoute><ScheduledPage /></ProtectedRoute>} />
          <Route path="/notifications"     element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/scan"              element={<ProtectedRoute><ScanPage /></ProtectedRoute>} />
          <Route path="/targets"           element={<ProtectedRoute><TargetsPage /></ProtectedRoute>} />
          
          {/* Stubs for other navigation */}
          <Route path="/calendar"          element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/accounts"          element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
          
          {/* Legacy/Other routes */}
          <Route path="/rewards"           element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />
          <Route path="/challenge"         element={<Navigate to="/targets" replace />} />
          <Route path="/subscription/:id"  element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
          <Route path="/profile/edit"      element={<ProtectedRoute><ProfileEditPage /></ProtectedRoute>} />
          <Route path="/profile/security"  element={<ProtectedRoute><ProfileSecurityPage /></ProtectedRoute>} />
          <Route path="/settings"          element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/developer/feedbacks" element={<DeveloperRoute><DeveloperFeedbacksPage /></DeveloperRoute>} />
          <Route path="/developer/analytics" element={<DeveloperRoute><DeveloperAnalyticsPage /></DeveloperRoute>} />
  
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Sentry.ErrorBoundary>
    </React.Suspense>
  );
}
