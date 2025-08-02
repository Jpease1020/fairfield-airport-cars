'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Container, Text, Button, LoadingSpinner, EditableText, ActionButtonGroup, GridSection, useToast, ToastProvider } from '@/ui';

function BookingStatusPageContent() {
  const params = useParams();
  const { addToast } = useToast();
  const bookingId = params.id as string;
  
  const [status, setStatus] = useState<string>('loading');
  const [estimatedArrival, setEstimatedArrival] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [booking, setBooking] = useState<any>(null);

  const getStatusText = (status: any) => {
    const statusMap: { [key: string]: string } = {
      'confirmed': 'Confirmed',
      'en-route': 'En Route',
      'arrived': 'Arrived',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'loading': 'Loading'
    };
    return statusMap[status] || 'Unknown';
  };

  const getStatusIcon = (status: any) => {
    const iconMap: { [key: string]: string } = {
      'confirmed': '✅',
      'en-route': '👨‍💼',
      'arrived': '📍',
      'completed': '🏁',
      'cancelled': '❌',
      'loading': '⏳'
    };
    return iconMap[status] || '❓';
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/booking/${bookingId}/status`);
        if (response.ok) {
          const data = await response.json();
          setStatus(data.status);
          setBooking(data.booking);
          setEstimatedArrival(data.estimatedArrival ? new Date(data.estimatedArrival) : null);
        } else {
          setError('Failed to load booking status');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        setError('Failed to load booking');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [bookingId]);

  const quickActions = [
    {
      id: 'manage-booking',
      label: 'Manage Booking',
      onClick: () => window.location.href = `/manage/${bookingId}`,
      variant: 'primary' as const,
      icon: '📋'
    },
    {
      id: 'contact-driver',
      label: 'Contact Driver',
      onClick: () => addToast('info', 'Driver contact feature coming soon'),
      variant: 'outline' as const,
      icon: '📞'
    },
    {
      id: 'get-support',
      label: 'Get Support',
      onClick: () => addToast('info', 'Support: (203) 555-0123'),
      variant: 'outline' as const,
      icon: '🆘'
    }
  ];

  if (loading) {
    return (
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            <LoadingSpinner />
            <EditableText field="status.loading.message" defaultValue="Please wait while we fetch your booking details...">
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
            <EditableText field="status.error.description" defaultValue="This could be due to an invalid booking ID or a temporary system issue.">
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

  return (
    <Container variant="default" padding="none">
      {/* Current Status */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Text>
            <EditableText field="status.confirmed.description" defaultValue="Your ride is confirmed and driver assigned">
              {getStatusText(status) === 'confirmed' && 'Your ride is confirmed and driver assigned'}
            </EditableText>
            <EditableText field="status.enRoute.description" defaultValue="Your driver is on the way to pick you up">
              {getStatusText(status) === 'en-route' && 'Your driver is on the way to pick you up'}
            </EditableText>
            <EditableText field="status.arrived.description" defaultValue="Your driver has arrived at the pickup location">
              {getStatusText(status) === 'arrived' && 'Your driver has arrived at the pickup location'}
            </EditableText>
            <EditableText field="status.completed.description" defaultValue="Your ride has been completed successfully">
              {getStatusText(status) === 'completed' && 'Your ride has been completed successfully'}
            </EditableText>
            <EditableText field="status.cancelled.description" defaultValue="This booking has been cancelled">
              {getStatusText(status) === 'cancelled' && 'This booking has been cancelled'}
            </EditableText>
            <EditableText field="status.unknown.description" defaultValue="We are processing your booking request">
              {getStatusText(status) === 'Unknown' && 'We are processing your booking request'}
            </EditableText>
          </Text>

          {estimatedArrival && (
            <Text>
              <strong>
                <EditableText field="status.estimatedArrival.label" defaultValue="⏰ Estimated Arrival:">
                  ⏰ Estimated Arrival:
                </EditableText>
              </strong> {estimatedArrival ? estimatedArrival.toString() : 'Calculating...'}
            </Text>
          )}
        </Container>
      </GridSection>

      {/* Quick Actions */}
      <GridSection variant="content" columns={1}>
        <Container>
          <ActionButtonGroup buttons={quickActions} />
        </Container>
      </GridSection>

      {/* Booking Details Toggle */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="ghost"
            size="sm"
          >
            <EditableText field="status.showDetails.button" defaultValue={showDetails ? 'Hide' : 'Show'}>
              {showDetails ? 'Hide' : 'Show'}
            </EditableText>
            <EditableText field="status.showDetails.label" defaultValue=" booking details">
              {' booking details'}
            </EditableText>
          </Button>
        </Container>
      </GridSection>

      {/* Booking Details */}
      {showDetails && (
        <GridSection variant="content" columns={1}>
          <Container>
            <div>
              <Text>
                <strong>
                  <EditableText field="status.bookingId.label" defaultValue="Booking ID:">
                    Booking ID:
                  </EditableText>
                </strong> {bookingId}
              </Text>
              <Text>
                <strong>
                  <EditableText field="status.pickup.label" defaultValue="Pickup:">
                    Pickup:
                  </EditableText>
                </strong> {booking?.pickupLocation || 'N/A'}
              </Text>
              <Text>
                <strong>
                  <EditableText field="status.dropoff.label" defaultValue="Dropoff:">
                    Dropoff:
                  </EditableText>
                </strong> {booking?.dropoffLocation || 'N/A'}
              </Text>
              <Text>
                <strong>
                  <EditableText field="status.date.label" defaultValue="Date:">
                    Date:
                  </EditableText>
                </strong> {booking?.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}
              </Text>
              <Text>
                <strong>
                  <EditableText field="status.time.label" defaultValue="Time:">
                    Time:
                  </EditableText>
                </strong> {booking?.time || 'N/A'}
              </Text>
              <Text>
                <strong>
                  <EditableText field="status.fare.label" defaultValue="Fare:">
                    Fare:
                  </EditableText>
                </strong> ${booking?.fare || 'N/A'}
              </Text>
            </div>
          </Container>
        </GridSection>
      )}
    </Container>
  );
}

export default function BookingStatusPage() {
  return (
    <ToastProvider>
      <BookingStatusPageContent />
    </ToastProvider>
  );
}
