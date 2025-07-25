'use client';

import React from 'react';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { AdminPageWrapper } from '@/components/ui/AdminPageWrapper';
import { 
  GridSection, 
  InfoCard, 
  ActionButtonGroup,
  ToastProvider,
  Container,
  Text
} from '@/components/ui';

function AdminDashboardContent() {
  const quickActions = [
    {
      label: 'View Bookings',
      onClick: () => window.location.href = '/admin/bookings',
      variant: 'primary' as const,
      icon: '📅'
    },
    {
      label: 'Manage CMS',
      onClick: () => window.location.href = '/admin/cms',
      variant: 'secondary' as const,
      icon: '⚙️'
    },
    {
      label: 'Colors & Design',
      onClick: () => window.location.href = '/admin/cms/colors',
      variant: 'outline' as const,
      icon: '🎨'
    }
  ];

  const statsCards = [
    { title: 'Total Bookings', value: '245', icon: '📊', color: 'var(--success-base)' },
    { title: 'Active Drivers', value: '12', icon: '🚗', color: 'var(--brand-primary)' },
    { title: 'Revenue This Month', value: '$8,450', icon: '💰', color: 'var(--warning-base)' },
    { title: 'Customer Rating', value: '4.9/5', icon: '⭐', color: 'var(--success-base)' }
  ];

  return (
    <UnifiedLayout 
      layoutType="admin"
      title="🏠 Admin Dashboard"
      subtitle="Manage your airport transportation business"
      description="Overview of bookings, revenue, and business operations"
      showNavigation={false}
      showFooter={false}
      maxWidth="full"
    >
      <AdminPageWrapper title="Dashboard" subtitle="Business overview and quick actions">
        {/* Quick Actions */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="⚡ Quick Actions"
            description="Common administrative tasks"
          >
            <ActionButtonGroup buttons={quickActions} />
          </InfoCard>
        </GridSection>

        {/* Statistics Cards */}
        <GridSection variant="content" columns={4}>
          {statsCards.map((stat, index) => (
            <InfoCard
              key={index}
              title={`${stat.icon} ${stat.title}`}
              description={stat.value}
            >
              <Container className="admin-stat-card">
                <Container className={`admin-stat-value admin-stat-value-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {stat.value}
                </Container>
                <Text className="admin-stat-title">
                  {stat.title}
                </Text>
              </Container>
            </InfoCard>
          ))}
        </GridSection>

        {/* Recent Activity */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="📈 Recent Activity"
            description="Latest bookings and system updates"
          >
            <Container className="admin-activity-placeholder">
              <Text className="admin-activity-text">
                Recent activity data will be displayed here once the booking system is fully integrated.
              </Text>
            </Container>
          </InfoCard>
        </GridSection>
      </AdminPageWrapper>
    </UnifiedLayout>
  );
}

export default function AdminDashboard() {
  return (
    <ToastProvider>
      <AdminDashboardContent />
    </ToastProvider>
  );
} 