'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isRunningAsPWA, checkInstalledRelatedApps } from '@/lib/pwa';
import styled, { keyframes } from 'styled-components';
import { colors } from '@/design/system/tokens/tokens';

const slideUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const BannerContainer = styled.div<{ $variant?: 'default' | 'success' }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${props => props.$variant === 'success'
    ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
    : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'};
  color: white;
  padding: 20px 24px;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: ${slideUp} 0.3s ease-out;

  @media (max-width: 768px) {
    padding: 24px 20px;
    padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  flex-shrink: 0;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
`;

const TextContent = styled.div`
  flex: 1;
`;

const FeatureList = styled.ul`
  margin: 8px 0 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const FeatureItem = styled.li`
  font-size: 13px;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const BannerTitle = styled.div`
  color: white;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
    gap: 8px;
  }
`;

const InstallButton = styled.button`
  background: white;
  color: ${colors.primary[600]};
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 14px 24px;
  }
`;

interface PWAInstallBannerProps {
  onDismiss?: () => void;
  /** Show after a successful booking with enhanced messaging */
  variant?: 'default' | 'post-booking';
  /** Force show the banner regardless of dismissal state */
  forceShow?: boolean;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  onDismiss,
  variant = 'default',
  forceShow = false
}) => {
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
  // - User dismissed it (unless forceShow)
  // - No banner should be shown (unless forceShow)
  // - No deferred prompt available
  if (isChecking || isInstalled || !deferredPrompt) {
    return null;
  }

  if (!forceShow && (isDismissed || !showBanner)) {
    return null;
  }

  const isPostBooking = variant === 'post-booking';

  return (
    <BannerContainer $variant={isPostBooking ? 'success' : 'default'}>
      <ContentWrapper>
        <IconWrapper>
          {isPostBooking ? '✓' : '📱'}
        </IconWrapper>
        <TextContent>
          <BannerTitle>
            {isPostBooking
              ? 'Booking Confirmed! Install our app to track your ride'
              : 'Get the Fairfield Airport Cars App'}
          </BannerTitle>
          <FeatureList>
            <FeatureItem>✓ Track your driver live</FeatureItem>
            <FeatureItem>✓ Ride reminders</FeatureItem>
            <FeatureItem>✓ One-tap rebooking</FeatureItem>
          </FeatureList>
        </TextContent>
        <ButtonGroup>
          <InstallButton onClick={handleInstallClick}>
            Install Free
          </InstallButton>
          <CloseButton onClick={handleDismiss} aria-label="Dismiss">
            ✕
          </CloseButton>
        </ButtonGroup>
      </ContentWrapper>
    </BannerContainer>
  );
};

