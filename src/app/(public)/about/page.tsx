'use client';

import React from 'react';
import { 
  Container,
  Stack,
  H1,
  Text,
  Button
} from '@/ui';
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';

function AboutPageContent() {
  const { cmsData } = useCMSData();
  const ctaActions = [
    {
      field: 'about.cta.primaryButton',
      label: 'Book Your Ride',
      onClick: () => window.location.href = '/book',
      variant: 'primary' as const
    },
    {
      field: 'about.cta.secondaryButton',
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
            <H1 align="center">
              {getCMSField(cmsData, 'about.hero.title', 'About Fairfield Airport Cars')}
            </H1>
            <Text variant="lead" align="center" size="lg">
              {getCMSField(cmsData, 'about.hero.subtitle', 'Professional airport transportation services')}
            </Text>
          </Stack>
        </Stack>
      </Container>

      {/* Simple Content Section */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="lg" align="center">
          <Text align="center" size="lg">
            {getCMSField(
              cmsData,
              'about.description',
              'We provide reliable, professional airport transportation throughout Fairfield County. Licensed drivers, clean vehicles, on-time service.'
            )}
          </Text>
          
          <Text align="center">
            {getCMSField(cmsData, 'about.cta.subtitle', 'Ready to book your ride?')}
          </Text>
          
          <Stack direction="horizontal" spacing="md" align="center">
            {ctaActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                onClick={action.onClick}
              >
                {getCMSField(cmsData, action.field, action.label)}
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