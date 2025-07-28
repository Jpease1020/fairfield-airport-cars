'use client';

import React from 'react';
import { UnifiedLayout } from '@/components/layout';
import { Stack } from '@/components/ui/layout/containers';
import { EditModeProvider } from '@/components/admin/EditModeProvider';
import { 
  GridSection,
  InfoCard,
  FeatureGrid,
  ActionButtonGroup,
  ToastProvider,
  H4,
  Text,
  EditableText,
  EditableHeading,
  Container,
  Card,
  CardBody,
  Grid,
  Span
} from '@/components/ui';

function HelpPageContent() {
  const helpSections = [
    {
      icon: "📅",
      title: "Booking Help",
      description: "Learn how to book, modify, or cancel your ride"
    },
    {
      icon: "💳",
      title: "Payment Support",
      description: "Get help with payments, refunds, and billing"
    },
    {
      icon: "🚗",
      title: "Service Information",
      description: "Learn about our vehicles, drivers, and service areas"
    },
    {
      icon: "✈️",
      title: "Airport Transportation",
      description: "Specialized airport pickup and drop-off services"
    },
    {
      icon: "📱",
      title: "App Support",
      description: "Help with our mobile app and online booking"
    },
    {
      icon: "🆘",
      title: "Emergency Support",
      description: "24/7 emergency assistance and urgent changes"
    }
  ];

  const faqItems = [
    {
      question: "How far in advance should I book?",
      answer: "We recommend booking at least 24 hours in advance, especially during peak travel seasons."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and cash payments."
    },
    {
      question: "Can I cancel my booking?",
      answer: "Yes, you can cancel up to 4 hours before your scheduled pickup time for a full refund."
    },
    {
      question: "Do you track flights?",
      answer: "Yes, we monitor flight schedules and adjust pickup times accordingly for airport departures."
    }
  ];

  return (
    <EditModeProvider>
      <UnifiedLayout 
        layoutType="content"
        title={<EditableText field="help.layout.title" defaultValue="Help & Support">Help & Support</EditableText>}
        subtitle={<EditableText field="help.layout.subtitle" defaultValue="Find answers to common questions and get assistance">Find answers to common questions and get assistance</EditableText>}
        description={<EditableText field="help.layout.description" defaultValue="Get help with booking, payments, scheduling, and more. Contact our support team for immediate assistance.">Get help with booking, payments, scheduling, and more. Contact our support team for immediate assistance.</EditableText>}
      >
      {/* Help Sections */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="md">
            <EditableHeading level={3} field="help.title" defaultValue="🎯 How Can We Help?">🎯 How Can We Help?</EditableHeading>
            <EditableText field="help.subtitle" defaultValue="Choose from the topics below or contact us directly">Choose from the topics below or contact us directly</EditableText>
            
            <Grid cols={3} gap="lg">
              <Container>
                <Stack spacing="sm">
                  <Span size="xl">📅</Span>
                  <EditableHeading level={4} field="help.sections.booking.title" defaultValue="Booking Help">Booking Help</EditableHeading>
                  <EditableText field="help.sections.booking.description" defaultValue="Learn how to book, modify, or cancel your ride">Learn how to book, modify, or cancel your ride</EditableText>
                </Stack>
              </Container>
              
              <Container>
                <Stack spacing="sm">
                  <Span size="xl">💳</Span>
                  <EditableHeading level={4} field="help.sections.payment.title" defaultValue="Payment Support">Payment Support</EditableHeading>
                  <EditableText field="help.sections.payment.description" defaultValue="Get help with payments, refunds, and billing">Get help with payments, refunds, and billing</EditableText>
                </Stack>
              </Container>
              
              <Container>
                <Stack spacing="sm">
                  <Span size="xl">🚗</Span>
                  <EditableHeading level={4} field="help.sections.service.title" defaultValue="Service Information">Service Information</EditableHeading>
                  <EditableText field="help.sections.service.description" defaultValue="Learn about our vehicles, drivers, and service areas">Learn about our vehicles, drivers, and service areas</EditableText>
                </Stack>
              </Container>
              
              <Container>
                <Stack spacing="sm">
                  <Span size="xl">✈️</Span>
                  <EditableHeading level={4} field="help.sections.airport.title" defaultValue="Airport Transportation">Airport Transportation</EditableHeading>
                  <EditableText field="help.sections.airport.description" defaultValue="Specialized airport pickup and drop-off services">Specialized airport pickup and drop-off services</EditableText>
                </Stack>
              </Container>
              
              <Container>
                <Stack spacing="sm">
                  <Span size="xl">📱</Span>
                  <EditableHeading level={4} field="help.sections.app.title" defaultValue="App Support">App Support</EditableHeading>
                  <EditableText field="help.sections.app.description" defaultValue="Help with our mobile app and online booking">Help with our mobile app and online booking</EditableText>
                </Stack>
              </Container>
              
              <Container>
                <Stack spacing="sm">
                  <Span size="xl">🆘</Span>
                  <EditableHeading level={4} field="help.sections.emergency.title" defaultValue="Emergency Support">Emergency Support</EditableHeading>
                  <EditableText field="help.sections.emergency.description" defaultValue="24/7 emergency assistance and urgent changes">24/7 emergency assistance and urgent changes</EditableText>
                </Stack>
              </Container>
            </Grid>
          </Stack>
        </Container>
      </GridSection>

      {/* FAQ Section */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="md">
            <EditableHeading level={3} field="help.faq.title" defaultValue="❓ Frequently Asked Questions">❓ Frequently Asked Questions</EditableHeading>
            <EditableText field="help.description" defaultValue="Quick answers to common questions">Quick answers to common questions</EditableText>
            
            <Stack spacing="lg">
              <Container>
                <EditableHeading level={4} field="help.faq.advance.title" defaultValue="How far in advance should I book?">How far in advance should I book?</EditableHeading>
                <EditableText field="help.faq.advance.answer" defaultValue="We recommend booking at least 24 hours in advance, especially during peak travel seasons.">We recommend booking at least 24 hours in advance, especially during peak travel seasons.</EditableText>
              </Container>
              
              <Container>
                <EditableHeading level={4} field="help.faq.payment.title" defaultValue="What payment methods do you accept?">What payment methods do you accept?</EditableHeading>
                <EditableText field="help.faq.payment.answer" defaultValue="We accept all major credit cards, debit cards, and cash payments.">We accept all major credit cards, debit cards, and cash payments.</EditableText>
              </Container>
              
              <Container>
                <EditableHeading level={4} field="help.faq.cancel.title" defaultValue="Can I cancel my booking?">Can I cancel my booking?</EditableHeading>
                <EditableText field="help.faq.cancel.answer" defaultValue="Yes, you can cancel up to 4 hours before your scheduled pickup time for a full refund.">Yes, you can cancel up to 4 hours before your scheduled pickup time for a full refund.</EditableText>
              </Container>
              
              <Container>
                <EditableHeading level={4} field="help.faq.flight.title" defaultValue="Do you track flights?">Do you track flights?</EditableHeading>
                <EditableText field="help.faq.flight.answer" defaultValue="Yes, we monitor flight schedules and adjust pickup times accordingly for airport departures.">Yes, we monitor flight schedules and adjust pickup times accordingly for airport departures.</EditableText>
              </Container>
            </Stack>
          </Stack>
        </Container>
      </GridSection>

      {/* Contact Information */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="md">
            <EditableHeading level={3} field="help.contactSection.title" defaultValue="📞 Still Need Help?">📞 Still Need Help?</EditableHeading>
            <EditableText field="help.contactSection.description" defaultValue="Contact our support team for personalized assistance">Contact our support team for personalized assistance</EditableText>
            
            <Grid cols={2} gap="lg">
              <Container>
                <Stack spacing="sm">
                  <Span size="xl">📞</Span>
                  <EditableHeading level={4} field="help.contact.phone.title" defaultValue="Phone Support">Phone Support</EditableHeading>
                  <EditableText field="help.contact.phone.description" defaultValue="(203) 555-0123 - Available 24/7">(203) 555-0123 - Available 24/7</EditableText>
                </Stack>
              </Container>
              
              <Container>
                <Stack spacing="sm">
                  <Span size="xl">✉️</Span>
                  <EditableHeading level={4} field="help.contact.email.title" defaultValue="Email Support">Email Support</EditableHeading>
                  <EditableText field="help.contact.email.description" defaultValue="support@fairfieldairportcars.com - Response within 2 hours">support@fairfieldairportcars.com - Response within 2 hours</EditableText>
                </Stack>
              </Container>
            </Grid>
          </Stack>
        </Container>
      </GridSection>
    </UnifiedLayout>
    </EditModeProvider>
  );
}

export default function HelpPage() {
  return (
    <ToastProvider>
      <HelpPageContent />
    </ToastProvider>
  );
}
