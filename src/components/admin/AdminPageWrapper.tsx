'use client';

import React from 'react';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { PageHeader } from '@/components/layout/structure/PageHeader';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Container, Text, H3, EditableText } from '@/components/ui';
import { Stack } from '@/components/ui/layout/containers';
import { ActionItem, ActionItemProps } from '@/components/ui/ActionItem';

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
        <ActionItem
          key={index}
          label={actionItem.label}
          onClick={actionItem.onClick}
          variant={actionItem.variant}
          icon={actionItem.icon}
          disabled={actionItem.disabled}
        />
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