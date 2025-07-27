'use client';

import React from 'react';
import { UnifiedLayout } from '@/components/layout';
import { 
  GridSection,
  InfoCard,
  FeatureGrid,
  ActionButtonGroup,
  ToastProvider,
  H4,
  Text
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
    <UnifiedLayout 
      layoutType="content"
      title="Help & Support"
      subtitle="Find answers to common questions and get assistance"
      description="Get help with booking, payments, scheduling, and more. Contact our support team for immediate assistance."
    >
      {/* Help Sections */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="🎯 How Can We Help?"
          description="Choose from the topics below or contact us directly"
        >
          <FeatureGrid features={helpSections} columns={3} />
        </InfoCard>
      </GridSection>

      {/* FAQ Section */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="❓ Frequently Asked Questions"
          description="Quick answers to common questions"
        >
          {faqItems.map((item, index) => (
            <React.Fragment key={index}>
              <H4>{item.question}</H4>
              <Text>{item.answer}</Text>
            </React.Fragment>
          ))}
        </InfoCard>
      </GridSection>

      {/* Contact Information */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="📞 Still Need Help?"
          description="Contact our support team for personalized assistance"
        >
          <FeatureGrid 
            features={[
              {
                icon: "📞",
                title: "Phone Support",
                description: "(203) 555-0123 - Available 24/7"
              },
              {
                icon: "✉️",
                title: "Email Support",
                description: "support@fairfieldairportcars.com - Response within 2 hours"
              }
            ]} 
            columns={2} 
          />
          
          <ActionButtonGroup buttons={[
            {
              label: 'Book Your Ride Now',
              onClick: () => window.location.href = '/book',
              variant: 'primary' as const,
              icon: '📅'
            }
          ]} />
        </InfoCard>
      </GridSection>
    </UnifiedLayout>
  );
}

export default function HelpPage() {
  return (
    <ToastProvider>
      <HelpPageContent />
    </ToastProvider>
  );
}
