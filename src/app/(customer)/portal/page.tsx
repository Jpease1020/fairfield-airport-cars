'use client';

import React from 'react';
import {
  FeatureGrid,
  ToastProvider,
  useToast,
  Container,
  Stack,
  H1,
  Text
} from '@/ui';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

function PortalPageContent() {
  const { addToast } = useToast();
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();

  const portalActions = [
    {
      id: 1,
      icon: "📋",
      label: getCMSField(cmsData, 'pages.portal.actions.myBookings.label', 'My Bookings'),
      description: getCMSField(cmsData, 'pages.portal.actions.myBookings.description', 'View and manage your current and past bookings'),
      href: "/manage"
    },
    {
      id: 2,
      icon: "📅",
      label: getCMSField(cmsData, 'pages.portal.actions.bookingStatus.label', 'Booking Status'),
      description: getCMSField(cmsData, 'pages.portal.actions.bookingStatus.description', 'Check the status of your upcoming rides'),
      href: "/status"
    },
    {
      id: 3,
      icon: "⚙️",
      label: getCMSField(cmsData, 'pages.portal.actions.accountSettings.label', 'Account Settings'),
      description: getCMSField(cmsData, 'pages.portal.actions.accountSettings.description', 'Update your profile and preferences'),
      href: "#"
    },
    {
      id: 4,
      icon: "💬",
      label: getCMSField(cmsData, 'pages.portal.actions.support.label', 'Support'),
      description: getCMSField(cmsData, 'pages.portal.actions.support.description', 'Get help with your bookings'),
      href: "/help"
    },
    {
      id: 5,
      icon: "📅",
      label: getCMSField(cmsData, 'pages.portal.actions.bookNewRide.label', 'Book New Ride'),
      description: getCMSField(cmsData, 'pages.portal.actions.bookNewRide.description', 'Schedule your next airport transportation'),
      href: "/book"
    },
    {
      id: 6,
      icon: "📞",
      label: getCMSField(cmsData, 'pages.portal.actions.contactUs.label', 'Contact Us'),
      description: getCMSField(cmsData, 'pages.portal.actions.contactUs.description', 'Reach out for immediate assistance'),
      onClick: () => addToast('info', getCMSField(cmsData, 'pages.portal.actions.contactUs.contactInfo', 'Contact information: (203) 555-0123')),
      href: "#"
    }
  ];

  const accountStats = [
    {
      icon: "🎯",
      title: getCMSField(cmsData, 'pages.portal.stats.totalBookings.title', 'Total Bookings'),
      description: getCMSField(cmsData, 'pages.portal.stats.totalBookings.description', 'Feature coming soon')
    },
    {
      icon: "⭐",
      title: getCMSField(cmsData, 'pages.portal.stats.loyaltyStatus.title', 'Loyalty Status'),
      description: getCMSField(cmsData, 'pages.portal.stats.loyaltyStatus.description', 'Valued Customer')
    },
    {
      icon: "📱",
      title: getCMSField(cmsData, 'pages.portal.stats.preferredContact.title', 'Preferred Contact'),
      description: getCMSField(cmsData, 'pages.portal.stats.preferredContact.description', 'SMS & Email')
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
              data-testid="portal-welcome-title"
              data-cms-id="pages.portal.welcome.title"
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.portal.welcome.title', '👋 Welcome to Your Portal')}
            </H1>
            <Text 
              variant="lead" 
              align="center" 
              size="lg"
              data-testid="portal-welcome-description"
              data-cms-id="pages.portal.welcome.description"
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.portal.welcome.description', 'Manage your Fairfield Airport Cars account, bookings, and preferences from this central hub. Your reliable transportation partner is just a click away.')}
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
              data-testid="portal-features-title"
              data-cms-id="pages.portal.features.title"
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.portal.features.title', '🎯 Portal Features')}
            </H1>
            <Text 
              align="center" 
              size="lg"
              data-testid="portal-features-description"
              data-cms-id="pages.portal.features.description"
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.portal.features.description', 'Access all available services and account management tools')}
            </Text>
          </Stack>
          
          <FeatureGrid
            features={portalActions.map((action, index) => ({
              id: action.id,
              icon: action.icon,
              title: action.label,
              description: action.description
            }))}
            columns={3}
          />
        </Stack>
      </Container>

      {/* Account Overview */}
      <Container maxWidth="2xl" padding="xl">
        <Stack spacing="xl" align="center">
          <Stack spacing="md" align="center">
            <H1 
              align="center" 
              data-testid="portal-stats-title"
              data-cms-id="pages.portal.stats.title"
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.portal.stats.title', '📊 Account Overview')}
            </H1>
            <Text 
              align="center" 
              size="lg"
              data-testid="portal-stats-description"
              data-cms-id="pages.portal.stats.description"
              mode={mode}
            >
              {getCMSField(cmsData, 'pages.portal.stats.description', 'Your account activity and statistics')}
            </Text>
          </Stack>
          
          <FeatureGrid
            features={accountStats.map((stat, index) => ({
              id: stat.title,
              icon: stat.icon,
              title: stat.title,
              description: stat.description
            }))}
            columns={3}
          />
        </Stack>
      </Container>
    </>
  );
}

export default function PortalPage() {
  return (
    <ToastProvider>
      <PortalPageContent />
    </ToastProvider>
  );
}
