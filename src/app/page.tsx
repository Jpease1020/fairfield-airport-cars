'use client';

import React from 'react';
import { PageLayout } from '@/design/components';
import { 
  Section,
  Container,
  Stack,
  H1,
  H2,
  Text,
  Button,
  Grid,
  GridItem
} from '@/ui';
import { EditableText } from '@/ui';
import { HeroSection } from '@/design/components/layout/HeroSection';
import { FeatureGrid } from '@/design/components/layout/FeatureGrid';
import { ContactSection } from '@/design/components/layout/ContactSection';

function HomePageContent() {
  const features = [
    {
      icon: "⏰",
      title: "On-Time Service",
      description: "Reliable pickup times with flight tracking"
    },
    {
      icon: "🚙",
      title: "Clean Vehicles",
      description: "Well-maintained, professional fleet"
    },
    {
      icon: "💳",
      title: "Easy Booking",
      description: "Secure online booking and payment"
    },
    {
      icon: "👨‍💼",
      title: "Professional Drivers",
      description: "Licensed, experienced drivers"
    },
    {
      icon: "📱",
      title: "Real-Time Updates",
      description: "Track your ride with live updates"
    },
    {
      icon: "💰",
      title: "Transparent Pricing",
      description: "No hidden fees, clear pricing"
    }
  ];

  const contactMethods = [
    {
      type: 'phone' as const,
      label: 'Call Us',
      value: '(203) 555-0123',
      href: 'tel:+12035550123'
    },
    {
      type: 'email' as const,
      label: 'Email Us',
      value: 'info@fairfieldairportcars.com',
      href: 'mailto:info@fairfieldairportcars.com'
    },
    {
      type: 'text' as const,
      label: 'Text Us',
      value: '(203) 555-0123',
      href: 'sms:+12035550123'
    }
  ];

  const ctaActions = [
    {
      label: 'Book Your Ride',
      onClick: () => window.location.href = '/book',
      variant: 'primary' as const
    },
    {
      label: 'Learn More',
      onClick: () => window.location.href = '/about',
      variant: 'outline' as const
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <HeroSection
        title="Premium Airport Transportation"
        subtitle="Reliable rides to and from Fairfield County airports"
        description="Professional drivers, clean vehicles, and on-time service for all your airport transportation needs."
        primaryAction={{
          label: 'Book Now',
          href: '/book'
        }}
        secondaryAction={{
          label: 'Learn More',
          href: '/about'
        }}
      />

      {/* Features Section */}
      <Section variant="default" padding="xl">
        <Container maxWidth="2xl">
          <Stack spacing="lg" align="center" marginBottom="xl">
            <H2 align="center">
              <EditableText field="home.features.title" defaultValue="Why Choose Fairfield Airport Cars">
                Why Choose Fairfield Airport Cars
              </EditableText>
            </H2>
            <Text variant="lead" align="center">
              <EditableText field="home.features.subtitle" defaultValue="Professional service you can count on">
                Professional service you can count on
              </EditableText>
            </Text>
          </Stack>
          
          <FeatureGrid features={features} columns={3} />
        </Container>
      </Section>

      {/* CTA Section */}
      <Section variant="brand" padding="xl">
        <Container maxWidth="2xl">
          <Stack spacing="lg" align="center">
            <H2 align="center">
              <EditableText field="home.cta.title" defaultValue="Ready to Book Your Ride?">
                Ready to Book Your Ride?
              </EditableText>
            </H2>
            <Text align="center" size="lg">
              <EditableText field="home.cta.subtitle" defaultValue="Get reliable airport transportation today">
                Get reliable airport transportation today
              </EditableText>
            </Text>
            
            <Stack direction="horizontal" spacing="md">
              {ctaActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  size="lg"
                  onClick={action.onClick}
                >
                  <EditableText field={`home.cta.button${index}`} defaultValue={action.label}>
                    {action.label}
                  </EditableText>
                </Button>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Section>

      {/* Contact Section */}
      <ContactSection
        title="Get in Touch"
        subtitle="We're here to help"
        description="Contact us for booking assistance or any questions about our services."
        contactMethods={contactMethods}
        variant="centered"
      />
    </>
  );
}

export default function HomePage() {
  return (
    <PageLayout>
      <HomePageContent />
    </PageLayout>
  );
} 