'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { Box, Button, Container, H2, Stack, Text, LoadingSpinner, ActionButtonGroup, GridSection, useToast, ToastProvider } from '@/design/ui';
import { Booking } from '@/types/booking';
import { useCMSData } from '@/design/providers/CMSDataProvider';
import { AddToCalendarButton } from '@/components/business/AddToCalendarButton';
import { hasCalendarBeenAdded } from '@/lib/utils/calendar-utils';
import { authFetch } from '@/lib/utils/auth-fetch';
import { formatBusinessDateTimeWithZone } from '@/lib/utils/booking-date-time';
import { parseBookingDate } from '@/utils/booking-helpers';

interface BookingDetailClientProps {
  bookingId: string;
}

const NarrowActionContainer = styled.div`
  width: 100%;
  max-width: 360px;
`;

const ResponsiveActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr));
  gap: 16px;
  width: 100%;
  max-width: 760px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

function BookingDetailsContent({ bookingId }: BookingDetailClientProps) {
  const { cmsData: allCmsData } = useCMSData();
  const cmsData = allCmsData?.booking || {};
  const searchParams = useSearchParams();
  const trackingToken = searchParams?.get('token') ?? '';
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCalendarButton, setShowCalendarButton] = useState(false);
  const { addToast } = useToast();

  // Check if calendar was already added (must be before early returns)
  useEffect(() => {
    if (booking?.id && typeof window !== 'undefined') {
      try {
        setShowCalendarButton(!hasCalendarBeenAdded(booking.id));
      } catch {
        // localStorage might not be available in test environment
        setShowCalendarButton(true);
      }
    }
  }, [booking?.id]);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const tokenQuery = trackingToken ? `&token=${encodeURIComponent(trackingToken)}` : '';
        const response = await authFetch(`/api/booking/get-bookings-simple?id=${bookingId}${tokenQuery}`);
        if (!response.ok) {
          throw new Error('Failed to fetch booking');
        }
        const data = await response.json();
        if (data.success && data.booking) {
          // Normalize dates: convert ISO strings to Date objects
          const rawBooking = data.booking;
          const normalizedBooking: Booking = {
            ...rawBooking,
            createdAt: rawBooking.createdAt ? new Date(rawBooking.createdAt) : new Date(),
            updatedAt: rawBooking.updatedAt ? new Date(rawBooking.updatedAt) : new Date(),
            trip: {
              ...rawBooking.trip,
              pickupDateTime: rawBooking.trip?.pickupDateTime || rawBooking.pickupDateTime || ''
            },
            // Normalize optional driver date fields
            ...(rawBooking.driver && {
              driver: {
                ...rawBooking.driver,
                ...(rawBooking.driver.estimatedArrival && {
                  estimatedArrival: typeof rawBooking.driver.estimatedArrival === 'string' 
                    ? new Date(rawBooking.driver.estimatedArrival)
                    : rawBooking.driver.estimatedArrival
                }),
                ...(rawBooking.driver.actualArrival && {
                  actualArrival: typeof rawBooking.driver.actualArrival === 'string'
                    ? new Date(rawBooking.driver.actualArrival)
                    : rawBooking.driver.actualArrival
                })
              }
            }),
            // Normalize optional tracking date fields
            ...(rawBooking.tracking && {
              tracking: {
                ...rawBooking.tracking,
                ...(rawBooking.tracking.lastUpdated && {
                  lastUpdated: typeof rawBooking.tracking.lastUpdated === 'string'
                    ? new Date(rawBooking.tracking.lastUpdated)
                    : rawBooking.tracking.lastUpdated
                }),
                ...(rawBooking.tracking.driverLocation && {
                  driverLocation: {
                    ...rawBooking.tracking.driverLocation,
                    ...(rawBooking.tracking.driverLocation.timestamp && {
                      timestamp: typeof rawBooking.tracking.driverLocation.timestamp === 'string'
                        ? new Date(rawBooking.tracking.driverLocation.timestamp)
                        : rawBooking.tracking.driverLocation.timestamp
                    })
                  }
                })
              }
            })
          };
          setBooking(normalizedBooking);
        } else {
          throw new Error(data.error || 'Failed to fetch booking');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId, trackingToken]);

  const withToken = (path: string) =>
    trackingToken ? `${path}?token=${encodeURIComponent(trackingToken)}` : path;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '✅';
      case 'pending':
        return '⏳';
      case 'cancelled':
        return '❌';
      default:
        return '❓';
    }
  };

  const formatDateTime = (dateTime: unknown) => {
    if (!dateTime) return 'Not specified';
    const date = parseBookingDate(dateTime);
    if (!date) return 'Invalid date';
    return formatBusinessDateTimeWithZone(date);
  };

  if (loading) {
    return (
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            <LoadingSpinner />
            {cmsData?.['booking-loading-message'] || 'Please wait while we fetch your booking details...'}
          </Container>
        </GridSection>
      </Container>
    );
  }

  if (error) {
    return (
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            {cmsData?.['booking-error-description'] || 'This could be due to an invalid booking ID or a temporary system issue.'}
            <ActionButtonGroup buttons={[
              {
                id: 'try-again',
                label: 'Try Again',
                onClick: () => window.location.reload(),
                variant: 'primary',
                icon: '🔄'
              },
              {
                id: 'contact-support',
                label: 'Text Support',
                onClick: () => addToast('info', 'Text Support: (203) 990-1815'),
                variant: 'outline',
                icon: '💬'
              }
            ]} />
          </Container>
        </GridSection>
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            {cmsData?.['booking-not_found-description'] || 'The booking you are looking for could not be found.'}
            <ActionButtonGroup buttons={[
              {
                id: 'book-new-ride',
                label: 'Book a New Ride',
                onClick: () => window.location.href = '/book',
                variant: 'primary',
                icon: '📅'
              }
            ]} />
          </Container>
        </GridSection>
      </Container>
    );
  }

  // Direct access to clean nested structure - no legacy fallbacks
  const pickupAddress = booking.trip.pickup.address || 'Not specified';
  const dropoffAddress = booking.trip.dropoff.address || 'Not specified';
  const pickupDateTime = booking.trip.pickupDateTime;
  const customerName = booking.customer.name || 'Not specified';
  const customerPhone = booking.customer.phone || 'Not specified';
  const customerEmail = booking.customer.email || 'Not specified';
  const fare = booking.trip.fare || 0;

  const actionButtons = [
    {
      id: 'manage-booking',
      label: 'Manage Booking',
      onClick: () => window.location.href = withToken(`/manage/${booking.id}`),
      variant: 'outline' as const,
      icon: '⚙️'
    },
    {
      id: 'check-status',
      label: 'Check Status',
      onClick: () => window.location.href = withToken(`/status/${booking.id}`),
      variant: 'outline' as const,
      icon: '📊'
    },
    {
      id: 'book-another-ride',
      label: 'Book Another Ride',
      onClick: () => window.location.href = '/book',
      variant: 'primary' as const,
      icon: '📅'
    }
  ];

  return (
    <Container variant="default" padding="none">
      {/* Booking Status */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Box variant="elevated" padding="lg">
            <Stack spacing="sm" align="center">
              <Text size="lg" weight="bold">
                {cmsData?.['booking-status-title'] || `${getStatusIcon(booking.status)} Booking Status`}
              </Text>
              <Text align="center">
                {cmsData?.['booking-status-description'] || `Your booking is currently ${booking.status}`}
              </Text>
            </Stack>
          </Box>
        </Container>
      </GridSection>

      {/* Trip Details */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Box variant="elevated" padding="lg">
            <Stack spacing="lg">
              <Stack spacing="sm">
                <H2>{cmsData?.['booking-trip_details-title'] || '📍 Trip Details'}</H2>
                <Text color="secondary">
                  {cmsData?.['booking-trip_details-description'] || 'Your pickup and dropoff information'}
                </Text>
              </Stack>
              <Stack spacing="md">
                <Stack spacing="xs">
                  <Text size="sm" weight="bold">{cmsData?.['booking-pickup_location-label'] || 'Pickup Location:'}</Text>
                  <Text>{pickupAddress}</Text>
                </Stack>
                <Stack spacing="xs">
                  <Text size="sm" weight="bold">{cmsData?.['booking-dropoff_location-label'] || 'Dropoff Location:'}</Text>
                  <Text>{dropoffAddress}</Text>
                </Stack>
                <Stack spacing="xs">
                  <Text size="sm" weight="bold">{cmsData?.['booking-pickup_datetime-label'] || 'Pickup Time:'}</Text>
                  <Text>{formatDateTime(pickupDateTime)}</Text>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </Container>
      </GridSection>

      {/* Passenger Information */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Box variant="elevated" padding="lg">
            <Stack spacing="lg">
              <Stack spacing="sm">
                <H2>{cmsData?.['booking-passenger_info-title'] || '👤 Passenger Information'}</H2>
                <Text color="secondary">
                  {cmsData?.['booking-passenger_info-description'] || 'Your contact details for this booking'}
                </Text>
              </Stack>
              <Stack spacing="md">
                <Stack spacing="xs">
                  <Text size="sm" weight="bold">{cmsData?.['booking-passenger_name-label'] || 'Passenger:'}</Text>
                  <Text>{customerName}</Text>
                </Stack>
                <Stack spacing="xs">
                  <Text size="sm" weight="bold">{cmsData?.['booking-passenger_phone-label'] || 'Phone:'}</Text>
                  <Text>{customerPhone}</Text>
                </Stack>
                <Stack spacing="xs">
                  <Text size="sm" weight="bold">{cmsData?.['booking-passenger_email-label'] || 'Email:'}</Text>
                  <Text>{customerEmail}</Text>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </Container>
      </GridSection>

      {/* Fare Information */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Box variant="elevated" padding="lg">
            <Stack spacing="sm" align="center">
              <Text color="secondary">
                {cmsData?.['booking-fare-info-includes-fees'] || 'Includes all fees and taxes'}
              </Text>
              <Text size="lg" weight="bold">
                ${fare.toFixed(2)}
              </Text>
            </Stack>
          </Box>
        </Container>
      </GridSection>

      {/* Add to Calendar (conditional) */}
      {showCalendarButton && booking?.id && (
        <GridSection variant="content" columns={1}>
          <Container>
            <Box variant="elevated" padding="lg">
              <Stack align="center">
                <NarrowActionContainer>
                  <AddToCalendarButton
                    pickupAddress={pickupAddress}
                    dropoffAddress={dropoffAddress}
                    pickupDateTime={pickupDateTime}
                    bookingId={booking.id}
                    customerName={customerName}
                    variant="primary"
                    size="md"
                    fullWidth
                  />
                </NarrowActionContainer>
              </Stack>
            </Box>
          </Container>
        </GridSection>
      )}

      {/* Actions */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Box variant="elevated" padding="lg">
            <Stack spacing="md" align="center">
              <Text size="lg" weight="bold">{cmsData?.['booking-quick-actions-title'] || '🎯 Quick Actions'}</Text>
              <Text align="center" color="secondary">
                {cmsData?.['booking-quick-actions-description'] || 'Manage your booking or book another ride'}
              </Text>
              <ResponsiveActionGrid>
                {actionButtons.map((action) => (
                  <Button
                    key={action.id}
                    onClick={action.onClick}
                    variant={action.variant}
                    fullWidth
                  >
                    {action.icon} {action.label}
                  </Button>
                ))}
              </ResponsiveActionGrid>
            </Stack>
          </Box>
        </Container>
      </GridSection>
    </Container>
  );
}

export default function BookingDetailClient({ bookingId }: BookingDetailClientProps) {
  return (
    <ToastProvider>
      <BookingDetailsContent bookingId={bookingId} />
    </ToastProvider>
  );
}
