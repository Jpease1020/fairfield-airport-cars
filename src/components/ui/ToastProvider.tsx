import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (type: Toast['type'], message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast['type'], message: string, duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, type, message, duration };
    
    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 'var(--spacing-lg)',
      right: 'var(--spacing-lg)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-sm)',
      maxWidth: '400px'
    }}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          backgroundColor: '#dcfce7',
          color: '#166534',
          border: '1px solid #4ade80'
        };
      case 'error':
        return {
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          border: '1px solid #f87171'
        };
      case 'warning':
        return {
          backgroundColor: '#fef3c7',
          color: '#92400e',
          border: '1px solid #fcd34d'
        };
      case 'info':
        return {
          backgroundColor: '#dbeafe',
          color: '#1e40af',
          border: '1px solid #60a5fa'
        };
      default:
        return {
          backgroundColor: '#f3f4f6',
          color: '#374151',
          border: '1px solid #d1d5db'
        };
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '';
    }
  };

  return (
    <div style={{
      ...getStyles(),
      padding: 'var(--spacing-md)',
      borderRadius: 'var(--border-radius)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--spacing-sm)',
      minWidth: '300px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
        <span>{getIcon()}</span>
        <span style={{ fontWeight: '500' }}>{toast.message}</span>
      </div>
      
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          fontSize: 'var(--font-size-lg)',
          padding: 'var(--spacing-xs)',
          opacity: 0.7
        }}
        onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
        onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
      >
        ×
      </button>
      
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}; 