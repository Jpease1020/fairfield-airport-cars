import React from 'react';
import { 
  Container,
  Stack,
  H1,
  H2,
  Text,
  Button,
  Box
} from '@/ui';
import { cmsFlattenedService } from '@/lib/services/cms-service';

import Link from 'next/link';


// Load CMS data at build time for instant page loads
export async function generateStaticParams() {
  return [{ page: 'help' }];
}

export async function generateMetadata() {
  const helpData = await cmsFlattenedService.getPageContent('help');
  
  return {
    title: helpData?.title || 'Help & FAQs - Fairfield Airport Cars',
    description: helpData?.subtitle || 'Find answers to common questions about our airport transportation service.',
    keywords: 'help, FAQ, airport transportation, booking, cancellation policy, flight tracking',
  };
}

// Get CMS data at build time
async function getCMSData(): Promise<any> {
  try {
    return await cmsFlattenedService.getPageContent('help');
  } catch (error) {
    console.error('Failed to load CMS data at build time:', error);
    return null;
  }
}

function HelpPageContent({ cmsData }: { cmsData: any }) {
  return (
    <>
      {/* Hero Section */}
      <Container maxWidth="full" padding="xl" variant="section" data-testid="help-hero-section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H1 
              align="center" 
              data-testid="title"
              data-cms-id="hero-title"
            >
              {cmsData?.['hero-title'] || 'Help & FAQs'}
            </H1>
            <Text 
              variant="lead" 
              align="center" 
              size="lg"
              data-cms-id="hero-subtitle"
            >
              {cmsData?.['hero-subtitle'] || 'Find answers to common questions about our service'}
            </Text>
          </Stack>
        </Stack>
      </Container>
      
      <Container maxWidth="2xl" data-testid="help-content">
        <Stack spacing="lg" align="center">
          <H2 
            data-cms-id="quick-answers-title"
          >
            {cmsData?.['quick-answers-title'] || 'Quick Answers'}
          </H2>
        </Stack>
        
        <Stack spacing="lg" data-testid="faq-section">
          <Box variant="elevated" padding="lg" data-testid="faq-item-0">
            <Stack spacing="md">
              <H2 
                                  data-cms-id="quick-answers-items-0-question"
              >
                {cmsData?.['quick-answers-items-0-question'] || 'How far in advance should I book?'}
              </H2>
              <Text 
                                  data-cms-id="quick-answers-items-0-answer"
              >
                {cmsData?.['quick-answers-items-0-answer'] || 'We recommend booking at least 24 hours in advance for airport rides.'}
              </Text>
            </Stack>
          </Box>

          <Box variant="elevated" padding="lg" data-testid="faq-item-1">
            <Stack spacing="md">
              <H2 
                                  data-cms-id="quick-answers-items-1-question"
              >
                {cmsData?.['quick-answers-items-1-question'] || 'What is your cancellation policy?'}
              </H2>
              <Text 
                                  data-cms-id="quick-answers-items-1-answer"
              >
                {cmsData?.['quick-answers-items-1-answer'] || 'Cancellations made more than 24 hours before pickup receive a full refund. Cancellations 3-24 hours before receive 50% refund.'}
              </Text>
            </Stack>
          </Box>

          <Box variant="elevated" padding="lg" data-testid="faq-item-2">
            <Stack spacing="md">
              <H2 
                                  data-cms-id="quick-answers-items-2-question"
              >
                {cmsData?.['quick-answers-items-2-question'] || 'Do you track flights?'}
              </H2>
              <Text 
                                  data-cms-id="quick-answers-items-2-answer"
              >
                {cmsData?.['quick-answers-items-2-answer'] || 'Yes, we monitor flight schedules and adjust pickup times accordingly.'}
              </Text>
            </Stack>
          </Box>

          <Box variant="elevated" padding="lg" data-testid="faq-item-3">
            <Stack spacing="md">
              <H2 
                                  data-cms-id="quick-answers-items-3-question"
              >
                {cmsData?.['quick-answers-items-3-question'] || 'What payment methods do you accept?'}
              </H2>
              <Text 
                                  data-cms-id="quick-answers-items-3-answer"
              >
                {cmsData?.['quick-answers-items-3-answer'] || 'All major credit cards, debit cards, and cash payments.'}
              </Text>
            </Stack>
          </Box>
        </Stack>
      </Container>
      
      <Container maxWidth="2xl">
        <Stack spacing="lg" align="center">
          <H2 
            data-cms-id="contact-title"
          >
            {cmsData?.['contact-title'] || 'Need More Help?'}
          </H2>
          <Text 
            variant="lead" 
            align="center"
            data-cms-id="contact-subtitle"
          >
            {cmsData?.['contact-subtitle'] || 'Contact our support team'}
          </Text>
          
          <Stack direction="horizontal" spacing="md" align="center">
                            <Link href="tel:contactsupport">
              <Button
                variant="primary"
                data-cms-id="contact-primary-button"
              >
                {cmsData?.['contact-primary-button'] || 'Call Support'}
              </Button>
            </Link>
            
                            <Link href="mailto:contactsupport">
              <Button
                variant="secondary"
                data-cms-id="contact-secondary-button"
              >
                {cmsData?.['contact-secondary-button'] || 'Email Support'}
              </Button>
            </Link>
            
            <Link href="/book">
              <Button
                variant="outline"
                data-cms-id="contact-tertiary-button"
              >
                {cmsData?.['contact-tertiary-button'] || 'Book a Ride'}
              </Button>
            </Link>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

export default async function HelpPage() {
  // Load CMS data at build time for instant page loads
  const cmsData = await getCMSData();
  
  return <HelpPageContent cmsData={cmsData} />;
}
