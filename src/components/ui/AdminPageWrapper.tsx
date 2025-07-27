import React from 'react';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { PageHeader, PageAction } from './PageHeader';
import { LoadingSpinner } from './LoadingSpinner';
import { Alert } from '@/components/feedback';
import { Container, Text } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

interface AdminPageWrapperProps {
  title: string;
  subtitle?: string;
  actions?: PageAction[];
  loading?: boolean;
  error?: string | null;
  loadingMessage?: string;
  errorTitle?: string;
  showNavigation?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  children: React.ReactNode;
}

export const AdminPageWrapper: React.FC<AdminPageWrapperProps> = ({
  title,
  subtitle,
  actions,
  loading = false,
  error = null,
  loadingMessage = 'Loading...',
  errorTitle = 'Error',
  showNavigation = false, // Default to false since admin layout provides navigation
  maxWidth = 'full',
  children
}) => {
  // Loading state
  if (loading) {
    return (
      <Container>
        {showNavigation && <AdminNavigation />}
        <PageHeader
          title={title}
          subtitle={loadingMessage}
        />
        <Container>
          <Stack direction="horizontal" spacing="md" align="center">
            <LoadingSpinner />
            <Text>{loadingMessage}</Text>
          </Stack>
        </Container>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container>
        {showNavigation && <AdminNavigation />}
        <PageHeader
          title={title}
          subtitle="Error occurred"
        />
        <Container maxWidth={maxWidth}>
          <Alert variant="error" title={errorTitle}>
            {error}
          </Alert>
        </Container>
      </Container>
    );
  }

  // Normal state
  return (
    <Container>
      {showNavigation && <AdminNavigation />}
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={actions}
      />
      
      <Container maxWidth={maxWidth}>
        {children}
      </Container>
    </Container>
  );
}; 