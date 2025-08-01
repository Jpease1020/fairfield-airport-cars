'use client';

import React from 'react';
import { Container, Stack } from '@/design/ui';
import { CustomerNavigation } from '@/design/page-sections/CustomerNavigation';
import { Footer } from '@/design/page-sections/Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  showFooter?: boolean;
  variant?: 'customer' | 'standard';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

/**
 * PageLayout - Unified page layout component for consistent page structure
 * 
 * Consolidates CustomerLayout and StandardLayout into a single, configurable component.
 * Provides consistent navigation, main content, and footer structure across the app.
 * 
 * @example
 * ```tsx
 * // Customer layout (default)
 * <PageLayout>
 *   <div>Page content</div>
 * </PageLayout>
 * 
 * // Standard layout with custom options
 * <PageLayout showNavigation={false} showFooter={true} variant="standard">
 *   <div>Page content</div>
 * </PageLayout>
 * ```
 */
export const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  showNavigation = true, 
  showFooter = true,
  variant = 'customer',
  maxWidth = 'full',
  spacing = 'none'
}) => {
  return (
    <>
      {/* Navigation - Full Width */}
      {showNavigation && (
        <Container variant="navigation" as="header" maxWidth="full" margin="none" data-testid="page-layout-navigation">
          {variant === 'customer' ? (
            <CustomerNavigation />
          ) : (
            <CustomerNavigation /> // TODO: Add AdminNavigation when available
          )}
        </Container>
      )}
      
      {/* Main Content */}
      <Container as="main" maxWidth={maxWidth} data-testid="page-layout-main-content">
        {children}
      </Container>
      
      {/* Footer - Full Width */}
      {showFooter && ( 
        <Footer data-testid="page-layout-footer"/>
      )}
    </>
  );
}; 