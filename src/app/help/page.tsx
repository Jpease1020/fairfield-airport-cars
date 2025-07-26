'use client';

import { UnifiedLayout } from '@/components/layout';
import {
  GridSection,
  InfoCard,
  ToastProvider,
  useToast,
  FeatureGrid
} from '@/components/ui';

function HelpPageContent() {
  const { addToast } = useToast();

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
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-lg)',
            padding: 'var(--spacing-lg) 0'
          }}>
            {faqItems.map((item, index) => (
              <div key={index} style={{
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--border-primary)'
              }}>
                <h4 style={{
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--spacing-sm)',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: '600'
                }}>
                  {item.question}
                </h4>
                <p style={{
                  color: 'var(--text-secondary)',
                  margin: 0,
                  fontSize: 'var(--font-size-sm)',
                  lineHeight: '1.5'
                }}>
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </InfoCard>
      </GridSection>

      {/* Contact Information */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="📞 Still Need Help?"
          description="Contact our support team for personalized assistance"
        >
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-lg)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--spacing-lg)',
              marginBottom: 'var(--spacing-lg)'
            }}>
              <div>
                <h4 style={{ 
                  margin: '0 0 var(--spacing-sm) 0',
                  color: 'var(--text-primary)'
                }}>📞 Phone Support</h4>
                <p style={{ 
                  margin: 0,
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: '600',
                  color: 'var(--brand-primary)'
                }}>
                  (203) 555-0123
                </p>
                <p style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                  margin: 'var(--spacing-xs) 0 0 0'
                }}>
                  Available 24/7
                </p>
              </div>
              
              <div>
                <h4 style={{ 
                  margin: '0 0 var(--spacing-sm) 0',
                  color: 'var(--text-primary)'
                }}>✉️ Email Support</h4>
                <p style={{ 
                  margin: 0,
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--brand-primary)'
                }}>
                  support@fairfieldairportcars.com
                </p>
                <p style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                  margin: 'var(--spacing-xs) 0 0 0'
                }}>
                  Response within 2 hours
                </p>
              </div>
            </div>
            
            <button 
              className="w-full h-12 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              onClick={() => window.location.href = '/book'}
            >
              📅 Book Your Ride Now
            </button>
          </div>
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
