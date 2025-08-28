import React from 'react';
import { cmsFlattenedService } from '@/lib/services/cms-service';
import DriversClient from './DriversClient';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'admin-drivers' }];
}

export async function generateMetadata() {
  const driversData = await cmsFlattenedService.getPageContent('admin-drivers');
  
  return {
    title: driversData?.title || 'Driver Management - Fairfield Airport Cars',
    description: driversData?.subtitle || 'Manage your driver status and information',
  };
}

// Get CMS data at build time
async function getCMSData(): Promise<any> {
  try {
    return await cmsFlattenedService.getPageContent('admin-drivers');
  } catch (error) {
    console.error('Failed to load CMS data at build time:', error);
    return null;
  }
}

export default async function DriversPage() {
  const cmsData = await getCMSData();
  
  return <DriversClient cmsData={cmsData} />;
}
