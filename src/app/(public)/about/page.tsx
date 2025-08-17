'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Container, Stack } from '@/ui';
import { H1, Text, Button } from '@/design/components/base-components/Components';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useAdmin } from '@/design/providers/AdminProvider';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

function AboutPageContent() {
  const router = useRouter();
  const { cmsData } = useCMSData();
  const { isAdmin } = useAdmin();
  const { mode } = useInteractionMode();
  
  // Debug: Log the CMS data structure
  console.log('About page CMS data:', cmsData);
  console.log('Looking for title at path: pages.about.title');
  console.log('Title value:', getCMSField(cmsData, 'pages.about.title', 'FALLBACK TEXT'));
  
  return (
    <>
      {/* Hero Section */}
      <Container maxWidth="full" padding="xl" variant="section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H1 
              align="center" 
              data-cms-id="pages.about.title" 
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.about.title', 'About Fairfield Airport Cars')}
            </H1>
            <Text 
              variant="lead" 
              align="center" 
              size="lg" 
              data-cms-id="pages.about.subtitle" 
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.about.subtitle', 'Professional airport transportation services')}
            </Text>
          </Stack>
        </Stack>
      </Container>

      {/* Main Content Section */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="lg" align="center">
          <Text 
            align="center" 
            size="lg" 
            data-cms-id="pages.about.description" 
            mode={mode}
          >
            {getCMSField(
              cmsData,
              'pages.about.description',
              'We provide reliable, professional airport transportation throughout Fairfield County. Licensed drivers, clean vehicles, on-time service.'
            )}
          </Text>
        </Stack>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="lg" align="center">
          <Text 
            align="center" 
            data-cms-id="pages.about.cta.subtitle" 
            mode={mode}
          >
            {getCMSField(cmsData, 'pages.about.cta.subtitle', 'Ready to book your ride?')}
          </Text>
          
          <Stack direction="horizontal" spacing="md" align="center">
            <Button
              variant="primary"
              cmsKey="pages.about.cta.primaryButton"
              interactionMode={mode}
              onClick={() => router.push('/book')}
            >
              {getCMSField(cmsData, 'pages.about.cta.primaryButton', 'Book Now')}
            </Button>
            
            <Button
              variant="secondary"
              cmsKey="pages.about.cta.secondaryButton"
              interactionMode={mode}
              onClick={() => router.push('/help')}
            >
              {getCMSField(cmsData, 'pages.about.cta.secondaryButton', 'Learn More')}
            </Button>
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