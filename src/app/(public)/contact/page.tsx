import React from 'react';
import ContactPageContent from './ContactPageContent';

// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'contact' }];
}

// Enable ISR for dynamic content updates
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata() {
  return {
    title: 'Contact Us - Fairfield Airport Cars',
    description: 'Get in touch with Fairfield Airport Car Service for bookings, support, or questions.',
    keywords: 'contact, airport transportation, Fairfield, customer service, booking support',
  };
}

export default function ContactPage() {
  return <ContactPageContent />;
}