'use client';

import { AdminPageWrapper, GridSection, InfoCard, SettingSection, ActionButtonGroup } from '@/components/ui';

const AdminHelpPage = () => {
  const helpSections = [
    {
      title: "Managing Bookings",
      icon: "📖",
      description: "Learn how to handle customer bookings efficiently",
      items: [
        {
          question: "How do I view all upcoming rides?",
          answer: "Go to Admin → Bookings to see all current and upcoming bookings. You can filter by status (pending, confirmed, completed, cancelled)."
        },
        {
          question: "How do I update a booking status?",
          answer: "In the Bookings page, click on any booking to view details. Use the status dropdown to change from 'pending' to 'confirmed', 'completed', or 'cancelled'."
        },
        {
          question: "What happens when I confirm a booking?",
          answer: "The customer receives an SMS and email confirmation with ride details and a calendar invite. The booking status changes to 'confirmed'."
        },
        {
          question: "How do I handle cancellations?",
          answer: "Customers can cancel through their booking link, or you can cancel manually in the admin. Refunds are processed automatically based on your cancellation policy."
        }
      ]
    },
    {
      title: "Content Management (CMS)",
      icon: "⚙️",
      description: "Update your business information and website content",
      items: [
        {
          question: "How do I update my business information?",
          answer: "Go to Admin → CMS → Business Settings to edit your company name, phone, email, address, and hours."
        },
        {
          question: "Can I change the homepage content?",
          answer: "Yes! Go to Admin → CMS → Pages → Homepage to edit the hero section, features, and contact information."
        },
        {
          question: "How do I update pricing?",
          answer: "Go to Admin → CMS → Pricing to set your base fare, per-mile rate, and cancellation policies."
        },
        {
          question: "Can I edit email and SMS templates?",
          answer: "Yes! Go to Admin → CMS → Communication to customize all email and SMS messages sent to customers."
        }
      ]
    },
    {
      title: "Customer Communication",
      icon: "📧",
      description: "Manage automated messages and customer interactions",
      items: [
        {
          question: "What emails do customers receive?",
          answer: "Booking confirmations (with calendar invite), 24-hour reminders, cancellation confirmations, and feedback requests after completed rides."
        },
        {
          question: "What SMS messages are sent?",
          answer: "Booking confirmations, 24-hour reminders, 'on my way' notifications, and feedback requests."
        },
        {
          question: "How do I send a custom message to a customer?",
          answer: "In the Bookings page, click on a booking and use the 'Send Message' feature to send a custom SMS."
        },
        {
          question: "Can I customize the message templates?",
          answer: "Yes! Go to Admin → CMS → Communication to edit all email and SMS templates with your own wording."
        }
      ]
    },
    {
      title: "Payments & Billing",
      icon: "💳",
      description: "Handle payments, refunds, and billing processes",
      items: [
        {
          question: "How do payments work?",
          answer: "Customers pay a 50% deposit when booking. The remaining balance is collected after the ride. All payments are processed through Square."
        },
        {
          question: "How do I handle refunds?",
          answer: "Refunds are processed automatically based on your cancellation policy. Full refunds for >24h cancellations, 50% for 3-24h, no refund for <3h."
        },
        {
          question: "Can customers tip?",
          answer: "Yes! The Square checkout includes tipping options. Tips are automatically added to your earnings."
        },
        {
          question: "How do I view payment history?",
          answer: "Check your Square dashboard for detailed payment history and reports."
        }
      ]
    },
    {
      title: "Technical Support",
      icon: "❓",
      description: "Troubleshooting and technical assistance",
      items: [
        {
          question: "What if the booking form isn't working?",
          answer: "Check that your Google Maps API key is configured in the environment variables. Contact your developer if issues persist."
        },
        {
          question: "How do I reset my admin password?",
          answer: "Contact your developer to reset your Firebase authentication credentials."
        },
        {
          question: "What if SMS/email isn't sending?",
          answer: "Check that Twilio and email credentials are configured in environment variables. Contact your developer for setup assistance."
        },
        {
          question: "How do I backup my data?",
          answer: "All data is stored in Firebase Firestore and automatically backed up. Contact your developer for data export if needed."
        }
      ]
    }
  ];

  const headerActions = [
    { 
      label: 'Print Guide', 
      onClick: () => window.print(), 
      variant: 'outline' as const 
    },
    { 
      label: 'Documentation', 
      href: '/docs', 
      variant: 'outline' as const 
    },
    { 
      label: 'Contact Support', 
      onClick: () => alert('Contact your developer for technical support'), 
      variant: 'primary' as const 
    }
  ];

  return (
    <AdminPageWrapper
      title="Admin Help & Guide"
      subtitle="Everything you need to know about managing your car service business"
      actions={headerActions}
    >
      {/* Help Sections */}
      <GridSection variant="content" columns={2}>
        {helpSections.map((section, sectionIndex) => (
          <InfoCard
            key={sectionIndex}
            title={`${section.icon} ${section.title}`}
            description={section.description}
          >
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              {section.items.map((item, itemIndex) => (
                <div 
                  key={itemIndex} 
                  style={{ 
                    marginBottom: 'var(--spacing-lg)',
                    paddingBottom: 'var(--spacing-md)',
                    borderBottom: itemIndex < section.items.length - 1 ? '1px solid var(--border-color)' : 'none'
                  }}
                >
                  <h4 style={{ 
                    fontWeight: '600',
                    fontSize: 'var(--font-size-sm)',
                    marginBottom: 'var(--spacing-sm)',
                    color: 'var(--text-primary)'
                  }}>
                    {item.question}
                  </h4>
                  <p style={{ 
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5'
                  }}>
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </InfoCard>
        ))}
      </GridSection>

      {/* Additional Resources */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="📞 Need More Help?"
          description="If you can't find the answer you're looking for, here are additional resources"
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--spacing-md)',
            marginTop: 'var(--spacing-md)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--background-secondary)',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ fontSize: 'var(--font-size-xl)' }}>💬</span>
              <span style={{ fontSize: 'var(--font-size-sm)' }}>
                Contact your developer for technical support
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--background-secondary)',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ fontSize: 'var(--font-size-xl)' }}>📄</span>
              <span style={{ fontSize: 'var(--font-size-sm)' }}>
                Check the business documentation in your project files
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--background-secondary)',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ fontSize: 'var(--font-size-xl)' }}>⚙️</span>
              <span style={{ fontSize: 'var(--font-size-sm)' }}>
                Review your CMS settings for configuration options
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--background-secondary)',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ fontSize: 'var(--font-size-xl)' }}>📊</span>
              <span style={{ fontSize: 'var(--font-size-sm)' }}>
                Use the Admin Dashboard to monitor your business metrics
              </span>
            </div>
          </div>
        </InfoCard>
      </GridSection>

      {/* Quick Navigation */}
      <SettingSection
        title="Quick Navigation"
        description="Access common admin functions directly"
        icon="🔗"
      >
        <ActionButtonGroup
          buttons={[
            {
              label: '📖 Manage Bookings',
              onClick: () => window.location.href = '/admin/bookings',
              variant: 'outline' as const,
              icon: '📖'
            },
            {
              label: '⚙️ CMS Settings',
              onClick: () => window.location.href = '/admin/cms',
              variant: 'outline' as const,
              icon: '⚙️'
            },
            {
              label: '🚗 Driver Management',
              onClick: () => window.location.href = '/admin/drivers',
              variant: 'outline' as const,
              icon: '🚗'
            },
            {
              label: '⭐ Customer Feedback',
              onClick: () => window.location.href = '/admin/feedback',
              variant: 'outline' as const,
              icon: '⭐'
            }
          ]}
          orientation="horizontal"
          spacing="md"
        />
      </SettingSection>
    </AdminPageWrapper>
  );
};

export default AdminHelpPage; 