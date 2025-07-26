import React from 'react';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { PageHeader, PageAction } from './PageHeader';
import { LoadingSpinner } from './LoadingSpinner';
import { Alert } from '@/components/feedback';

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
  showNavigation = true,
  maxWidth = 'full',
  children
}) => {
  const maxWidthClass = {
    'sm': 'max-w-sm',
    'md': 'max-w-2xl',
    'lg': 'max-w-4xl',
    'xl': 'max-w-6xl',
    '2xl': 'max-w-7xl',
    'full': ''
  }[maxWidth];

  // Loading state
  if (loading) {
    return (
      <div className="admin-dashboard">
        {showNavigation && <AdminNavigation />}
        <PageHeader
          title={title}
          subtitle={loadingMessage}
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">{loadingMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="admin-dashboard">
        {showNavigation && <AdminNavigation />}
        <PageHeader
          title={title}
          subtitle="Error occurred"
        />
        <div className={`standard-content ${maxWidthClass} mx-auto`}>
          <Alert variant="error" title={errorTitle}>
            {error}
          </Alert>
        </div>
      </div>
    );
  }

  // Normal state
  return (
    <div className="admin-dashboard bg-bg-secondary">
      {showNavigation && <AdminNavigation />}
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={actions}
      />
      
      <div className={`standard-content ${maxWidthClass} ${maxWidthClass ? 'mx-auto' : ''}`}>
        {children}
      </div>
    </div>
  );
}; 