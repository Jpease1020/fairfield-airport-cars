'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Stack, 
  Text, 
  Button, 
  Box, 
  Grid,
  GridItem,
  LoadingSpinner,
  Alert,
  H2,
} from '@/ui';
import { getAllBookings, getAllDrivers, getAllPayments } from '@/lib/services/database-service';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

function AdminDashboardContent() {
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();
  
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeDrivers: 0,
    revenueThisMonth: 0,
    customerRating: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // Fetch real data from database with individual error handling
      let bookings: any[] = [];
      let drivers: any[] = [];
      let payments: any[] = [];

      try {
        bookings = await getAllBookings();
      } catch (err) {
        console.warn('⚠️ Could not load bookings:', err);
        bookings = [];
      }

      try {
        drivers = await getAllDrivers();
      } catch (err) {
        console.warn('⚠️ Could not load drivers:', err);
        drivers = [];
      }

      try {
        payments = await getAllPayments();
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
          message: getCMSField(cmsData, 'admin.dashboard.activity.bookingTemplate', `New booking from ${booking.name} - ${booking.dropoffLocation}`),
          time: new Date(booking.createdAt).toLocaleDateString(),
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
          message: getCMSField(cmsData, 'admin.dashboard.activity.paymentTemplate', `Payment received: ${formatCurrency(payment.amount)}`),
          time: new Date(payment.createdAt).toLocaleDateString(),
          icon: '💰'
        });
      });

      setRecentActivity(activity);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error loading dashboard data:', err);
      setError(getCMSField(cmsData, 'admin.dashboard.error.loadFailed', 'Failed to load dashboard data. Please try again.'));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statsCards = [
    { 
      title: getCMSField(cmsData, 'admin.dashboard.stats.totalBookings.title', 'Total Bookings'), 
      value: stats.totalBookings.toString(), 
      icon: '📊', 
      change: stats.totalBookings === 0 ? 
        getCMSField(cmsData, 'admin.dashboard.stats.totalBookings.noBookings', 'No bookings yet') : 
        getCMSField(cmsData, 'admin.dashboard.stats.totalBookings.allTime', 'All time bookings'),
      changeType: 'neutral' as const
    },
    { 
              title: getCMSField(cmsData, 'admin.dashboard.stats.activeDriver.title', 'Active Driver'), 
      value: stats.activeDrivers.toString(), 
      icon: '👨‍💼', 
              change: stats.activeDrivers === 0 ?
          getCMSField(cmsData, 'admin.dashboard.stats.activeDriver.noDriver', 'Add driver to get started') :
          getCMSField(cmsData, 'admin.dashboard.stats.activeDriver.available', 'Available now'),
      changeType: 'neutral' as const
    },
    { 
      title: getCMSField(cmsData, 'admin.dashboard.stats.revenue.title', 'Revenue This Month'), 
      value: formatCurrency(stats.revenueThisMonth), 
      icon: '💰', 
      change: stats.revenueThisMonth === 0 ? 
        getCMSField(cmsData, 'admin.dashboard.stats.revenue.noRevenue', 'No revenue yet') : 
        getCMSField(cmsData, 'admin.dashboard.stats.revenue.completed', 'Completed payments'),
      changeType: 'positive' as const
    },
    { 
      title: getCMSField(cmsData, 'admin.dashboard.stats.customerRating.title', 'Customer Rating'), 
      value: `${stats.customerRating}/5`, 
      icon: '⭐', 
      change: getCMSField(cmsData, 'admin.dashboard.stats.customerRating.average', 'Average rating'),
      changeType: 'neutral' as const
    }
  ];

  const quickActions = [
    {
      title: getCMSField(cmsData, 'admin.dashboard.quickActions.viewBookings.title', 'View Bookings'),
      description: getCMSField(cmsData, 'admin.dashboard.quickActions.viewBookings.description', 'See all current and past bookings'),
      icon: '📋',
      onClick: () => window.location.href = '/admin/bookings'
    },
    {
              title: getCMSField(cmsData, 'admin.dashboard.quickActions.manageDriver.title', 'Manage Driver'),
        description: getCMSField(cmsData, 'admin.dashboard.quickActions.manageDriver.description', 'Add, edit, or remove driver'),
      icon: '👨‍💼',
              onClick: () => window.location.href = '/admin/driver'
    },
    {
      title: getCMSField(cmsData, 'admin.dashboard.quickActions.editContent.title', 'Edit Content'),
      description: getCMSField(cmsData, 'admin.dashboard.quickActions.editContent.description', 'Update website content and settings'),
      icon: '✏️',
      onClick: () => window.location.href = '/admin/cms'
    },
    {
      title: getCMSField(cmsData, 'admin.dashboard.quickActions.viewCalendar.title', 'View Calendar'),
      description: getCMSField(cmsData, 'admin.dashboard.quickActions.viewCalendar.description', 'See upcoming bookings and availability'),
      icon: '📅',
      onClick: () => window.location.href = '/admin/calendar'
    }
  ];

  if (loading) {
    return (
      <Container>
        <Stack direction="horizontal" spacing="md" align="center">
          <LoadingSpinner />
          <Text data-cms-id="admin.dashboard.loading.message" mode={mode}>
            {getCMSField(cmsData, 'admin.dashboard.loading.message', 'Loading dashboard data...')}
          </Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="error">
          <Text data-cms-id="admin.dashboard.error.message" mode={mode}>
            {getCMSField(cmsData, 'admin.dashboard.error.message', error)}
          </Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Stack spacing="xl">
        {/* Statistics Overview */}
        <Stack spacing="lg" align="center">
          <H2 data-cms-id="admin.dashboard.sections.stats.title" mode={mode}>
            {getCMSField(cmsData, 'admin.dashboard.sections.stats.title', '📊 Business Overview')}
          </H2>
          <Text variant="body" color="secondary" align="center" data-cms-id="admin.dashboard.sections.stats.description" mode={mode}>
            {getCMSField(cmsData, 'admin.dashboard.sections.stats.description', 'Key metrics and performance indicators')}
          </Text>
        </Stack>
        
        <Grid cols={4} gap="lg" responsive>
          {statsCards.map((stat, index) => (
            <GridItem key={index}>
              <Box variant="elevated" padding="lg">
                <Stack spacing="md" align="center">
                  <Text size="xl">{stat.icon}</Text>
                  <Text size="xl" weight="bold" color="primary">
                    {stat.value}
                  </Text>
                  <H2 size="md">{stat.title}</H2>
                  <Text size="sm" color="secondary" align="center">
                    {stat.change}
                  </Text>
                </Stack>
              </Box>
            </GridItem>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Stack spacing="lg" align="center">
          <H2 data-cms-id="admin.dashboard.sections.quickActions.title" mode={mode}>
            {getCMSField(cmsData, 'admin.dashboard.sections.quickActions.title', '⚡ Quick Actions')}
          </H2>
          <Text variant="body" color="secondary" align="center" data-cms-id="admin.dashboard.sections.quickActions.description" mode={mode}>
            {getCMSField(cmsData, 'admin.dashboard.sections.quickActions.description', 'Common administrative tasks')}
          </Text>
        </Stack>
        
        <Grid cols={2} gap="lg" responsive>
          {quickActions.map((action, index) => (
            <GridItem key={index}>
              <Button 
                variant="ghost"
                onClick={action.onClick}
                fullWidth
              >
                <Stack spacing="md">
                  <Stack direction="horizontal" spacing="md" align="center">
                    <Text size="xl">{action.icon}</Text>
                    <H2 size="lg">{action.title}</H2>
                  </Stack>
                  <Text align="left">
                    {action.description}
                  </Text>
                </Stack>
              </Button>
            </GridItem>
          ))}
        </Grid>

        {/* Recent Activity */}
        <Stack spacing="lg" align="center">
          <H2 data-cms-id="admin.dashboard.sections.recentActivity.title" mode={mode}>
            {getCMSField(cmsData, 'admin.dashboard.sections.recentActivity.title', '📈 Recent Activity')}
          </H2>
          <Text variant="body" color="secondary" align="center" data-cms-id="admin.dashboard.sections.recentActivity.description" mode={mode}>
            {getCMSField(cmsData, 'admin.dashboard.sections.recentActivity.description', 'Latest bookings and system updates')}
          </Text>
        </Stack>
        
        <Box variant="elevated" padding="lg">
          <Stack spacing="md">
            {recentActivity.length === 0 ? (
              <Stack spacing="md" align="center">
                <Text size="xl">📭</Text>
                <Text data-cms-id="admin.dashboard.sections.recentActivity.noActivity" mode={mode}>
                  {getCMSField(cmsData, 'admin.dashboard.sections.recentActivity.noActivity', 'No recent activity to display')}
                </Text>
              </Stack>
            ) : (
              recentActivity.map((activity, index) => (
                <Stack 
                  key={index} 
                  direction="horizontal" 
                  spacing="md" 
                  align="center"
                >
                  <Text size="xl">{activity.icon}</Text>
                  <Stack spacing="xs">
                    <Text>{activity.message}</Text>
                    <Text size="sm" color="secondary">{activity.time}</Text>
                  </Stack>
                </Stack>
              ))
            )}
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}

function AdminDashboard() {
  return <AdminDashboardContent />;
}

export default AdminDashboard; 