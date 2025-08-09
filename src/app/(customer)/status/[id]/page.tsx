'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Container, Text, Button, LoadingSpinner, ActionButtonGroup, GridSection, useToast, ToastProvider } from '@/ui';
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';

function BookingStatusPageContent() {
  const { cmsData } = useCMSData();
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
            <Text>
              {getCMSField(cmsData, 'pages.status.loading.message', 'Please wait while we fetch your booking details...')}
            </Text>
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
            <Text>
              {getCMSField(cmsData, 'pages.status.error.description', 'This could be due to an invalid booking ID or a temporary system issue.')}
            </Text>
            <ActionButtonGroup buttons={[
              {
                id: 'try-again',
                label: getCMSField(cmsData, 'pages.status.actions.tryAgain', 'Try Again'),
                onClick: () => window.location.reload(),
                variant: 'primary',
                icon: '🔄'
              },
              {
                id: 'contact-support',
                label: getCMSField(cmsData, 'pages.status.actions.contactSupport', 'Contact Support'),
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
            {getStatusText(status) === 'confirmed' && getCMSField(cmsData, 'pages.status.confirmed.description', 'Your ride is confirmed and driver assigned')}
            {getStatusText(status) === 'en-route' && getCMSField(cmsData, 'pages.status.enRoute.description', 'Your driver is on the way to pick you up')}
            {getStatusText(status) === 'arrived' && getCMSField(cmsData, 'pages.status.arrived.description', 'Your driver has arrived at the pickup location')}
            {getStatusText(status) === 'completed' && getCMSField(cmsData, 'pages.status.completed.description', 'Your ride has been completed successfully')}
            {getStatusText(status) === 'cancelled' && getCMSField(cmsData, 'pages.status.cancelled.description', 'This booking has been cancelled')}
            {getStatusText(status) === 'Unknown' && getCMSField(cmsData, 'pages.status.unknown.description', 'We are processing your booking request')}
          </Text>

          {estimatedArrival && (
            <Text>
              <strong>
                {getCMSField(cmsData, 'pages.status.estimatedArrival.label', '⏰ Estimated Arrival:')}
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
            {getCMSField(cmsData, 'pages.status.showDetails.button', showDetails ? 'Hide' : 'Show')}
            {getCMSField(cmsData, 'pages.status.showDetails.label', ' booking details')}
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
                  {getCMSField(cmsData, 'pages.status.labels.bookingId', 'Booking ID:')}
                </strong> {bookingId}
              </Text>
              <Text>
                <strong>
                  {getCMSField(cmsData, 'pages.status.labels.pickup', 'Pickup:')}
                </strong> {booking?.pickupLocation || 'N/A'}
              </Text>
              <Text>
                <strong>
                  {getCMSField(cmsData, 'pages.status.labels.dropoff', 'Dropoff:')}
                </strong> {booking?.dropoffLocation || 'N/A'}
              </Text>
              <Text>
                <strong>
                  {getCMSField(cmsData, 'pages.status.labels.date', 'Date:')}
                </strong> {booking?.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}
              </Text>
              <Text>
                <strong>
                  {getCMSField(cmsData, 'pages.status.labels.time', 'Time:')}
                </strong> {booking?.time || 'N/A'}
              </Text>
              <Text>
                <strong>
                  {getCMSField(cmsData, 'pages.status.labels.fare', 'Fare:')}
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
