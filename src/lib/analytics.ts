import posthog from 'posthog-js';

/**
 * Initialize PostHog for Real User Monitoring (RUM) and Core Web Vitals.
 * Automatically captures pageviews and performance metrics.
 * Safe to call; no-ops if VITE_POSTHOG_KEY is missing (e.g., local dev).
 */
export function initAnalytics() {
  const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
  const _posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';
  const posthogHost = _posthogHost.startsWith('http') ? _posthogHost : `https://${_posthogHost}`;

  if (!posthogKey) {
    if (import.meta.env.DEV) {
      console.info('[Analytics] VITE_POSTHOG_KEY not set — local development tracking disabled.');
    }
    return;
  }

  posthog.init(posthogKey, {
    api_host: posthogHost,
    // Enable session recording
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '*', // Mask all text by default for financial privacy
    },
    // Capture Core Web Vitals (LCP, CLS, FCP) automatically
    capture_performance: true,
    // Automatically capture pageviews when the URL changes (React Router)
    capture_pageview: true, 
    // Respect Do Not Track settings
    respect_dnt: true,
  });

  if (import.meta.env.DEV) {
    console.info('[Analytics] PostHog initialized successfully.');
  }
}
