import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { PreferencesProvider } from './hooks/usePreferences';
import App from './App';
import './index.css';
import { initSentry } from './lib/sentry';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { ApiError } from './api/client';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'Terjadi kesalahan pada sistem';
      window.dispatchEvent(new CustomEvent('app-error', { detail: { message } }));
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : 'Terjadi kesalahan pada sistem';
      window.dispatchEvent(new CustomEvent('app-error', { detail: { message } }));
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: { retry: false },
  },
});

// Initialise Sentry before the React tree renders
initSentry();

// PostHog analytics will be initialized by ConsentBanner after user consent
// import { initAnalytics } from './lib/analytics';

// Only load devtools in development — saves ~70KB in prod bundle
const ReactQueryDevtools = import.meta.env.DEV
  ? React.lazy(() =>
      import('@tanstack/react-query-devtools').then((mod) => ({
        default: mod.ReactQueryDevtools,
      }))
    )
  : () => null;

import { ToastProvider } from './components/ui/ToastProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <PreferencesProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </PreferencesProvider>
        </BrowserRouter>
      </ToastProvider>
      <React.Suspense fallback={null}>
        <ReactQueryDevtools initialIsOpen={false} />
      </React.Suspense>
    </QueryClientProvider>
  </React.StrictMode>
);

// Auto-update PWA every hour
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    setInterval(() => {
      registration.update();
      console.log('[PWA] Checking for updates...');
    }, 60 * 60 * 1000); // 1 jam
  });
}

