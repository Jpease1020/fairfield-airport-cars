'use client';

import React from 'react';
import { AdminProvider, EditModeProvider } from '@/ui';

interface AdminWrapperProps {
  children: React.ReactNode;
}

/**
 * AdminWrapper - Provides admin-specific providers only
 * 
 * This wrapper only handles admin authentication and edit mode providers.
 * Layout is handled by UnifiedLayout, so this doesn't duplicate layout logic.
 * 
 * @example
 * ```tsx
 * // In admin pages
 * <AdminWrapper>
 *   <div>Admin page content</div>
 * </AdminWrapper>
 * ```
 */
export function AdminWrapper({ children }: AdminWrapperProps) {
  return (
    <AdminProvider>
      <EditModeProvider>
        {children}
      </EditModeProvider>
    </AdminProvider>
  );
} 