import React from 'react';
import { StandardHeader } from '../structure/StandardHeader';
import { StandardFooter } from '../structure/StandardFooter';
import { StandardNavigation } from '../navigation/StandardNavigation';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { Container } from '@/components/ui';

interface UniversalLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  showNavigation?: boolean;
  layoutType?: 'standard' | 'admin' | 'minimal';
  variant?: 'standard' | 'admin' | 'minimal' | 'compact';
}

/**
 * UniversalLayout - Enforces consistent design patterns across ALL pages
 * 
 * This component ensures that every page in the application follows
 * the same design system rules and layout patterns.
 * 
 * Usage:
 * - Standard pages: layoutType="standard" (default)
 * - Admin pages: layoutType="admin" 
 * - Simple pages: layoutType="minimal"
 * 
 * @param layoutType - Controls which navigation and styling theme to use
 * @param title - Page title (shown in header)
 * @param subtitle - Page subtitle (shown in header)
 * @param showHeader - Whether to show the page header section
 * @param showFooter - Whether to show the footer
 * @param showNavigation - Whether to show navigation
 * @param className - Additional CSS classes
 */
export const UniversalLayout: React.FC<UniversalLayoutProps> = ({
  children,
  title,
  subtitle,
  showHeader = true,
  showFooter = true,
  showNavigation = true,
  layoutType = 'standard'
}) => {
  // Determine navigation component based on layout type
  const NavigationComponent = layoutType === 'admin' ? AdminNavigation : StandardNavigation;

  return (
    <Container variant="default">
      {showNavigation && <NavigationComponent />}
      
      <Container variant="main">
        {showHeader && (title || subtitle) && layoutType !== 'minimal' && (
          <StandardHeader title={title || ''} subtitle={subtitle} />
        )}
        
        <Container variant="content">
          {children}
        </Container>
      </Container>
      
      {showFooter && layoutType !== 'admin' && layoutType !== 'minimal' && (
        <StandardFooter />
      )}
    </Container>
  );
}; 