'use client';

import React from 'react';
import { UnifiedLayout } from '@/components/layout/core/UnifiedLayout';
import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';
import { 
  Section,
  Container,
  Stack,
  H1,
  H2,
  Text,
  Card,
  Button,
  Grid,
  GridItem,
  EditableText,
  ToastProvider
} from '@/components/ui';
import styled from 'styled-components';
import { spacing, fontSize, fontWeight } from '@/lib/design-system/tokens';

// Styled components for admin dashboard
const StatCard = styled(Card)`
  text-align: center;
  transition: transform 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const StatValue = styled.div`
  font-size: ${fontSize['4xl']};
  font-weight: ${fontWeight.bold};
  color: var(--primary-color, #0B1F3A);
  margin-bottom: ${spacing.sm};
`;

const StatIcon = styled.div`
  font-size: ${fontSize['3xl']};
  margin-bottom: ${spacing.md};
`;

const QuickActionCard = styled(Card)`
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const ActivityItem = styled.div`
  padding: ${spacing.md};
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  
  &:last-child {
    border-bottom: none;
  }
`;

function AdminDashboardContent() {
  const quickActions = [
    {
      icon: '📅',
      title: 'View Bookings',
      description: 'Manage all customer reservations and bookings',
      onClick: () => window.location.href = '/admin/bookings',
      color: 'var(--primary-color, #0B1F3A)'
    },
    {
      icon: '💰',
      title: 'Payment Management',
      description: 'Track payments, deposits, and process refunds',
      onClick: () => window.location.href = '/admin/payments',
      color: 'var(--success-base, #10b981)'
    },
    {
      icon: '👨‍💼',
      title: 'Driver Management',
      description: 'Manage your fleet and driver assignments',
      onClick: () => window.location.href = '/admin/drivers',
      color: 'var(--warning-base, #f59e0b)'
    },
    {
      icon: '📊',
      title: 'Cost Tracking',
      description: 'Monitor expenses and financial metrics',
      onClick: () => window.location.href = '/admin/costs',
      color: 'var(--error-base, #ef4444)'
    }
  ];

  const statsCards = [
    { 
      title: 'Total Bookings', 
      value: '245', 
      icon: '📊', 
      change: '+12% from last month',
      changeType: 'positive' as const
    },
    { 
      title: 'Active Drivers', 
      value: '12', 
      icon: '👨‍💼', 
      change: '3 available now',
      changeType: 'neutral' as const
    },
    { 
      title: 'Revenue This Month', 
      value: '$8,450', 
      icon: '💰', 
      change: '+8% from last month',
      changeType: 'positive' as const
    },
    { 
      title: 'Customer Rating', 
      value: '4.9/5', 
      icon: '⭐', 
      change: 'Based on 156 reviews',
      changeType: 'neutral' as const
    }
  ];

  const recentActivity = [
    {
      type: 'booking',
      message: 'New booking from John Smith - JFK Airport',
      time: '2 minutes ago',
      icon: '📅'
    },
    {
      type: 'payment',
      message: 'Payment received for booking #1234',
      time: '15 minutes ago',
      icon: '💰'
    },
    {
      type: 'driver',
      message: 'Driver Mike completed ride to LGA',
      time: '1 hour ago',
      icon: '👨‍💼'
    },
    {
      type: 'review',
      message: '5-star review from Sarah M.',
      time: '2 hours ago',
      icon: '⭐'
    }
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
      <AdminPageWrapper 
        title={<EditableText field="admin.dashboard.wrapperTitle" defaultValue="Dashboard">Dashboard</EditableText>} 
        subtitle={<EditableText field="admin.dashboard.wrapperSubtitle" defaultValue="Business overview and quick actions">Business overview and quick actions</EditableText>}
      >
        {/* Statistics Overview */}
        <Section variant="default" padding="lg">
          <Container maxWidth="2xl">
            <Stack spacing="lg" align="center" marginBottom="xl">
              <H2>
                <EditableText field="admin.dashboard.statsTitle" defaultValue="📊 Business Overview">
                  📊 Business Overview
                </EditableText>
              </H2>
              <Text variant="lead" align="center">
                <EditableText field="admin.dashboard.statsSubtitle" defaultValue="Key metrics and performance indicators">
                  Key metrics and performance indicators
                </EditableText>
              </Text>
            </Stack>
            
            <Grid cols={4} gap="lg" responsive>
              {statsCards.map((stat, index) => (
                <GridItem key={index}>
                  <StatCard variant="elevated" padding="lg" hover>
                    <Stack spacing="md" align="center">
                      <StatIcon>
                        <EditableText field={`admin.dashboard.statIcon${index}`} defaultValue={stat.icon}>
                          {stat.icon}
                        </EditableText>
                      </StatIcon>
                      <StatValue>
                        <EditableText field={`admin.dashboard.statValue${index}`} defaultValue={stat.value}>
                          {stat.value}
                        </EditableText>
                      </StatValue>
                      <H2 size="md">
                        <EditableText field={`admin.dashboard.statTitle${index}`} defaultValue={stat.title}>
                          {stat.title}
                        </EditableText>
                      </H2>
                      <Text size="sm" color="secondary">
                        <EditableText field={`admin.dashboard.statChange${index}`} defaultValue={stat.change}>
                          {stat.change}
                        </EditableText>
                      </Text>
                    </Stack>
                  </StatCard>
                </GridItem>
              ))}
            </Grid>
          </Container>
        </Section>

        {/* Quick Actions */}
        <Section variant="alternate" padding="lg">
          <Container maxWidth="2xl">
            <Stack spacing="lg" align="center" marginBottom="xl">
              <H2>
                <EditableText field="admin.dashboard.quickActionsTitle" defaultValue="⚡ Quick Actions">
                  ⚡ Quick Actions
                </EditableText>
              </H2>
              <Text variant="lead" align="center">
                <EditableText field="admin.dashboard.quickActionsSubtitle" defaultValue="Common administrative tasks">
                  Common administrative tasks
                </EditableText>
              </Text>
            </Stack>
            
            <Grid cols={2} gap="lg" responsive>
              {quickActions.map((action, index) => (
                <GridItem key={index}>
                  <div onClick={action.onClick} style={{ cursor: 'pointer' }}>
                    <QuickActionCard 
                      variant="elevated" 
                      padding="lg" 
                      hover
                    >
                      <Stack spacing="md">
                        <Stack direction="horizontal" gap="md" align="center">
                          <div style={{ fontSize: fontSize['3xl'], color: action.color }}>
                            <EditableText field={`admin.dashboard.actionIcon${index}`} defaultValue={action.icon}>
                              {action.icon}
                            </EditableText>
                          </div>
                          <H2 size="lg">
                            <EditableText field={`admin.dashboard.actionTitle${index}`} defaultValue={action.title}>
                              {action.title}
                            </EditableText>
                          </H2>
                        </Stack>
                        <Text align="left">
                          <EditableText field={`admin.dashboard.actionDesc${index}`} defaultValue={action.description}>
                            {action.description}
                          </EditableText>
                        </Text>
                      </Stack>
                    </QuickActionCard>
                  </div>
                </GridItem>
              ))}
            </Grid>
          </Container>
        </Section>

        {/* Recent Activity */}
        <Section variant="default" padding="lg">
          <Container maxWidth="2xl">
            <Stack spacing="lg" align="center" marginBottom="xl">
              <H2>
                <EditableText field="admin.dashboard.recentActivityTitle" defaultValue="📈 Recent Activity">
                  📈 Recent Activity
                </EditableText>
              </H2>
              <Text variant="lead" align="center">
                <EditableText field="admin.dashboard.recentActivitySubtitle" defaultValue="Latest bookings and system updates">
                  Latest bookings and system updates
                </EditableText>
              </Text>
            </Stack>
            
            <Card variant="elevated" padding="lg">
              <Stack spacing="md">
                {recentActivity.map((activity, index) => (
                  <ActivityItem key={index}>
                    <Stack direction="horizontal" spacing="md" align="center">
                      <div style={{ fontSize: fontSize.xl }}>
                        <EditableText field={`admin.dashboard.activityIcon${index}`} defaultValue={activity.icon}>
                          {activity.icon}
                        </EditableText>
                      </div>
                                             <div style={{ flex: 1 }}>
                         <Stack spacing="xs">
                           <Text>
                             <EditableText field={`admin.dashboard.activityMessage${index}`} defaultValue={activity.message}>
                               {activity.message}
                             </EditableText>
                           </Text>
                           <Text size="sm" color="secondary">
                             <EditableText field={`admin.dashboard.activityTime${index}`} defaultValue={activity.time}>
                               {activity.time}
                             </EditableText>
                           </Text>
                         </Stack>
                       </div>
                    </Stack>
                  </ActivityItem>
                ))}
              </Stack>
            </Card>
          </Container>
        </Section>
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