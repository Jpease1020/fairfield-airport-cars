import React from 'react';
import { cmsFlattenedService } from '@/lib/services/cms-service';
import AdminDashboardClient from './AdminDashboardClient';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'admin' }];
}

// Enable ISR for dynamic content updates
export const revalidate = 1800; // Revalidate every 30 minutes (more frequent for admin)

export async function generateMetadata() {
  const adminData = await cmsFlattenedService.getPageContent('admin');
  
  return {
    title: adminData?.title || 'Admin Dashboard - Fairfield Airport Cars',
    description: adminData?.subtitle || 'Manage your airport transportation business',
  };
}

// Get CMS data at build time
async function getCMSData(): Promise<any> {
  try {
    return await cmsFlattenedService.getPageContent('admin');
  } catch (error) {
    console.error('Failed to load CMS data at build time:', error);
    return null;
  }
}

export default async function AdminDashboardPage() {
  const cmsData = await getCMSData();
  
  return <AdminDashboardClient cmsData={cmsData} />;
} 