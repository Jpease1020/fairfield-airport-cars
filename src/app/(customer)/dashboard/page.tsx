import React from 'react';
import { ToastProvider } from '@/ui';
import DashboardClient from './DashboardClient';

// Force dynamic rendering to prevent server-side rendering issues
export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return {
    title: 'Dashboard - Fairfield Airport Cars',
    description: 'Welcome to your airport transportation dashboard',
  };
}

export default async function DashboardPage() {
  return (
    <ToastProvider>
      <DashboardClient />
    </ToastProvider>
  );
}
