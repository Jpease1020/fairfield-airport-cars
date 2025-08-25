'use client';

import React from 'react';
import {
  ToastProvider,
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
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

function DashboardPageContent() {
  const { addToast } = useToast();
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();

  const dashboardActions = [
    {
      id: 1,
      icon: "📋",
      label: getCMSField(cmsData, 'label', 'My Bookings'),
      description: getCMSField(cmsData, 'description', 'View and manage your current and past bookings'),
      href: "/manage"
    },
    {
      id: 2,
      icon: "📅",
      label: getCMSField(cmsData, 'label', 'Booking Status'),
      description: getCMSField(cmsData, 'description', 'Check the status of your upcoming rides'),
      href: "/status"
    },
    {
      id: 3,
      icon: "⚙️",
      label: getCMSField(cmsData, 'label', 'Account Settings'),
      description: getCMSField(cmsData, 'description', 'Update your profile and preferences'),
      href: "#"
    },
    {
      id: 4,
      icon: "💬",
      label: getCMSField(cmsData, 'label', 'Support'),
      description: getCMSField(cmsData, 'description', 'Get help with your bookings'),
      href: "/help"
    },
    {
      id: 5,
      icon: "📅",
      label: getCMSField(cmsData, 'label', 'Book New Ride'),
      description: getCMSField(cmsData, 'description', 'Schedule your next airport transportation'),
      href: "/book"
    },
    {
      id: 6,
      icon: "📞",
      label: getCMSField(cmsData, 'label', 'Contact Us'),
      description: getCMSField(cmsData, 'description', 'Reach out for immediate assistance'),
      onClick: () => addToast('info', getCMSField(cmsData, 'contactInfo', 'Contact information: (203) 555-0123')),
      href: "#"
    }
  ];

  const accountStats = [
    {
      icon: "🎯",
      title: getCMSField(cmsData, 'title', 'Total Bookings'),
      description: getCMSField(cmsData, 'description', 'Feature coming soon')
    },
    {
      icon: "⭐",
      title: getCMSField(cmsData, 'title', 'Loyalty Status'),
      description: getCMSField(cmsData, 'description', 'Valued Customer')
    },
    {
      icon: "📱",
      title: getCMSField(cmsData, 'title', 'Preferred Contact'),
      description: getCMSField(cmsData, 'description', 'SMS & Email')
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
              data-testid="dashboard-welcome-title"
              data-cms-id="dashboard-welcome-title"
              mode={mode}
            >
              {getCMSField(cmsData, 'title', '👋 Welcome to Your Dashboard')}
            </H1>
            <Text 
              variant="lead" 
              align="center" 
              size="lg"
              data-testid="dashboard-welcome-description"
              data-cms-id="dashboard-welcome-description"
              mode={mode}
            >
              {getCMSField(cmsData, 'description', 'Manage your Fairfield Airport Cars account, bookings, and preferences from this central hub. Your reliable transportation partner is just a click away.')}
            </Text>
          </Stack>
        </Stack>
      </Container>

      {/* Portal Features */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H1 
              align="center" 
              data-testid="dashboard-features-title"
              data-cms-id="dashboard-features-title"
              mode={mode}
            >
                              {getCMSField(cmsData, 'title', '🎯 Dashboard Features')}
            </H1>
            <Text 
              align="center" 
              size="lg"
              data-testid="dashboard-features-description"
              data-cms-id="dashboard-features-description"
              mode={mode}
            >
              {getCMSField(cmsData, 'description', 'Access all available services and account management tools')}
            </Text>
          </Stack>
          
          <Grid cols={3} gap="lg" responsive>
            {dashboardActions.map((action) => (
              <GridItem key={action.id}>
                <Box 
                  variant="elevated" 
                  padding="lg"
                >
                  <Stack direction="vertical" spacing="md" align="center">
                    <Container>
                      <Text size="xl">{action.icon}</Text>
                    </Container>
                    <Container>
                      <H4>{action.label}</H4>
                    </Container>
                    <Container>
                      <Text variant="muted">{action.description}</Text>
                    </Container>
                  </Stack>
                </Box>
              </GridItem>
            ))}
          </Grid>
        </Stack>
      </Container>

      {/* Account Overview */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H1 
              align="center" 
              data-testid="dashboard-stats-title"
              data-cms-id="dashboard-stats-title"
              mode={mode}
            >
              {getCMSField(cmsData, 'title', '📊 Account Overview')}
            </H1>
            <Text 
              align="center" 
              size="lg"
              data-testid="dashboard-stats-description"
              data-cms-id="dashboard-stats-description"
              mode={mode}
            >
              {getCMSField(cmsData, 'description', 'Your account activity and statistics')}
            </Text>
          </Stack>
          
          <Grid cols={3} gap="lg" responsive>
            {accountStats.map((stat, index) => (
              <GridItem key={index}>
                <Box variant="elevated" padding="lg">
                  <Stack direction="vertical" spacing="md" align="center">
                    <Container>
                      <Text size="xl">{stat.icon}</Text>
                    </Container>
                    <Container>
                      <H4>{stat.title}</H4>
                    </Container>
                    <Container>
                      <Text variant="muted">{stat.description}</Text>
                    </Container>
                  </Stack>
                </Box>
              </GridItem>
            ))}
          </Grid>
        </Stack>
      </Container>
    </>
  );
}

export default function DashboardPage() {
  return (
    <ToastProvider>
      <DashboardPageContent />
    </ToastProvider>
  );
}
