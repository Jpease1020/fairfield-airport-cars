'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Text, 
  Stack, 
  Box,
  Badge,
  ActionButtonGroup,
  LoadingSpinner,
  GridSection
} from '@/ui';
import { businessDashboardService } from '@/lib/services/business-dashboard-service';

// Metric card component
const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  color = 'primary' 
}: { 
  title: string; 
  value: string; 
  change?: string; 
  icon: string; 
  color?: string;
}) => (
  <Box variant="outlined" padding="lg" rounded="lg">
    <Stack direction="vertical" spacing="md">
      <Stack direction="horizontal" spacing="sm" align="center">
        <Text variant="body" size="lg">{icon}</Text>
        <Text variant="small" color="muted">{title}</Text>
      </Stack>
      <Text variant="lead" size="xl" weight="bold" color={color as any}>
        {value}
      </Text>
      {change && (
        <Text variant="small" color={change.startsWith('+') ? 'success' : 'error'}>
          {change}
        </Text>
      )}
    </Stack>
  </Box>
);

// Revenue chart component
const RevenueChart = ({ data }: { data: any[] }) => (
  <Box variant="outlined" padding="lg" rounded="lg">
    <Stack direction="vertical" spacing="md">
      <Text variant="lead" weight="bold">
        Revenue Trend
      </Text>
      <Stack direction="vertical" spacing="sm">
        {data.map((item, index) => (
          <Stack key={index} direction="horizontal" spacing="md" align="center">
            <Text variant="small" color="muted">
              {item.period}
            </Text>
            <Text variant="small" weight="medium">
              ${item.amount.toLocaleString()}
            </Text>
          </Stack>
        ))}
      </Stack>
    </Stack>
  </Box>
);

// Recent bookings component
const RecentBookings = ({ bookings }: { bookings: any[] }) => (
  <Box variant="outlined" padding="lg" rounded="lg">
    <Stack direction="vertical" spacing="md">
      <Text variant="lead" weight="bold">
        Recent Bookings
      </Text>
      <Stack direction="vertical" spacing="sm">
        {bookings.map((booking, index) => (
          <Stack key={index} direction="horizontal" spacing="md" align="center">
            <Badge variant={booking.status === 'completed' ? 'success' : 'default'}>
              {booking.status}
            </Badge>
            <Stack direction="vertical" spacing="xs">
              <Text variant="small" weight="medium">
                {booking.customerName}
              </Text>
              <Text variant="small" color="muted">
                {booking.pickupLocation} → {booking.dropoffLocation}
              </Text>
            </Stack>
            <Text variant="small" weight="bold">
              ${booking.amount}
            </Text>
          </Stack>
        ))}
      </Stack>
    </Stack>
  </Box>
);

export default function BusinessDashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await businessDashboardService.getDashboardData(timeRange);
        setDashboardData(data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [timeRange]);

  if (loading) {
    return (
      <Container variant="default" padding="lg">
        <Stack direction="vertical" spacing="lg" align="center">
          <LoadingSpinner text="Loading business dashboard..." />
        </Stack>
      </Container>
    );
  }

  if (error || !dashboardData) {
    return (
      <Container variant="default" padding="lg">
        <Stack direction="vertical" spacing="lg" align="center">
          <Text variant="body" color="error">
            {error || 'Unable to load dashboard data'}
          </Text>
          <ActionButtonGroup buttons={[
            {
              id: 'retry',
              label: 'Retry',
              onClick: () => window.location.reload(),
              variant: 'primary',
              icon: '🔄'
            }
          ]} />
        </Stack>
      </Container>
    );
  }

  return (
    <Container variant="default" padding="lg">
      <Stack direction="vertical" spacing="xl">
        <Stack direction="vertical" spacing="md" align="center">
          <Text variant="lead" size="xl" weight="bold">
            Business Dashboard
          </Text>
          <Text variant="body" color="muted" align="center">
            Track your earnings, expenses, and business performance
          </Text>
        </Stack>

        {/* Time Range Selector */}
        <Stack direction="horizontal" spacing="md" align="center" justify="center">
          <ActionButtonGroup buttons={[
            {
              id: 'week',
              label: 'Week',
              onClick: () => setTimeRange('week'),
              variant: timeRange === 'week' ? 'primary' : 'outline',
              icon: '📅'
            },
            {
              id: 'month',
              label: 'Month',
              onClick: () => setTimeRange('month'),
              variant: timeRange === 'month' ? 'primary' : 'outline',
              icon: '📅'
            },
            {
              id: 'quarter',
              label: 'Quarter',
              onClick: () => setTimeRange('quarter'),
              variant: timeRange === 'quarter' ? 'primary' : 'outline',
              icon: '📅'
            }
          ]} />
        </Stack>

        {/* Key Metrics */}
        <GridSection columns={4} gap="lg">
          <MetricCard
            title="Total Revenue"
            value={`$${dashboardData.revenue.total.toLocaleString()}`}
            change={dashboardData.revenue.change}
            icon="💰"
            color="success"
          />
          <MetricCard
            title="Total Bookings"
            value={dashboardData.bookings.total.toString()}
            change={dashboardData.bookings.change}
            icon="📋"
          />
          <MetricCard
            title="Average Fare"
            value={`$${dashboardData.averageFare.toFixed(0)}`}
            change={dashboardData.averageFareChange}
            icon="🚗"
          />
          <MetricCard
            title="Customer Rating"
            value={`${dashboardData.rating}⭐`}
            change={dashboardData.ratingChange}
            icon="⭐"
            color="warning"
          />
        </GridSection>

        {/* Revenue and Bookings Charts */}
        <GridSection columns={2} gap="lg">
          <RevenueChart data={dashboardData.revenueTrend} />
          <Box variant="outlined" padding="lg" rounded="lg">
            <Stack direction="vertical" spacing="md">
              <Text variant="lead" weight="bold">
                Booking Status
              </Text>
              <Stack direction="vertical" spacing="sm">
                {dashboardData.bookingStatus.map((status: any, index: number) => (
                  <Stack key={index} direction="horizontal" spacing="md" align="center">
                    <Badge variant={status.color as any}>
                      {status.label}
                    </Badge>
                    <Text variant="small">
                      {status.count} bookings
                    </Text>
                    <Text variant="small" color="muted">
                      {status.percentage}%
                    </Text>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Box>
        </GridSection>

        {/* Recent Activity */}
        <GridSection columns={2} gap="lg">
          <RecentBookings bookings={dashboardData.recentBookings} />
          <Box variant="outlined" padding="lg" rounded="lg">
            <Stack direction="vertical" spacing="md">
              <Text variant="lead" weight="bold">
                Top Routes
              </Text>
              <Stack direction="vertical" spacing="sm">
                {dashboardData.topRoutes.map((route: any, index: number) => (
                  <Stack key={index} direction="horizontal" spacing="md" align="center">
                    <Text variant="small" color="muted">
                      #{index + 1}
                    </Text>
                    <Stack direction="vertical" spacing="xs">
                      <Text variant="small" weight="medium">
                        {route.from} → {route.to}
                      </Text>
                      <Text variant="small" color="muted">
                        {route.bookings} bookings
                      </Text>
                    </Stack>
                    <Text variant="small" weight="bold">
                      ${route.revenue.toLocaleString()}
                    </Text>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Box>
        </GridSection>

        {/* Action Buttons */}
        <ActionButtonGroup buttons={[
          {
            id: 'export-report',
            label: 'Export Report',
            onClick: () => businessDashboardService.exportReport(timeRange),
            variant: 'primary',
            icon: '📊'
          },
          {
            id: 'view-details',
            label: 'View Details',
            onClick: () => window.location.href = '/admin/bookings',
            variant: 'outline',
            icon: '📋'
          },
          {
            id: 'tax-summary',
            label: 'Tax Summary',
            onClick: () => businessDashboardService.generateTaxSummary(),
            variant: 'outline',
            icon: '📄'
          }
        ]} />
      </Stack>
    </Container>
  );
} 