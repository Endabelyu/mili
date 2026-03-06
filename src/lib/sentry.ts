import * as Sentry from '@sentry/react';

/**
 * Initialise Sentry for the React frontend.
 * Call this once at the very top of main.tsx before <App /> renders.
 * No-op when VITE_SENTRY_DSN is not set.
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) {
    console.warn('[Sentry] VITE_SENTRY_DSN not set — client error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Mask all text/input in session replays for privacy
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // 10% of sessions traced in production; adjust via env
    tracesSampleRate: parseFloat(import.meta.env.VITE_SENTRY_TRACES_RATE ?? '0.1'),
    // 1% session replays in production
    replaysSessionSampleRate: 0.01,
    // 100% of error sessions are replayed
    replaysOnErrorSampleRate: 1.0,
  });
}

/**
 * Manually capture an error with extra context.
 */
export function captureError(err: unknown, context?: Record<string, unknown>) {
  Sentry.withScope((scope) => {
    if (context) scope.setExtras(context);
    Sentry.captureException(err);
  });
}

// Re-export ErrorBoundary for wrapping route segments
export { Sentry };
