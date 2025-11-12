'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/design/ui';
import { isRunningAsPWA } from '@/lib/pwa';

interface PWAInstallButtonProps {
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ className }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(isRunningAsPWA());

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('📱 PWA: User accepted the install prompt');
    } else {
      console.log('📱 PWA: User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  if (isInstalled) {
    return (
      <Button
        variant="secondary"
        size="sm"
        disabled
        className={className}
      >
        ✅ App Installed
      </Button>
    );
  }

  if (!showInstall) {
    return null;
  }

  return (
    <Button
      onClick={handleInstallClick}
      variant="primary"
      size="sm"
      className={className}
    >
      📱 Install App
    </Button>
  );
};



