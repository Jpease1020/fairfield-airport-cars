'use client';

import React from 'react'; 
import { GridSection, Box, ActionGrid, Container, Text, Stack, H3 } from '@/ui';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

function AdminHelpPage() {
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();
  const helpSections = [
    {
      title: getCMSField(cmsData, 'admin-help-sections-booking-title', 'Booking Management'),
      icon: "📋",
      description: getCMSField(cmsData, 'admin-help-sections-booking-description', 'How to manage bookings and customer requests'),
      items: [
        {
          question: getCMSField(cmsData, 'admin-help-sections-booking-q1-question', 'How do I view all bookings?'),
          answer: getCMSField(cmsData, 'admin-help-sections-booking-q1-answer', 'Go to Admin > Bookings to see all current and past bookings. You can filter by status, date, and customer.')
        },
        {
          question: getCMSField(cmsData, 'admin-help-sections-booking-q2-question', 'How do I assign a driver to a booking?'),
          answer: getCMSField(cmsData, 'admin-help-sections-booking-q2-answer', 'In the Bookings page, click on a booking and use the "Assign Driver" option. You can select from available drivers.')
        },
        {
          question: getCMSField(cmsData, 'admin-help-sections-booking-q3-question', 'What if a customer wants to cancel?'),
          answer: getCMSField(cmsData, 'admin-help-sections-booking-q3-answer', 'Customers can cancel through their dashboard, or you can cancel manually in the Admin > Bookings section.')
        },
        {
          question: getCMSField(cmsData, 'admin-help-sections-booking-q4-question', 'How do I handle no-shows?'),
          answer: getCMSField(cmsData, 'admin-help-sections-booking-q4-answer', 'Mark the booking as "No Show" in the status field. This helps track patterns and adjust policies.')
        }
      ]
    },
    {
      title: getCMSField(cmsData, 'admin-help-sections-driver-title', 'Driver Management'),
      icon: "👨‍💼",
      description: getCMSField(cmsData, 'admin-help-sections-driver-description', 'Managing your driver and availability'),
      items: [
        {
                  question: getCMSField(cmsData, 'admin-help-sections-driver-q1-question', 'How do I update driver information?'),
        answer: getCMSField(cmsData, 'admin-help-sections-driver-q1-answer', 'Go to Admin > Driver and update the driver details and vehicle information.')
        },
        {
                  question: getCMSField(cmsData, 'admin-help-sections-driver-q2-question', 'How do I update driver status?'),
        answer: getCMSField(cmsData, 'admin-help-sections-driver-q2-answer', 'In the Driver page, use the status buttons to set driver as Available, Busy, or Offline.')
        },
        {
                  question: getCMSField(cmsData, 'admin-help-sections-driver-q3-question', 'What if the driver is late?'),
        answer: getCMSField(cmsData, 'admin-help-sections-driver-q3-answer', 'Update the driver status to "Busy" and contact them directly. You can also update the booking status to reflect delays.')
        },
        {
                  question: getCMSField(cmsData, 'admin-help-sections-driver-q4-question', 'How do I track driver performance?'),
        answer: getCMSField(cmsData, 'admin-help-sections-driver-q4-answer', 'View driver ratings and feedback in the Driver page. Monitor completion rates and customer satisfaction.')
        }
      ]
    },
    {
      title: getCMSField(cmsData, 'admin-help-sections-payments-title', 'Payment Processing'),
      icon: "💳",
      description: getCMSField(cmsData, 'admin-help-sections-payments-description', 'Managing payments and financial transactions'),
      items: [
        {
          question: getCMSField(cmsData, 'admin-help-sections-payments-q1-question', 'How do I view payment history?'),
          answer: getCMSField(cmsData, 'admin-help-sections-payments-q1-answer', 'Go to Admin > Payments to see all payment transactions, including successful payments and refunds.')
        },
        {
          question: getCMSField(cmsData, 'admin-help-sections-payments-q2-question', 'What if a payment fails?'),
          answer: getCMSField(cmsData, 'admin-help-sections-payments-q2-answer', 'Failed payments are marked in the system. Contact the customer to update their payment method and retry.')
        },
        {
          question: getCMSField(cmsData, 'admin-help-sections-payments-q3-question', 'How do I process refunds?'),
          answer: getCMSField(cmsData, 'admin-help-sections-payments-q3-answer', 'In the Payments page, find the transaction and use the refund option. Enter the amount and reason for the refund.')
        },
        {
          question: getCMSField(cmsData, 'admin-help-sections-payments-q4-question', 'How do I track revenue?'),
          answer: getCMSField(cmsData, 'admin-help-sections-payments-q4-answer', 'Use the Analytics page to view revenue trends, payment success rates, and financial summaries.')
        }
      ]
    },
    {
      title: getCMSField(cmsData, 'admin-help-sections-technical-title', 'Technical Support'),
      icon: "❓",
      description: getCMSField(cmsData, 'admin-help-sections-technical-description', 'Troubleshooting and technical assistance'),
      items: [
        {
          question: getCMSField(cmsData, 'admin-help-sections-technical-q1-question', 'What if the booking form isn\'t working?'),
          answer: getCMSField(cmsData, 'admin-help-sections-technical-q1-answer', 'Check that your Google Maps API key is configured in the environment variables. Contact your developer if issues persist.')
        },
        {
          question: getCMSField(cmsData, 'admin-help-sections-technical-q2-question', 'How do I reset my admin password?'),
          answer: getCMSField(cmsData, 'admin-help-sections-technical-q2-answer', 'Contact your developer to reset your Firebase authentication credentials.')
        },
        {
          question: getCMSField(cmsData, 'admin-help-sections-technical-q3-question', 'What if SMS/email isn\'t sending?'),
          answer: getCMSField(cmsData, 'admin-help-sections-technical-q3-answer', 'Check that Twilio and email credentials are configured in environment variables. Contact your developer for setup assistance.')
        },
        {
          question: getCMSField(cmsData, 'admin-help-sections-technical-q4-question', 'How do I backup my data?'),
          answer: getCMSField(cmsData, 'admin-help-sections-technical-q4-answer', 'All data is stored in Firebase Firestore and automatically backed up. Contact your developer for data export if needed.')
        }
      ]
    }
  ];

  return (
    <>
      {/* Help Sections */}
      <GridSection variant="content" columns={2}>
        {helpSections.map((section, sectionIndex) => (
          <Box
            key={sectionIndex}
          >
            <Stack spacing="md">
                <Text variant="lead" size="md" weight="semibold" data-cms-id={`admin.help.sections.${sectionIndex}.title`} mode={mode}>
                  {section.icon} {section.title}
                </Text>
                <Text variant="muted" size="sm" data-cms-id={`admin.help.sections.${sectionIndex}.description`} mode={mode}>
                  {section.description}
                </Text>
              </Stack>
            <Container>
              <H3 data-cms-id={`admin.help.sections.${sectionIndex}.sectionTitle`} mode={mode}>
                {getCMSField(cmsData, `admin.help.sections.${sectionIndex}.sectionTitle`, section.title)}
              </H3>
              <Text data-cms-id={`admin.help.sections.${sectionIndex}.sectionDescription`} mode={mode}>
                {getCMSField(cmsData, `admin.help.sections.${sectionIndex}.sectionDescription`, section.description)}
              </Text>
            </Container>
            
            <Stack spacing="md">
              {section.items.map((item, index) => (
                <Container key={index}>
                  <Text weight="semibold" data-cms-id={`admin.help.sections.${sectionIndex}.q${index + 1}.question`} mode={mode}>
                    {getCMSField(cmsData, `admin.help.sections.${sectionIndex}.q${index + 1}.question`, item.question)}
                  </Text>
                  <Text variant="muted" size="sm" data-cms-id={`admin.help.sections.${sectionIndex}.q${index + 1}.answer`} mode={mode}>
                    {getCMSField(cmsData, `admin.help.sections.${sectionIndex}.q${index + 1}.answer`, item.answer)}
                  </Text>
                </Container>
              ))}
            </Stack>
          </Box>
        ))}
      </GridSection>

      {/* Additional Resources */}
      <GridSection variant="content" columns={1}>
        <Box>
          <Stack spacing="md">
            <Stack spacing="sm">
              <Text variant="lead" size="md" weight="semibold" data-cms-id="admin.help.sections.additionalResources.title" mode={mode}>
                {getCMSField(cmsData, 'admin-help-sections-additionalResources-title', '📞 Need More Help?')}
              </Text>
              <Text variant="muted" size="sm" data-cms-id="admin.help.sections.additionalResources.description" mode={mode}>
                {getCMSField(cmsData, 'admin-help-sections-additionalResources-description', 'If you can\'t find the answer you\'re looking for, here are additional resources')}
              </Text>
            </Stack>
          <Stack spacing="md">
            <Container>
              <Text data-cms-id="admin.help.sections.additionalResources.technicalSupport" mode={mode}>
                {getCMSField(cmsData, 'admin-help-sections-additionalResources-technicalSupport', 'Contact your developer for technical support')}
              </Text>
            </Container>
            
            <Container>
              <Text data-cms-id="admin.help.sections.additionalResources.businessDocs" mode={mode}>
                {getCMSField(cmsData, 'admin-help-sections-additionalResources-businessDocs', 'Check the business documentation in your project files')}
              </Text>
            </Container>
            
            <Container>
              <Text data-cms-id="admin.help.sections.additionalResources.cmsSettings" mode={mode}>
                {getCMSField(cmsData, 'admin-help-sections-additionalResources-cmsSettings', 'Review your CMS settings for configuration options')}
              </Text>
            </Container>
            
            <Container>
              <Text data-cms-id="admin.help.sections.additionalResources.adminDashboard" mode={mode}>
                {getCMSField(cmsData, 'admin-help-sections-additionalResources-adminDashboard', 'Use the Admin Dashboard to monitor your business metrics')}
              </Text>
            </Container>
          </Stack>
          </Stack>
        </Box>
      </GridSection>

      {/* Quick Navigation */}
      <GridSection variant="actions" columns={1}>
        <Box>
          <Stack spacing="md">
            <Stack spacing="sm">
              <Text variant="lead" size="md" weight="semibold">Quick Navigation</Text>
              <Text variant="muted" size="sm">Access common admin functions directly</Text>
            </Stack>
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
                onClick: () => window.location.href = '/admin/driver'
              },
              {
                id: 4,
                icon: "⭐",
                label: "Customer Feedback",
                onClick: () => window.location.href = '/admin/feedback'
              }
            ]}
          />
          </Stack>
        </Box>
      </GridSection>
    </>
  );
}

export default AdminHelpPage;
