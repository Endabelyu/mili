import { useEffect, useState } from 'react';
import { initAnalytics } from '../../lib/analytics';

const CONSENT_KEY = 'finance_tracker_consent';

export function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if we already have consent stored
    const storedConsent = localStorage.getItem(CONSENT_KEY);
    
    if (storedConsent) {
      try {
        const consent = JSON.parse(storedConsent);
        // If they previously accepted analytics, initialize it now
        if (consent.analytics) {
          initAnalytics();
        }
      } catch (e) {
        // Corrupted JSON, show banner again
        setIsVisible(true);
      }
    } else {
      // No consent record found, show the banner
      setIsVisible(true);
    }
  }, []);

  const handleAccept = async () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      analytics: true,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }));
    setIsVisible(false);
    initAnalytics();

    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3005'}/api/v1/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consentVersion: '1.0' }),
      });
    } catch (e) {
      console.error('Failed to record consent on server', e);
    }
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      analytics: false,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }));
    setIsVisible(false);
    // Don't initialize analytics
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg dark:bg-slate-900 dark:border-slate-800 animate-slide-up">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">We value your privacy</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            We use cookies to analyze site traffic and improve your experience. 
            No personal financial data is ever shared with third parties.
          </p>
        </div>
        <div className="flex flex-shrink-0 gap-3 w-full sm:w-auto">
          <button 
            onClick={handleDecline}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
          >
            Decline
          </button>
          <button 
            onClick={handleAccept}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Accept Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
