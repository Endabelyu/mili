/**
 * useInstallPrompt Hook
 * Simple hook to manage the PWA install prompt visibility
 */
import { useState, useEffect } from 'react';
import type { BeforeInstallPromptEvent } from './usePWA';

export interface InstallPromptState {
  show: boolean;
  canInstall: boolean;
  prompt: BeforeInstallPromptEvent | null;
}

/**
 * Hook for managing install prompt visibility
 * @param delay - Delay in ms before showing the prompt (default: 30000 - 30 seconds)
 * @returns Install prompt state and prompt function
 */
export function useInstallPrompt(delay: number = 30000): {
  show: boolean;
  canInstall: boolean;
  prompt: BeforeInstallPromptEvent | null;
  handleInstall: () => Promise<boolean>;
  dismiss: () => void;
} {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
      
      // Show prompt after delay
      const timer = setTimeout(() => {
        // Only show if not already in standalone mode
        const isStandalone = 
          window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as unknown as { standalone?: boolean }).standalone === true;
        
        if (!isStandalone) {
          setShowPrompt(true);
        }
      }, delay);

      return () => clearTimeout(timer);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setCanInstall(false);
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [delay]);

  const handleInstall = async (): Promise<boolean> => {
    if (!installPrompt) return false;
    
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setCanInstall(false);
      setShowPrompt(false);
      return true;
    }
    
    return false;
  };

  const dismiss = () => {
    setShowPrompt(false);
  };

  return {
    show: showPrompt,
    canInstall,
    prompt: installPrompt,
    handleInstall,
    dismiss,
  };
}

export default useInstallPrompt;
