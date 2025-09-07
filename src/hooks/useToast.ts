import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastOptions {
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface UseToastReturn {
  toasts: Toast[];
  showToast: (type: ToastType, message: string, options?: ToastOptions) => string;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
  clearToastsByType: (type: ToastType) => void;
  updateToast: (id: string, updates: Partial<Toast>) => void;
}

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((
    type: ToastType, 
    message: string, 
    options: ToastOptions = {}
  ): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const { duration = 5000, persistent = false, action } = options;

    const newToast: Toast = {
      id,
      type,
      message,
      duration,
      persistent,
      action
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-hide toast after duration (unless persistent)
    if (!persistent && duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }

    return id;
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const clearToastsByType = useCallback((type: ToastType) => {
    setToasts(prev => prev.filter(toast => toast.type !== type));
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, ...updates } : toast
      )
    );
  }, []);

  return {
    toasts,
    showToast,
    hideToast,
    clearAllToasts,
    clearToastsByType,
    updateToast
  };
};
