'use client';

import React from 'react'; 
import { GridSection, Box, Container, Text, Stack, H3 } from '@/ui';
import { useCMSData } from '@/design/providers/CMSDataProvider';

export default function AdminHelpClient() {
  
  const { cmsData: allCmsData } = useCMSData();
  const cmsData = allCmsData?.admin || {};
  
  const helpSections = [
    {
      title: cmsData?.['sections.booking.title'] || 'Booking Management',
      icon: "📋",
      description: cmsData?.['sections.booking.description'] || 'How to manage bookings and customer requests',
      items: [
        {
          question: cmsData?.['sections.booking.q1.question'] || 'How do I view all bookings?',
          answer: cmsData?.['sections.booking.q1.answer'] || 'Go to Admin > Bookings to see all current and past bookings. You can filter by status, date, and customer.'
        },
        {
          question: cmsData?.['sections.booking.q2.question'] || 'How do I assign a driver to a booking?',
          answer: cmsData?.['sections.booking.q2.answer'] || 'In the Bookings page, click on a booking and use the "Assign Driver" option. You can select from available drivers.'
        },
        {
          question: cmsData?.['sections.booking.q3.question'] || 'What if a customer wants to cancel?',
          answer: cmsData?.['sections.booking.q3.answer'] || 'Customers can cancel through their dashboard, or you can cancel manually in the Admin > Bookings section.'
        },
        {
          question: cmsData?.['sections.booking.q4.question'] || 'How do I handle no-shows?',
          answer: cmsData?.['sections.booking.q4.answer'] || 'Mark the booking as "No Show" in the status field. This helps track patterns and adjust policies.'
        }
      ]
    },
    {
      title: cmsData?.['sections.driver.title'] || 'Driver Management',
      icon: "👨‍💼",
      description: cmsData?.['sections.driver.description'] || 'Managing your driver and availability',
      items: [
        {
          question: cmsData?.['sections.driver.q1.question'] || 'How do I update driver information?',
          answer: cmsData?.['sections.driver.q1.answer'] || 'Go to Admin > Driver and update the driver details and vehicle information.'
        },
        {
          question: cmsData?.['sections.driver.q2.question'] || 'How do I update driver status?',
          answer: cmsData?.['sections.driver.q2.answer'] || 'In the Driver page, use the status buttons to set driver as Available, Busy, or Offline.'
        },
        {
          question: cmsData?.['sections.driver.q3.question'] || 'What if the driver is late?',
          answer: cmsData?.['sections.driver.q3.answer'] || 'Update the driver status to "Busy" and contact them directly. You can also update the booking status to reflect delays.'
        }
      ]
    }
  ];

  return (
    <Container maxWidth="full" padding="xl">
      <Stack spacing="xl">
        {/* Header */}
        <Stack spacing="md" align="center">
          <H3 
            align="center" 
            cmsId="title"
            
          >
            {cmsData?.['title'] || 'Admin Help'}
          </H3>
          <Text 
            variant="lead" 
            align="center" 
            cmsId="subtitle"
            
          >
            {cmsData?.['subtitle'] || 'Get help with managing your business'}
          </Text>
        </Stack>

        {/* Help Sections */}
        <Stack spacing="xl">
          {helpSections.map((section, index) => (
            <GridSection
              key={index}
              title={section.title}
            >
              <Stack spacing="md">
                {section.items.map((item, itemIndex) => (
                  <Box key={itemIndex} variant="elevated" padding="lg">
                    <Stack spacing="md">
                      <Text weight="bold" size="lg">
                        {item.question}
                      </Text>
                      <Text color="muted">
                        {item.answer}
                      </Text>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </GridSection>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}

