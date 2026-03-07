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
} from '@/design/ui';
import { useCMSData } from '@/design/providers/CMSDataProvider';

export default function DashboardClient() {
  // Get CMS data from provider
  const { cmsData: allCmsData } = useCMSData();
  const pageCmsData = allCmsData?.dashboard || {};
  const { addToast } = useToast();
  

  const dashboardActions = [
    {
      id: 1,
      icon: "📋",
      label: pageCmsData?.['actions.bookings.label'] || 'My Bookings',
      description: pageCmsData?.['actions.bookings.description'] || 'View and manage your current and past bookings',
      href: "/manage"
    },
    {
      id: 2,
      icon: "📅",
      label: pageCmsData?.['actions.status.label'] || 'Booking Status',
      description: pageCmsData?.['actions.status.description'] || 'Check the status of your upcoming rides',
      href: "/status"
    },
    {
      id: 3,
      icon: "⚙️",
      label: pageCmsData?.['actions.settings.label'] || 'Account Settings',
      description: pageCmsData?.['actions.settings.description'] || 'Update your profile and preferences',
      href: "/profile"
    },
    {
      id: 4,
      icon: "💬",
      label: pageCmsData?.['actions.support.label'] || 'Support',
      description: pageCmsData?.['actions.support.description'] || 'Get help with your bookings',
      href: "/help"
    },
    {
      id: 5,
      icon: "📅",
      label: pageCmsData?.['actions.book.label'] || 'Book New Ride',
      description: pageCmsData?.['actions.book.description'] || 'Schedule your next airport transportation',
      href: "/book"
    },
    {
      id: 6,
      icon: "💬",
      label: pageCmsData?.['actions.contact.label'] || 'Contact Us',
      description: pageCmsData?.['actions.contact.description'] || 'Reach out for immediate assistance',
      onClick: () => addToast('info', pageCmsData?.['contactInfo'] || 'Text us: (203) 990-1815'),
      href: "#"
    }
  ];

  const accountStats = [
    {
      icon: "🎯",
      title: pageCmsData?.['stats.totalRides'] || 'Total Rides',
      description: pageCmsData?.['stats.totalRides'] || 'Feature coming soon'
    },
    {
      icon: "⭐",
        title: pageCmsData?.['stats.completedRides'] || 'Completed Rides',
      description: pageCmsData?.['stats.completedRides'] || 'Valued Customer'
    },
    {
      icon: "📱",
      title: pageCmsData?.['stats.upcomingRides'] || 'Upcoming Rides',
      description: pageCmsData?.['stats.upcomingRides'] || 'SMS & Email'
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

              
            >
              {pageCmsData?.['welcome-title'] || '👋 Welcome to Your Dashboard'}
            </H1>
            <Text 
              variant="lead" 
              align="center" 

              
            >
              {pageCmsData?.['welcome-subtitle'] || 'Manage your airport transportation from one central hub'}
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
            <H4 align="center">
              {pageCmsData?.['stats-title'] || 'Account Overview'}
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
