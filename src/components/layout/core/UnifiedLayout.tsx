'use client';

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

import React, { ReactNode } from 'react';
import { AccessibilityEnhancer } from '@/components/ui/AccessibilityEnhancer';
import { Container, H1, Text } from '@/components/ui';
import { Section } from '@/components/ui/layout/containers';

interface UnifiedLayoutProps {
  children: ReactNode;
  
  // Page Configuration
  title?: string | ReactNode;
  subtitle?: string | ReactNode;
  description?: string | ReactNode;
  
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
}

export function UnifiedLayout({
  children,
  title,
  subtitle,
  description,
  layoutType = 'standard',
  showNavigation = false, // Temporarily disabled
  showFooter = false, // Temporarily disabled
  maxWidth = 'xl',
  padding = 'lg',
  centerContent = false
}: UnifiedLayoutProps) {
  return (
    <AccessibilityEnhancer>
      <Container maxWidth={maxWidth} padding={padding}>
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
        <Section variant="default" padding="lg">
          <Container maxWidth={maxWidth}>
            {children}
          </Container>
        </Section>
      </Container>
    </AccessibilityEnhancer>
  );
} 