'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Container, Text, Button, LoadingSpinner, ActionButtonGroup, GridSection, useToast, ToastProvider, H1, H2, Stack, Box } from '@/ui';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

function BookingStatusPageContent() {
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();
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
      'confirmed': getCMSField(cmsData, 'confirmed', 'Confirmed'),
      'en-route': getCMSField(cmsData, 'enRoute', 'En Route'),
      'arrived': getCMSField(cmsData, 'arrived', 'Arrived'),
      'completed': getCMSField(cmsData, 'completed', 'Completed'),
      'cancelled': getCMSField(cmsData, 'cancelled', 'Cancelled'),
      'loading': getCMSField(cmsData, 'loading', 'Loading')
    };
    return statusMap[status] || getCMSField(cmsData, 'unknown', 'Unknown');
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
          setError(getCMSField(cmsData, 'loadFailed', 'Failed to load booking status'));
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        setError(getCMSField(cmsData, 'loadFailed', 'Failed to load booking'));
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [bookingId, cmsData]);

  const quickActions = [
    {
      id: 'manage-booking',
      label: getCMSField(cmsData, 'manageBooking', 'Manage Booking'),
      onClick: () => window.location.href = `/manage/${bookingId}`,
      variant: 'primary' as const,
      icon: '📋'
    },
    {
      id: 'contact-driver',
      label: getCMSField(cmsData, 'contactDriver', 'Contact Driver'),
      onClick: () => addToast('info', getCMSField(cmsData, 'driverContactComingSoon', 'Driver contact feature coming soon')),
      variant: 'outline' as const,
      icon: '📞'
    },
    {
      id: 'get-support',
      label: getCMSField(cmsData, 'getSupport', 'Get Support'),
      onClick: () => addToast('info', getCMSField(cmsData, 'supportContact', 'Support: (203) 555-0123')),
      variant: 'outline' as const,
      icon: '🆘'
    }
  ];

  if (loading) {
    return (
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            <Stack spacing="lg" align="center">
              <LoadingSpinner />
              <Text align="center" data-cms-id="status-loading-message" mode={mode}>
                {getCMSField(cmsData, 'message', 'Please wait while we fetch your booking details...')}
              </Text>
            </Stack>
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
            <Stack spacing="lg" align="center">
              <H1 align="center" data-cms-id="status-error-title" mode={mode}>
                {getCMSField(cmsData, 'title', 'Unable to Load Booking')}
              </H1>
              <Text align="center" data-cms-id="status-error-description" mode={mode}>
                {getCMSField(cmsData, 'description', 'This could be due to an invalid booking ID or a temporary system issue.')}
              </Text>
              <ActionButtonGroup buttons={[
                {
                  id: 'try-again',
                  label: getCMSField(cmsData, 'tryAgain', 'Try Again'),
                  onClick: () => window.location.reload(),
                  variant: 'primary',
                  icon: '🔄'
                },
                {
                  id: 'contact-support',
                  label: getCMSField(cmsData, 'contactSupport', 'Contact Support'),
                  onClick: () => addToast('info', getCMSField(cmsData, 'supportContact', 'Support: (203) 555-0123')),
                  variant: 'outline',
                  icon: '📞'
                }
              ]} />
            </Stack>
          </Container>
        </GridSection>
      </Container>
    );
  }

  return (
    <Container variant="default" padding="none">
      {/* Page Header */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg" align="center">
            <H1 align="center" data-cms-id="status-main-title" mode={mode}>
              {getCMSField(cmsData, 'title', 'Booking Status')}
            </H1>
            <Text align="center" data-cms-id="status-subtitle" mode={mode}>
              {getCMSField(cmsData, 'subtitle', `Tracking your ride for booking #${bookingId}`)}
            </Text>
          </Stack>
        </Container>
      </GridSection>

      {/* Current Status */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Box variant="elevated" padding="lg">
            <Stack spacing="md" align="center">
              <Text size="2xl" align="center">{getStatusIcon(status)}</Text>
              <H2 align="center" data-cms-id="current-status-title" mode={mode}>
                {getCMSField(cmsData, 'currentStatus-title', 'Current Status')}
              </H2>
              <Text align="center" size="lg" data-cms-id="current-status-status" mode={mode}>
                {getStatusText(status)}
              </Text>
              <Text align="center" data-cms-id="current-status-description" mode={mode}>
                {getStatusText(status) === 'confirmed' && getCMSField(cmsData, 'confirmed', 'Your ride is confirmed and driver assigned')}
                {getStatusText(status) === 'en-route' && getCMSField(cmsData, 'enRoute', 'Your driver is on the way to pick you up')}
                {getStatusText(status) === 'arrived' && getCMSField(cmsData, 'arrived', 'Your driver has arrived at the pickup location')}
                {getStatusText(status) === 'completed' && getCMSField(cmsData, 'completed', 'Your ride has been completed successfully')}
                {getStatusText(status) === 'cancelled' && getCMSField(cmsData, 'cancelled', 'This booking has been cancelled')}
                {getStatusText(status) === 'Unknown' && getCMSField(cmsData, 'unknown', 'We are processing your booking request')}
              </Text>

              {estimatedArrival && (
                <Text align="center" data-cms-id="estimated-arrival-message" mode={mode}>
                  <strong>
                    {getCMSField(cmsData, 'label', '⏰ Estimated Arrival:')}
                  </strong> {estimatedArrival ? estimatedArrival.toString() : getCMSField(cmsData, 'calculating', 'Calculating...')}
                </Text>
              )}
            </Stack>
          </Box>
        </Container>
      </GridSection>

      {/* Quick Actions */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="md" align="center">
            <H2 align="center" data-cms-id="status-actions-title" mode={mode}>
              {getCMSField(cmsData, 'actions-title', 'Quick Actions')}
            </H2>
            <ActionButtonGroup buttons={quickActions} />
          </Stack>
        </Container>
      </GridSection>

      {/* Booking Details Toggle */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="md" align="center">
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="ghost"
              size="sm"
              data-cms-id="show-details-button"
            >
              {getCMSField(cmsData, 'show-details-button', showDetails ? 'Hide' : 'Show')}
              {getCMSField(cmsData, 'show-details-label', ' booking details')}
            </Button>
          </Stack>
        </Container>
      </GridSection>

      {/* Booking Details */}
      {showDetails && (
        <GridSection variant="content" columns={1}>
          <Container>
            <Box variant="elevated" padding="lg">
              <Stack spacing="md">
                <H2 data-cms-id="booking-details-title" mode={mode}>
                  {getCMSField(cmsData, 'booking-details-title', 'Booking Details')}
                </H2>
                <div>
                  <Text data-cms-id="booking-details-booking-id" mode={mode}>
                    <strong>
                      {getCMSField(cmsData, 'booking-details-booking-id', 'Booking ID:')}
                    </strong> {bookingId}
                  </Text>
                  <Text data-cms-id="booking-details-pickup" mode={mode}>
                    <strong>
                      {getCMSField(cmsData, 'booking-details-pickup', 'Pickup:')}
                    </strong> {booking?.pickupLocation || getCMSField(cmsData, 'pickup-notAvailable', 'N/A')}
                  </Text>
                  <Text data-cms-id="booking-details-dropoff" mode={mode}>
                    <strong>
                      {getCMSField(cmsData, 'booking-details-dropoff', 'Dropoff:')}
                    </strong> {booking?.dropoffLocation || getCMSField(cmsData, 'dropoff-notAvailable', 'N/A')}
                  </Text>
                  <Text data-cms-id="booking-details-date" mode={mode}>
                    <strong>
                      {getCMSField(cmsData, 'booking-details-date', 'Date:')}
                    </strong> {booking?.date ? new Date(booking.date).toLocaleDateString() : getCMSField(cmsData, 'date-notAvailable', 'N/A')}
                  </Text>
                    <Text data-cms-id="booking-details-time" mode={mode}>
                    <strong>
                      {getCMSField(cmsData, 'booking-details-time', 'Time:')}
                    </strong> {booking?.time || getCMSField(cmsData, 'time-notAvailable', 'N/A')}
                  </Text>
                  <Text data-cms-id="booking-details-fare" mode={mode}>
                    <strong>
                      {getCMSField(cmsData, 'booking-details-fare', 'Fare:')}
                    </strong> ${booking?.fare || getCMSField(cmsData, 'fare-notAvailable', 'N/A')}
                  </Text>
                </div>
              </Stack>
            </Box>
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
