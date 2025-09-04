import React from 'react';
import PrivacyPageContent from './PrivacyPageContent';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'privacy' }];
}

export async function generateMetadata() {
  return {
    title: 'Privacy Policy - Fairfield Airport Cars',
    description: 'Privacy policy for Fairfield Airport Car Service - how we collect, use, and protect your information.',
    keywords: 'privacy policy, data protection, airport transportation, Fairfield, personal information',
  };
}

export default function PrivacyPage() {
  return <PrivacyPageContent />;
}