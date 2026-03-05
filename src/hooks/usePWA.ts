// TypeScript type for notification permission
type NotificationPermission = 'default' | 'denied' | 'granted';

/**
 * usePWA Hook
 * Manages PWA installation state and service worker functionality
 */
import { useState, useEffect, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export interface PWAState {
  /** Whether the app is installable (not yet installed) */
  isInstallable: boolean;
  /** Whether the app is running in standalone mode (installed) */
  isStandalone: boolean;
  /** Whether the app is offline */
  isOffline: boolean;
  /** The beforeinstallprompt event, if available */
  installPrompt: BeforeInstallPromptEvent | null;
  /** Whether service worker is registered */
  swRegistered: boolean;
  /** Whether an update is available */
  updateAvailable: boolean;
  /** Whether notifications are enabled */
  notificationsEnabled: boolean;
}

export interface PWAActions {
  /** Trigger the install prompt */
  install: () => Promise<boolean>;
  /** Dismiss the install prompt */
  dismissInstall: () => void;
  /** Check for service worker updates */
  checkForUpdates: () => Promise<void>;
  /** Register for push notifications */
  subscribeToNotifications: () => Promise<boolean>;
  /** Request notification permission */
  requestNotificationPermission: () => Promise<NotificationPermission>;
}

/**
 * Hook for managing PWA functionality
 * @returns PWA state and actions
 */
export function usePWA(): PWAState & PWAActions {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  // Initialize to false (safe for SSR) — real value synced in useEffect below
  const [isOffline, setIsOffline] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [swRegistered, setSwRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Check if running in standalone mode
  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(isStandaloneMode);
    };
    
    checkStandalone();
    
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const listener = (e: MediaQueryListEvent) => setIsStandalone(e.matches);
    mediaQuery.addEventListener('change', listener);
    
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setInstallPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Sync actual online/offline state after mount (avoids SSR / hydration mismatch)
  useEffect(() => {
    // Set real value now that we're on the client
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check service worker registration
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let active = true;
    const handleControllerChange = () => {
      if (active) setUpdateAvailable(true);
    };

    navigator.serviceWorker.ready.then(() => {
      if (active) setSwRegistered(true);
    });

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      active = false;
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) {
      return false;
    }

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setInstallPrompt(null);
      return true;
    }
    
    return false;
  }, [installPrompt]);

  const dismissInstall = useCallback(() => {
    setIsInstallable(false);
    setInstallPrompt(null);
  }, []);

  const checkForUpdates = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
    }
  }, []);

  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      return 'denied';
    }
    
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === 'granted');
    return permission;
  }, []);

  const subscribeToNotifications = useCallback(async (): Promise<boolean> => {
    const permission = await requestNotificationPermission();
    return permission === 'granted';
  }, [requestNotificationPermission]);

  return {
    isInstallable,
    isStandalone,
    isOffline,
    installPrompt,
    swRegistered,
    updateAvailable,
    notificationsEnabled,
    install,
    dismissInstall,
    checkForUpdates,
    subscribeToNotifications,
    requestNotificationPermission,
  };
}

export default usePWA;
