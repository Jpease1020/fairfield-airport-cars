'use client';

import React, { useState, useEffect } from 'react';
import { Container, Text, Button, LoadingSpinner, ActionButtonGroup, GridSection, useToast, ToastProvider, H1, H2, Stack, Box } from '@/design/ui';
import { useCMSData } from '@/design/providers/CMSDataProvider';

interface StatusClientProps {
  bookingId: string;
}

function BookingStatusPageContent({ bookingId }: StatusClientProps) {
  // Get CMS data from provider - extract only what this page needs
  const { cmsData: allCmsData } = useCMSData();
  const cmsData = allCmsData?.['customer-status'] || {};
  
  const { addToast } = useToast();
  
  const [status, setStatus] = useState<string>('loading');
  const [estimatedArrival, setEstimatedArrival] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [booking, setBooking] = useState<any>(null);

  const getStatusText = (status: any) => {
    const statusMap: { [key: string]: string } = {
      'confirmed': cmsData?.['confirmed'] || 'Confirmed',
      'en-route': cmsData?.['enRoute'] || 'En Route',
      'arrived': cmsData?.['arrived'] || 'Arrived',
      'completed': cmsData?.['completed'] || 'Completed',
      'cancelled': cmsData?.['cancelled'] || 'Cancelled',
      'loading': cmsData?.['loading'] || 'Loading'
    };
    return statusMap[status] || cmsData?.['unknown'] || 'Unknown';
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
          setError(cmsData?.['loadFailed'] || 'Failed to load booking status');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        setError(cmsData?.['loadFailed'] || 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [bookingId, cmsData]);

  const quickActions = [
    {
      id: 'manage-booking',
      label: cmsData?.['manageBooking'] || 'Manage Booking',
      onClick: () => window.location.href = `/manage/${bookingId}`,
      variant: 'primary' as const,
      icon: '📋'
    },
    {
      id: 'contact-driver',
      label: cmsData?.['contactDriver'] || 'Contact Driver',
      onClick: () => addToast('info', cmsData?.['driverContactComingSoon'] || 'Driver contact feature coming soon'),
      variant: 'outline' as const,
      icon: '📞'
    },
    {
      id: 'get-support',
      label: cmsData?.['getSupport'] || 'Get Support',
      onClick: () => addToast('info', cmsData?.['supportContact'] || 'Support: (203) 555-0123'),
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
              <Text align="center" cmsId="status-loading-message" >
                {cmsData?.['message'] || 'Please wait while we fetch your booking details...'}
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
              <H1 align="center" cmsId="status-error-title" >
                {cmsData?.['title'] || 'Unable to Load Booking'}
              </H1>
              <Text align="center" cmsId="status-error-description" >
                {cmsData?.['description'] || 'This could be due to an invalid booking ID or a temporary system issue.'}
              </Text>
              <ActionButtonGroup buttons={[
                {
                  id: 'try-again',
                  label: cmsData?.['tryAgain'] || 'Try Again',
                  onClick: () => window.location.reload(),
                  variant: 'primary',
                  icon: '🔄'
                },
                {
                  id: 'contact-support',
                  label: cmsData?.['contactSupport'] || 'Contact Support',
                  onClick: () => addToast('info', cmsData?.['supportContact'] || 'Support: (203) 555-0123'),
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
            <H1 align="center" cmsId="status-main-title" >
              {cmsData?.['title'] || 'Booking Status'}
            </H1>
            <Text align="center" cmsId="status-subtitle" >
              {cmsData?.['subtitle'] || `Tracking your ride for booking #${bookingId}`}
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
              <H2 align="center" cmsId="current-status-title" >
                {cmsData?.['currentStatus-title'] || 'Current Status'}
              </H2>
              <Text align="center" size="lg" cmsId="current-status-status" >
                {getStatusText(status)}
              </Text>
              <Text align="center" cmsId="current-status-description" >
                {getStatusText(status) === 'confirmed' && (cmsData?.['confirmed'] || 'Your ride is confirmed and driver assigned')}
                {getStatusText(status) === 'en-route' && (cmsData?.['enRoute'] || 'Your driver is on the way to pick you up')}
                {getStatusText(status) === 'arrived' && (cmsData?.['arrived'] || 'Your driver has arrived at the pickup location')}
                {getStatusText(status) === 'completed' && (cmsData?.['completed'] || 'Your ride has been completed successfully')}
                {getStatusText(status) === 'cancelled' && (cmsData?.['cancelled'] || 'This booking has been cancelled')}
                {getStatusText(status) === 'Unknown' && (cmsData?.['unknown'] || 'We are processing your booking request')}
              </Text>

              {estimatedArrival && (
                <Text align="center" cmsId="estimated-arrival-message" >
                  <strong>
                    {cmsData?.['label'] || '⏰ Estimated Arrival:'}
                  </strong> {estimatedArrival ? estimatedArrival.toString() : (cmsData?.['calculating'] || 'Calculating...')}
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
            <H2 align="center" cmsId="status-actions-title" >
              {cmsData?.['actions-title'] || 'Quick Actions'}
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
              cmsId="show-details-button"
            >
              {cmsData?.['show-details-button'] || (showDetails ? 'Hide' : 'Show')}
              {cmsData?.['show-details-label'] || ' booking details'}
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
                <H2 cmsId="booking-details-title" >
                  {cmsData?.['booking-details-title'] || 'Booking Details'}
                </H2>
                <div>
                  <Text cmsId="booking-details-booking-id" >
                    <strong>
                      {cmsData?.['booking-details-booking-id'] || 'Booking ID:'}
                    </strong> {bookingId}
                  </Text>
                  <Text cmsId="booking-details-pickup" >
                    <strong>
                      {cmsData?.['booking-details-pickup'] || 'Pickup:'}
                    </strong> {booking?.pickupLocation || (cmsData?.['pickup-notAvailable'] || 'N/A')}
                  </Text>
                  <Text cmsId="booking-details-dropoff" >
                    <strong>
                      {cmsData?.['booking-details-dropoff'] || 'Dropoff:'}
                    </strong> {booking?.dropoffLocation || (cmsData?.['dropoff-notAvailable'] || 'N/A')}
                  </Text>
                  <Text cmsId="booking-details-date" >
                    <strong>
                      {cmsData?.['booking-details-date'] || 'Date:'}
                    </strong> {booking?.date ? new Date(booking.date).toLocaleDateString() : (cmsData?.['date-notAvailable'] || 'N/A')}
                  </Text>
                  <Text cmsId="booking-details-time" >
                    <strong>
                      {cmsData?.['booking-details-time'] || 'Time:'}
                    </strong> {booking?.time || (cmsData?.['time-notAvailable'] || 'N/A')}
                  </Text>
                  <Text cmsId="booking-details-fare" >
                    <strong>
                      {cmsData?.['booking-details-fare'] || 'Fare:'}
                    </strong> ${booking?.fare || (cmsData?.['fare-notAvailable'] || 'N/A')}
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

export default function StatusClient({ bookingId }: StatusClientProps) {
  return (
    <ToastProvider>
      <BookingStatusPageContent bookingId={bookingId} />
    </ToastProvider>
  );
}
