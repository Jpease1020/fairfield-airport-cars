'use client';

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
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

function HelpPageContent() {
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();

  return (
    <>
      {/* Hero Section */}
      <Container maxWidth="full" padding="xl" variant="section" data-testid="help-hero-section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H1 
              align="center" 
              data-testid="help-title"
              data-cms-id="pages.help.hero.title"
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.help.hero.title', 'Help & FAQs')}
            </H1>
            <Text 
              variant="lead" 
              align="center" 
              size="lg"
              data-cms-id="pages.help.hero.subtitle"
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.help.hero.subtitle')}
            </Text>
          </Stack>
        </Stack>
      </Container>
      
      <Container maxWidth="2xl" data-testid="help-content">
        <Stack spacing="lg" align="center">
          <H2 
            data-cms-id="pages.help.quickAnswers.title"
            mode={mode}
          >
            {getCMSField(cmsData, 'pages.help.quickAnswers.title')}
          </H2>
        </Stack>
        
        <Stack spacing="lg" data-testid="faq-section">
          <Box variant="elevated" padding="lg" data-testid="faq-item-0">
            <Stack spacing="md">
              <H2 
                                  data-cms-id="pages.help.quickAnswers.items.0.question"
                mode={mode}
              >
                {getCMSField(cmsData, 'pages.help.quickAnswers.items.0.question', 'How far in advance should I book?')}
              </H2>
              <Text 
                                  data-cms-id="pages.help.quickAnswers.items.0.answer"
                mode={mode}
              >
                {getCMSField(cmsData, 'pages.help.quickAnswers.items.0.answer', 'We recommend booking at least 24 hours in advance for airport rides.')}
              </Text>
            </Stack>
          </Box>

          <Box variant="elevated" padding="lg" data-testid="faq-item-1">
            <Stack spacing="md">
              <H2 
                                  data-cms-id="pages.help.quickAnswers.items.1.question"
                mode={mode}
              >
                {getCMSField(cmsData, 'pages.help.quickAnswers.items.1.question', 'What is your cancellation policy?')}
              </H2>
              <Text 
                                  data-cms-id="pages.help.quickAnswers.items.1.answer"
                mode={mode}
              >
                {getCMSField(cmsData, 'pages.help.quickAnswers.items.1.answer', 'Cancellations made more than 24 hours before pickup receive a full refund. Cancellations 3-24 hours before receive 50% refund.')}
              </Text>
            </Stack>
          </Box>

          <Box variant="elevated" padding="lg" data-testid="faq-item-2">
            <Stack spacing="md">
              <H2 
                                  data-cms-id="pages.help.quickAnswers.items.2.question"
                mode={mode}
              >
                {getCMSField(cmsData, 'pages.help.quickAnswers.items.2.question', 'Do you track flights?')}
              </H2>
              <Text 
                                  data-cms-id="pages.help.quickAnswers.items.2.answer"
                mode={mode}
              >
                {getCMSField(cmsData, 'pages.help.quickAnswers.items.2.answer', 'Yes, we monitor flight schedules and adjust pickup times accordingly.')}
              </Text>
            </Stack>
          </Box>

          <Box variant="elevated" padding="lg" data-testid="faq-item-3">
            <Stack spacing="md">
              <H2 
                                  data-cms-id="pages.help.quickAnswers.items.3.question"
                mode={mode}
              >
                {getCMSField(cmsData, 'pages.help.quickAnswers.items.3.question', 'What payment methods do you accept?')}
              </H2>
              <Text 
                                  data-cms-id="pages.help.quickAnswers.items.3.answer"
                mode={mode}
              >
                {getCMSField(cmsData, 'pages.help.quickAnswers.item4.answer', 'All major credit cards, debit cards, and cash payments.')}
              </Text>
            </Stack>
          </Box>
        </Stack>
      </Container>
      
      <Container maxWidth="2xl">
        <Stack spacing="lg" align="center">
          <H2 
            data-cms-id="pages.help.contact.title"
            mode={mode}
          >
            {getCMSField(cmsData, 'pages.help.contact.title', 'Need More Help?')}
          </H2>
          <Text 
            variant="lead" 
            align="center"
            data-cms-id="pages.help.contact.subtitle"
            mode={mode}
          >
            {getCMSField(cmsData, 'pages.help.contact.subtitle', 'Contact our support team')}
          </Text>
          
          <Stack direction="horizontal" spacing="md" align="center">
            <Button
              variant="primary"
              onClick={() => window.location.href = 'tel:+12035550123'}
              data-cms-id="pages.help.contact.primaryButton"
              interactionMode={mode}
            >
              {getCMSField(cmsData, 'pages.help.contact.primaryButton', 'Call Support')}
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => window.location.href = 'mailto:rides@fairfieldairportcars.com'}
              data-cms-id="pages.help.contact.secondaryButton"
              interactionMode={mode}
            >
              {getCMSField(cmsData, 'pages.help.contact.secondaryButton', 'Email Support')}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.href = '/book'}
              data-cms-id="pages.help.contact.tertiaryButton"
              interactionMode={mode}
            >
              {getCMSField(cmsData, 'pages.help.contact.tertiaryButton', 'Book a Ride')}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}

export default function HelpPage() {
  return (
    <HelpPageContent />
  );
}
