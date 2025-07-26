'use client';

import { UniversalLayout } from '@/components/layout/UniversalLayout';
import { LayoutEnforcer } from '@/lib/design-system/LayoutEnforcer';
import { 
  GridSection,
  InfoCard,
  ActionButtonGroup,
  ToastProvider,
  useToast,
  FeatureGrid
} from '@/components/ui';

function HomePageContent() {
  const { addToast } = useToast();

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

  // REFACTORED: Using structured feature data for FeatureGrid
  const features = [
    {
      icon: "🚗",
      title: "Professional Service",
      description: "Experienced drivers with clean, well-maintained vehicles"
    },
    {
      icon: "⏰",
      title: "Reliable & On Time",
      description: "We understand the importance of punctuality for airport travel"
    },
    {
      icon: "💳",
      title: "Easy Booking",
      description: "Simple online booking with secure payment processing"
    }
  ];

  const finalCTAActions = [
    {
      label: 'Book Now',
      onClick: () => window.location.href = '/book',
      variant: 'primary' as const,
      icon: '🚀'
    }
  ];

  return (
    <LayoutEnforcer>
      <UniversalLayout 
        layoutType="standard"
        title="Premium Airport Transportation"
        subtitle="Reliable, professional, and luxurious transportation to and from all major airports in the NY and CT area"
      >
        {/* Hero Section */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="🚗 Premium Airport Transportation"
            description="Reliable, comfortable rides to and from Fairfield Airport with professional drivers"
          >
            <div style={{
              textAlign: 'center',
              padding: 'var(--spacing-xl) 0'
            }}>
              <p style={{
                fontSize: 'var(--font-size-lg)',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--spacing-lg)',
                maxWidth: '600px',
                margin: '0 auto var(--spacing-lg) auto'
              }}>
                Experience luxury, reliability, and professional service for all your airport transportation needs.
                Our professional drivers ensure you arrive on time, every time.
              </p>
              
              <ActionButtonGroup buttons={heroActions} />
            </div>
          </InfoCard>
        </GridSection>

        {/* Features Section */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="✨ Why Choose Us?"
            description="Professional service, reliable transportation, and peace of mind for your airport journey"
          >
            {/* REFACTORED: Using FeatureGrid instead of manual CSS grid */}
            <FeatureGrid features={features} columns={3} />
          </InfoCard>
        </GridSection>

        {/* Final CTA Section */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="🎯 Ready to Book Your Ride?"
            description="Get started with your airport transportation booking today"
          >
            <div style={{
              textAlign: 'center',
              padding: 'var(--spacing-lg) 0'
            }}>
              <p style={{
                fontSize: 'var(--font-size-base)',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--spacing-lg)'
              }}>
                Join thousands of satisfied customers who trust us for their airport transportation needs.
                Professional, reliable, and always on time.
              </p>
              
              <ActionButtonGroup buttons={finalCTAActions} />
            </div>
          </InfoCard>
        </GridSection>
      </UniversalLayout>
    </LayoutEnforcer>
  );
}

export default function HomePage() {
  return (
    <ToastProvider>
      <HomePageContent />
    </ToastProvider>
  );
}