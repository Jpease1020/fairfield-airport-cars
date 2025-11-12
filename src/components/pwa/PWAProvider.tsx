// src/components/pwa/PWAProvider.tsx
'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { registerServiceWorker, usePWAInstallPrompt, requestNotificationPermission } from '@/lib/pwa';

interface PWAContextType {
  canInstall: boolean;
  promptInstall: () => Promise<void>;
  requestPushPermission: () => Promise<NotificationPermission>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

interface PWAProviderProps {
  children: ReactNode;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const { canInstall, promptInstall } = usePWAInstallPrompt();

  useEffect(() => {
    registerServiceWorker();
  }, []);

  const requestPushPermission = async () => {
    return await requestNotificationPermission();
  };

  const value: PWAContextType = {
    canInstall,
    promptInstall,
    requestPushPermission,
  };

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>;
};

export const usePWA = (): PWAContextType => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};