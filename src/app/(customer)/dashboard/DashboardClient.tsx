'use client';

import React from 'react';
import {
  useToast,
  Container,
  Stack,
  H1,
  Text,
  Grid,
  GridItem,
  H4,
  Box
} from '@/ui';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

// Helper function to get field value from CMS
import { getCMSField } from '@/design/hooks/useCMSData';

interface DashboardClientProps {
  cmsData: any;
}

export default function DashboardClient({ cmsData }: DashboardClientProps) {
  const { addToast } = useToast();
  const { mode } = useInteractionMode();

  const dashboardActions = [
    {
      id: 1,
      icon: "📋",
      label: getCMSField(cmsData, 'actions.bookings.label', 'My Bookings'),
      description: getCMSField(cmsData, 'actions.bookings.description', 'View and manage your current and past bookings'),
      href: "/manage"
    },
    {
      id: 2,
      icon: "📅",
      label: getCMSField(cmsData, 'actions.status.label', 'Booking Status'),
      description: getCMSField(cmsData, 'actions.status.description', 'Check the status of your upcoming rides'),
      href: "/status"
    },
    {
      id: 3,
      icon: "⚙️",
      label: getCMSField(cmsData, 'actions.settings.label', 'Account Settings'),
      description: getCMSField(cmsData, 'actions.settings.description', 'Update your profile and preferences'),
      href: "/profile"
    },
    {
      id: 4,
      icon: "💬",
      label: getCMSField(cmsData, 'actions.support.label', 'Support'),
      description: getCMSField(cmsData, 'actions.support.description', 'Get help with your bookings'),
      href: "/help"
    },
    {
      id: 5,
      icon: "📅",
      label: getCMSField(cmsData, 'actions.book.label', 'Book New Ride'),
      description: getCMSField(cmsData, 'actions.book.description', 'Schedule your next airport transportation'),
      href: "/book"
    },
    {
      id: 6,
      icon: "📞",
      label: getCMSField(cmsData, 'actions.contact.label', 'Contact Us'),
      description: getCMSField(cmsData, 'actions.contact.description', 'Reach out for immediate assistance'),
      onClick: () => addToast('info', getCMSField(cmsData, 'contactInfo', 'Contact information: (203) 555-0123')),
      href: "#"
    }
  ];

  const accountStats = [
    {
      icon: "🎯",
      title: getCMSField(cmsData, 'stats.totalRides', 'Total Rides'),
      description: getCMSField(cmsData, 'stats.totalRides', 'Feature coming soon')
    },
    {
      icon: "⭐",
      title: getCMSField(cmsData, 'stats.completedRides', 'Completed Rides'),
      description: getCMSField(cmsData, 'stats.completedRides', 'Valued Customer')
    },
    {
      icon: "📱",
      title: getCMSField(cmsData, 'stats.upcomingRides', 'Upcoming Rides'),
      description: getCMSField(cmsData, 'stats.upcomingRides', 'SMS & Email')
    }
  ];

  return (
    <>
      {/* Welcome Section */}
      <Container maxWidth="full" padding="xl" variant="section">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H1 
              align="center" 
              data-testid="welcome-title"
              data-cms-id="welcome-title"
              mode={mode}
            >
              {getCMSField(cmsData, 'welcome-title', '👋 Welcome to Your Dashboard')}
            </H1>
            <Text 
              variant="lead" 
              align="center" 
              data-cms-id="welcome-subtitle"
              mode={mode}
            >
              {getCMSField(cmsData, 'welcome-subtitle', 'Manage your airport transportation from one central hub')}
            </Text>
          </Stack>

          {/* Quick Actions Grid */}
          <Grid cols={{ xs: 1, md: 2, lg: 3 }} gap="lg">
            {dashboardActions.map((action) => (
              <GridItem key={action.id}>
                <Box 
                  variant="elevated" 
                  padding="lg" 
                  as="div" 
                  onClick={action.onClick}
                >
                  <Stack spacing="md" align="center">
                    <Text size="3xl">{action.icon}</Text>
                    <H4 align="center">{action.label}</H4>
                    <Text align="center" color="muted" size="sm">
                      {action.description}
                    </Text>
                  </Stack>
                </Box>
              </GridItem>
            ))}
          </Grid>

          {/* Account Stats */}
          <Stack spacing="lg" align="center">
            <H4 align="center" data-cms-id="stats-title">
              {getCMSField(cmsData, 'stats-title', 'Account Overview')}
            </H4>
            <Grid cols={{ xs: 1, md: 3 }} gap="md">
              {accountStats.map((stat, index) => (
                <GridItem key={index}>
                  <Box variant="elevated" padding="md">
                    <Stack spacing="sm" align="center">
                      <Text size="2xl">{stat.icon}</Text>
                      <H4 align="center" size="sm">{stat.title}</H4>
                      <Text align="center" color="muted" size="sm">
                        {stat.description}
                      </Text>
                    </Stack>
                  </Box>
                </GridItem>
              ))}
            </Grid>
          </Stack>
        </Stack>
      </Container>
    </>
  );
}
