'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Container, Text, Button, LoadingSpinner, ActionButtonGroup, GridSection, useToast, ToastProvider } from '@/ui';
import { Booking } from '@/types/booking';
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';

function BookingDetailsContent() {
  const { cmsData } = useCMSData();
  const params = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/booking/get-booking/${params.id}`);
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

    if (params.id) {
      fetchBooking();
    }
  }, [params.id]);

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
            {getCMSField(cmsData, 'booking.loading.message', 'Please wait while we fetch your booking details...')}
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
            {getCMSField(cmsData, 'booking.error.description', 'This could be due to an invalid booking ID or a temporary system issue.')}
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
            {getCMSField(cmsData, 'booking.not_found.description', 'The booking you are looking for could not be found.')}
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
          {getCMSField(cmsData, 'booking.status.title', `${getStatusIcon(booking.status)} Booking Status`)}
          {getCMSField(cmsData, 'booking.status.description', `Your booking is currently ${booking.status}`)}
        </Container>
      </GridSection>

      {/* Trip Details */}
      <GridSection variant="content" columns={1}>
        <Container>
          {getCMSField(cmsData, 'booking.trip_details.title', '📍 Trip Details')}
          {getCMSField(cmsData, 'booking.trip_details.description', 'Your pickup and dropoff information')}
          <Container>
            {getCMSField(cmsData, 'booking.pickup_location.label', 'Pickup Location:')}
            <Text>{booking.pickupLocation}</Text>
          </Container>
          <Container>
            {getCMSField(cmsData, 'booking.dropoff_location.label', 'Dropoff Location:')}
            <Text>{booking.dropoffLocation}</Text>
          </Container>
          <Container>
            {getCMSField(cmsData, 'booking.pickup_datetime.label', 'Pickup Date & Time:')}
            <Text>{formatDateTime(booking.pickupDateTime)}</Text>
          </Container>
        </Container>
      </GridSection>

      {/* Passenger Information */}
      <GridSection variant="content" columns={1}>
        <Container>
            {getCMSField(cmsData, 'booking.passenger_info.title', '👤 Passenger Information')}
          {getCMSField(cmsData, 'booking.passenger_info.description', 'Your contact details for this booking')}
          <Container spacing="lg">
            {getCMSField(cmsData, 'booking.passenger_name.label', 'Passenger:')}
            <Text>{booking.name}</Text>
            {getCMSField(cmsData, 'booking.passenger_phone.label', 'Phone:')}
            <Text>{booking.phone}</Text>
            {getCMSField(cmsData, 'booking.passenger_email.label', 'Email:')}
            <Text>{booking.email}</Text>
          </Container>
        </Container>
      </GridSection>

      {/* Fare Information */}
      <GridSection variant="content" columns={1}>
        <Container>
          {getCMSField(cmsData, 'booking.fare_info.title', '💰 Fare Information')}
          {getCMSField(cmsData, 'booking.fare_info.description', 'Payment details for your trip')}
          <Container spacing="md">
            {getCMSField(cmsData, 'booking.total_fare.label', 'Total Fare:')}
            <Text>
              {getCMSField(cmsData, 'booking.fare_info.includes_fees', 'Includes all fees and taxes')}
            </Text>
            <Text size="lg">
              ${booking.fare?.toFixed(2)}
            </Text>
          </Container>
        </Container>
      </GridSection>

      {/* Actions */}
      <GridSection variant="content" columns={1}>
        <Container>
          {getCMSField(cmsData, 'booking.quick_actions.title', '🎯 Quick Actions')}
          {getCMSField(cmsData, 'booking.quick_actions.description', 'Manage your booking or book another ride')}
          <ActionButtonGroup buttons={actionButtons} />
        </Container>
      </GridSection>
    </Container>
  );
}

export default function BookingDetailsPage() {
  return (
    <ToastProvider>
      <BookingDetailsContent />
    </ToastProvider>
  );
}
