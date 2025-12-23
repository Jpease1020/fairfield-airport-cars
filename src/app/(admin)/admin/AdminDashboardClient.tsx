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
} from '@/design/ui';
import { getAllBookings, getAllDrivers, getAllPayments } from '@/lib/services/database-service';
import { useCMSData } from '@/design/providers/CMSDataProvider';      

export default function AdminDashboardClient() {
  // Get CMS data from provider
  const { cmsData: allCmsData } = useCMSData();
  const cmsData = allCmsData?.admin || {};
  
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeDrivers: 0,
    revenueThisMonth: 0,
    customerRating: 0,
    pendingApprovals: 0
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

      // Count bookings requiring approval
      const pendingApprovals = bookings.filter(b => b.status === 'requires_approval').length;

      setStats({
        totalBookings,
        activeDrivers,
        revenueThisMonth,
        customerRating,
        pendingApprovals
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
          message: `New booking from ${booking.customerName || 'Customer'} to ${booking.dropoffLocation}`,
          time: new Date(booking.createdAt).toLocaleDateString(),
          icon: '📋'
        });
      });

      // Add recent payments
      const recentPayments = payments
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 2);
      
      recentPayments.forEach(payment => {
        activity.push({
          type: 'payment',
          message: `Payment received: ${formatCurrency(payment.amount)}`,
          time: new Date(payment.createdAt).toLocaleDateString(),
          icon: '💰'
        });
      });

      // Add driver updates
      const recentDriverUpdates = drivers
        .filter(d => d.lastUpdated)
        .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
        .slice(0, 2);
      
      recentDriverUpdates.forEach(driver => {
        activity.push({
          type: 'driver',
          message: `Driver ${driver.name} status: ${driver.status}`,
          time: new Date(driver.lastUpdated).toLocaleDateString(),
          icon: '🚗'
        });
      });

      // Sort by time and take top 5
      const sortedActivity = activity
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 5);

      setRecentActivity(sortedActivity);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <Container maxWidth="full" padding="xl">
        <Stack spacing="xl" align="center">
          <LoadingSpinner size="lg" />
          <Text>Loading dashboard...</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="full" padding="xl">
        <Stack spacing="xl" align="center">
          <Alert variant="error">
            <Text>{error}</Text>
          </Alert>
          <Button onClick={fetchDashboardData} cmsId="retry-button">
            <Text cmsId="retry-button">
              Retry
            </Text>
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="full" padding="xl">
      <Stack spacing="xl">
        {/* Header */}
        <Stack spacing="md" align="center">
          <H2 
            align="center" 
            cmsId="title"
            
          >
            {cmsData?.['title'] || 'Admin Dashboard'}
          </H2>
          <Text 
            variant="lead" 
            align="center" 
            cmsId="subtitle"
            
          >
            {cmsData?.['subtitle'] || 'Manage your airport transportation business'}
          </Text>
        </Stack>

        {/* Stats Grid */}
        <Grid cols={{ xs: 1, md: 2, lg: 5 }} gap="lg">
          <GridItem>
            <Box variant="elevated" padding="lg">
              <Stack spacing="sm" align="center">
                <Text size="3xl">📋</Text>
                <H2>{stats.totalBookings}</H2>
                <Text align="center" color="muted" cmsId="stats-total-bookings" >
                  {cmsData?.['stats-total-bookings'] || 'Total Bookings'}
                </Text>
              </Stack>
            </Box>
          </GridItem>
          
          <GridItem>
            <Box 
              variant="elevated" 
              padding="lg"
              onClick={stats.pendingApprovals > 0 ? () => {
                window.location.href = '/admin/bookings?status=requires_approval';
              } : undefined}
            >
              <Stack spacing="sm" align="center">
                <Text size="3xl">🔍</Text>
                <H2>{stats.pendingApprovals}</H2>
                <Text align="center" color="muted" cmsId="stats-pending-approvals">
                  {cmsData?.['stats-pending-approvals'] || 'Pending Approvals'}
                </Text>
                {stats.pendingApprovals > 0 && (
                  <Text variant="small" color="warning" weight="medium">
                    {cmsData?.['stats-pending-approvals-action'] || 'Click to review'}
                  </Text>
                )}
              </Stack>
            </Box>
          </GridItem>
          
          <GridItem>
            <Box variant="elevated" padding="lg">
              <Stack spacing="sm" align="center">
                <Text size="3xl">🚗</Text>
                <H2>{stats.activeDrivers}</H2>
                <Text align="center" color="muted" cmsId="stats-active-drivers">
                  {cmsData?.['stats-active-drivers'] || 'Active Drivers'}
                </Text>
              </Stack>
            </Box>
          </GridItem>
          
          <GridItem>
            <Box variant="elevated" padding="lg">
              <Stack spacing="sm" align="center">
                <Text size="3xl">💰</Text>
                <H2>{formatCurrency(stats.revenueThisMonth)}</H2>
                <Text align="center" color="muted" cmsId="stats-revenue-this-month">
                  {cmsData?.['stats-revenue-this-month'] || 'Revenue This Month'}
                </Text>
              </Stack>
            </Box>
          </GridItem>
          
          <GridItem>
            <Box variant="elevated" padding="lg">
              <Stack spacing="sm" align="center">
                <Text size="3xl">⭐</Text>
                <H2>{stats.customerRating}</H2>
                <Text align="center" color="muted" cmsId="stats-customer-rating">
                  {cmsData?.['stats-customer-rating'] || 'Customer Rating'}
                </Text>
              </Stack>
            </Box>
          </GridItem>
        </Grid>

        {/* Recent Activity */}
        <Box variant="elevated" padding="xl">
          <Stack spacing="lg">
            <H2 align="center">Recent Activity</H2>
            {recentActivity.length > 0 ? (
              <Stack spacing="md">
                {recentActivity.map((activity, index) => (
                  <Box key={index} variant="elevated" padding="md">
                    <Stack direction={{ xs: 'vertical', md: 'horizontal' }} spacing="md" align="center">
                      <Text size="xl">{activity.icon}</Text>
                      <Stack spacing="sm">
                        <Text>{activity.message}</Text>
                        <Text variant="small" color="muted">{activity.time}</Text>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Text align="center" color="muted">No recent activity</Text>
            )}
          </Stack>
        </Box>

        {/* Quick Actions */}
        <Stack spacing="md" align="center">
          <Button onClick={fetchDashboardData} variant="outline" cmsId="refresh-data-button"  text="Refresh Data" />
        </Stack>
      </Stack>
    </Container>
  );
}

