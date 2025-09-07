'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useToast, ToastType } from '@/hooks/useToast';
import { Stack, Box, Text, Button } from '@/ui';
import styled from 'styled-components';

const ToastContainer = styled(Stack)`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  max-width: 400px;
  pointer-events: none;
`;

const ToastItem = styled(Box)<{ type: ToastType }>`
  pointer-events: auto;
  background: ${props => {
    switch (props.type) {
      case 'success': return 'var(--success-color, #10b981)';
      case 'error': return 'var(--error-color, #ef4444)';
      case 'warning': return 'var(--warning-color, #f59e0b)';
      case 'info': return 'var(--info-color, #3b82f6)';
      default: return 'var(--background-elevated, #ffffff)';
    }
  }};
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease-out;
  
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
`;

const ToastContext = createContext<ReturnType<typeof useToast> | null>(null);

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer spacing="sm" align="stretch">
        {toast.toasts.map((toastItem) => (
          <ToastItem
            key={toastItem.id}
            type={toastItem.type}
            padding="md"
            data-testid={`toast-${toastItem.type}`}
          >
            <Stack spacing="sm">
              <Stack direction="horizontal" justify="space-between" align="center">
                <Text size="sm" weight="medium" color="inherit">
                  {toastItem.message}
                </Text>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toast.hideToast(toastItem.id)}
                  data-testid={`toast-close-${toastItem.id}`}
                  cmsId="toast-close-button"
                >
                  ×
                </Button>
              </Stack>
              {toastItem.action && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toastItem.action.onClick}
                  data-testid={`toast-action-${toastItem.id}`}
                >
                  {toastItem.action.label}
                </Button>
              )}
            </Stack>
          </ToastItem>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};
