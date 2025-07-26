'use client';

import { useState } from 'react';
import { UniversalLayout } from '@/components/layout/UniversalLayout';
import { LayoutEnforcer } from '@/lib/design-system/LayoutEnforcer';
import { 
  GridSection,
  InfoCard,
  ActionGrid,
  StatusMessage,
  ToastProvider,
  useToast
} from '@/components/ui';

function PortalPageContent() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const portalActions = [
    {
      id: 1,
      icon: "📅",
      label: "Current Bookings",
      description: "View and manage your upcoming rides",
      onClick: () => addToast('info', 'Booking management coming soon'),
      href: "#"
    },
    {
      id: 2,
      icon: "📋",
      label: "Past Trips",
      description: "Review your previous rides and receipts",
      onClick: () => addToast('info', 'Trip history coming soon'),
      href: "#"
    },
    {
      id: 3,
      icon: "⚙️",
      label: "Account Settings",
      description: "Update your contact information and preferences",
      onClick: () => addToast('info', 'Account settings coming soon'),
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
    <LayoutEnforcer>
      <UniversalLayout 
        layoutType="standard"
        title="Customer Portal"
        subtitle="Manage your bookings and account information"
      >
        {/* Error Display */}
        {error && (
          <GridSection variant="content" columns={1}>
            <StatusMessage 
              type="error" 
              message={error} 
              onDismiss={() => setError(null)}
            />
          </GridSection>
        )}

        {/* Welcome Section */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="👋 Welcome to Your Portal"
            description="Access all your booking information and account features in one place"
          >
            <div style={{
              padding: 'var(--spacing-lg)',
              textAlign: 'center',
              backgroundColor: 'var(--background-secondary)',
              borderRadius: 'var(--border-radius)',
              marginTop: 'var(--spacing-md)'
            }}>
              <h3 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--text-primary)' }}>
                🎯 Quick Access Portal
              </h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                Manage your Fairfield Airport Cars account, bookings, and preferences from this central hub. 
                Your reliable transportation partner is just a click away.
              </p>
            </div>
          </InfoCard>
        </GridSection>

        {/* Portal Actions */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="🎯 Portal Features"
            description="Access all available services and account management tools"
          >
            <ActionGrid actions={portalActions} columns={3} />
          </InfoCard>
        </GridSection>

        {/* Quick Stats */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="📊 Account Overview"
            description="Your account activity and statistics"
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--spacing-lg)',
              padding: 'var(--spacing-lg) 0'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>🎯</div>
                <h4>Total Bookings</h4>
                <p style={{ color: 'var(--text-secondary)' }}>Feature coming soon</p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>⭐</div>
                <h4>Loyalty Status</h4>
                <p style={{ color: 'var(--text-secondary)' }}>Valued Customer</p>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>📱</div>
                <h4>Preferred Contact</h4>
                <p style={{ color: 'var(--text-secondary)' }}>SMS & Email</p>
              </div>
            </div>
          </InfoCard>
        </GridSection>
      </UniversalLayout>
    </LayoutEnforcer>
  );
}

export default function PortalPage() {
  return (
    <ToastProvider>
      <PortalPageContent />
    </ToastProvider>
  );
}
