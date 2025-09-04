'use client';

import React, { useState, useEffect } from 'react';
import { Container, Text, LoadingSpinner, ActionButtonGroup, GridSection, useToast, ToastProvider } from '@/ui';
import { Booking } from '@/types/booking';
import { useCMSData } from '@/design/providers/CMSDataProvider';

interface BookingDetailClientProps {
  bookingId: string;
}

function BookingDetailsContent({ bookingId }: BookingDetailClientProps) {
  const { cmsData: allCmsData } = useCMSData();
  const cmsData = allCmsData?.booking || {};
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/booking/get-bookings-simple?id=${bookingId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch booking');
        }
        const data = await response.json();
        setBooking(data);
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

  const formatDateTime = (dateTime: Date) => {
    return dateTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                label: 'Contact Support',
                onClick: () => addToast('info', 'Support: (203) 555-0123'),
                variant: 'outline',
                icon: '📞'
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
            <Text>{booking.pickupLocation}</Text>
          </Container>
          <Container>
            {cmsData?.['booking-dropoff_location-label'] || 'Dropoff Location:'}
            <Text>{booking.dropoffLocation}</Text>
          </Container>
          <Container>
            {cmsData?.['booking-pickup_datetime-label'] || 'Pickup Date & Time:'}
            <Text>{formatDateTime(booking.pickupDateTime)}</Text>
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
            <Text>{booking.name}</Text>
            {cmsData?.['booking-passenger_phone-label'] || 'Phone:'}
            <Text>{booking.phone}</Text>
            {cmsData?.['booking-passenger_email-label'] || 'Email:'}
            <Text>{booking.email}</Text>
          </Container>
        </Container>
      </GridSection>

      {/* Fare Information */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Container spacing="md">
            <Text cmsId="booking-fare-info-includes-fees">
              {cmsData?.['booking-fare-info-includes-fees'] || 'Includes all fees and taxes'}
            </Text>
            <Text size="lg" cmsId="ignore">
              ${booking.fare?.toFixed(2)}
            </Text>
          </Container>
        </Container>
      </GridSection>

      {/* Actions */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Text cmsId="booking-quick-actions-title">{cmsData?.['booking-quick-actions-title'] || '🎯 Quick Actions'}</Text>
          <Text cmsId="booking-quick-actions-description">{cmsData?.['booking-quick-actions-description'] || 'Manage your booking or book another ride'}</Text>
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
