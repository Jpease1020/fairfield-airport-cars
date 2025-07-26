'use client';

import React from 'react';
import { UnifiedLayout } from '@/components/layout';
import {
  GridSection,
  InfoCard,
  ActionButtonGroup,
  ToastProvider,
  FeatureGrid
} from '@/components/ui';

function HelpPageContent() {


  const helpSections = [
    {
      icon: "📞",
      title: "Contact Support",
      description: "Call us at (203) 555-0123 for immediate assistance with your booking"
    },
    {
      icon: "📅",
      title: "Booking Process",
      description: "Learn how to book your ride and what information you'll need"
    },
    {
      icon: "💳",
      title: "Payment & Billing",
      description: "Understand our payment methods and billing process"
    },
    {
      icon: "🚗",
      title: "Service Areas",
      description: "See which airports and areas we serve in Connecticut and New York"
    },
    {
      icon: "⏰",
      title: "Scheduling",
      description: "Best practices for scheduling your airport transportation"
    },
    {
      icon: "❓",
      title: "General Questions",
      description: "Frequently asked questions about our services"
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
              <h4>{item.question}</h4>
              <p>{item.answer}</p>
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
