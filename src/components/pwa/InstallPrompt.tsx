import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@app/components/ui';
import { useInstallPrompt } from '@app/hooks/useInstallPrompt';

/**
 * InstallPrompt Component
 * Shows a native-style install banner for PWA installation
 */
export function InstallPrompt() {
  const { show, canInstall, handleInstall, dismiss } = useInstallPrompt(5000);
  const [isDismissing, setIsDismissing] = useState(false);

  const handleDismiss = () => {
    setIsDismissing(true);
    setTimeout(() => {
      dismiss();
      setIsDismissing(false);
    }, 300);
  };

  const handleInstallClick = async () => {
    const installed = await handleInstall();
    if (installed) {
      dismiss();
    }
  };

  // Store dismissed state in localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < oneWeek) {
        dismiss();
      }
    }
  }, [dismiss]);

  const handlePermanentDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    handleDismiss();
  };

  if (!canInstall || !show) {
    return null;
  }

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-50 
        bg-white dark:bg-gray-900 
        border-t border-gray-200 dark:border-gray-800
        px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]
        shadow-lg
        transform transition-transform duration-300 ease-out
        ${isDismissing ? 'translate-y-full' : 'translate-y-0'}
        sm:bottom-4 sm:left-4 sm:right-auto sm:rounded-2xl sm:border sm:max-w-sm
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        {/* App Icon */}
        <div className="flex-shrink-0">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
            <svg
              className="w-8 h-8 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
              <text x="12" y="17" textAnchor="middle" fill="currentColor" fontSize="8" fontWeight="bold">$</text>
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                Install Finance Tracker
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Add to your home screen for quick access
              </p>
            </div>
            
            <button
              onClick={handlePermanentDismiss}
              className="flex-shrink-0 p-1 -mr-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Dismiss install prompt"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-3">
            <Button
              onClick={handleInstallClick}
              className="flex-1 h-10 text-sm font-medium"
              variant="primary"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Install
            </Button>
            
            <Button
              onClick={handlePermanentDismiss}
              className="h-10 px-4 text-sm"
              variant="secondary"
            >
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InstallPrompt;
