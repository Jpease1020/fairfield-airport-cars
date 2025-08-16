'use client';

import React from 'react';
import { 
  GridSection,
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
      label: "My Bookings",
      description: "View and manage your current and past bookings",
      href: "/manage"
    },
    {
      id: 2,
      icon: "📅",
      label: "Booking Status",
      description: "Check the status of your upcoming rides",
      href: "/status"
    },
    {
      id: 3,
      icon: "⚙️",
      label: "Account Settings",
      description: "Update your profile and preferences",
      href: "#"
    },
    {
      id: 4,
      icon: "💬",
      label: "Support",
      description: "Get help with your bookings",
      href: "/help"
    },
    {
      id: 5,
      icon: "📅",
      label: "Book New Ride",
      description: "Schedule your next airport transportation",
      href: "/book"
    },
    {
      id: 6,
      icon: "📞",
      label: "Contact Us",
      description: "Reach out for immediate assistance",
      onClick: () => addToast('info', 'Contact information: (203) 555-0123'),
      href: "#"
    }
  ];

  const accountStats = [
    {
      icon: "🎯",
      title: "Total Bookings",
      description: "Feature coming soon"
    },
    {
      icon: "⭐",
      title: "Loyalty Status",
      description: "Valued Customer"
    },
    {
      icon: "📱",
      title: "Preferred Contact",
      description: "SMS & Email"
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

      {/* Portal Actions */}
      <GridSection variant="content" columns={1}>
        <Container marginTop="xl">
          <Stack spacing="xl" align="center">
            <Stack spacing="md" align="center">
              <Text 
                data-testid="portal-features-title" 
                weight="semibold" 
                size="2xl"
                data-cms-id="pages.portal.features.title"
                mode={mode}
              >
                {getCMSField(cmsData, 'pages.portal.features.title', '🎯 Portal Features')}
              </Text>
              <Text 
                data-testid="portal-features-description" 
                variant="lead" 
                size="lg"
                data-cms-id="pages.portal.features.description"
                mode={mode}
              >
                {getCMSField(cmsData, 'pages.portal.features.description', 'Access all available services and account management tools')}
              </Text>
            </Stack>
            
            <FeatureGrid 
              data-testid="portal-features-grid"
              features={portalActions.map(action => ({
                icon: action.icon,
                title: action.label,
                description: action.description
              }))} 
              columns={3} 
            />
          </Stack>
        </Container>
      </GridSection>

      {/* Quick Stats */}
      <GridSection variant="content" columns={1}>
        <Container marginTop="xl">
          <Stack spacing="xl" align="center">
            <Stack spacing="md" align="center">
              <Text 
                data-testid="portal-stats-title" 
                weight="semibold" 
                size="2xl"
                data-cms-id="pages.portal.stats.title"
                mode={mode}
              >
                {getCMSField(cmsData, 'pages.portal.stats.title', '📊 Account Overview')}
              </Text>
              <Text 
                data-testid="portal-stats-description" 
                variant="lead" 
                size="lg"
                data-cms-id="pages.portal.stats.description"
                mode={mode}
              >
                {getCMSField(cmsData, 'pages.portal.stats.description', 'Your account activity and statistics')}
              </Text>
            </Stack>
            
            <FeatureGrid 
              data-testid="portal-stats-grid"
              features={accountStats} 
              columns={3} 
            />
          </Stack>
        </Container>
      </GridSection>
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
