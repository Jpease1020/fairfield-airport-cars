import React from 'react';
import { cmsFlattenedService } from '@/lib/services/cms-service';
import AdminHelpClient from './AdminHelpClient';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'admin-help' }];
}

// Enable ISR for dynamic content updates
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata() {
  const helpData = await cmsFlattenedService.getPageContent('admin-help');
  
  return {
    title: helpData?.title || 'Admin Help - Fairfield Airport Cars',
    description: helpData?.subtitle || 'Get help with managing your business',
  };
}

// Get CMS data at build time
async function getCMSData(): Promise<any> {
  try {
    return await cmsFlattenedService.getPageContent('admin-help');
  } catch (error) {
    console.error('Failed to load CMS data at build time:', error);
    return null;
  }
}

export default async function AdminHelpPage() {
  const cmsData = await getCMSData();
  
  return <AdminHelpClient cmsData={cmsData} />;
}
