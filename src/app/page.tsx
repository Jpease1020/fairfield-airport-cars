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
  H4
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
            <H4>🎯 Ready to Experience Premium Transportation?</H4>
            <Text>Join thousands of satisfied customers who trust us for reliable airport transportation. Professional drivers, clean vehicles, and on-time service for all your airport travel needs.</Text>
          </Stack>
        </Container>
      </GridSection>

      {/* Features Section */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg">
            <H4>✨ Why Choose Us?</H4>
            <Text>Professional service, reliable transportation, and peace of mind for your airport journey</Text>
          </Stack>
        </Container>
      </GridSection>

      {/* Final CTA Section */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg">
            <H4>Professional Service</H4>
            <Text variant="muted">Experienced drivers with clean, well-maintained vehicles for your comfort and safety</Text>
          </Stack>
        </Container>
      </GridSection>

      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg">
            <H4>Reliable & On Time</H4>
            <Text variant="muted">We understand the importance of punctuality for airport travel and never let you down</Text>
          </Stack>
        </Container>
      </GridSection>

      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg">
            <H4>Easy Booking</H4>
            <Text variant="muted">Simple online booking with secure payment processing and instant confirmation</Text>
          </Stack>
        </Container>
      </GridSection>

      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg">
            <H4>�� Ready to Book Your Ride?</H4>
            <Text>Experience the difference that professional service makes. Get started with your reliable airport transportation today.</Text>
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