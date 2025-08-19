'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { CustomerNavigation } from './CustomerNavigation';
import { AdminNavigation } from './AdminNavigation';

export function SmartNavigation() {
  const pathname = usePathname();
  
  // Check if we're in admin context
  const isAdminRoute = pathname?.startsWith('/admin');
  
  // Render appropriate navigation based on context
  if (isAdminRoute) {
    return <AdminNavigation />;
  }
  
  // Default to customer navigation for all other routes
  return <CustomerNavigation />;
}
