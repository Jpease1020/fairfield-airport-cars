import React from 'react';
import BookPageClient from './BookPageClient';

// Force dynamic rendering to prevent server-side rendering issues
export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return {
    title: 'Book Your Ride - Fairfield Airport Cars',
    description: 'Book your airport transportation with ease',
  };
}

export default function BookPage() {
  return <BookPageClient />;
}
