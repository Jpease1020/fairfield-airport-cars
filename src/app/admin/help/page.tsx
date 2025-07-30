'use client';

import React, { useState, useEffect } from 'react';
import { AdminPageWrapper, GridSection, Card, ActionGrid, Container, H3 } from '@/components/ui';
import { EditableText } from '@/design/components/core/layout/EditableSystem';
import { Stack } from '@/components/ui/layout/containers';

function AdminHelpPage() {
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
      onClick: () => window.location.href = '/docs', 
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
          <Card
            key={sectionIndex}
            title={`${section.icon} ${section.title}`}
            description={section.description}
          >
            <Container>
              <H3>
                <EditableText field="admin.help.section.title" defaultValue={section.title}>
                  {section.title}
                </EditableText>
              </H3>
              <EditableText field="admin.help.section.description" defaultValue={section.description}>
                {section.description}
              </EditableText>
            </Container>
            
            <Stack spacing="md">
              {section.items.map((item, index) => (
                <Container key={index}>
                  <EditableText field={`admin.help.question.${index}`} defaultValue={item.question}>
                    {item.question}
                  </EditableText>
                  <EditableText field={`admin.help.answer.${index}`} defaultValue={item.answer}>
                    {item.answer}
                  </EditableText>
                </Container>
              ))}
            </Stack>
          </Card>
        ))}
      </GridSection>

      {/* Additional Resources */}
      <GridSection variant="content" columns={1}>
        <Card
          title="📞 Need More Help?"
          description="If you can't find the answer you're looking for, here are additional resources"
        >
          <Stack spacing="md">
            <Container>
              <EditableText field="admin.help.technical_support" defaultValue="Contact your developer for technical support">
                Contact your developer for technical support
              </EditableText>
            </Container>
            
            <Container>
              <EditableText field="admin.help.business_docs" defaultValue="Check the business documentation in your project files">
                Check the business documentation in your project files
              </EditableText>
            </Container>
            
            <Container>
              <EditableText field="admin.help.cms_settings" defaultValue="Review your CMS settings for configuration options">
                Review your CMS settings for configuration options
              </EditableText>
            </Container>
            
            <Container>
              <EditableText field="admin.help.admin_dashboard" defaultValue="Use the Admin Dashboard to monitor your business metrics">
                Use the Admin Dashboard to monitor your business metrics
              </EditableText>
            </Container>
          </Stack>
        </Card>
      </GridSection>

      {/* Quick Navigation */}
      <GridSection variant="actions" columns={1}>
        <Card
          title="Quick Navigation"
          description="Access common admin functions directly"
        >
          <ActionGrid
            actions={[
              {
                id: 1,
                icon: "📖",
                label: "Manage Bookings",
                onClick: () => window.location.href = '/admin/bookings'
              },
              {
                id: 2,
                icon: "⚙️",
                label: "CMS Settings",
                onClick: () => window.location.href = '/admin/cms'
              },
              {
                id: 3,
                icon: "👨‍💼",
                label: "Driver Management",
                onClick: () => window.location.href = '/admin/drivers'
              },
              {
                id: 4,
                icon: "⭐",
                label: "Customer Feedback",
                onClick: () => window.location.href = '/admin/feedback'
              }
            ]}
          />
        </Card>
      </GridSection>
    </AdminPageWrapper>
  );
}

export default AdminHelpPage;
