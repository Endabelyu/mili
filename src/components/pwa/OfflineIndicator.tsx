import { WifiOff, RefreshCw } from 'lucide-react';
import { usePWA } from '@app/hooks/usePWA';

/**
 * OfflineIndicator Component
 * Shows a subtle indicator when the app is offline
 */
export function OfflineIndicator() {
  const { isOffline } = usePWA();

  if (!isOffline) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium animate-in slide-in-from-top"
      role="alert"
      aria-live="polite"
    >
      <WifiOff className="w-4 h-4" />
      <span>You're offline. Changes will sync when you reconnect.</span>
      <button
        onClick={() => window.location.reload()}
        className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
        aria-label="Retry connection"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  );
}

export default OfflineIndicator;
