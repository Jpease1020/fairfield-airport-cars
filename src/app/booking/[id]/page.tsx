'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { 
  GridSection, 
  InfoCard, 
  ActionButtonGroup,
  Container,
  H3,
  Text,
  Span,
  LoadingSpinner
} from '@/components/ui';
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
      case 'cancelled':
        return '❌';
      case 'completed':
        return '✅';
      default:
        return '⏰';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'booking-status-confirmed';
      case 'cancelled':
        return 'booking-status-cancelled';
      case 'completed':
        return 'booking-status-completed';
      default:
        return 'booking-status-pending';
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
      <UnifiedLayout 
        layoutType="standard"
        title="Loading Booking Details"
        subtitle="Please wait while we fetch your booking information"
      >
        <GridSection variant="content" columns={1}>
          <InfoCard title="Loading..." description="Fetching booking details">
            <Container>
              <LoadingSpinner text="Loading booking details..." />
            </Container>
          </InfoCard>
        </GridSection>
      </UnifiedLayout>
    );
  }

  if (error || !booking) {
    return (
      <UnifiedLayout 
        layoutType="standard"
        title="Booking Not Found"
        subtitle="We couldn't find the booking you're looking for"
      >
        <GridSection variant="content" columns={1}>
          <InfoCard title="❌ Booking Not Found" description="The booking could not be found">
            <Container>
              <Text>
                {error || 'The booking you are looking for could not be found.'}
              </Text>
              <ActionButtonGroup buttons={[
                {
                  label: 'Book a New Ride',
                  onClick: () => window.location.href = '/book',
                  variant: 'primary' as const,
                  icon: '🚗'
                }
              ]} />
            </Container>
          </InfoCard>
        </GridSection>
      </UnifiedLayout>
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
      icon: '🚗'
    }
  ];

  return (
    <UnifiedLayout 
      layoutType="standard"
      title="Booking Details"
      subtitle={`Booking #${booking.id}`}
    >
      {/* Booking Status */}
      <GridSection variant="content" columns={1}>
        <InfoCard 
          title={`${getStatusIcon(booking.status)} Booking Status`}
          description={`Your booking is currently ${booking.status}`}
        >
          <Container>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Container>
        </InfoCard>
      </GridSection>

      {/* Trip Details */}
      <GridSection variant="content" columns={1}>
        <InfoCard 
          title="📍 Trip Details"
          description="Your pickup and dropoff information"
        >
          <Container>
            <Container >
              <Span >📍</Span>
              <Container >
                <H3 >Pickup Location</H3>
                <Text >{booking.pickupLocation}</Text>
              </Container>
            </Container>
            <Container >
              <Span >🎯</Span>
              <Container >
                <H3 >Dropoff Location</H3>
                <Text >{booking.dropoffLocation}</Text>
              </Container>
            </Container>
            <Container >
              <Span >📅</Span>
              <Container >
                <H3 >Pickup Date & Time</H3>
                <Text >{formatDateTime(booking.pickupDateTime)}</Text>
              </Container>
            </Container>
          </Container>
        </InfoCard>
      </GridSection>

      {/* Passenger Information */}
      <GridSection variant="content" columns={1}>
        <InfoCard 
          title="👤 Passenger Information"
          description="Your contact details for this booking"
        >
          <Container>
            <Container >
              <Span >👤</Span>
              <Container >
                <H3 >Passenger</H3>
                <Text >{booking.name}</Text>
              </Container>
            </Container>
            <Container >
              <Span >📞</Span>
              <Container >
                <H3 >Phone</H3>
                <Text >{booking.phone}</Text>
              </Container>
            </Container>
            <Container >
              <Span >✉️</Span>
              <Container >
                <H3 >Email</H3>
                <Text >{booking.email}</Text>
              </Container>
            </Container>
          </Container>
        </InfoCard>
      </GridSection>

      {/* Fare Information */}
      <GridSection variant="content" columns={1}>
        <InfoCard 
          title="💰 Fare Information"
          description="Payment details for your trip"
        >
          <Container>
            <Container>
              <Span>💳</Span>
              <Container>
                <H3>Total Fare</H3>
                <Text>Includes all fees and taxes</Text>
              </Container>
              <Container>
                ${booking.fare?.toFixed(2)}
              </Container>
            </Container>
          </Container>
        </InfoCard>
      </GridSection>

      {/* Actions */}
      <GridSection variant="content" columns={1}>
        <InfoCard 
          title="🎯 Quick Actions"
          description="Manage your booking or book another ride"
        >
          <ActionButtonGroup buttons={actionButtons} />
        </InfoCard>
      </GridSection>
    </UnifiedLayout>
  );
}

export default function BookingDetailsPage() {
  return <BookingDetailsContent />;
}
