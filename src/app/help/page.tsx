'use client';

import { UniversalLayout } from '@/components/layout/UniversalLayout';
import { LayoutEnforcer } from '@/lib/design-system/LayoutEnforcer';
import { 
  GridSection,
  InfoCard,
  ToastProvider,
  useToast,
  ActionButtonGroup
} from '@/components/ui';

function HelpPageContent() {
  const { addToast } = useToast();

  const supportActions = [
    {
      label: 'Call Support',
      onClick: () => addToast('info', '📞 24/7 Support: (203) 555-0123'),
      variant: 'primary' as const,
      icon: '📞'
    },
    {
      label: 'Book a Ride',
      onClick: () => window.location.href = '/book',
      variant: 'outline' as const,
      icon: '🚗'
    },
    {
      label: 'Customer Portal',
      onClick: () => window.location.href = '/portal',
      variant: 'outline' as const,
      icon: '🏠'
    }
  ];

  const faqData = [
    {
      id: 1,
      question: "How do I book a ride?",
      answer: "You can book a ride through our online booking system. Simply select your pickup and drop-off locations, choose your date and time, and complete the payment process."
    },
    {
      id: 2,
      question: "What areas do you serve?",
      answer: "We provide transportation services throughout Fairfield County, CT and surrounding areas to all major airports including JFK, LaGuardia, Newark, and Bradley."
    },
    {
      id: 3,
      question: "How much does it cost?",
      answer: "Our rates vary based on distance and destination. You can get an instant quote during the booking process before confirming your reservation."
    },
    {
      id: 4,
      question: "Can I cancel or modify my booking?",
      answer: "Yes, you can cancel or modify your booking up to 2 hours before your scheduled pickup time. Contact us directly or use the manage booking feature."
    },
    {
      id: 5,
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards including Visa, MasterCard, American Express, and Discover. Payment is processed securely through our online system."
    },
    {
      id: 6,
      question: "How do I contact customer support?",
      answer: "You can reach our customer support team by phone, email, or through our contact form. We're available 24/7 for any questions or assistance."
    }
  ];

  return (
    <LayoutEnforcer>
      <UniversalLayout 
        layoutType="standard"
        title="Help Center"
        subtitle="Get answers to frequently asked questions about our airport transportation service"
      >
        {/* Welcome Section */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="👋 How Can We Help You?"
            description="Find answers to common questions or contact our support team"
          >
            <div style={{
              textAlign: 'center',
              padding: 'var(--spacing-lg)'
            }}>
              <p style={{
                fontSize: 'var(--font-size-base)',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--spacing-lg)',
                maxWidth: '600px',
                margin: '0 auto var(--spacing-lg) auto'
              }}>
                We're here to help! Browse our frequently asked questions below or contact our 24/7 support team 
                for immediate assistance with your airport transportation needs.
              </p>
              
              <ActionButtonGroup buttons={supportActions} />
            </div>
          </InfoCard>
        </GridSection>

        {/* FAQ Section */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="❓ Frequently Asked Questions"
            description="Quick answers to the most common questions about our service"
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-lg)',
              padding: 'var(--spacing-md) 0'
            }}>
              {faqData.map((faq) => (
                <div 
                  key={faq.id}
                  style={{
                    padding: 'var(--spacing-lg)',
                    backgroundColor: 'var(--background-secondary)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)',
                    transition: 'box-shadow 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <h3 style={{
                    margin: '0 0 var(--spacing-md) 0',
                    color: 'var(--brand-primary)',
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: '600'
                  }}>
                    {faq.question}
                  </h3>
                  <p style={{
                    margin: 0,
                    color: 'var(--text-primary)',
                    fontSize: 'var(--font-size-base)',
                    lineHeight: '1.6'
                  }}>
                    {faq.answer}
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
            description="Our support team is here to assist you 24/7"
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--spacing-lg)',
              padding: 'var(--spacing-lg) 0'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📞</div>
                <h4 style={{ margin: '0 0 var(--spacing-sm) 0' }}>Phone Support</h4>
                <p style={{ 
                  margin: '0 0 var(--spacing-sm) 0',
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: '600',
                  color: 'var(--brand-primary)'
                }}>
                  (203) 555-0123
                </p>
                <p style={{ 
                  margin: 0,
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)'
                }}>
                  Available 24/7 for immediate assistance
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>💬</div>
                <h4 style={{ margin: '0 0 var(--spacing-sm) 0' }}>Live Chat</h4>
                <p style={{ 
                  margin: '0 0 var(--spacing-sm) 0',
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--text-primary)'
                }}>
                  Coming Soon
                </p>
                <p style={{ 
                  margin: 0,
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)'
                }}>
                  Real-time support chat
                </p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📧</div>
                <h4 style={{ margin: '0 0 var(--spacing-sm) 0' }}>Email Support</h4>
                <p style={{ 
                  margin: '0 0 var(--spacing-sm) 0',
                  fontSize: 'var(--font-size-base)',
                  color: 'var(--text-primary)'
                }}>
                  support@fairfieldairportcars.com
                </p>
                <p style={{ 
                  margin: 0,
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)'
                }}>
                  Response within 2 hours
                </p>
              </div>
            </div>
          </InfoCard>
        </GridSection>

        {/* Emergency Contact */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="🚨 Emergency & Urgent Situations"
            description="For time-sensitive issues and emergencies"
          >
            <div style={{
              textAlign: 'center',
              padding: 'var(--spacing-lg)',
              backgroundColor: 'var(--background-secondary)',
              borderRadius: 'var(--border-radius)',
              border: '2px solid var(--brand-primary)'
            }}>
              <h4 style={{
                margin: '0 0 var(--spacing-md) 0',
                color: 'var(--brand-primary)',
                fontSize: 'var(--font-size-lg)'
              }}>
                🚨 Emergency Hotline
              </h4>
              <p style={{
                margin: '0 0 var(--spacing-md) 0',
                fontSize: 'var(--font-size-xl)',
                fontWeight: '700',
                color: 'var(--text-primary)'
              }}>
                📞 (203) 555-0123
              </p>
              <p style={{
                margin: 0,
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-secondary)'
              }}>
                For flight delays, last-minute changes, or driver location assistance
              </p>
            </div>
          </InfoCard>
        </GridSection>
      </UniversalLayout>
    </LayoutEnforcer>
  );
}

export default function HelpPage() {
  return (
    <ToastProvider>
      <HelpPageContent />
    </ToastProvider>
  );
}
