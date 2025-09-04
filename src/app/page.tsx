import React from 'react';
import HomePageContent from '../components/HomePageUI';

export async function generateMetadata() {
  return {
    title: 'Fairfield Airport Cars - Premium Airport Transportation Service',
    description: 'Reliable, comfortable rides to and from Fairfield Airport with professional driver',
    keywords: 'airport transportation, Fairfield, JFK, LGA, EWR, airport shuttle, luxury car service',
  };
}

// Main page component
export default function HomePage() {
  return <HomePageContent />;
} 