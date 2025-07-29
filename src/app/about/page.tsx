'use client';

import React from 'react';
import { UnifiedLayout } from '@/components/layout';
import { 
  Section,
  Container,
  Stack,
  H1,
  Text,
  ActionButtonGroup,
  EditableText
} from '@/components/ui';

function AboutPageContent() {
  const ctaActions = [
    {
      label: 'Book Your Ride',
      onClick: () => window.location.href = '/book',
      variant: 'primary' as const
    },
    {
      label: 'Contact Us',
      onClick: () => window.location.href = '/help',
      variant: 'secondary' as const
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <Section variant="brand" padding="xl">
        <Container maxWidth="2xl">
          <Stack spacing="2xl" align="center" gap="md">
            <H1 align="center">
              <EditableText field="about.hero.title" defaultValue="About Fairfield Airport Cars">
                About Fairfield Airport Cars
              </EditableText>
            </H1>
            <Text variant="lead" align="center">
              <EditableText field="about.hero.subtitle" defaultValue="Professional airport transportation services">
                Professional airport transportation services
              </EditableText>
            </Text>
          </Stack>
        </Container>
      </Section>

      {/* Simple Content Section */}
      <Section variant="default" padding="xl">
        <Container maxWidth="2xl">
          <Stack spacing="lg" align="center">
            <Text align="center" size="lg">
              <EditableText field="about.description" defaultValue="We provide reliable, professional airport transportation throughout Fairfield County. Licensed drivers, clean vehicles, on-time service.">
                We provide reliable, professional airport transportation throughout Fairfield County. 
                Licensed drivers, clean vehicles, on-time service.
              </EditableText>
            </Text>
            
            <Text align="center">
              <EditableText field="about.cta.subtitle" defaultValue="Ready to book your ride?">
                Ready to book your ride?
              </EditableText>
            </Text>
            
            <ActionButtonGroup buttons={ctaActions} />
          </Stack>
        </Container>
      </Section>
    </>
  );
}

export default function AboutPage() {
  return (
    <UnifiedLayout layoutType="content">
      <AboutPageContent />
    </UnifiedLayout>
  );
} 