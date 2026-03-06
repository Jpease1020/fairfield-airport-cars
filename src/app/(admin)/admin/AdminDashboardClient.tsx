'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Alert, Box, Button, Container, Grid, GridItem, H2, LoadingSpinner, Stack, Text } from '@/design/ui';
import { getAllBookings } from '@/lib/services/database-service';
import { authFetch } from '@/lib/utils/auth-fetch';
import { formatBusinessDateTimeWithZone } from '@/lib/utils/booking-date-time';
import { isSmsInboxClientEnabled } from '@/lib/utils/sms-inbox-feature-client';

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

interface DashboardSnapshot {
  pendingApprovals: number;
  todaysRides: number;
  nextRideText: string;
  monthCosts: number;
  health: HealthStatus;
}

const baseNavLinks = [
  { href: '/admin/bookings', label: 'Bookings', description: 'View and manage all bookings' },
  { href: '/admin/payments', label: 'Payments', description: 'Track payments, refunds, and balances' },
  { href: '/admin/costs', label: 'Costs', description: 'Track Twilio, SendGrid, Firebase, and cloud spend' },
  { href: '/admin/schedules', label: 'Schedule', description: 'Manage rides and driver schedule' },
  { href: '/admin/settings', label: 'Settings', description: 'Update business rules and core settings' },
  { href: '/admin/health', label: 'Health', description: 'Check system status and service health' },
];

const toMonthKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const isSameLocalDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

function formatNextRide(date: Date | null): string {
  if (!date) return 'No upcoming rides';
  return formatBusinessDateTimeWithZone(date);
}

export default function AdminDashboardClient() {
  const smsInboxEnabled = isSmsInboxClientEnabled();
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>({
    pendingApprovals: 0,
    todaysRides: 0,
    nextRideText: 'No upcoming rides',
    monthCosts: 0,
    health: 'unknown',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navLinks = useMemo(() => {
    if (!smsInboxEnabled) return baseNavLinks;

    return [
      baseNavLinks[0],
      baseNavLinks[1],
      { href: '/admin/messages', label: 'Messages', description: 'Send customer updates and reminders' },
      ...baseNavLinks.slice(2),
    ];
  }, [smsInboxEnabled]);

  async function loadSnapshot() {
    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      const month = toMonthKey(now);

      const [bookingsResult, costsResult, healthResult] = await Promise.allSettled([
        getAllBookings(),
        authFetch(`/api/admin/costs?month=${month}`),
        authFetch('/api/admin/health'),
      ]);

      let pendingApprovals = 0;
      let todaysRides = 0;
      let nextRideDate: Date | null = null;
      if (bookingsResult.status === 'fulfilled') {
        const bookings = bookingsResult.value;
        pendingApprovals = bookings.filter((booking) => booking.status === 'requires_approval').length;

        const futureDates: Date[] = [];
        for (const booking of bookings) {
          const pickupDate = new Date(booking.pickupDateTime);
          if (Number.isNaN(pickupDate.getTime())) continue;
          if (isSameLocalDay(pickupDate, now)) todaysRides += 1;
          if (pickupDate >= now && booking.status !== 'cancelled') futureDates.push(pickupDate);
        }

        futureDates.sort((a, b) => a.getTime() - b.getTime());
        nextRideDate = futureDates[0] ?? null;
      }

      let monthCosts = 0;
      if (costsResult.status === 'fulfilled' && costsResult.value.ok) {
        const costsData = await costsResult.value.json();
        monthCosts = (costsData.entries || []).reduce(
          (sum: number, entry: { amount?: number }) => sum + Number(entry.amount || 0),
          0
        );
      }

      let health: HealthStatus = 'unknown';
      if (healthResult.status === 'fulfilled' && healthResult.value.ok) {
        const healthData = await healthResult.value.json();
        health = (healthData.status as HealthStatus) || 'unknown';
      }

      setSnapshot({
        pendingApprovals,
        todaysRides,
        nextRideText: formatNextRide(nextRideDate),
        monthCosts,
        health,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin home');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSnapshot();
  }, []);

  const healthLabel = useMemo(() => {
    if (snapshot.health === 'healthy') return 'Healthy';
    if (snapshot.health === 'degraded') return 'Degraded';
    if (snapshot.health === 'unhealthy') return 'Unhealthy';
    return 'Unknown';
  }, [snapshot.health]);

  return (
    <Container maxWidth="full" padding="xl">
      <Stack spacing="xl">
        <Stack spacing="sm">
          <H2>Admin Home</H2>
          <Text color="muted">Quick access for Gregg. Keep this page simple and actionable.</Text>
        </Stack>

        {error && (
          <Alert variant="error">
            <Text>{error}</Text>
          </Alert>
        )}

        <Grid cols={{ xs: 1, md: 2, lg: 3 }} gap="lg">
          {navLinks.map((item) => (
            <GridItem key={item.href}>
              <Link href={item.href} style={{ textDecoration: 'none' }}>
                <Box variant="elevated" padding="lg">
                  <Stack spacing="sm">
                    <Text weight="bold">{item.label}</Text>
                    <Text size="sm" color="muted">
                      {item.description}
                    </Text>
                  </Stack>
                </Box>
              </Link>
            </GridItem>
          ))}
        </Grid>

        <Box variant="elevated" padding="lg">
          <Stack spacing="md">
            <Stack direction="horizontal" align="center" justify="space-between">
              <Text weight="bold">At A Glance</Text>
              <Button variant="outline" size="sm" onClick={loadSnapshot} disabled={loading} text={loading ? 'Refreshing…' : 'Refresh'} />
            </Stack>

            {loading ? (
              <Stack direction="horizontal" spacing="sm" align="center">
                <LoadingSpinner size="sm" />
                <Text size="sm">Loading snapshot…</Text>
              </Stack>
            ) : (
              <Stack spacing="sm">
                <Text>Pending approvals: {snapshot.pendingApprovals}</Text>
                <Text>Today&apos;s rides: {snapshot.todaysRides}</Text>
                <Text>Next ride: {snapshot.nextRideText}</Text>
                <Text>
                  This month&apos;s costs: $
                  {formatCurrency(snapshot.monthCosts)}
                </Text>
                <Text>System health: {healthLabel}</Text>
              </Stack>
            )}
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
