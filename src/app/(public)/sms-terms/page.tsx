import React from 'react';
import SmsTermsContent from './SmsTermsContent';

export async function generateMetadata() {
  return {
    title: 'SMS Terms & Conditions - Fairfield Airport Cars',
    description: 'SMS terms and conditions for Fairfield Airport Car Service text message alerts and notifications.',
    keywords: 'SMS terms, text message policy, airport transportation, Fairfield, opt-in, opt-out',
  };
}

export default function SmsTermsPage() {
  return <SmsTermsContent />;
}
