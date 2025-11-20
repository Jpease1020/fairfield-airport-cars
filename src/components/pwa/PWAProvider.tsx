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
  const [isMounted, setIsMounted] = React.useState(false);
  const { canInstall, promptInstall } = usePWAInstallPrompt();

  useEffect(() => {
    setIsMounted(true);
    // Disable service worker in development to prevent caching issues
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Unregister any existing service workers in development
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then(() => {
            console.log('🔧 Development mode: Unregistered service worker for hot reloading');
          });
        }
      });
      console.log('🔧 Development mode: Service Worker disabled for hot reloading');
    } else if (!isDevelopment && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Only register service worker in production
      registerServiceWorker().catch((error) => {
        console.warn('📱 PWA: Service Worker registration failed:', error);
      });
    }
  }, []);

  const requestPushPermission = async () => {
    if (!isMounted || typeof window === 'undefined') {
      return 'default' as NotificationPermission;
    }
    return await requestNotificationPermission();
  };

  const value: PWAContextType = {
    canInstall: isMounted ? canInstall : false,
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