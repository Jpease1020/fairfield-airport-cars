'use client';

import { UnifiedLayout } from '@/components/layout';
import {
  GridSection,
  ToastProvider,
  Container,
  Stack,
  EditableText,
  EditableHeading,
  ActionButtonGroup
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
      title={<EditableText field="homepage.layout.title" defaultValue="🚗 Premium Airport Transportation">🚗 Premium Airport Transportation</EditableText>}
      subtitle={<EditableText field="homepage.layout.subtitle" defaultValue="Reliable, comfortable rides to and from Fairfield Airport with professional drivers">Reliable, comfortable rides to and from Fairfield Airport with professional drivers</EditableText>}
      description={<EditableText field="homepage.layout.description" defaultValue="Experience luxury, reliability, and professional service for all your airport transportation needs.">Experience luxury, reliability, and professional service for all your airport transportation needs.</EditableText>}
    >
      {/* Hero Section with CTA */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="xl">
            <Stack spacing="lg">
              <EditableHeading field="homepage.hero.title" defaultValue="🎯 Ready to Experience Premium Transportation?">
                Ready to Experience Premium Transportation?
              </EditableHeading>
              <EditableText field="homepage.hero.description" defaultValue="Join thousands of satisfied customers who trust us for reliable airport transportation. Professional drivers, clean vehicles, and on-time service for all your airport travel needs.">
                Join thousands of satisfied customers who trust us for reliable airport transportation. Professional drivers, clean vehicles, and on-time service for all your airport travel needs.
              </EditableText>
            </Stack>
            
            {/* Hero Action Buttons */}
            <ActionButtonGroup
              buttons={heroActions}
              orientation="horizontal"
              spacing="md"
            />
          </Stack>
        </Container>
      </GridSection>

      {/* Features Section */}
      <GridSection variant="content" columns={3}>
        {features.map((feature, index) => (
          <Container key={index}>
            <Stack spacing="md">
              <Container>
                <EditableText field={`homepage.features.${index}.icon`} defaultValue={feature.icon}>
                  {feature.icon}
                </EditableText>
              </Container>
              <EditableHeading field={`homepage.features.${index}.title`} defaultValue={feature.title}>
                {feature.title}
              </EditableHeading>
              <EditableText field={`homepage.features.${index}.description`} defaultValue={feature.description}>
                {feature.description}
              </EditableText>
            </Stack>
          </Container>
        ))}
      </GridSection>

      {/* Final CTA Section */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="xl">
            <Stack spacing="lg">
              <EditableHeading field="homepage.cta.title" defaultValue="🚀 Ready to Book Your Ride?">
                Ready to Book Your Ride?
              </EditableHeading>
              <EditableText field="homepage.cta.description" defaultValue="Experience the difference that professional service makes. Get started with your reliable airport transportation today.">
                Experience the difference that professional service makes. Get started with your reliable airport transportation today.
              </EditableText>
            </Stack>
            
            {/* Final CTA Action Buttons */}
            <ActionButtonGroup
              buttons={finalCTAActions}
              orientation="horizontal"
              spacing="md"
            />
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