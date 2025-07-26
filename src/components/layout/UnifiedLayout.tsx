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
        <section className="bg-gradient-to-b from-blue-50 to-white border-b-2 border-blue-100">
          <div className={containerClasses}>
            <div className="py-16 text-center">
              {title && (
                <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 bg-clip-text text-transparent mb-6 leading-tight">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-xl md:text-2xl text-gray-700 mb-4 font-medium max-w-4xl mx-auto leading-relaxed">
                  {subtitle}
                </p>
              )}
              {description && (
                <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>
        </section>
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