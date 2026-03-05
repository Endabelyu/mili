import { useState, useCallback, useRef } from 'react';
import type { Toast, ToastType } from '@app/components/ui';

interface UseToastReturn {
  toasts: Toast[];
  showToast: (type: ToastType, message: string, title?: string, duration?: number) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idCounter = useRef(0);

  const generateId = () => {
    idCounter.current += 1;
    return `toast-${idCounter.current}-${Date.now()}`;
  };

  const showToast = useCallback((
    type: ToastType,
    message: string,
    title?: string,
    duration: number = 5000
  ) => {
    const id = generateId();
    const newToast: Toast = {
      id,
      type,
      message,
      title,
      duration,
    };

    setToasts((prev) => [...prev, newToast]);
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    showToast('success', message, title ?? 'Success');
  }, [showToast]);

  const showError = useCallback((message: string, title?: string) => {
    showToast('error', message, title ?? 'Error');
  }, [showToast]);

  const showWarning = useCallback((message: string, title?: string) => {
    showToast('warning', message, title ?? 'Warning');
  }, [showToast]);

  const showInfo = useCallback((message: string, title?: string) => {
    showToast('info', message, title ?? 'Info');
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAll,
  };
}
