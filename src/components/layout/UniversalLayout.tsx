import React from 'react';
import { StandardHeader } from './StandardHeader';
import { StandardFooter } from './StandardFooter';
import { StandardNavigation } from './StandardNavigation';
import { AdminNavigation } from '@/components/admin/AdminNavigation';

interface UniversalLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  showNavigation?: boolean;
  layoutType?: 'standard' | 'admin' | 'minimal';
  className?: string;
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
  layoutType = 'standard',
  className = ''
}) => {
  // Determine navigation component based on layout type
  const NavigationComponent = layoutType === 'admin' ? AdminNavigation : StandardNavigation;
  
  // Determine CSS classes based on layout type
  const layoutClasses = [
    'standard-layout', // All layouts use the base standard-layout class
    layoutType === 'admin' ? 'admin-layout' : '',
    layoutType === 'minimal' ? 'minimal-layout' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={layoutClasses}>
      {showNavigation && <NavigationComponent />}
      
      <main className="standard-main">
        {showHeader && (title || subtitle) && layoutType !== 'minimal' && (
          <StandardHeader title={title} subtitle={subtitle} />
        )}
        
        <div className="standard-content">
          {children}
        </div>
      </main>
      
      {showFooter && layoutType !== 'admin' && layoutType !== 'minimal' && (
        <StandardFooter />
      )}
    </div>
  );
}; 