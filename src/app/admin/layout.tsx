'use client';

import React from 'react';
import '../standard-layout.css';
import '../globals.css';
import { UnifiedLayout } from '@/components/layout';
import { AdminProvider } from '@/components/admin/AdminProvider';
import AdminHamburgerMenu from '@/components/admin/AdminHamburgerMenu';
import { usePathname } from 'next/navigation';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Skip admin layout for login page - use minimal layout instead
  if (pathname === '/admin/login') {
    return (
      <UnifiedLayout layoutType="minimal">
        {children}
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout layoutType="admin">
      {children}
      <AdminHamburgerMenu />
    </UnifiedLayout>
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