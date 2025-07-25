'use client';

import React from 'react';
import '../standard-layout.css';
import '../globals.css';
import { UniversalLayout } from '@/components/layout/UniversalLayout';
import { LayoutEnforcer } from '@/lib/design-system/LayoutEnforcer';
import { AdminProvider } from '@/components/admin/AdminProvider';
import AdminHamburgerMenu from '@/components/admin/AdminHamburgerMenu';
import { usePathname } from 'next/navigation';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Skip admin layout for login page - use minimal layout instead
  if (pathname === '/admin/login') {
    return (
      <LayoutEnforcer>
        <UniversalLayout layoutType="minimal">
          {children}
        </UniversalLayout>
      </LayoutEnforcer>
    );
  }

  return (
    <LayoutEnforcer>
      <UniversalLayout layoutType="admin">
        {children}
        <AdminHamburgerMenu />
      </UniversalLayout>
    </LayoutEnforcer>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    </AdminProvider>
  );
} 