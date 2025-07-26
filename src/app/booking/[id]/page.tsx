'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { UnifiedLayout } from '@/components/layout';
import { 
  GridSection,
  InfoCard,
  ActionButtonGroup,
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
            <div className="booking-loading-container">
              <LoadingSpinner text="Loading booking details..." />
            </div>
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
            <div className="booking-error-container">
              <p className="booking-error-message">
                {error || 'The booking you are looking for could not be found.'}
              </p>
              <ActionButtonGroup buttons={[
                {
                  label: 'Book a New Ride',
                  onClick: () => window.location.href = '/book',
                  variant: 'primary' as const,
                  icon: '🚗'
                }
              ]} />
            </div>
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
          <div className={`booking-status-badge ${getStatusClass(booking.status)}`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </div>
        </InfoCard>
      </GridSection>

      {/* Trip Details */}
      <GridSection variant="content" columns={1}>
        <InfoCard 
          title="📍 Trip Details"
          description="Your pickup and dropoff information"
        >
          <div className="booking-trip-details">
            <div className="booking-location-item">
              <span className="booking-location-icon">📍</span>
              <div className="booking-location-content">
                <h3 className="booking-location-title">Pickup Location</h3>
                <p className="booking-location-address">{booking.pickupLocation}</p>
              </div>
            </div>
            <div className="booking-location-item">
              <span className="booking-location-icon">🎯</span>
              <div className="booking-location-content">
                <h3 className="booking-location-title">Dropoff Location</h3>
                <p className="booking-location-address">{booking.dropoffLocation}</p>
              </div>
            </div>
            <div className="booking-location-item">
              <span className="booking-location-icon">📅</span>
              <div className="booking-location-content">
                <h3 className="booking-location-title">Pickup Date & Time</h3>
                <p className="booking-location-address">{formatDateTime(booking.pickupDateTime)}</p>
              </div>
            </div>
          </div>
        </InfoCard>
      </GridSection>

      {/* Passenger Information */}
      <GridSection variant="content" columns={1}>
        <InfoCard 
          title="👤 Passenger Information"
          description="Your contact details for this booking"
        >
          <div className="booking-passenger-details">
            <div className="booking-passenger-item">
              <span className="booking-passenger-icon">👤</span>
              <div className="booking-passenger-content">
                <h3 className="booking-passenger-title">Passenger</h3>
                <p className="booking-passenger-value">{booking.name}</p>
              </div>
            </div>
            <div className="booking-passenger-item">
              <span className="booking-passenger-icon">📞</span>
              <div className="booking-passenger-content">
                <h3 className="booking-passenger-title">Phone</h3>
                <p className="booking-passenger-value">{booking.phone}</p>
              </div>
            </div>
            <div className="booking-passenger-item">
              <span className="booking-passenger-icon">✉️</span>
              <div className="booking-passenger-content">
                <h3 className="booking-passenger-title">Email</h3>
                <p className="booking-passenger-value">{booking.email}</p>
              </div>
            </div>
          </div>
        </InfoCard>
      </GridSection>

      {/* Fare Information */}
      <GridSection variant="content" columns={1}>
        <InfoCard 
          title="💰 Fare Information"
          description="Payment details for your trip"
        >
          <div className="booking-fare-details">
            <div className="booking-fare-item">
              <span className="booking-fare-icon">💳</span>
              <div className="booking-fare-content">
                <h3 className="booking-fare-title">Total Fare</h3>
                <p className="booking-fare-description">Includes all fees and taxes</p>
              </div>
              <div className="booking-fare-amount">
                ${booking.fare?.toFixed(2)}
              </div>
            </div>
          </div>
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
