import React from 'react';
import HelpPageContent from './HelpPageContent';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'help' }];
}

// Enable ISR for dynamic content updates
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata() {
  return {
    title: 'Help & Support - Fairfield Airport Cars',
    description: 'Get help with booking, managing your rides, and finding answers to common questions.',
    keywords: 'help, support, FAQ, airport transportation, Fairfield, customer service',
  };
}

export default function HelpPage() {
  return <HelpPageContent />;
}