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
    config.container && maxWidth !== 'full' ? 'max-w-7xl mx-auto' : '',
    padding !== 'none' ? `px-${padding === 'sm' ? '4' : padding === 'md' ? '6' : padding === 'lg' ? '8' : '12'}` : '',
    padding !== 'none' ? `py-${padding === 'sm' ? '4' : padding === 'md' ? '6' : padding === 'lg' ? '8' : '12'}` : '',
    centerContent ? 'text-center' : '',
    className
  ].filter(Boolean).join(' ');

  // Variant-specific styles
  const variantStyles = {
    default: 'bg-white',
    brand: 'bg-gradient-to-br from-brand-primary to-brand-secondary text-white',
    minimal: 'bg-gray-50',
    elevated: 'bg-white shadow-lg rounded-lg border'
  };

  if (!cmsReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${variantStyles[variant]}`}>
      <AccessibilityEnhancer>
        <></>
      </AccessibilityEnhancer>
      
      {/* Navigation */}
      {shouldShowNav && (
        <header className="relative z-50">
          <Navigation />
        </header>
      )}

      {/* Page Header */}
      {(title || subtitle || description) && (
        <div className="border-b bg-white/95 backdrop-blur-sm">
          <div className={containerClasses}>
            <div className="py-8">
              {title && (
                <h1 style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  marginBottom: subtitle || description ? 'var(--spacing-sm)' : '0'
                }}>
                  {title}
                </h1>
              )}
              {subtitle && (
                <p style={{
                  fontSize: 'var(--font-size-lg)',
                  color: 'var(--text-secondary)',
                  marginBottom: description ? 'var(--spacing-sm)' : '0'
                }}>
                  {subtitle}
                </p>
              )}
              {description && (
                <p style={{
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--text-muted)',
                  maxWidth: '600px',
                  margin: centerContent ? '0 auto' : '0'
                }}>
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <div className={containerClasses}>
          {children}
        </div>
      </main>

      {/* Footer */}
      {shouldShowFooter && (
        <footer className="mt-auto">
          <StandardFooter />
        </footer>
      )}
    </div>
  );
} 