'use client';

import React from 'react';
import { 
  GridSection,
  FeatureGrid,
  ToastProvider,
  useToast,
  Container,
  Stack,
  CustomerLayout
} from '@/design/ui';
import { EditableHeading, EditableText } from '@/design/ui';

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
    <CustomerLayout>
      {/* Welcome Section */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg"  >
            <Stack spacing="md" align="center">
              <EditableHeading data-testid="portal-welcome-title" level={3} field="portal.welcome.title" defaultValue="👋 Welcome to Your Portal">👋 Welcome to Your Portal</EditableHeading>
              <EditableText data-testid="portal-welcome-description" field="portal.welcome.description" defaultValue="Manage your Fairfield Airport Cars account, bookings, and preferences from this central hub. Your reliable transportation partner is just a click away.">
                Manage your Fairfield Airport Cars account, bookings, and preferences from this central hub. Your reliable transportation partner is just a click away.
              </EditableText>
            </Stack>
          </Stack>
        </Container>
      </GridSection>

      {/* Portal Actions */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg"  >
            <Stack spacing="md" align="center">
              <EditableHeading data-testid="portal-features-title" level={3} field="portal.features.title" defaultValue="🎯 Portal Features">🎯 Portal Features</EditableHeading>
              <EditableText data-testid="portal-features-description" field="portal.features.description" defaultValue="Access all available services and account management tools">
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
        <Container>
          <Stack spacing="lg"  >
            <Stack spacing="md" align="center">
              <EditableHeading data-testid="portal-stats-title" level={3} field="portal.stats.title" defaultValue="📊 Account Overview">📊 Account Overview</EditableHeading>
              <EditableText data-testid="portal-stats-description" field="portal.stats.description" defaultValue="Your account activity and statistics">
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
    </CustomerLayout>
  );
}

export default function PortalPage() {
  return (
    <ToastProvider>
      <PortalPageContent />
    </ToastProvider>
  );
}
