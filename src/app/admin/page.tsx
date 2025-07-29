'use client';

import React from 'react';
import { UnifiedLayout } from '@/components/layout/core/UnifiedLayout';
import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';
import { 
  GridSection, 
  InfoCard, 
  ActionButtonGroup,
  ToastProvider,
  Container,
  Text,
  EditableText
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
    { title: 'Active Drivers', value: '12', icon: '👨‍💼', color: 'var(--brand-primary)' },
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
      <AdminPageWrapper title={<EditableText field="admin.dashboard.wrapperTitle" defaultValue="Dashboard">Dashboard</EditableText>} subtitle={<EditableText field="admin.dashboard.wrapperSubtitle" defaultValue="Business overview and quick actions">Business overview and quick actions</EditableText>}>
        {/* Quick Actions */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title={<EditableText field="admin.dashboard.quickActionsTitle" defaultValue="⚡ Quick Actions">⚡ Quick Actions</EditableText>}
            description={<EditableText field="admin.dashboard.quickActionsDesc" defaultValue="Common administrative tasks">Common administrative tasks</EditableText>}
          >
            <ActionButtonGroup buttons={quickActions} />
          </InfoCard>
        </GridSection>

        {/* Statistics Cards */}
        <GridSection variant="content" columns={4}>
          {statsCards.map((stat, index) => (
            <InfoCard
              key={index}
              title={<EditableText field={`admin.dashboard.statTitle${index}`} defaultValue={`${stat.icon} ${stat.title}`}>{`${stat.icon} ${stat.title}`}</EditableText>}
              description={<EditableText field={`admin.dashboard.statDesc${index}`} defaultValue={stat.value}>{stat.value}</EditableText>}
            >
              <Container>
                <Text>
                  {stat.value}
                </Text>
                <Text>
                  {stat.title}
                </Text>
              </Container>
            </InfoCard>
          ))}
        </GridSection>

        {/* Recent Activity */}
        <GridSection variant="content" columns={1}>
          <InfoCard
            title={<EditableText field="admin.dashboard.recentActivityTitle" defaultValue="📈 Recent Activity">📈 Recent Activity</EditableText>}
            description={<EditableText field="admin.dashboard.recentActivityDesc" defaultValue="Latest bookings and system updates">Latest bookings and system updates</EditableText>}
          >
            <Container>
              <Text>
                <EditableText field="admin.dashboard.recentActivityPlaceholder" defaultValue="Recent activity data will be displayed here once the booking system is fully integrated.">Recent activity data will be displayed here once the booking system is fully integrated.</EditableText>
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