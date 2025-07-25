'use client';

import React from 'react';
import '../standard-layout.css';
import '../globals.css';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { AdminProvider } from '@/components/admin/AdminProvider';
import { usePathname } from 'next/navigation';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Skip admin layout for login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="standard-layout admin-layout">
      <AdminNavigation />
      
      <main className="standard-main">
        <div className="standard-content">
          {children}
        </div>
      </main>
    </div>
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