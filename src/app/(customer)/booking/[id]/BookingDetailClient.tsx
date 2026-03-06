'use client';

import React, { useState, useEffect } from 'react';
import { Container, Text, LoadingSpinner, ActionButtonGroup, GridSection, useToast, ToastProvider } from '@/design/ui';
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

function BookingDetailsContent({ bookingId }: BookingDetailClientProps) {
  const { cmsData: allCmsData } = useCMSData();
  const cmsData = allCmsData?.booking || {};
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
        const response = await authFetch(`/api/booking/get-bookings-simple?id=${bookingId}`);
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
  }, [bookingId]);

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
                onClick: () => addToast('info', 'Text Support: (646) 221-6370'),
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
      onClick: () => window.location.href = `/manage/${booking.id}`,
      variant: 'outline' as const,
      icon: '⚙️'
    },
    {
      id: 'check-status',
      label: 'Check Status',
      onClick: () => window.location.href = `/status/${booking.id}`,
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
          <Text>{cmsData?.['booking-status-title'] || `${getStatusIcon(booking.status)} Booking Status`}</Text>
          <Text>{cmsData?.['booking-status-description'] || `Your booking is currently ${booking.status}`}</Text>
        </Container>
      </GridSection>

      {/* Trip Details */}
      <GridSection variant="content" columns={1}>
        <Container>
          {cmsData?.['booking-trip_details-title'] || '📍 Trip Details'}
          {cmsData?.['booking-trip_details-description'] || 'Your pickup and dropoff information'}
          <Container>
            {cmsData?.['booking-pickup_location-label'] || 'Pickup Location:'}
            <Text>{pickupAddress}</Text>
          </Container>
          <Container>
            {cmsData?.['booking-dropoff_location-label'] || 'Dropoff Location:'}
            <Text>{dropoffAddress}</Text>
          </Container>
          <Container>
            {cmsData?.['booking-pickup_datetime-label'] || 'Pickup Time:'}
            <Text>{formatDateTime(pickupDateTime)}</Text>
          </Container>
        </Container>
      </GridSection>

      {/* Passenger Information */}
      <GridSection variant="content" columns={1}>
        <Container>
          {cmsData?.['booking-passenger_info-title'] || '👤 Passenger Information'}
          {cmsData?.['booking-passenger_info-description'] || 'Your contact details for this booking'}
          <Container spacing="lg">
            {cmsData?.['booking-passenger_name-label'] || 'Passenger:'}
            <Text>{customerName}</Text>
            {cmsData?.['booking-passenger_phone-label'] || 'Phone:'}
            <Text>{customerPhone}</Text>
            {cmsData?.['booking-passenger_email-label'] || 'Email:'}
            <Text>{customerEmail}</Text>
          </Container>
        </Container>
      </GridSection>

      {/* Fare Information */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Container spacing="md">
            <Text>
              {cmsData?.['booking-fare-info-includes-fees'] || 'Includes all fees and taxes'}
            </Text>
            <Text size="lg">
              ${fare.toFixed(2)}
            </Text>
          </Container>
        </Container>
      </GridSection>

      {/* Add to Calendar (conditional) */}
      {showCalendarButton && booking?.id && (
        <GridSection variant="content" columns={1}>
          <Container>
            <AddToCalendarButton
              pickupAddress={pickupAddress}
              dropoffAddress={dropoffAddress}
              pickupDateTime={pickupDateTime}
              bookingId={booking.id}
              customerName={customerName}
              variant="primary"
              size="md"
            />
          </Container>
        </GridSection>
      )}

      {/* Actions */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Text>{cmsData?.['booking-quick-actions-title'] || '🎯 Quick Actions'}</Text>
          <Text>{cmsData?.['booking-quick-actions-description'] || 'Manage your booking or book another ride'}</Text>
          <ActionButtonGroup buttons={actionButtons} />
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
