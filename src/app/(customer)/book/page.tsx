import React from 'react';
import { cmsFlattenedService } from '@/lib/services/cms-service';
import BookPageClient from './BookPageClient';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'book' }];
}

// Enable ISR for dynamic content updates
export const revalidate = 1800; // Revalidate every 30 minutes (more frequent for booking)

export async function generateMetadata() {
  const bookData = await cmsFlattenedService.getPageContent('book');
  
  return {
    title: bookData?.title || 'Book Your Ride - Fairfield Airport Cars',
    description: bookData?.subtitle || 'Book your airport transportation with ease',
  };
}

// Get CMS data at build time
async function getCMSData(): Promise<any> {
  try {
    return await cmsFlattenedService.getPageContent('book');
  } catch (error) {
    console.error('Failed to load CMS data at build time:', error);
    return null;
  }
}

export default async function BookPage() {
  const cmsData = await getCMSData();
  
  return <BookPageClient cmsData={cmsData} />;
}
