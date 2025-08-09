'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Button } from '../../components/base-components/Button';
import { useCMSData, getCMSField } from '../../providers/CMSDesignProvider';
import { Stack } from '../../layout/framing/Stack';
import { Container } from '../../layout/containers/Container';
import { PositionedContainer } from '../../layout/containers/PositionedContainer';

// Single styled component for mobile menu overlay
const MobileMenuOverlay = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 280px;
  background: white;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  z-index: 50;
  margin-top: 0.5rem;
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
  const { cmsData } = useCMSData();
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
      data-testid={`${dataTestIdPrefix}-container`}
      id="navigation-container"
    >
      <Container maxWidth="full" padding="md" margin="none">
        <Stack 
          direction="horizontal" 
          justify="space-between" 
          align="center" 
          spacing="lg"
        >
          {/* Logo */}
          <PositionedContainer 
            position="relative"
            data-testid={`${dataTestIdPrefix}-logo`} 
            id="navigation-logo"
          >
            {logo}
          </PositionedContainer>

        {/* Desktop Navigation - Hidden on mobile */}
        {!isMobile && (
          <PositionedContainer position="relative" display="flex" alignItems="center" justifyContent="flex-end">
            <Stack direction="horizontal" align="center" spacing="sm">
              {navigationItems.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  data-testid={`${dataTestIdPrefix}-desktop-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  id={`navigation-desktop-link-${index + 1}`}
                >
                  <Button 
                    variant={item.current ? 'primary' : 'ghost'} 
                    size="sm"
                    data-testid={`${dataTestIdPrefix}-desktop-button-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    id={`navigation-desktop-button-${index + 1}`}
                  >
                    {getCMSField(cmsData, `${editableFieldPrefix}.${item.name.toLowerCase()}`, item.name)}
                  </Button>
                </Link>
              ))}
            </Stack>
          </PositionedContainer>
        )}

        {/* Desktop Actions - Hidden on mobile */}
        {!isMobile && actions && (
          <Stack direction="horizontal" align="center" spacing="sm">
            {actions}
          </Stack>
        )}

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
          >
            <MobileMenuButton />
          </Button>
        )}
        </Stack>

        {/* Mobile Menu */}
        {isMobile && mobileMenuOpen && (
          <MobileMenuOverlay
            data-testid={`${dataTestIdPrefix}-mobile-menu`}
            id="navigation-mobile-menu"
            role="menu"
          >
            <Stack spacing="xs">
              {navigationItems.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMobileMenu}
                  data-testid={`${dataTestIdPrefix}-mobile-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                  id={`navigation-mobile-link-${index + 1}`}
                >
                  <Button 
                    variant={item.current ? 'primary' : 'ghost'} 
                    size="sm"
                    fullWidth
                    data-testid={`${dataTestIdPrefix}-mobile-button-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    id={`navigation-mobile-button-${index + 1}`}
                  >
                    {getCMSField(cmsData, `${editableFieldPrefix}.mobile.${item.name.toLowerCase()}`, item.name)}
                  </Button>
                </Link>
              ))}
            </Stack>
          </MobileMenuOverlay>
        )}
      </Container>
    </PositionedContainer>
  );
}; 