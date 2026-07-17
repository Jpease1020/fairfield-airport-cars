import React from 'react';
import AdminDashboardClient from './AdminDashboardClient';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'admin' }];
}

// Enable ISR for dynamic content updates
export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return {
    title: 'Admin Dashboard - Fairfield Airport Cars',
    description: 'Manage your airport transportation business',
  };
}

export default async function AdminDashboardPage() {
  return <AdminDashboardClient />;
} 