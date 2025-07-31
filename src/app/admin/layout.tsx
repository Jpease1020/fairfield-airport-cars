'use client';

import React from 'react';
import { AdminProvider } from '@/design/components/providers/AdminProvider';
import { EditModeProvider } from '@/design/components/providers/EditModeProvider';

import { usePathname } from 'next/navigation';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Skip admin layout for login page - use minimal layout instead
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return <>{children}</>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <EditModeProvider>
        <AdminLayoutContent>
          {children}
        </AdminLayoutContent>
      </EditModeProvider>
    </AdminProvider>
  );
} 