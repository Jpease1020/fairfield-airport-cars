'use client';

import React from 'react';
import { 
  GridSection,
  FeatureGrid,
  ToastProvider,
  useToast,
  Container,
  Stack,
  CustomerLayout,
  H1,
  Text
} from '@/ui';
import { EditableHeading, EditableText } from '@/ui';

function PortalPageContent() {
  const { addToast } = useToast();

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
            <EditableHeading field="portal.welcome.title" defaultValue="👋 Welcome to Your Portal" level={1} size="5xl" weight="bold" align="center" data-testid="portal-welcome-title">
              👋 Welcome to Your Portal
            </EditableHeading>
            <EditableText field="portal.welcome.description" defaultValue="Manage your Fairfield Airport Cars account, bookings, and preferences from this central hub. Your reliable transportation partner is just a click away." variant="lead" align="center" size="lg" data-testid="portal-welcome-description">
              Manage your Fairfield Airport Cars account, bookings, and preferences from this central hub. Your reliable transportation partner is just a click away.
            </EditableText>
          </Stack>
        </Stack>
      </Container>

      {/* Portal Actions */}
      <GridSection variant="content" columns={1}>
        <Container marginTop="xl">
          <Stack spacing="xl" align="center">
            <Stack spacing="md" align="center">
              <EditableHeading data-testid="portal-features-title" level={3} field="portal.features.title" defaultValue="🎯 Portal Features" size="2xl" weight="semibold">🎯 Portal Features</EditableHeading>
              <EditableText data-testid="portal-features-description" field="portal.features.description" defaultValue="Access all available services and account management tools" variant="lead" size="lg">
                Access all available services and account management tools
              </EditableText>
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
              <EditableHeading data-testid="portal-stats-title" level={3} field="portal.stats.title" defaultValue="📊 Account Overview" size="2xl" weight="semibold">📊 Account Overview</EditableHeading>
              <EditableText data-testid="portal-stats-description" field="portal.stats.description" defaultValue="Your account activity and statistics" variant="lead" size="lg">
                Your account activity and statistics
              </EditableText>
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
