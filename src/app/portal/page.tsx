'use client';

import React from 'react';
import { UnifiedLayout } from '@/components/layout';
import { 
  GridSection,
  InfoCard,
  FeatureGrid,
  ToastProvider,
  useToast,
  Text
} from '@/components/ui';

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
      icon: "🚗",
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

  return (
    <UnifiedLayout 
      layoutType="content"
      title="Customer Portal"
      subtitle="Manage your bookings and account information"
      description="Access all your booking information and account features in one place"
    >
      {/* Welcome Section */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="👋 Welcome to Your Portal"
          description="Manage your Fairfield Airport Cars account, bookings, and preferences from this central hub. Your reliable transportation partner is just a click away."
        >
          <Text>🎯 Quick Access Portal</Text>
        </InfoCard>
      </GridSection>

      {/* Portal Actions */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="🎯 Portal Features"
          description="Access all available services and account management tools"
        >
          <FeatureGrid 
            features={portalActions.map(action => ({
              icon: action.icon,
              title: action.label,
              description: action.description
            }))} 
            columns={3} 
          />
        </InfoCard>
      </GridSection>

      {/* Quick Stats */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="📊 Account Overview"
          description="Your account activity and statistics"
        >
          <FeatureGrid 
            features={[
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
            ]} 
            columns={3} 
          />
        </InfoCard>
      </GridSection>
    </UnifiedLayout>
  );
}

export default function PortalPage() {
  return (
    <ToastProvider>
      <PortalPageContent />
    </ToastProvider>
  );
}
