'use client';

import React from 'react'; 
import { GridSection, Box, ActionGrid, Container, Text, Stack, H3 } from '@/ui';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

// Helper function to get field value from CMS
function getCMSField(cmsData: any, fieldPath: string, defaultValue: string = ''): string {
  if (!cmsData) return defaultValue;
  
  const resolvePath = (obj: any, path: string[]): unknown => {
    let cur: any = obj;
    for (const seg of path) {
      if (cur && typeof cur === 'object' && seg in cur) {
        cur = cur[seg as keyof typeof cur];
      } else {
        return undefined;
      }
    }
    return cur;
  };

  const value = resolvePath(cmsData, fieldPath.split('.'));
  return typeof value === 'string' ? (value as string) : defaultValue;
}

interface AdminHelpClientProps {
  cmsData: any;
}

export default function AdminHelpClient({ cmsData }: AdminHelpClientProps) {
  const { mode } = useInteractionMode();
  
  const helpSections = [
    {
      title: getCMSField(cmsData, 'sections.booking.title', 'Booking Management'),
      icon: "📋",
      description: getCMSField(cmsData, 'sections.booking.description', 'How to manage bookings and customer requests'),
      items: [
        {
          question: getCMSField(cmsData, 'sections.booking.q1.question', 'How do I view all bookings?'),
          answer: getCMSField(cmsData, 'sections.booking.q1.answer', 'Go to Admin > Bookings to see all current and past bookings. You can filter by status, date, and customer.')
        },
        {
          question: getCMSField(cmsData, 'sections.booking.q2.question', 'How do I assign a driver to a booking?'),
          answer: getCMSField(cmsData, 'sections.booking.q2.answer', 'In the Bookings page, click on a booking and use the "Assign Driver" option. You can select from available drivers.')
        },
        {
          question: getCMSField(cmsData, 'sections.booking.q3.question', 'What if a customer wants to cancel?'),
          answer: getCMSField(cmsData, 'sections.booking.q3.answer', 'Customers can cancel through their dashboard, or you can cancel manually in the Admin > Bookings section.')
        },
        {
          question: getCMSField(cmsData, 'sections.booking.q4.question', 'How do I handle no-shows?'),
          answer: getCMSField(cmsData, 'sections.booking.q4.answer', 'Mark the booking as "No Show" in the status field. This helps track patterns and adjust policies.')
        }
      ]
    },
    {
      title: getCMSField(cmsData, 'sections.driver.title', 'Driver Management'),
      icon: "👨‍💼",
      description: getCMSField(cmsData, 'sections.driver.description', 'Managing your driver and availability'),
      items: [
        {
          question: getCMSField(cmsData, 'sections.driver.q1.question', 'How do I update driver information?'),
          answer: getCMSField(cmsData, 'sections.driver.q1.answer', 'Go to Admin > Driver and update the driver details and vehicle information.')
        },
        {
          question: getCMSField(cmsData, 'sections.driver.q2.question', 'How do I update driver status?'),
          answer: getCMSField(cmsData, 'sections.driver.q2.answer', 'In the Driver page, use the status buttons to set driver as Available, Busy, or Offline.')
        },
        {
          question: getCMSField(cmsData, 'sections.driver.q3.question', 'What if the driver is late?'),
          answer: getCMSField(cmsData, 'sections.driver.q3.answer', 'Update the driver status to "Busy" and contact them directly. You can also update the booking status to reflect delays.')
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
            data-cms-id="title"
            mode={mode}
          >
            {getCMSField(cmsData, 'title', 'Admin Help')}
          </H3>
          <Text 
            variant="lead" 
            align="center" 
            data-cms-id="subtitle"
            mode={mode}
          >
            {getCMSField(cmsData, 'subtitle', 'Get help with managing your business')}
          </Text>
        </Stack>

        {/* Help Sections */}
        <Stack spacing="xl">
          {helpSections.map((section, index) => (
            <GridSection
              key={index}
              title={section.title}
              description={section.description}
              icon={section.icon}
            >
              <ActionGrid>
                {section.items.map((item, itemIndex) => (
                  <Box key={itemIndex} variant="card" padding="lg">
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
              </ActionGrid>
            </GridSection>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}

