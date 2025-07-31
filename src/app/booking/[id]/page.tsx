'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  GridSection, 
  ActionButtonGroup,
  Container,
  H3,
  Text,
  Span,
  LoadingSpinner,
  Card,
} from '@/ui';
import { Layout, Stack } from '@/ui';
import { Booking } from '@/types/booking';

function BookingDetailsContent() {
  const params = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <Layout>
        <GridSection variant="content" columns={1}>
          <Card title="Loading..." description="Fetching booking details">
            <Container>
              <LoadingSpinner text="Loading booking details..." />
            </Container>
          </Card>
        </GridSection>
      </Layout>
    );
  }

  if (error || !booking) {
    return (
      <Layout>
        <GridSection variant="content" columns={1}>
          <Card title="❌ Booking Not Found" description="The booking could not be found">
            <Container>
              <Text>
                {error || 'The booking you are looking for could not be found.'}
              </Text>
              <ActionButtonGroup buttons={[
                {
                  label: 'Book a New Ride',
                  onClick: () => window.location.href = '/book',
                  variant: 'primary' as const,
                  icon: '📅'
                }
              ]} />
            </Container>
          </Card>
        </GridSection>
      </Layout>
    );
  }

  const actionButtons = [
    {
      label: 'Manage Booking',
      onClick: () => window.location.href = `/manage/${booking.id}`,
      variant: 'outline' as const,
      icon: '⚙️'
    },
    {
      label: 'Check Status',
      onClick: () => window.location.href = `/status/${booking.id}`,
      variant: 'outline' as const,
      icon: '📊'
    },
    {
      label: 'Book Another Ride',
      onClick: () => window.location.href = '/book',
      variant: 'primary' as const,
      icon: '📅'
    }
  ];

  return (
    <Layout>
      {/* Booking Status */}
      <GridSection variant="content" columns={1}>
        <Card 
          title={`${getStatusIcon(booking.status)} Booking Status`}
          description={`Your booking is currently ${booking.status}`}
        >
          <Container>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Container>
        </Card>
      </GridSection>

      {/* Trip Details */}
      <GridSection variant="content" columns={1}>
        <Card 
          title="📍 Trip Details"
          description="Your pickup and dropoff information"
        >
          <Container>
            <Span>📍</Span>
            <H3>Pickup Location</H3>
            <Text>{booking.pickupLocation}</Text>
          </Container>
          <Container>
            <Span>🎯</Span>
            <H3>Dropoff Location</H3>
            <Text>{booking.dropoffLocation}</Text>
          </Container>
          <Container>
            <Span>📅</Span>
            <H3>Pickup Date & Time</H3>
            <Text>{formatDateTime(booking.pickupDateTime)}</Text>
          </Container>
        </Card>    </GridSection>

      {/* Passenger Information */}
      <GridSection variant="content" columns={1}>
        <Card 
          title="👤 Passenger Information"
          description="Your contact details for this booking"
        >
          <Container spacing="lg">
            <Stack direction="horizontal" align="center" spacing="md">
              <Span>👤</Span>
              <H3>Passenger</H3>
              <Text>{booking.name}</Text>
            </Stack>
            <Stack direction="horizontal" align="center" spacing="md">
              <Span>📞</Span>
              <H3>Phone</H3>
              <Text>{booking.phone}</Text>
            </Stack>
            <Stack direction="horizontal" align="center" spacing="md">
              <Span>✉️</Span>
              <H3>Email</H3>
              <Text>{booking.email}</Text>
            </Stack>
          </Container>
        </Card>
      </GridSection>

      {/* Fare Information */}
      <GridSection variant="content" columns={1}>
        <Card 
          title="💰 Fare Information"
          description="Payment details for your trip"
        >
          <Stack direction="horizontal" align="center" spacing="md">
            <Span>💳</Span>
            <H3>Total Fare</H3>
            <Text>Includes all fees and taxes</Text>
            <Text size="lg">
              ${booking.fare?.toFixed(2)}
            </Text>
          </Stack>
        </Card>
      </GridSection>

      {/* Actions */}
      <GridSection variant="content" columns={1}>
        <Card 
          title="🎯 Quick Actions"
          description="Manage your booking or book another ride"
        >
          <ActionButtonGroup buttons={actionButtons} />
        </Card>
              </GridSection>
      </Layout>
    );
}

export default function BookingDetailsPage() {
  return <BookingDetailsContent />;
}
