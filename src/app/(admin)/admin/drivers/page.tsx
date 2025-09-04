import React from 'react';
import DriversClient from './DriversClient';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'admin-drivers' }];
}

// Enable ISR for dynamic content updates
export const revalidate = 1800; // Revalidate every 30 minutes (more frequent for admin)

export async function generateMetadata() {
  return {
    title: 'Driver Management - Fairfield Airport Cars',
    description: 'Manage your driver status and information',
  };
}

export default async function DriversPage() {
  return <DriversClient />;
}
