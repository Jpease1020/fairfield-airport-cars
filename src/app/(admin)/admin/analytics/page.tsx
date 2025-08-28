import React from 'react';
import { cmsFlattenedService } from '@/lib/services/cms-service';
import AnalyticsClient from './AnalyticsClient';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'admin-analytics' }];
}

export async function generateMetadata() {
  const analyticsData = await cmsFlattenedService.getPageContent('admin-analytics');
  
  return {
    title: analyticsData?.title || 'Analytics - Fairfield Airport Cars',
    description: analyticsData?.subtitle || 'Track user interactions and system performance',
  };
}

// Get CMS data at build time
async function getCMSData(): Promise<any> {
  try {
    return await cmsFlattenedService.getPageContent('admin-analytics');
  } catch (error) {
    console.error('Failed to load CMS data at build time:', error);
    return null;
  }
}

export default async function AnalyticsPage() {
  const cmsData = await getCMSData();
  
  return <AnalyticsClient cmsData={cmsData} />;
} 