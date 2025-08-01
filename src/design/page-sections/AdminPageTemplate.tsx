'use client';

import React from 'react';
import { Container, Stack, Text, LoadingSpinner, AdminNavigation, PageHeader } from '@/design/ui';

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
              title={errorTitle}
              subtitle={error}
              actions={actions}
            />
            <Container>
              <Text color="error">{error}</Text>
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