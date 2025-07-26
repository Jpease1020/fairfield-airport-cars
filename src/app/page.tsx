'use client';

import { UnifiedLayout } from '@/components/layout';
import {
  GridSection,
  InfoCard,
  ActionButtonGroup,
  ToastProvider,
  FeatureGrid
} from '@/components/ui';

function HomePageContent() {


  const heroActions = [
    {
      label: 'Book Your Ride',
      onClick: () => window.location.href = '/book',
      variant: 'primary' as const,
      icon: '🚗'
    },
    {
      label: 'Learn More',
      onClick: () => window.location.href = '/about',
      variant: 'outline' as const,
      icon: 'ℹ️'
    }
  ];

  const features = [
    {
      icon: "🚗",
      title: "Professional Service",
      description: "Experienced drivers with clean, well-maintained vehicles for your comfort and safety"
    },
    {
      icon: "⏰",
      title: "Reliable & On Time",
      description: "We understand the importance of punctuality for airport travel and never let you down"
    },
    {
      icon: "💳",
      title: "Easy Booking",
      description: "Simple online booking with secure payment processing and instant confirmation"
    }
  ];

  const finalCTAActions = [
    {
      label: 'Book Your Ride Today',
      onClick: () => window.location.href = '/book',
      variant: 'primary' as const,
      icon: '🚀'
    }
  ];

  return (
    <UnifiedLayout 
      layoutType="marketing"
      title="🚗 Premium Airport Transportation"
      subtitle="Reliable, comfortable rides to and from Fairfield Airport with professional drivers"
      description="Experience luxury, reliability, and professional service for all your airport transportation needs."
    >
      {/* Hero Section */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="🎯 Ready to Experience Premium Transportation?"
          description="Join thousands of satisfied customers who trust us for reliable airport transportation. Professional drivers, clean vehicles, and on-time service for all your airport travel needs."
        >
          <ActionButtonGroup buttons={heroActions} />
        </InfoCard>
      </GridSection>

      {/* Features Section */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="✨ Why Choose Us?"
          description="Professional service, reliable transportation, and peace of mind for your airport journey"
        >
          <FeatureGrid features={features} columns={3} />
        </InfoCard>
      </GridSection>

      {/* Final CTA Section */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="🎯 Ready to Book Your Ride?"
          description="Experience the difference that professional service makes. Get started with your reliable airport transportation today."
        >
          <ActionButtonGroup buttons={finalCTAActions} />
        </InfoCard>
      </GridSection>
    </UnifiedLayout>
  );
}

export default function HomePage() {
  return (
    <ToastProvider>
      <HomePageContent />
    </ToastProvider>
  );
}