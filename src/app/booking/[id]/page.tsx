'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Container, Text, Button, LoadingSpinner, EditableText, ActionButtonGroup, GridSection, useToast, ToastProvider } from '@/ui';
import { Booking } from '@/types/booking';

function BookingDetailsContent() {
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
            <EditableText field="booking.loading.message" defaultValue="Please wait while we fetch your booking details...">
              Please wait while we fetch your booking details...
            </EditableText>
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
            <EditableText field="booking.error.description" defaultValue="This could be due to an invalid booking ID or a temporary system issue.">
              This could be due to an invalid booking ID or a temporary system issue.
            </EditableText>
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
            <EditableText field="booking.not_found.description" defaultValue="The booking you are looking for could not be found.">
              The booking you are looking for could not be found.
            </EditableText>
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
          <EditableText field="booking.status.title" defaultValue={`${getStatusIcon(booking.status)} Booking Status`}>
            {`${getStatusIcon(booking.status)} Booking Status`}
          </EditableText>
          <EditableText field="booking.status.description" defaultValue={`Your booking is currently ${booking.status}`}>
            Your booking is currently {booking.status}
          </EditableText>
        </Container>
      </GridSection>

      {/* Trip Details */}
      <GridSection variant="content" columns={1}>
        <Container>
          <EditableText field="booking.trip_details.title" defaultValue="📍 Trip Details">
            "📍 Trip Details"
          </EditableText>
          <EditableText field="booking.trip_details.description" defaultValue="Your pickup and dropoff information">
            Your pickup and dropoff information
          </EditableText>
          <Container>
            <EditableText field="booking.pickup_location.label" defaultValue="Pickup Location:">
              Pickup Location:
            </EditableText>
            <Text>{booking.pickupLocation}</Text>
          </Container>
          <Container>
            <EditableText field="booking.dropoff_location.label" defaultValue="Dropoff Location:">
              Dropoff Location:
            </EditableText>
            <Text>{booking.dropoffLocation}</Text>
          </Container>
          <Container>
            <EditableText field="booking.pickup_datetime.label" defaultValue="Pickup Date & Time:">
              Pickup Date & Time:
            </EditableText>
            <Text>{formatDateTime(booking.pickupDateTime)}</Text>
          </Container>
        </Container>
      </GridSection>

      {/* Passenger Information */}
      <GridSection variant="content" columns={1}>
        <Container>
          <EditableText field="booking.passenger_info.title" defaultValue="👤 Passenger Information">
            "👤 Passenger Information"
          </EditableText>
          <EditableText field="booking.passenger_info.description" defaultValue="Your contact details for this booking">
            Your contact details for this booking
          </EditableText>
          <Container spacing="lg">
            <EditableText field="booking.passenger_name.label" defaultValue="Passenger:">
              Passenger:
            </EditableText>
            <Text>{booking.name}</Text>
            <EditableText field="booking.passenger_phone.label" defaultValue="Phone:">
              Phone:
            </EditableText>
            <Text>{booking.phone}</Text>
            <EditableText field="booking.passenger_email.label" defaultValue="Email:">
              Email:
            </EditableText>
            <Text>{booking.email}</Text>
          </Container>
        </Container>
      </GridSection>

      {/* Fare Information */}
      <GridSection variant="content" columns={1}>
        <Container>
          <EditableText field="booking.fare_info.title" defaultValue="💰 Fare Information">
            "�� Fare Information"
          </EditableText>
          <EditableText field="booking.fare_info.description" defaultValue="Payment details for your trip">
            Payment details for your trip
          </EditableText>
          <Container spacing="md">
            <EditableText field="booking.total_fare.label" defaultValue="Total Fare:">
              Total Fare:
            </EditableText>
            <Text>Includes all fees and taxes</Text>
            <Text size="lg">
              ${booking.fare?.toFixed(2)}
            </Text>
          </Container>
        </Container>
      </GridSection>

      {/* Actions */}
      <GridSection variant="content" columns={1}>
        <Container>
          <EditableText field="booking.quick_actions.title" defaultValue="🎯 Quick Actions">
            "🎯 Quick Actions"
          </EditableText>
          <EditableText field="booking.quick_actions.description" defaultValue="Manage your booking or book another ride">
            Manage your booking or book another ride
          </EditableText>
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
