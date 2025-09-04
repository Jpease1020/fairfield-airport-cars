import React from 'react';
import AnalyticsClient from './AnalyticsClient';

// Force dynamic rendering to prevent server-side rendering issues
export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  // Use static metadata since CMS data is loaded in root layout
  return {
    title: 'Analytics - Fairfield Airport Cars',
    description: 'Track user interactions and system performance',
  };
}

export default async function AnalyticsPage() {
  return <AnalyticsClient />;
}