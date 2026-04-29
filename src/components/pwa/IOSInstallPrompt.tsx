import { useState, useEffect } from 'react';
import { X, Share, PlusSquare } from 'lucide-react';

/**
 * IOSInstallPrompt Component
 * Shows instructions on how to install the PWA on iOS
 */
export function IOSInstallPrompt() {
  const [show, setShow] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    // Check if already in standalone mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    // Check if already dismissed in this session or recently
    const dismissed = localStorage.getItem('ios-pwa-prompt-dismissed');
    let isRecentDismiss = false;
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      isRecentDismiss = Date.now() - dismissedTime < oneWeek;
    }

    if (isIOS && !isStandalone && !isRecentDismiss) {
      // Small delay for better UX
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissing(true);
    localStorage.setItem('ios-pwa-prompt-dismissed', Date.now().toString());
    setTimeout(() => {
      setShow(false);
      setIsDismissing(false);
    }, 300);
  };

  if (!show) return null;

  return (
    <div
      className={`
        fixed bottom-6 left-4 right-4 z-50 
        bg-white dark:bg-gray-900 
        rounded-2xl border border-gray-200 dark:border-gray-800
        px-5 py-5 shadow-2xl
        transform transition-all duration-500 ease-out
        ${isDismissing ? 'translate-y-20 opacity-0' : 'translate-y-0 opacity-100'}
        sm:left-auto sm:right-6 sm:max-w-sm
      `}
      role="alert"
    >
      <div className="flex items-start gap-4">
        {/* App Icon */}
        <div className="flex-shrink-0">
          <img 
            src="/icon-192.png" 
            alt="Mili Logo" 
            className="w-12 h-12 rounded-xl shadow-md object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-[15px]">
                Pasang Mili di iPhone
              </h3>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                Akses Mili lebih cepat dari layar utama Anda.
              </p>
            </div>
            
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 -mr-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-4 space-y-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
            <div className="flex items-center gap-3 text-[13px] text-gray-700 dark:text-gray-300">
              <div className="flex-shrink-0 w-6 h-6 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center shadow-sm">
                <Share className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <span>Tap tombol <b>Bagikan (Share)</b> di Safari</span>
            </div>
            <div className="flex items-center gap-3 text-[13px] text-gray-700 dark:text-gray-300">
              <div className="flex-shrink-0 w-6 h-6 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center shadow-sm">
                <PlusSquare className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
              </div>
              <span>Pilih <b>"Tambah ke Layar Utama"</b></span>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="w-full mt-4 py-2.5 text-[13px] font-bold text-[var(--accent)] hover:bg-[var(--accent)]/5 rounded-xl transition-colors"
          >
            Nanti Saja
          </button>
        </div>
      </div>
      
      {/* Pointer arrow for mobile Safari (center bottom) */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-900 border-b border-r border-gray-200 dark:border-gray-800 rotate-45 sm:hidden" />
    </div>
  );
}

export default IOSInstallPrompt;
