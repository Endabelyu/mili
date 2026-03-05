import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@app/components/ui';

/**
 * UpdatePrompt Component
 * Shows when a new version of the app is available
 */
export function UpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Check for waiting worker
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowUpdate(true);
        }

        // Listen for new worker installation
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setShowUpdate(true);
              }
            });
          }
        });
      });

      // Listen for controller change (page updated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      // Tell the service worker to skip waiting
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdate(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 bg-blue-600 text-white px-4 py-3 rounded-xl shadow-lg max-w-md mx-auto animate-in slide-in-from-bottom"
      role="alert"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
          
          <div>
            <p className="font-medium">Update Available</p>
            <p className="text-sm text-blue-100">A new version of the app is ready</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleDismiss}
            variant="secondary"
            className="h-9 px-3 text-sm bg-white/10 border-0 text-white hover:bg-white/20"
          >
            Later
          </Button>
          
          <Button
            onClick={handleUpdate}
            variant="primary"
            className="h-9 px-4 text-sm bg-white text-blue-600 hover:bg-gray-100"
          >
            Update
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UpdatePrompt;
