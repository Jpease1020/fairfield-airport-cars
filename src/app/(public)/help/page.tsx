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
import { EditableText, EditableHeading } from '@/ui';

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
      <Container maxWidth="full" padding="xl" variant="section" data-testid="help-hero-section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <EditableHeading field="help.hero.title" defaultValue="Help & Support" level={1} size="5xl" weight="bold" align="center" data-testid="help-title">
              Help & Support
            </EditableHeading>
            <EditableText field="help.hero.subtitle" defaultValue="Quick answers and support" variant="lead" align="center" size="lg">
              Quick answers and support
            </EditableText>
          </Stack>
        </Stack>
      </Container>
      
        <Container maxWidth="2xl" data-testid="help-content">
          <Stack spacing="lg" align="center">
            <EditableHeading field="help.quickAnswers.title" defaultValue="Quick Answers" level={2} size="4xl" weight="bold">
              Quick Answers
            </EditableHeading>
          </Stack>
          
          <Stack spacing="lg" data-testid="faq-section">
            {quickAnswers.map((item, index) => (
              <Box key={index} variant="elevated" padding="lg" data-testid={`faq-item-${index}`}>
                <Stack spacing="md">
                  <EditableHeading field={`help.quickAnswers.${index}.question`} defaultValue={item.question} level={2} size="xl" weight="semibold">
                    {item.question}
                  </EditableHeading>
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
      
        <Container maxWidth="2xl">
          <Stack spacing="lg" align="center">
            <EditableHeading field="help.contact.title" defaultValue="Need More Help?" level={2} size="4xl" weight="bold">
              Need More Help?
            </EditableHeading>
            <Text variant="lead" align="center">
              <EditableText field="help.contact.subtitle" defaultValue="Contact our support team">
                Contact our support team
              </EditableText>
            </Text>
            
            <Stack direction="horizontal" spacing="md" align="center">
              {contactActions.map((action, index) => (
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

export default function HelpPage() {
  return (
    
      <HelpPageContent />
    
  );
}
