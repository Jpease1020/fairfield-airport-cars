'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { CustomerNavigation } from './CustomerNavigation';
import { AdminNavigation } from './AdminNavigation';
import { Container } from '@/ui';

export function NavigationManager() {
  const pathname = usePathname();
  
  // Check if we're in admin context
  const isAdminRoute = pathname?.startsWith('/admin');
  
  // Render appropriate navigation based on route
  if (isAdminRoute) {
    return (
      <Container variant="navigation" as="header" maxWidth="full" margin="none" data-testid="layout-navigation" padding="none">
        <AdminNavigation />
      </Container>
    );
  }
  
  // Default to customer navigation for all other routes (home, public, customer)
  return (
    <Container variant="navigation" as="header" maxWidth="full" margin="none" data-testid="layout-navigation" padding="none">
      <CustomerNavigation />
    </Container>
  );
}
