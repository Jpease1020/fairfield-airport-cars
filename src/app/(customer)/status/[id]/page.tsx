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
      'confirmed': getCMSField(cmsData, 'pages.status.statusText.confirmed', 'Confirmed'),
      'en-route': getCMSField(cmsData, 'pages.status.statusText.enRoute', 'En Route'),
      'arrived': getCMSField(cmsData, 'pages.status.statusText.arrived', 'Arrived'),
      'completed': getCMSField(cmsData, 'pages.status.statusText.completed', 'Completed'),
      'cancelled': getCMSField(cmsData, 'pages.status.statusText.cancelled', 'Cancelled'),
      'loading': getCMSField(cmsData, 'pages.status.statusText.loading', 'Loading')
    };
    return statusMap[status] || getCMSField(cmsData, 'pages.status.statusText.unknown', 'Unknown');
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
          setError(getCMSField(cmsData, 'pages.status.errors.loadFailed', 'Failed to load booking status'));
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        setError(getCMSField(cmsData, 'pages.status.errors.loadFailed', 'Failed to load booking'));
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [bookingId, cmsData]);

  const quickActions = [
    {
      id: 'manage-booking',
      label: getCMSField(cmsData, 'pages.status.actions.manageBooking', 'Manage Booking'),
      onClick: () => window.location.href = `/manage/${bookingId}`,
      variant: 'primary' as const,
      icon: '📋'
    },
    {
      id: 'contact-driver',
      label: getCMSField(cmsData, 'pages.status.actions.contactDriver', 'Contact Driver'),
      onClick: () => addToast('info', getCMSField(cmsData, 'pages.status.messages.driverContactComingSoon', 'Driver contact feature coming soon')),
      variant: 'outline' as const,
      icon: '📞'
    },
    {
      id: 'get-support',
      label: getCMSField(cmsData, 'pages.status.actions.getSupport', 'Get Support'),
      onClick: () => addToast('info', getCMSField(cmsData, 'pages.status.messages.supportContact', 'Support: (203) 555-0123')),
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
              <Text align="center" data-cms-id="pages.status.loading.message" mode={mode}>
                {getCMSField(cmsData, 'pages.status.loading.message', 'Please wait while we fetch your booking details...')}
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
              <H1 align="center" data-cms-id="pages.status.error.title" mode={mode}>
                {getCMSField(cmsData, 'pages.status.error.title', 'Unable to Load Booking')}
              </H1>
              <Text align="center" data-cms-id="pages.status.error.description" mode={mode}>
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
                  onClick: () => addToast('info', getCMSField(cmsData, 'pages.status.messages.supportContact', 'Support: (203) 555-0123')),
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
            <H1 align="center" data-cms-id="pages.status.title" mode={mode}>
              {getCMSField(cmsData, 'pages.status.title', 'Booking Status')}
            </H1>
            <Text align="center" data-cms-id="pages.status.subtitle" mode={mode}>
              {getCMSField(cmsData, 'pages.status.subtitle', `Tracking your ride for booking #${bookingId}`)}
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
              <H2 align="center" data-cms-id="pages.status.currentStatus.title" mode={mode}>
                {getCMSField(cmsData, 'pages.status.currentStatus.title', 'Current Status')}
              </H2>
              <Text align="center" size="lg" data-cms-id="pages.status.currentStatus.status" mode={mode}>
                {getStatusText(status)}
              </Text>
              <Text align="center" data-cms-id="pages.status.currentStatus.description" mode={mode}>
                {getStatusText(status) === 'confirmed' && getCMSField(cmsData, 'pages.status.currentStatus.confirmed', 'Your ride is confirmed and driver assigned')}
                {getStatusText(status) === 'en-route' && getCMSField(cmsData, 'pages.status.currentStatus.enRoute', 'Your driver is on the way to pick you up')}
                {getStatusText(status) === 'arrived' && getCMSField(cmsData, 'pages.status.currentStatus.arrived', 'Your driver has arrived at the pickup location')}
                {getStatusText(status) === 'completed' && getCMSField(cmsData, 'pages.status.currentStatus.completed', 'Your ride has been completed successfully')}
                {getStatusText(status) === 'cancelled' && getCMSField(cmsData, 'pages.status.currentStatus.cancelled', 'This booking has been cancelled')}
                {getStatusText(status) === 'Unknown' && getCMSField(cmsData, 'pages.status.currentStatus.unknown', 'We are processing your booking request')}
              </Text>

              {estimatedArrival && (
                <Text align="center" data-cms-id="pages.status.estimatedArrival.message" mode={mode}>
                  <strong>
                    {getCMSField(cmsData, 'pages.status.estimatedArrival.label', '⏰ Estimated Arrival:')}
                  </strong> {estimatedArrival ? estimatedArrival.toString() : getCMSField(cmsData, 'pages.status.estimatedArrival.calculating', 'Calculating...')}
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
            <H2 align="center" data-cms-id="pages.status.actions.title" mode={mode}>
              {getCMSField(cmsData, 'pages.status.actions.title', 'Quick Actions')}
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
              data-cms-id="pages.status.showDetails.button"
            >
              {getCMSField(cmsData, 'pages.status.showDetails.button', showDetails ? 'Hide' : 'Show')}
              {getCMSField(cmsData, 'pages.status.showDetails.label', ' booking details')}
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
                <H2 data-cms-id="pages.status.bookingDetails.title" mode={mode}>
                  {getCMSField(cmsData, 'pages.status.bookingDetails.title', 'Booking Details')}
                </H2>
                <div>
                  <Text data-cms-id="pages.status.bookingDetails.bookingId" mode={mode}>
                    <strong>
                      {getCMSField(cmsData, 'pages.status.labels.bookingId', 'Booking ID:')}
                    </strong> {bookingId}
                  </Text>
                  <Text data-cms-id="pages.status.bookingDetails.pickup" mode={mode}>
                    <strong>
                      {getCMSField(cmsData, 'pages.status.labels.pickup', 'Pickup:')}
                    </strong> {booking?.pickupLocation || getCMSField(cmsData, 'pages.status.labels.notAvailable', 'N/A')}
                  </Text>
                  <Text data-cms-id="pages.status.bookingDetails.dropoff" mode={mode}>
                    <strong>
                      {getCMSField(cmsData, 'pages.status.labels.dropoff', 'Dropoff:')}
                    </strong> {booking?.dropoffLocation || getCMSField(cmsData, 'pages.status.labels.notAvailable', 'N/A')}
                  </Text>
                  <Text data-cms-id="pages.status.bookingDetails.date" mode={mode}>
                    <strong>
                      {getCMSField(cmsData, 'pages.status.labels.date', 'Date:')}
                    </strong> {booking?.date ? new Date(booking.date).toLocaleDateString() : getCMSField(cmsData, 'pages.status.labels.notAvailable', 'N/A')}
                  </Text>
                  <Text data-cms-id="pages.status.bookingDetails.time" mode={mode}>
                    <strong>
                      {getCMSField(cmsData, 'pages.status.labels.time', 'Time:')}
                    </strong> {booking?.time || getCMSField(cmsData, 'pages.status.labels.notAvailable', 'N/A')}
                  </Text>
                  <Text data-cms-id="pages.status.bookingDetails.fare" mode={mode}>
                    <strong>
                      {getCMSField(cmsData, 'pages.status.labels.fare', 'Fare:')}
                    </strong> ${booking?.fare || getCMSField(cmsData, 'pages.status.labels.notAvailable', 'N/A')}
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
