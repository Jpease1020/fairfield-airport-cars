'use client';

import { UnifiedLayout } from '@/components/layout';
import {
  GridSection,
  InfoCard,
  ActionButtonGroup,
  ToastProvider,
  FeatureGrid,
  Container,
  Grid,
  Stack,
  Text,
  H4,
  EditableText,
  EditableHeading
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
        <Container>
          <Stack spacing="lg">
            <EditableHeading field="homepage.hero.title" defaultValue="🎯 Ready to Experience Premium Transportation?">
              Ready to Experience Premium Transportation?
            </EditableHeading>
            <EditableText field="homepage.hero.description" defaultValue="Join thousands of satisfied customers who trust us for reliable airport transportation. Professional drivers, clean vehicles, and on-time service for all your airport travel needs.">
              Join thousands of satisfied customers who trust us for reliable airport transportation. Professional drivers, clean vehicles, and on-time service for all your airport travel needs.
            </EditableText>
          </Stack>
        </Container>
      </GridSection>

      {/* Features Section */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg">
            <EditableHeading field="homepage.features.intro" defaultValue="✨ Why Choose Us?">
              Why Choose Us?
            </EditableHeading>
            <EditableText field="homepage.features.intro" defaultValue="Professional service, reliable transportation, and peace of mind for your airport journey">
              Professional service, reliable transportation, and peace of mind for your airport journey
            </EditableText>
          </Stack>
        </Container>
      </GridSection>

      {/* Final CTA Section */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg">
            <EditableHeading field="homepage.features.professional_service.title" defaultValue="Professional Service">
              Professional Service
            </EditableHeading>
            <EditableText field="homepage.final_cta.professional_service" defaultValue="Experienced drivers with clean, well-maintained vehicles for your comfort and safety">
              Experienced drivers with clean, well-maintained vehicles for your comfort and safety
            </EditableText>
          </Stack>
        </Container>
        
        <Container>
          <Stack spacing="lg">
            <EditableHeading field="homepage.features.reliable_on_time.title" defaultValue="Reliable & On Time">
              Reliable & On Time
            </EditableHeading>
            <EditableText field="homepage.final_cta.reliable_on_time" defaultValue="We understand the importance of punctuality for airport travel and never let you down">
              We understand the importance of punctuality for airport travel and never let you down
            </EditableText>
          </Stack>
        </Container>
        
        <Container>
          <Stack spacing="lg">
            <EditableHeading field="homepage.features.easy_booking.title" defaultValue="Easy Booking">
              Easy Booking
            </EditableHeading>
            <EditableText field="homepage.final_cta.easy_booking" defaultValue="Simple online booking with secure payment processing and instant confirmation">
              Simple online booking with secure payment processing and instant confirmation
            </EditableText>
          </Stack>
        </Container>
      </GridSection>

      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg">
            <EditableHeading field="homepage.cta.title" defaultValue="🚀 Ready to Book Your Ride?">
              Ready to Book Your Ride?
            </EditableHeading>
            <EditableText field="homepage.cta.description" defaultValue="Experience the difference that professional service makes. Get started with your reliable airport transportation today.">
              Experience the difference that professional service makes. Get started with your reliable airport transportation today.
            </EditableText>
          </Stack>
        </Container>
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