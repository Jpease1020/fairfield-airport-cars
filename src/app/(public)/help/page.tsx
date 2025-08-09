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
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';

function HelpPageContent() {
  const { cmsData } = useCMSData();
  const quickAnswers = [
    {
      question: "How far in advance should I book?",
      answer: "Book at least 24 hours in advance, especially during peak travel seasons."
    },
    {
      question: "Can I cancel my booking?",
      answer: "Yes, cancel up to 4 hours before pickup for a full refund."
    },
    {
      question: "Do you track flights?",
      answer: "Yes, we monitor flight schedules and adjust pickup times accordingly."
    },
    {
      question: "What payment methods do you accept?",
      answer: "All major credit cards, debit cards, and cash payments."
    }
  ];

  const contactActions = [
    {
      field: 'help.contact.primaryButton',
      label: 'Call Support',
      onClick: () => window.location.href = 'tel:+12035550123',
      variant: 'primary' as const
    },
    {
      field: 'help.contact.secondaryButton',
      label: 'Email Support',
      onClick: () => window.location.href = 'mailto:support@fairfieldairportcars.com',
      variant: 'secondary' as const
    },
    {
      field: 'help.contact.tertiaryButton',
      label: 'Book a Ride',
      onClick: () => window.location.href = '/book',
      variant: 'outline' as const
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <Container maxWidth="full" padding="xl" variant="section" data-testid="help-hero-section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H1 align="center" data-testid="help-title">
              {getCMSField(cmsData, 'help.hero.title', 'Help & Support')}
            </H1>
            <Text variant="lead" align="center" size="lg">
              {getCMSField(cmsData, 'help.hero.subtitle', 'Quick answers and support')}
            </Text>
          </Stack>
        </Stack>
      </Container>
      
        <Container maxWidth="2xl" data-testid="help-content">
          <Stack spacing="lg" align="center">
            <H2>
              {getCMSField(cmsData, 'help.quickAnswers.title', 'Quick Answers')}
            </H2>
          </Stack>
          
          <Stack spacing="lg" data-testid="faq-section">
            {quickAnswers.map((item, index) => (
              <Box key={index} variant="elevated" padding="lg" data-testid={`faq-item-${index}`}>
                <Stack spacing="md">
                  <H2>
                    {getCMSField(cmsData, `help.quickAnswers.${index}.question`, item.question)}
                  </H2>
                  <Text>
                    {getCMSField(cmsData, `help.quickAnswers.${index}.answer`, item.answer)}
                  </Text>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Container>
      
        <Container maxWidth="2xl">
          <Stack spacing="lg" align="center">
            <H2>
              {getCMSField(cmsData, 'help.contact.title', 'Need More Help?')}
            </H2>
            <Text variant="lead" align="center">
              {getCMSField(cmsData, 'help.contact.subtitle', 'Contact our support team')}
            </Text>
            
            <Stack direction="horizontal" spacing="md" align="center">
              {contactActions.map((action, index) => (
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

export default function HelpPage() {
  return (
    
      <HelpPageContent />
    
  );
}
