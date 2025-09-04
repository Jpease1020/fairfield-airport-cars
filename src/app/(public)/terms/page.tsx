import React from 'react';
import TermsPageContent from './TermsPageContent';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'terms' }];
}

// Enable ISR for dynamic content updates
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata() {
  return {
    title: 'Terms of Service - Fairfield Airport Cars',
    description: 'Terms of service for Fairfield Airport Car Service.',
    keywords: 'terms of service, airport transportation, Fairfield, cancellation policy, liability',
  };
}

export default function TermsPage() {
  return <TermsPageContent />;
}