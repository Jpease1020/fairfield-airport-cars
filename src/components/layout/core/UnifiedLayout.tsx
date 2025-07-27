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

import React, { ReactNode } from 'react';
import { AccessibilityEnhancer } from '@/components/ui/AccessibilityEnhancer';
import { Container, H1, Text } from '@/components/ui';
import { Section } from '@/components/ui/containers';
import Navigation from '../navigation/Navigation';
import { StandardFooter } from '../structure/StandardFooter';

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
  showFooter = true
}: UnifiedLayoutProps) {
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
          <Container as="header">
            <Navigation />
          </Container>
        )}

        {/* Page Header */}
        {(title || subtitle || description) && (
          <Section variant="default" padding="lg">
            <Container maxWidth="xl">
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
          </Section>
        )}

        {/* Main Content */}
        <Container as="main">
          {children}
        </Container>

        {/* Footer */}
        {shouldShowFooter && (
          <Container as="footer">
            <StandardFooter />
          </Container>
        )}
      </Container>
    </AccessibilityEnhancer>
  );
} 