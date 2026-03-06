import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/auth.login';
import DashboardPage from './pages/_app.dashboard';

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
  return <>{children}</>;
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
    </React.Suspense>
  );
}
