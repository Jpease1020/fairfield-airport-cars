import React from 'react';
import { ToastProvider } from '@/ui';
import { cmsFlattenedService } from '@/lib/services/cms-service';
import DashboardClient from './DashboardClient';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'dashboard' }];
}

export async function generateMetadata() {
  const dashboardData = await cmsFlattenedService.getPageContent('dashboard');
  
  return {
    title: dashboardData?.title || 'Dashboard - Fairfield Airport Cars',
    description: dashboardData?.subtitle || 'Welcome to your airport transportation dashboard',
  };
}

// Get CMS data at build time
async function getCMSData(): Promise<any> {
  try {
    return await cmsFlattenedService.getPageContent('dashboard');
  } catch (error) {
    console.error('Failed to load CMS data at build time:', error);
    return null;
  }
}

export default async function DashboardPage() {
  const cmsData = await getCMSData();
  
  return (
    <ToastProvider>
      <DashboardClient cmsData={cmsData} />
    </ToastProvider>
  );
}
