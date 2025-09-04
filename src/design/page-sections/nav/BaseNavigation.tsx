'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Button } from '../../components/base-components/Button';
import { Stack } from '../../layout/framing/Stack';
import { PositionedContainer } from '../../layout/containers/PositionedContainer';
import { Text } from '../../components/base-components/text/Text';
import { FlexboxContainer } from '../../components/base-components/FlexboxContainer';
import { colors, spacing, shadows, zIndex } from '../../system/tokens/tokens';
import { useCMSData } from '../../providers/CMSDataProvider';

// Styled components for navigation layout
const LogoContainer = styled.div`
  flex-shrink: 0;
`;

const Spacer = styled.div`
  flex: 1;
`;

const RightSideContainer = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: ${spacing.xl};
`;

const NavigationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xl};
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.lg};
`;

// Mobile menu overlay with flexbox positioning
const MobileMenuOverlay = styled(FlexboxContainer)`
  position: absolute;
  top: 100%;
  right: 0;
  width: 280px;
  background: ${colors.background.primary};
  border: 1px solid ${colors.border.default};
  border-radius: 0.5rem;
  padding: ${spacing.md};
  box-shadow: ${shadows.lg};
  z-index: ${zIndex.dropdown};
  margin-top: ${spacing.sm};
  flex-direction: column;
  align-items: stretch;
`;

const MobileMenuButton = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
<line x1="3" y1="6" x2="21" y2="6"></line>
<line x1="3" y1="12" x2="21" y2="12"></line>
<line x1="3" y1="18" x2="21" y2="18"></line>
</svg>;

// Hook to detect window size
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size immediately
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export interface NavigationItem {
  name: string;
  href: string;
  current: boolean;
}

export interface BaseNavigationProps {
  logo: React.ReactNode;
  navigationItems: NavigationItem[];
  actions?: React.ReactNode;
  mobileActions?: React.ReactNode;
  dataTestIdPrefix?: string;
  editableFieldPrefix?: string;
  width?: string;
}

export const BaseNavigation: React.FC<BaseNavigationProps> = ({
  logo,
  navigationItems,
  actions,
  mobileActions,
  dataTestIdPrefix = 'nav',
  editableFieldPrefix = 'navigation',
}) => {
  // Get CMS data from provider
  const { cmsData: allCmsData } = useCMSData();
  const cmsData = allCmsData?.navigation || {};
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { width: containerWidth } = useWindowSize();
  const [isMobile, setIsMobile] = useState(false);
  
  // Use both width detection and CSS media query for reliability
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkMobile = () => {
      const widthCheck = containerWidth < 768;
      const mediaQueryCheck = window.matchMedia('(max-width: 767px)').matches;
      setIsMobile(widthCheck || mediaQueryCheck);
    };
    
    checkMobile();
    
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    mediaQuery.addEventListener('change', checkMobile);
    
    return () => mediaQuery.removeEventListener('change', checkMobile);
  }, [containerWidth]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <PositionedContainer
      position="relative"
      zIndex={zIndex.dropdown}
      display="flex"
      flexDirection="row"
      alignItems="center"
      data-testid={`${dataTestIdPrefix}-container`}
      gap={{ xs: spacing.md, md: spacing.xl }}
      backgroundColor="white"
      padding={`0 ${spacing.xl}`}
      width="100%"
    >
      {/* Logo - Takes minimal space */}
      <LogoContainer>
        {logo}
      </LogoContainer>

      {/* Spacer to push everything to the right */}
      <Spacer />

      {/* Right side - Navigation and Actions grouped together */}
      <RightSideContainer>
        {/* Desktop Navigation */}
        {!isMobile && (
          <NavigationContainer>
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                data-testid={`${dataTestIdPrefix}-desktop-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Text
                  variant={item.current ? 'body' : 'body'}
                  weight={item.current ? 'semibold' : 'medium'}
                  size="md"
                >
                  {cmsData?.[`${editableFieldPrefix}.${item.name.toLowerCase().replace(/\s+/g, '-')}`] || item.name}
                </Text>
              </Link>
            ))}
          </NavigationContainer>
        )}

        {/* Desktop Actions */}
        {!isMobile && actions && (
          <ActionsContainer>
            {Array.isArray(actions) 
              ? actions.map((action, index) => (
                  <React.Fragment key={`action-${index}`}>
                    {action}
                  </React.Fragment>
                ))
              : actions
            }
          </ActionsContainer>
        )}
      </RightSideContainer>

      {/* Mobile Menu Button - Only visible on mobile */}
      {isMobile && (
        <Button
          onClick={toggleMobileMenu}
          variant="ghost"
          size="xl"
          data-testid={`${dataTestIdPrefix}-mobile-menu-button`}
          id="navigation-mobile-menu-button"
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
          cmsId="mobile-menu-button"
          
          text="Menu"
        >
          <MobileMenuButton />
        </Button>
      )}

      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <MobileMenuOverlay
          data-testid={`${dataTestIdPrefix}-mobile-menu`}
          id="navigation-mobile-menu"
        >
          {/* Mobile Menu Header with Close Button */}
          <Stack direction="horizontal" justify="space-between" align="center" spacing="sm">
            <Text weight="semibold" size="sm">Menu</Text>
            <Button
              onClick={closeMobileMenu}
              variant="ghost"
              size="sm"
              aria-label="Close mobile menu"
              data-testid={`${dataTestIdPrefix}-mobile-close-button`}
              cmsId="mobile-close-button"
              
              text="✕"
            />
          </Stack>
          
          <Stack spacing="md">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobileMenu}
                data-testid={`${dataTestIdPrefix}-mobile-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <Text
                  variant="body"
                  weight={item.current ? 'semibold' : 'medium'}
                  size="md"
                >
                  {cmsData?.[`${editableFieldPrefix}.${item.name.toLowerCase().replace(/\s+/g, '-')}`] || item.name}
                </Text>
              </Link>
            ))}
          </Stack>
          
          {/* Mobile Actions */}
          {mobileActions && (
            <Stack spacing="sm">
              {Array.isArray(mobileActions) 
                ? mobileActions.map((action, index) => (
                    <React.Fragment key={`mobile-action-${index}`}>
                      {action}
                    </React.Fragment>
                  ))
                : mobileActions
              }
            </Stack>
          )}
        </MobileMenuOverlay>
      )}
    </PositionedContainer>
  );
}; 