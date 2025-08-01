'use client';

import React from 'react';
import { 
  Section,
  Container,
  Stack,
  H1,
  H2,
  Text,
  ActionButtonGroup,
  Box,
  CustomerLayout
} from '@/ui';
import { EditableText } from '@/ui';

function HelpPageContent() {
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
      label: 'Call Support',
      onClick: () => window.location.href = 'tel:+12035550123',
      variant: 'primary' as const
    },
    {
      label: 'Email Support',
      onClick: () => window.location.href = 'mailto:support@fairfieldairportcars.com',
      variant: 'secondary' as const
    },
    {
      label: 'Book a Ride',
      onClick: () => window.location.href = '/book',
      variant: 'outline' as const
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <Section variant="default" padding="xl" data-testid="help-hero-section">
        <Container maxWidth="2xl">
          <Stack spacing="2xl" align="center">
            <H1 align="center" data-testid="help-title">
              <EditableText field="help.hero.title" defaultValue="Help & Support">
                Help & Support
              </EditableText>
            </H1>
            <Text variant="lead" align="center">
              <EditableText field="help.hero.subtitle" defaultValue="Quick answers and support">
                Quick answers and support
              </EditableText>
            </Text>
          </Stack>
        </Container>
      </Section>

      {/* Quick Answers Section */}
      <Section variant="default" padding="xl" data-testid="help-content">
        <Container maxWidth="2xl">
          <Stack spacing="lg" align="center">
            <H2>
              <EditableText field="help.quickAnswers.title" defaultValue="Quick Answers">
                Quick Answers
              </EditableText>
            </H2>
          </Stack>
          
          <Stack spacing="lg" data-testid="faq-section">
            {quickAnswers.map((item, index) => (
              <Box key={index} variant="elevated" padding="lg" data-testid={`faq-item-${index}`}>
                <Stack spacing="md">
                  <H2 size="md">
                    <EditableText field={`help.quickAnswers.${index}.question`} defaultValue={item.question}>
                      {item.question}
                    </EditableText>
                  </H2>
                  <Text>
                    <EditableText field={`help.quickAnswers.${index}.answer`} defaultValue={item.answer}>
                      {item.answer}
                    </EditableText>
                  </Text>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Container>
      </Section>

      {/* Contact Support Section */}
      <Section variant="default" padding="xl">
        <Container maxWidth="2xl">
          <Stack spacing="lg" align="center">
            <H2>
              <EditableText field="help.contact.title" defaultValue="Need More Help?">
                Need More Help?
              </EditableText>
            </H2>
            <Text variant="lead" align="center">
              <EditableText field="help.contact.subtitle" defaultValue="Contact our support team">
                Contact our support team
              </EditableText>
            </Text>
            
            <ActionButtonGroup buttons={contactActions} spacing="md" />
          </Stack>
        </Container>
      </Section>
    </>
  );
}

export default function HelpPage() {
  return (
    
      <HelpPageContent />
    
  );
}
