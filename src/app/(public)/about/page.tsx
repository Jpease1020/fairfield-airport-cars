import React from 'react';
import AboutPageContent from './AboutPageContent';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'about' }];
}

export async function generateMetadata() {
  return {
    title: 'About Us - Fairfield Airport Cars',
    description: 'Learn about Fairfield Airport Car Service - your trusted partner for reliable airport transportation.',
    keywords: 'about, airport transportation, Fairfield, professional drivers, reliable service',
  };
}

export default function AboutPage() {
  return <AboutPageContent />;
} 