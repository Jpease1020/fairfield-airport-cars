import React from 'react';
import { PageLayout } from './PageLayout';
import { AdminLayoutWrapper } from './AdminLayoutWrapper';

interface RouteBasedLayoutProps {
  children: React.ReactNode;
}

// Simplified server component for route-based layout
export function RouteBasedLayout({ children }: RouteBasedLayoutProps) {
  // For now, use PageLayout as default
  // Route detection will be handled by individual page layouts
  return <PageLayout>{children}</PageLayout>;
} 