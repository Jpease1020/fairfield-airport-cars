'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { PageLayout } from './PageLayout';
import { AdminPageWrapper } from '@/design/page-sections/AdminPageWrapper';

interface RouteBasedLayoutProps {
  children: React.ReactNode;
}

function ClientRouteBasedLayout({ children }: RouteBasedLayoutProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isLoginRoute = pathname === '/admin/login';
  
  // Admin login page gets minimal layout
  if (isLoginRoute) {
    return <>{children}</>;
  }
  
  // Admin pages get AdminPageWrapper
  if (isAdminRoute) {
    return (
      <AdminPageWrapper
        title="Admin Dashboard"
        subtitle="Manage your airport transportation business"
      >
        {children}
      </AdminPageWrapper>
    );
  }
  
  // Customer pages get PageLayout (default)
  return <PageLayout>{children}</PageLayout>;
}

// Server component wrapper
export function RouteBasedLayout({ children }: RouteBasedLayoutProps) {
  return <ClientRouteBasedLayout>{children}</ClientRouteBasedLayout>;
} 