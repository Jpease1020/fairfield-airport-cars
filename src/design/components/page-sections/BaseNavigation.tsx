'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Span, EditableText } from '@/design/ui';

// Hook to detect window size
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

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
}

export const BaseNavigation: React.FC<BaseNavigationProps> = ({
  logo,
  navigationItems,
  actions,
  mobileActions,
  dataTestIdPrefix = 'nav',
  editableFieldPrefix = 'navigation'
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { width } = useWindowSize();
  const isMobile = width < 768;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: '1.5rem',
        position: 'relative'
      }}
      data-testid={`${dataTestIdPrefix}-container`}
      id="navigation-container"
    >
      {/* Logo */}
      <div data-testid={`${dataTestIdPrefix}-logo`} id="navigation-logo">
        {logo}
      </div>

      {/* Desktop Navigation - Hidden on mobile */}
      {!isMobile && (
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '0.75rem'
          }}
          data-testid={`${dataTestIdPrefix}-desktop-menu`}
          id="navigation-desktop-menu"
        >
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
        </div>
      )}

      {/* Desktop Actions - Hidden on mobile */}
      {!isMobile && actions && (
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '0.5rem'
          }}
          data-testid={`${dataTestIdPrefix}-desktop-actions`}
          id="navigation-desktop-actions"
        >
          {actions}
        </div>
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
          <Span style={{ fontSize: '1.5rem' }}>☰</Span>
        </Button>
      )}

      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <div 
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.375rem',
            padding: '1rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            zIndex: 50,
            marginTop: '0.5rem'
          }}
          data-testid={`${dataTestIdPrefix}-mobile-menu`}
          id="navigation-mobile-menu"
          role="menu"
        >
          <div 
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
            data-testid={`${dataTestIdPrefix}-mobile-menu-items`}
            id="navigation-mobile-menu-items"
          >
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
          </div>

          {/* Mobile Actions */}
          {mobileActions && (
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '0.5rem',
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
              }}
              data-testid={`${dataTestIdPrefix}-mobile-actions`}
              id="navigation-mobile-actions"
            >
              {mobileActions}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}; 