import React from 'react';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { PageHeader } from '@/components/layout/structure/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Container, Text, H3 } from '@/components/ui';
import { Stack } from '@/components/ui/containers';

interface AdminPageWrapperProps {
  title: string;
  subtitle?: string;
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
          <H3>{errorTitle}</H3>
          <Text>{error}</Text>
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
      />
      
      <Container maxWidth={maxWidth}>
        {children}
      </Container>
    </Container>
  );
}; 