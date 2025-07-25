'use client';

import React from 'react';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { AdminProvider } from '@/components/admin/AdminProvider';
import AdminHamburgerMenu from '@/components/admin/AdminHamburgerMenu';
import { usePathname } from 'next/navigation';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Skip admin layout for login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* Top Navigation Bar */}
      <AdminNavigation />
      
      {/* Admin Hamburger Menu */}
      <AdminHamburgerMenu />
      
      {/* Main Content Area */}
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16 lg:pb-0 lg:bg-bg-primary lg:border-r lg:border-border-primary">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {/* Sidebar navigation items will be added here */}
              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Main
                </h3>
              </div>
              <a href="/admin" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-text-primary hover:bg-bg-secondary hover:text-brand-primary">
                <svg className="mr-3 h-5 w-5 text-text-secondary group-hover:text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
                Dashboard
              </a>
              <a href="/admin/bookings" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-text-primary hover:bg-bg-secondary hover:text-brand-primary">
                <svg className="mr-3 h-5 w-5 text-text-secondary group-hover:text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Bookings
              </a>
              <a href="/admin/calendar" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-text-primary hover:bg-bg-secondary hover:text-brand-primary">
                <svg className="mr-3 h-5 w-5 text-text-secondary group-hover:text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendar
              </a>
              
              <div className="px-3 py-2 mt-8">
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Management
                </h3>
              </div>
              <a href="/admin/drivers" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-text-primary hover:bg-bg-secondary hover:text-brand-primary">
                <svg className="mr-3 h-5 w-5 text-text-secondary group-hover:text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Drivers
              </a>
              <a href="/admin/promos" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-text-primary hover:bg-bg-secondary hover:text-brand-primary">
                <svg className="mr-3 h-5 w-5 text-text-secondary group-hover:text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Promos
              </a>
              
              <div className="px-3 py-2 mt-8">
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Analytics
                </h3>
              </div>
              <a href="/admin/analytics" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-text-primary hover:bg-bg-secondary hover:text-brand-primary">
                <svg className="mr-3 h-5 w-5 text-text-secondary group-hover:text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analytics
              </a>
              <a href="/admin/costs" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-text-primary hover:bg-bg-secondary hover:text-brand-primary">
                <svg className="mr-3 h-5 w-5 text-text-secondary group-hover:text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Costs
              </a>
              
              <div className="px-3 py-2 mt-8">
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Content
                </h3>
              </div>
              <a href="/admin/cms" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-text-primary hover:bg-bg-secondary hover:text-brand-primary">
                <svg className="mr-3 h-5 w-5 text-text-secondary group-hover:text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                CMS
              </a>
              <a href="/admin/feedback" className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-text-primary hover:bg-bg-secondary hover:text-brand-primary">
                <svg className="mr-3 h-5 w-5 text-text-secondary group-hover:text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Feedback
              </a>
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
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