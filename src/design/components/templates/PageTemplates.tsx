'use client';

import React from 'react';
import { Container, Stack, Text, H3, LoadingSpinner, CustomerNavigation, CustomerFooter, AdminNavigation, PageHeader } from '@/design/ui';

// ============================================================================
// LAYER 5: PAGE TEMPLATES
// Built on top of Grid + Containers + Page Sections
// ============================================================================

/**
 * Customer Page Template 
 * Complete customer-facing page with navigation and footer
 */
export interface CustomerPageTemplateProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  showFooter?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const CustomerPageTemplate: React.FC<CustomerPageTemplateProps> = ({
  children,
  showNavigation = true,
  showFooter = true,
  maxWidth = 'xl'
}) => {
  return (
    <Container maxWidth="full">
      <Stack spacing="none">
        {/* Navigation */}
        {showNavigation && (
          <Container variant="navigation" as="header">
            <CustomerNavigation />
          </Container>
        )}

        {/* Main Content */}
        <Container as="main" maxWidth={maxWidth}>
          {children}
        </Container>

        {/* Footer */}
        {showFooter && (
          <Container variant="navigation" as="footer">
            <CustomerFooter />
          </Container>
        )}
      </Stack>
    </Container>
  );
};

/**
 * Admin Page Template
 * Complete admin page with navigation, header, and content area
 */
export interface AdminPageTemplateProps {
  children: React.ReactNode;
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  actions?: React.ReactNode[];
  loading?: boolean;
  error?: string | null;
  loadingMessage?: string;
  errorTitle?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const AdminPageTemplate: React.FC<AdminPageTemplateProps> = ({
  children,
  title,
  subtitle,
  actions = [],
  loading = false,
  error = null,
  loadingMessage = 'Loading...',
  errorTitle = 'Error',
  maxWidth = 'full'
}) => {
  // Loading state
  if (loading) {
    return (
      <Container maxWidth="full">
        <Stack spacing="none">
          <AdminNavigation />
          <Container maxWidth={maxWidth}>
            <PageHeader
              title={title}
              subtitle={loadingMessage}
              actions={actions}
            />
            <Container>
              <Stack direction="horizontal" spacing="md" align="center">
                <LoadingSpinner />
                <Text>{loadingMessage}</Text>
              </Stack>
            </Container>
          </Container>
        </Stack>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="full">
        <Stack spacing="none">
          <AdminNavigation />
          <Container maxWidth={maxWidth}>
            <PageHeader
              title={title}
              subtitle="Error occurred"
              actions={actions}
            />
            <Container>
              <H3>{errorTitle}</H3>
              <Text>{error}</Text>
            </Container>
          </Container>
        </Stack>
      </Container>
    );
  }

  // Normal state
  return (
    <Container maxWidth="full">
      <Stack spacing="none">
        <AdminNavigation />
        <Container maxWidth={maxWidth}>
          <PageHeader
            title={title}
            subtitle={subtitle}
            actions={actions}
          />
          {children}
        </Container>
      </Stack>
    </Container>
  );
};

/**
 * Landing Page Template
 * Hero-focused page with sections
 */
export interface LandingPageTemplateProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  showFooter?: boolean;
}

export const LandingPageTemplate: React.FC<LandingPageTemplateProps> = ({
  children,
  showNavigation = true,
  showFooter = true
}) => {
  return (
    <Container maxWidth="full">
      <Stack spacing="none">
        {/* Navigation */}
        {showNavigation && (
          <Container variant="navigation" as="header">
            <CustomerNavigation />
          </Container>
        )}

        {/* Main Content */}
        <Container as="main" maxWidth="full">
          {children}
        </Container>

        {/* Footer */}
        {showFooter && (
          <Container variant="navigation" as="footer">
            <CustomerFooter />
          </Container>
        )}
      </Stack>
    </Container>
  );
};

/**
 * Modal Page Template
 * Lightweight page without navigation/footer
 */
export interface ModalPageTemplateProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const ModalPageTemplate: React.FC<ModalPageTemplateProps> = ({
  children,
  maxWidth = 'md'
}) => {
  return (
    <Container maxWidth={maxWidth}>
      {children}
    </Container>
  );
}; 