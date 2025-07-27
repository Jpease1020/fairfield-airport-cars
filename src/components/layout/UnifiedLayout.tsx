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

import React, { ReactNode, useEffect, useState } from 'react';
import { generateCSSVariables } from '@/lib/design';
import { AccessibilityEnhancer } from '@/components/ui/AccessibilityEnhancer';
import { Container, H1, Text } from '@/components/ui';
import { Stack } from '@/components/ui/containers';
import Navigation from './Navigation';
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
    // Temporarily bypass CMS loading to fix the stuck loading issue
    setCmsReady(true);
    
    // TODO: Re-enable CMS design system once import issues are resolved
    // const applyCMSDesign = () => {
    //   try {
    //     let cmsConfig = {};
    //     
    //     if (typeof window !== 'undefined') {
    //       const stored = localStorage.getItem('cmsConfig');
    //       if (stored) {
    //         try {
    //           cmsConfig = JSON.parse(stored);
    //         } catch (e) {
    //           console.warn('Using default design system');
    //         }
    //       }
    //       
    //       if (typeof window !== 'undefined') {
    //         const cssVars = generateCSSVariables(cmsConfig);
    //         const rootElement = document.documentElement;
    //           
    //         Object.entries(cssVars).forEach(([property, value]) => {
    //           rootElement.style.setProperty(property, String(value));
    //         });
    //       }
    //       
    //       setCmsReady(true);
    //     } catch (error) {
    //       console.warn('CMS design system failed, using defaults');
    //       setCmsReady(true);
    //     }
    //   };
    //   
    //   // Apply design system in background
    //   setTimeout(() => {
    //     applyCMSDesign();
    //   }, 100);

    return () => {};
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

  // Temporarily disable loading state to fix the stuck loading issue
  // if (!cmsReady) {
  //   return (
  //     <div >
  //       <div ></div>
  //     </div>
  //   );
  // }

  return (
    <AccessibilityEnhancer>
      <Container>
        {/* Navigation */}
        {shouldShowNav && (
          <header>
            <Navigation />
          </header>
        )}

        {/* Page Header */}
        {(title || subtitle || description) && (
          <section>
            <Container>
              <Container>
                {title && (
                  <H1>
                    {title}
                  </H1>
                )}
                {subtitle && (
                  <Text>
                    {subtitle}
                  </Text>
                )}
                {description && (
                  <Text>
                    {description}
                  </Text>
                )}
              </Container>
            </Container>
          </section>
        )}

        {/* Main Content */}
        <main id="main-content">
          <Container>
            {children}
          </Container>
        </main>

        {/* Footer */}
        {shouldShowFooter && (
          <footer>
            <StandardFooter />
          </footer>
        )}
      </Container>
    </AccessibilityEnhancer>
  );
} 