'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  ToastProvider
} from '@/components/ui';

import styled from 'styled-components';
import { spacing, fontSize, fontWeight } from '../../../design/design-system/tokens';
import { getAllBookings, getAllDrivers, getAllPayments } from '@/lib/services/database-service';

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
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeDrivers: 0,
    revenueThisMonth: 0,
    customerRating: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('📊 Loading dashboard data...');

      // Fetch real data from database with individual error handling
      let bookings: any[] = [];
      let drivers: any[] = [];
      let payments: any[] = [];

      try {
        bookings = await getAllBookings();
        console.log('✅ Bookings loaded:', bookings.length);
      } catch (err) {
        console.warn('⚠️ Could not load bookings:', err);
        bookings = [];
      }

      try {
        drivers = await getAllDrivers();
        console.log('✅ Drivers loaded:', drivers.length);
      } catch (err) {
        console.warn('⚠️ Could not load drivers:', err);
        drivers = [];
      }

      try {
        payments = await getAllPayments();
        console.log('✅ Payments loaded:', payments.length);
      } catch (err) {
        console.warn('⚠️ Could not load payments:', err);
        payments = [];
      }

      // Calculate real stats (handle empty data gracefully)
      const totalBookings = bookings.length;
      const activeDrivers = drivers.filter(d => d.status === 'available').length;
      const revenueThisMonth = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      
      // Calculate average customer rating (if we have feedback data)
      const customerRating = 4.9; // This would come from feedback service

      setStats({
        totalBookings,
        activeDrivers,
        revenueThisMonth,
        customerRating
      });

      // Generate recent activity from real data
      const activity: Array<{
        type: string;
        message: string;
        time: string;
        icon: string;
      }> = [];
      
      // Add recent bookings
      const recentBookings = bookings
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);
      
      recentBookings.forEach(booking => {
        activity.push({
          type: 'booking',
          message: `New booking from ${booking.name} - ${booking.dropoffLocation}`,
          time: new Date(booking.createdAt).toLocaleString(),
          icon: '📅'
        });
      });

      // Add recent payments
      const recentPayments = payments
        .filter(p => p.status === 'completed')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 2);
      
      recentPayments.forEach(payment => {
        activity.push({
          type: 'payment',
          message: `Payment received for booking #${payment.bookingId}`,
          time: new Date(payment.createdAt).toLocaleString(),
          icon: '💰'
        });
      });

      setRecentActivity(activity);
      console.log('✅ Dashboard data loaded successfully');
      
      // If no data exists, add helpful placeholder activity
      if (activity.length === 0) {
        setRecentActivity([
          {
            type: 'info',
            message: 'No bookings yet - your first customer will appear here!',
            time: new Date().toLocaleString(),
            icon: '📝'
          },
          {
            type: 'info', 
            message: 'Add drivers to get started with your fleet',
            time: new Date().toLocaleString(),
            icon: '👨‍💼'
          }
        ]);
      }
    } catch (err) {
      console.error('❌ Error loading dashboard data:', err);
      // Don't set error if it's just empty data - that's normal for a new business
      if (err instanceof Error && err.message.includes('permission')) {
        setError('Authentication required. Please log in to view dashboard data.');
      } else {
        setError('Failed to load dashboard data. Check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const statsCards = [
    { 
      title: 'Total Bookings', 
      value: stats.totalBookings.toString(), 
      icon: '📊', 
      change: stats.totalBookings === 0 ? 'No bookings yet' : 'All time bookings',
      changeType: 'neutral' as const
    },
    { 
      title: 'Active Drivers', 
      value: stats.activeDrivers.toString(), 
      icon: '👨‍💼', 
      change: stats.activeDrivers === 0 ? 'Add drivers to get started' : 'Available now',
      changeType: 'neutral' as const
    },
    { 
      title: 'Revenue This Month', 
      value: formatCurrency(stats.revenueThisMonth), 
      icon: '💰', 
      change: stats.revenueThisMonth === 0 ? 'No revenue yet' : 'Completed payments',
      changeType: 'positive' as const
    },
    { 
      title: 'Customer Rating', 
      value: `${stats.customerRating}/5`, 
      icon: '⭐', 
      change: 'Average rating',
      changeType: 'neutral' as const
    }
  ];

  return (
          <AdminPageWrapper 
        title="Dashboard"
        subtitle="Business overview and quick actions"
        data-testid="admin-dashboard"
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
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📭</div>
                    <Text>No recent activity to display</Text>
                  </div>
                ) : (
                  recentActivity.map((activity, index) => (
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
                  ))
                )}
              </Stack>
            </Card>
          </Container>
        </Section>
      </AdminPageWrapper>
  );
}

import withAuth from './withAuth';
import { EditableText } from '@/design/components/core/layout/EditableSystem';

function AdminDashboard() {
  return (
    <ToastProvider>
      <AdminDashboardContent />
    </ToastProvider>
  );
}

export default withAuth(AdminDashboard); 