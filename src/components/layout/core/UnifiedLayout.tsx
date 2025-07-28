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
import styled from 'styled-components';
import { Container, H1, Text, Stack } from '@/components/ui';
import { Section, Layout } from '@/components/ui/layout/containers';
import { StandardHeader } from '../structure/StandardHeader';
import { StandardFooter } from '../structure/StandardFooter';
import { StandardNavigation } from '../structure/StandardNavigation';
import { Logo as LogoImage } from '@/components/icons';
import { spacing, breakpoints } from '@/lib/design-system/tokens';

interface UnifiedLayoutProps {
  children: ReactNode;
  layoutType?: 'marketing' | 'admin' | 'status' | 'content';
  title?: string | ReactNode;
  subtitle?: string | ReactNode;
  description?: string | ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showHeader?: boolean;
  showFooter?: boolean;
  showNavigation?: boolean;
}

// Responsive Layout Container
const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ContentWrapper = styled.div`
  max-width: var(--container-max-width, 1200px);
  margin: 0 auto;
  width: 100%;
  padding: 0 ${spacing.lg};
  
  @media (max-width: ${breakpoints.md}) {
    padding: 0 ${spacing.md};
  }
  
  @media (max-width: ${breakpoints.sm}) {
    padding: 0 ${spacing.sm};
  }
`;

export const UnifiedLayout: React.FC<UnifiedLayoutProps> = ({
  children,
  layoutType = 'content',
  title,
  subtitle,
  description,
  maxWidth = 'xl',
  padding = 'lg',
  showHeader = true,
  showFooter = true,
  showNavigation = true
}) => {
  // Determine header variant based on layout type
  const getHeaderVariant = () => {
    switch (layoutType) {
      case 'marketing':
        return 'brand'; // Blue background for marketing pages
      case 'admin':
        return 'default'; // Clean header for admin
      case 'status':
        return 'default'; // Standard header for status pages
      case 'content':
        return 'default'; // Standard header for content pages
      default:
        return 'default';
    }
  };

  return (
    <LayoutContainer>
      {/* Navigation */}
      {showNavigation && (
        <StandardNavigation 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Book', href: '/book' },
            { label: 'Help', href: '/help' },
            { label: 'About', href: '/about' }
          ]}
          logo={<LogoImage size="sm" width={40} height={40} />}
          brandName="Fairfield Airport Cars"
          ctaButton={{
            label: 'Book Now',
            href: '/book',
            variant: 'primary'
          }}
        />
      )}

      {/* Header Section */}
      {showHeader && (title || subtitle || description) && (
        <Section variant={getHeaderVariant()} padding={padding}>
          <ContentWrapper>
            <Stack spacing="lg">
              {title && <H1>{title}</H1>}
              {subtitle && <Text variant="lead">{subtitle}</Text>}
              {description && <Text>{description}</Text>}
            </Stack>
          </ContentWrapper>
        </Section>
      )}

      {/* Main Content */}
      <MainContent id="main-content">
        {children}
      </MainContent>

      {/* Footer */}
      {showFooter && (
        <StandardFooter />
      )}
    </LayoutContainer>
  );
}; 