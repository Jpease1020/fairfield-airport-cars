import React from 'react';
import { cmsFlattenedService } from '@/lib/services/cms-service';
import HomePageContent from '../components/HomePageUI';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'home' }];
}

// Enable ISR for dynamic content updates
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata() {
  const homeData = await cmsFlattenedService.getPageContent('home');

  return {
    title: homeData?.hero?.title || 'Fairfield Airport Cars - Premium Airport Transportation Service',
    description: homeData?.hero?.description || 'Reliable, comfortable rides to and from Fairfield Airport with professional driver',
    keywords: 'airport transportation, Fairfield, JFK, LGA, EWR, airport shuttle, luxury car service',
  };
}

// Get CMS data at build time
async function getCMSData(): Promise<any> {
  try {
    return await cmsFlattenedService.getPageContent('home');
  } catch (error) {
    console.error('Failed to load CMS data at build time:', error);
    return null;
  }
}

// Main page component
export default async function HomePage() {
  const cmsData = await getCMSData();
  
  return <HomePageContent cmsData={cmsData} />;
} 