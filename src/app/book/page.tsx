'use client';

import { useState } from 'react';
import { UniversalLayout } from '@/components/layout/UniversalLayout';
import { LayoutEnforcer } from '@/lib/design-system/LayoutEnforcer';
import { 
  GridSection,
  InfoCard,
  StatusMessage,
  ToastProvider,
  useToast,
  FeatureGrid
} from '@/components/ui';
import BookingForm from './booking-form';

function BookPageContent() {
  const { addToast } = useToast();
  const [error, setError] = useState<string | null>(null);

  // REFACTORED: Using structured feature data for FeatureGrid
  const features = [
    {
      icon: "⏰",
      title: "Always On Time",
      description: "We track your flight and traffic to ensure punctual service"
    },
    {
      icon: "🚗",
      title: "Premium Vehicles",
      description: "Clean, comfortable cars with professional drivers"
    },
    {
      icon: "💳",
      title: "Secure Payment",
      description: "Safe and secure online payment processing"
    }
  ];

  return (
    <LayoutEnforcer>
      <UniversalLayout 
        layoutType="standard"
        title="Book Your Airport Transfer"
        subtitle="Reserve your luxury airport transportation with professional drivers"
      >
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="🚗 Book Your Ride"
            description="Complete the form below to reserve your airport transportation"
          >
            <BookingForm />
          </InfoCard>
        </GridSection>

        <GridSection variant="content" columns={1}>
          <InfoCard
            title="✨ Why Choose Us?"
            description="Professional service you can count on"
          >
            {/* REFACTORED: Using FeatureGrid instead of manual grid */}
            <FeatureGrid features={features} columns={3} />
          </InfoCard>
        </GridSection>

        {/* Error Display */}
        {error && (
          <GridSection variant="content" columns={1}>
            <StatusMessage 
              type="error" 
              message={error} 
              onDismiss={() => setError(null)}
            />
          </GridSection>
        )}
      </UniversalLayout>
    </LayoutEnforcer>
  );
}

export default function BookPage() {
  return (
    <ToastProvider>
      <BookPageContent />
    </ToastProvider>
  );
}
