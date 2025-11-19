'use client';

import { useEffect, useState } from 'react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferredPrompt: InstallPromptEvent | null = null;

// PWA Service Worker Registration
export const registerServiceWorker = async (): Promise<void> => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('📱 PWA: Service Worker registered successfully:', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              window.dispatchEvent(new Event('pwa:updateavailable'));
            }
          });
        }
      });
      
    } catch (error) {
      console.error('📱 PWA: Service Worker registration failed:', error);
    }
  }
};

// Install prompt handling
export const handleInstallPrompt = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      deferredPrompt = event as InstallPromptEvent;
      resolve(false);
    };

    const onAppInstalled = () => {
      console.log('📱 PWA: App was installed');
      deferredPrompt = null;
      resolve(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall, { once: true });
    window.addEventListener('appinstalled', onAppInstalled, { once: true });
  });
};

// Check if app is installed using getInstalledRelatedApps() API (Chrome)
export const checkInstalledRelatedApps = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  // Check if API is available (Chrome/Edge)
  if ('getInstalledRelatedApps' in navigator) {
    try {
      const relatedApps = await (navigator as any).getInstalledRelatedApps();
      return relatedApps && relatedApps.length > 0;
    } catch (error) {
      console.warn('📱 PWA: Error checking installed related apps:', error);
      return false;
    }
  }
  
  return false;
};

// Check if app is running as PWA
export const isRunningAsPWA = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
};

// Comprehensive check: Is PWA installed or running as PWA?
export const isPWAInstalled = async (): Promise<boolean> => {
  // First check display mode (fast, synchronous)
  if (isRunningAsPWA()) {
    return true;
  }
  
  // Then check getInstalledRelatedApps() (async, Chrome-specific)
  const installedViaAPI = await checkInstalledRelatedApps();
  return installedViaAPI;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }
  
  return 'denied';
};

// Background sync for other data (not bookings)
export const registerBackgroundSync = async (tag: string): Promise<void> => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    const syncRegistration = registration as ServiceWorkerRegistration & {
      sync?: {
        register: (tag: string) => Promise<void>;
      };
    };
    if (syncRegistration.sync) {
      await syncRegistration.sync.register(tag);
      console.log('📱 PWA: Background sync registered for tag:', tag);
    }
  }
};

// Check if user is online
export const isOnline = (): boolean => {
  return typeof window !== 'undefined' && navigator.onLine;
};

// Listen for online/offline events
export const addConnectionListener = (callback: (isOnline: boolean) => void): void => {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
  }
};

// PWA Install Prompt Hook
export const usePWAInstallPrompt = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Only add event listener on client side
    if (typeof window === 'undefined') return;
    
    const handler = (event: Event) => {
      event.preventDefault();
      deferredPrompt = event as InstallPromptEvent;
      setCanInstall(true);
      console.log('📱 PWA: Before install prompt fired');
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const promptInstall = async () => {
    if (typeof window === 'undefined' || !deferredPrompt) return;
    
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`📱 PWA: User response to the install prompt: ${outcome}`);
      deferredPrompt = null;
      setCanInstall(false);
    } catch (error) {
      console.warn('📱 PWA: Error showing install prompt:', error);
    }
  };

  // Return false until mounted to prevent hydration mismatch
  return { canInstall: isMounted ? canInstall : false, promptInstall };
};
