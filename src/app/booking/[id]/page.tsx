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
            <Container className="booking-loading-container">
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
            <Container className="booking-error-container">
              <Text className="booking-error-message">
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
          <Container className={`booking-status-badge ${getStatusClass(booking.status)}`}>
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
          <Container className="booking-trip-details">
            <Container className="booking-location-item">
              <Span className="booking-location-icon">📍</Span>
              <Container className="booking-location-content">
                <H3 className="booking-location-title">Pickup Location</H3>
                <Text className="booking-location-address">{booking.pickupLocation}</Text>
              </Container>
            </Container>
            <Container className="booking-location-item">
              <Span className="booking-location-icon">🎯</Span>
              <Container className="booking-location-content">
                <H3 className="booking-location-title">Dropoff Location</H3>
                <Text className="booking-location-address">{booking.dropoffLocation}</Text>
              </Container>
            </Container>
            <Container className="booking-location-item">
              <Span className="booking-location-icon">📅</Span>
              <Container className="booking-location-content">
                <H3 className="booking-location-title">Pickup Date & Time</H3>
                <Text className="booking-location-address">{formatDateTime(booking.pickupDateTime)}</Text>
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
          <Container className="booking-passenger-details">
            <Container className="booking-passenger-item">
              <Span className="booking-passenger-icon">👤</Span>
              <Container className="booking-passenger-content">
                <H3 className="booking-passenger-title">Passenger</H3>
                <Text className="booking-passenger-value">{booking.name}</Text>
              </Container>
            </Container>
            <Container className="booking-passenger-item">
              <Span className="booking-passenger-icon">📞</Span>
              <Container className="booking-passenger-content">
                <H3 className="booking-passenger-title">Phone</H3>
                <Text className="booking-passenger-value">{booking.phone}</Text>
              </Container>
            </Container>
            <Container className="booking-passenger-item">
              <Span className="booking-passenger-icon">✉️</Span>
              <Container className="booking-passenger-content">
                <H3 className="booking-passenger-title">Email</H3>
                <Text className="booking-passenger-value">{booking.email}</Text>
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
          <Container className="booking-fare-details">
            <Container className="booking-fare-item">
              <Span className="booking-fare-icon">💳</Span>
              <Container className="booking-fare-content">
                <H3 className="booking-fare-title">Total Fare</H3>
                <Text className="booking-fare-description">Includes all fees and taxes</Text>
              </Container>
              <Container className="booking-fare-amount">
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
