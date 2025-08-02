'use client';

import React from 'react';
import { 
  Container,
  Stack,
  H1,
  Text,
  Button
} from '@/ui';
import { EditableText, EditableHeading } from '@/ui';

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
      <Container maxWidth="full" padding="xl" variant="section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <EditableHeading field="about.hero.title" defaultValue="About Fairfield Airport Cars" level={1} size="5xl" weight="bold" align="center">
              About Fairfield Airport Cars
            </EditableHeading>
            <EditableText field="about.hero.subtitle" defaultValue="Professional airport transportation services" variant="lead" align="center" size="lg">
              Professional airport transportation services
            </EditableText>
          </Stack>
        </Stack>
      </Container>

      {/* Simple Content Section */}
      <Container maxWidth="2xl" padding="xl">
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
          
          <Stack direction="horizontal" spacing="md" align="center">
            {ctaActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

export default function AboutPage() {
  return (
    
      <AboutPageContent />
    
  );
} 