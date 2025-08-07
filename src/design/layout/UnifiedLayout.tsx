'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Container } from './containers/Container';
import { CustomerNavigation } from '../../components/app/CustomerNavigation';
import { Footer } from '../page-sections/Footer';
import { CommentSystem } from '../../components/business';

interface UnifiedLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  showFooter?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

/**
 * UnifiedLayout - Automatically detects route type and applies appropriate layout
 * 
 * Route detection logic:
 * - /admin/* -> skipped (handled by admin layout)
 * - /(customer)/* -> customer layout  
 * - /(public)/* -> public layout
 * - /login, /register, etc. -> public layout
 * 
 * This eliminates the need for individual layout wrappers on each page.
 */
export function UnifiedLayout({ 
  children, 
  showNavigation = true, 
  showFooter = true,
  maxWidth = 'full'
}: UnifiedLayoutProps) {
  const pathname = usePathname();
  
  // Determine layout variant based on route
  const getLayoutVariant = (): 'public' | 'customer' => {
    // Skip admin routes - let admin layout handle them
    if (pathname.startsWith('/admin')) {
      return 'public'; // No navigation, let admin layout handle it
    }
    
    if (pathname.startsWith('/book') || 
        pathname.startsWith('/portal') || 
        pathname.startsWith('/manage') || 
        pathname.startsWith('/status') || 
        pathname.startsWith('/tracking') || 
        pathname.startsWith('/payments') || 
        pathname.startsWith('/profile') || 
        pathname.startsWith('/feedback') || 
        pathname.startsWith('/booking')) {
      return 'customer';
    }
    
    // Default to public for landing pages, login, etc.
    return 'public';
  };

  const variant = getLayoutVariant();

  // Determine navigation based on variant
  const getNavigation = () => {
    if (!showNavigation) return null;
    
    switch (variant) {
      case 'customer':
        return <CustomerNavigation />;
      case 'public':
      default:
        return null; // No navigation for public pages
    }
  };

  // Determine footer visibility
  const shouldShowFooter = showFooter && variant !== 'public';

  return (
    <CommentSystem>
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
    </CommentSystem>
  );
} 