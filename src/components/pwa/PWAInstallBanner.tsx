'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button, Text, Stack } from '@/design/ui';
import { isRunningAsPWA, checkInstalledRelatedApps } from '@/lib/pwa';
import styled from 'styled-components';

const BannerContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  padding: 16px 20px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 20px;
    text-align: center;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

interface PWAInstallBannerProps {
  onDismiss?: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onDismiss }) => {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check installation status on mount and route changes
  useEffect(() => {
    const checkInstallationStatus = async () => {
      setIsChecking(true);
      
      // Fast synchronous check first
      const runningAsPWA = isRunningAsPWA();
      if (runningAsPWA) {
        setIsInstalled(true);
        setShowBanner(false);
        setIsChecking(false);
        return;
      }

      // Then check getInstalledRelatedApps() (Chrome-specific, async)
      try {
        const installedViaAPI = await checkInstalledRelatedApps();
        if (installedViaAPI) {
          setIsInstalled(true);
          setShowBanner(false);
          setIsChecking(false);
          return;
        }
      } catch (error) {
        console.warn('📱 PWA: Error checking installed apps:', error);
      }

      setIsInstalled(false);
      setIsChecking(false);
    };

    checkInstallationStatus();
  }, [pathname]);

  // Main effect: Set up event listeners and check dismissal
  useEffect(() => {
    // Check if user previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setIsDismissed(true);
        return;
      } else {
        // Clear old dismissal if more than 7 days
        localStorage.removeItem('pwa-install-dismissed');
        setIsDismissed(false);
      }
    }

    const handleBeforeInstallPrompt = async (e: Event) => {
      // Only show banner if:
      // 1. beforeinstallprompt fired (browser says installable)
      // 2. Not already installed
      // 3. Not dismissed
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Double-check installation status before showing
      // Fast synchronous check first
      const runningAsPWA = isRunningAsPWA();
      if (runningAsPWA) {
        setIsInstalled(true);
        setShowBanner(false);
        return;
      }

      // Then check getInstalledRelatedApps() (Chrome-specific, async)
      try {
        const installedViaAPI = await checkInstalledRelatedApps();
        if (installedViaAPI) {
          setIsInstalled(true);
          setShowBanner(false);
          return;
        }
      } catch (error) {
        console.warn('📱 PWA: Error checking installed apps:', error);
      }

      // If not installed and not dismissed, show banner
      // Check localStorage directly to avoid stale closure issues
      const currentDismissed = localStorage.getItem('pwa-install-dismissed');
      if (!currentDismissed) {
        setShowBanner(true);
      }
    };

    const handleAppInstalled = () => {
      console.log('📱 PWA: App was installed');
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-dismissed');
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

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('📱 PWA: User accepted the install prompt');
        setShowBanner(false);
      } else {
        console.log('📱 PWA: User dismissed the install prompt');
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
    
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    onDismiss?.();
  };

  // Don't show if:
  // - Still checking installation status
  // - Already installed
  // - User dismissed it
  // - No banner should be shown
  // - No deferred prompt available
  if (isChecking || isInstalled || isDismissed || !showBanner || !deferredPrompt) {
    return null;
  }

  return (
    <BannerContainer>
      <ContentWrapper>
        <div style={{ flex: 1 }}>
          <Text variant="body" style={{ color: 'white', fontWeight: 600, marginBottom: '4px' }}>
            📱 Install Our App
          </Text>
          <Text variant="small" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            Get ride reminders, track your driver, and faster access
          </Text>
        </div>
        <Stack direction="horizontal" spacing="sm" style={{ alignItems: 'center' }}>
          <Button
            onClick={handleInstallClick}
            variant="secondary"
            size="md"
          >
            Install Now
          </Button>
          <CloseButton onClick={handleDismiss} aria-label="Dismiss">
            ×
          </CloseButton>
        </Stack>
      </ContentWrapper>
    </BannerContainer>
  );
};

