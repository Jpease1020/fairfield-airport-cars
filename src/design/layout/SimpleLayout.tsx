'use client';

import React from 'react';
import { Container } from '@/ui';
import { CustomerNavigation } from '@/ui';
import { AdminNavigation } from '@/ui';
import { Footer } from '@/ui';

interface SimpleLayoutProps {
  children: React.ReactNode;
  variant?: 'public' | 'customer' | 'admin';
  showNavigation?: boolean;
  showFooter?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

/**
 * SimpleLayout - Unified layout component for all pages
 * 
 * Single layout component that handles all route types:
 * - public: No navigation, no footer (landing pages)
 * - customer: Customer navigation + footer
 * - admin: Admin navigation + footer
 * 
 * @example
 * ```tsx
 * // Public page (landing)
 * <SimpleLayout variant="public">
 *   <div>Landing page content</div>
 * </SimpleLayout>
 * 
 * // Customer page
 * <SimpleLayout variant="customer">
 *   <div>Customer page content</div>
 * </SimpleLayout>
 * 
 * // Admin page
 * <SimpleLayout variant="admin">
 *   <div>Admin page content</div>
 * </SimpleLayout>
 * ```
 */
export const SimpleLayout: React.FC<SimpleLayoutProps> = ({ 
  children, 
  variant = 'customer',
  showNavigation = true, 
  showFooter = true,
  maxWidth = 'full',
}) => {
  // Determine navigation based on variant
  const getNavigation = () => {
    if (!showNavigation) return null;
    
    switch (variant) {
      case 'admin':
        return <AdminNavigation />;
      case 'customer':
      case 'public':
      default:
        return <CustomerNavigation />;
    }
  };

  // Determine footer visibility
  const shouldShowFooter = showFooter && variant !== 'public';

  return (
    <>
      {/* Navigation - Full Width */}
      {getNavigation() && (
        <Container variant="navigation" as="header" maxWidth="full" margin="none" data-testid="layout-navigation">
          {getNavigation()}
        </Container>
      )}
      
      {/* Main Content */}
      <Container as="main" maxWidth={maxWidth} data-testid="layout-main-content">
        {children}
      </Container>
      
      {/* Footer - Full Width */}
      {shouldShowFooter && ( 
        <Footer data-testid="layout-footer"/>
      )}
    </>
  );
}; 