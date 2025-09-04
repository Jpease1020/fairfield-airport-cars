import React from 'react';
import AdminHelpClient from './AdminHelpClient';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'admin-help' }];
}

// Enable ISR for dynamic content updates
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata() {
  return {
    title: 'Admin Help - Fairfield Airport Cars',
    description: 'Get help with managing your business',
  };
}

export default async function AdminHelpPage() {
  return <AdminHelpClient />;
}
