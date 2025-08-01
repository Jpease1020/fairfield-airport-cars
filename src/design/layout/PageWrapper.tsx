'use client';

import React from 'react';
import { AdminNavigation } from '../page-sections/AdminNavigation';
import { LoadingSpinner, Text } from '@/design/ui';
import { Container } from '../layout/containers/Container';
import { Stack } from '../layout/content/Stack';
import { PageHeader } from '../page-sections/PageHeader';
import { Button, EditableText, H3 } from '../ui';

interface ActionItemProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'outline' | 'secondary' | 'ghost';
  icon?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface AdminPageWrapperProps {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  actions?: React.ReactNode[] | ActionItemProps[];
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
  actions = [],
  loading = false,
  error = null,
  loadingMessage = 'Loading...',
  errorTitle = 'Error',
  showNavigation = false, // Default to false since admin layout provides navigation
  maxWidth = 'full',
  children
}) => {
  // Convert action items to React elements if needed
  const actionElements = React.useMemo(() => {
    if (!actions || actions.length === 0) return [];
    
    return actions.map((action, index) => {
      if (React.isValidElement(action)) {
        return action;
      }
      
      const actionItem = action as ActionItemProps;
      return (
        <Button
          key={index}
          variant={actionItem.variant || 'outline'}
          size={actionItem.size || 'md'}
          onClick={actionItem.onClick}
          disabled={actionItem.disabled}
        >
          {actionItem.icon && <span>{actionItem.icon}</span>}
          {actionItem.label}
        </Button>
      );
    });
  }, [actions]);
  // Loading state
  if (loading) {
    return (
      <Container>
        {showNavigation && <AdminNavigation />}
        <PageHeader
          title={title}
          subtitle={loadingMessage}
          actions={actionElements}
        />
        <Container>
          <Stack direction="horizontal" spacing="md" align="center">
            <LoadingSpinner />
            <Text>
              <EditableText field="adminPageWrapper.loadingMessage" defaultValue={loadingMessage}>
                {loadingMessage}
              </EditableText>
            </Text>
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
          actions={actionElements}
        />
        <Container maxWidth={maxWidth}>
          <H3>
            <EditableText field="adminPageWrapper.errorTitle" defaultValue={errorTitle}>
              {errorTitle}
            </EditableText>
          </H3>
          <Text>
            <EditableText field="adminPageWrapper.errorMessage" defaultValue={error}>
              {error}
            </EditableText>
          </Text>
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
        actions={actionElements}
      />
      
      <Container maxWidth={maxWidth}>
        {children}
      </Container>
    </Container>
  );
}; 