'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Button, Span, EditableText, Stack, Container } from '@/ui';

const MobileMenuOverlay = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  padding: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 50;
  margin-top: 0.5rem;
`;

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
  width = '100%'
}) => {
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
    <nav 
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
          <div data-testid={`${dataTestIdPrefix}-logo`} id="navigation-logo">
            {logo}
          </div>

        {/* Desktop Navigation - Hidden on mobile */}
        {!isMobile && (
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
                  <EditableText field={`${editableFieldPrefix}.${item.name.toLowerCase()}`}>
                    {item.name}
                  </EditableText>
                </Button>
              </Link>
            ))}
          </Stack>
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
            size="lg"
            data-testid={`${dataTestIdPrefix}-mobile-menu-button`}
            id="navigation-mobile-menu-button"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            <Span>☰</Span>
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
            <Stack spacing="sm">
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
                    <EditableText field={`${editableFieldPrefix}.mobile.${item.name.toLowerCase()}`}>
                      {item.name}
                    </EditableText>
                  </Button>
                </Link>
              ))}
            </Stack>

            {/* Mobile Actions */}
            {mobileActions && (
              <Stack spacing="sm" margin="md" padding="md">
                {mobileActions}
              </Stack>
            )}
          </MobileMenuOverlay>
        )}
      </Container>
    </nav>
  );
}; 