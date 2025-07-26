/**
 * 🎯 UNIFIED LAYOUT SYSTEM
 * 
 * THE single layout system for ALL pages in the app
 * Combines CMS design control + Universal Layout simplicity
 * 
 * ✅ Works for: Admin, Customer, Content, Marketing, Status pages
 * ✅ Features: CMS color control, consistent spacing, responsive design
 * ✅ Usage: Simple props, no complexity, lightning fast
 */

'use client';

import { ReactNode, useEffect, useState } from 'react';
import { generateCSSVariables } from '@/lib/design';
import { AccessibilityEnhancer } from '@/components/ui/AccessibilityEnhancer';
import { Navigation } from './Navigation';
import { StandardFooter } from './StandardFooter';

interface UnifiedLayoutProps {
  children: ReactNode;
  
  // Page Configuration
  title?: string;
  subtitle?: string;
  description?: string;
  
  // Layout Type (determines structure)
  layoutType?: 'standard' | 'admin' | 'minimal' | 'marketing' | 'content' | 'status';
  
  // Navigation Control
  showNavigation?: boolean;
  showFooter?: boolean;
  
  // Content Structure
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  
  // Visual Style
  variant?: 'default' | 'brand' | 'minimal' | 'elevated';
  centerContent?: boolean;
  
  // Meta
  className?: string;
}

export function UnifiedLayout({
  children,
  title,
  subtitle,
  description,
  layoutType = 'standard',
  showNavigation = true,
  showFooter = true,
  maxWidth = 'xl',
  padding = 'lg',
  variant = 'default',
  centerContent = false,
  className = ''
}: UnifiedLayoutProps) {
  const [cmsReady, setCmsReady] = useState(false);

  // Apply CMS design system
  useEffect(() => {
    const applyCMSDesign = () => {
      try {
        let cmsConfig = {};
        
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('cmsConfig');
          if (stored) {
            try {
              cmsConfig = JSON.parse(stored);
            } catch (e) {
              console.warn('Using default design system');
            }
          }
        }
        
        if (typeof window !== 'undefined') {
          const cssVars = generateCSSVariables(cmsConfig);
          const rootElement = document.documentElement;
          
          Object.entries(cssVars).forEach(([property, value]) => {
            rootElement.style.setProperty(property, String(value));
          });
        }
        
        setCmsReady(true);
      } catch (error) {
        console.warn('CMS design system failed, using defaults');
        setCmsReady(true);
      }
    };

    applyCMSDesign();
  }, []);

  // Layout-specific configurations
  const layoutConfig = {
    standard: { showNav: true, showFooter: true, container: true },
    admin: { showNav: false, showFooter: false, container: true },
    minimal: { showNav: false, showFooter: false, container: false },
    marketing: { showNav: true, showFooter: true, container: true },
    content: { showNav: true, showFooter: true, container: true },
    status: { showNav: true, showFooter: false, container: true }
  };

  const config = layoutConfig[layoutType];
  const shouldShowNav = showNavigation && config.showNav;
  const shouldShowFooter = showFooter && config.showFooter;

  // Container classes
  const containerClasses = [
    config.container && maxWidth !== 'full' ? 'unified-layout-container' : '',
    padding !== 'none' ? `unified-layout-padding-${padding}` : '',
    padding !== 'none' ? `unified-layout-max-width-${maxWidth}` : '',
    centerContent ? 'unified-layout-center' : '',
    className
  ].filter(Boolean).join(' ');

  // Variant-specific styles
  const variantStyles = {
    default: 'unified-layout-default',
    brand: 'unified-layout-brand',
    minimal: 'unified-layout-minimal',
    elevated: 'unified-layout-elevated'
  };

  if (!cmsReady) {
    return (
      <div className="unified-layout-loading">
        <div className="unified-layout-loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className={`unified-layout ${variantStyles[variant]}`}>
      <AccessibilityEnhancer>
        <></>
      </AccessibilityEnhancer>
      
      {/* Navigation */}
      {shouldShowNav && (
        <header className="unified-layout-header">
          <Navigation />
        </header>
      )}

      {/* Page Header */}
      {(title || subtitle || description) && (
        <section className="unified-layout-page-header">
          <div className={containerClasses}>
            <div className="unified-layout-page-header-content">
              {title && (
                <h1 className="unified-layout-page-title">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="unified-layout-page-subtitle">
                  {subtitle}
                </p>
              )}
              {description && (
                <p className="unified-layout-page-description">
                  {description}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main id="main-content" className="unified-layout-main">
        <div className={containerClasses}>
          {children}
        </div>
      </main>

      {/* Footer */}
      {shouldShowFooter && (
        <footer className="unified-layout-footer">
          <StandardFooter />
        </footer>
      )}
    </div>
  );
} 