'use client';

import React from 'react';
import { AdminPageWrapper, AdminProvider, EditModeProvider } from '@/ui';

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <EditModeProvider>
        <AdminPageWrapper
          title="Admin Dashboard"
          subtitle="Manage your airport transportation business"
        >
          {children}
        </AdminPageWrapper>
      </EditModeProvider>
    </AdminProvider>
  );
} 