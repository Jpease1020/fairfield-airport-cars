'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GridSection,
  ToastProvider,
  useToast,
  Text,
  Container,
  Stack,
  H1,
  H2,
  Button,
  Box,
  LoadingSpinner,
  Span
} from '@/design/ui';
import { authFetch } from '@/lib/utils/auth-fetch';

interface ManageBookingClientProps {
  bookingId: string;
  cmsData?: any;
}   

function ManageBookingPageContent({ bookingId, cmsData }: ManageBookingClientProps) {
  // Temporary: no CMS data for now
  const pageCmsData = cmsData || {};
  
  const router = useRouter();
  const { addToast } = useToast();
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await authFetch(`/api/booking/${bookingId}`);
        if (response.ok) {
          const data = await response.json();
          setBooking(data);
        } else {
          setError(pageCmsData?.['bookingNotFound'] || 'Booking not found');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        setError(pageCmsData?.['loadFailed'] || 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, pageCmsData]);

  const handleCancelBooking = async () => {
    if (!confirm(pageCmsData?.['cancel-confirm'] || 'Are you sure you want to cancel this booking? You may be subject to cancellation fees.')) {
      return;
    }

    setCancelling(true);
    try {
      const response = await authFetch('/api/booking/cancel-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          reason: 'Customer requested cancellation'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        addToast('success', `Booking cancelled. ${data.refundAmount > 0 ? `Refund: $${data.refundAmount.toFixed(2)}` : 'No refund available.'}`);
        // Refresh booking data
        const refreshResponse = await authFetch(`/api/booking/${bookingId}`);
        if (refreshResponse.ok) {
          const refreshedData = await refreshResponse.json();
          setBooking(refreshedData);
        }
      } else {
        const errorData = await response.json();
        addToast('error', errorData.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      addToast('error', 'Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            <Stack spacing="lg" align="center">
              <LoadingSpinner />
              <Text align="center" cmsId="loading-message" >
                {pageCmsData?.['message'] || 'Loading booking details...'}
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
              <H1 align="center" cmsId="error-title" >
                  {pageCmsData?.['title'] || 'Unable to Load Booking'}
              </H1>
              <Text align="center" cmsId="error-description" >
                {pageCmsData?.['description'] || 'We could not load the booking details. Please check your booking ID and try again.'}
              </Text>
              <Button
                onClick={() => router.push('/bookings')}
                variant="primary"
                cmsId="error-view-bookings"
              >
                {pageCmsData?.['viewBookings'] || 'View My Bookings'}
              </Button>
            </Stack>
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
            <Stack spacing="lg" align="center">
              <H1 align="center" cmsId="no-booking-title" >
                {pageCmsData?.['title'] || 'No Booking Found'}
              </H1>
              <Text align="center" cmsId="no-booking-description" >
                {pageCmsData?.['description'] || 'The booking you are looking for could not be found.'}
              </Text>
              <Button
                onClick={() => router.push('/bookings')}
                variant="primary"
                cmsId="view-bookings"
              >
                {pageCmsData?.['view-bookings'] || 'View My Bookings'}
              </Button>
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
            <H1 align="center" cmsId="title" >
              {pageCmsData?.['title'] || 'Manage Booking'}
            </H1>
            <Text align="center" cmsId="subtitle" >
              {pageCmsData?.['subtitle'] || `Manage your booking #${bookingId}`}
            </Text>
          </Stack>
        </Container>
      </GridSection>

      {/* Booking Details */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Box variant="elevated" padding="lg">
            <Stack spacing="lg">
              <H2 cmsId="booking-details-title">
                {pageCmsData?.['booking-details-title'] || 'Booking Information'}
              </H2>
              
              <Stack spacing="md">
                <Text>
                  <Span weight="bold">{pageCmsData?.['pickupLabel'] || 'Pickup:'}</Span>{' '}
                  {booking.trip?.pickup?.address || booking.pickupLocation || 'N/A'}
                </Text>
                <Text>
                  <Span weight="bold">{pageCmsData?.['dropoffLabel'] || 'Dropoff:'}</Span>{' '}
                  {booking.trip?.dropoff?.address || booking.dropoffLocation || 'N/A'}
                </Text>
                <Text>
                  <Span weight="bold">{pageCmsData?.['dateTimeLabel'] || 'Date & Time:'}</Span>{' '}
                  {booking.trip?.pickupDateTime 
                    ? new Date(booking.trip.pickupDateTime).toLocaleString()
                    : booking.pickupDateTime 
                    ? new Date(booking.pickupDateTime).toLocaleString()
                    : 'N/A'}
                </Text>
                <Text>
                  <Span weight="bold">{pageCmsData?.['statusLabel'] || 'Status:'}</Span>{' '}
                  {booking.status || 'pending'}
                </Text>
                <Text cmsId="fare-display">
                  <Span weight="bold">{pageCmsData?.['fareLabel'] || 'Fare:'}</Span>{' '}
                  ${(booking.trip?.fare || booking.fare || 0).toFixed(2)}
                </Text>
                {booking.customer?.notes && (
                  <Text>
                    <Span weight="bold">{pageCmsData?.['notesLabel'] || 'Notes:'}</Span>{' '}
                    {booking.customer.notes}
                  </Text>
                )}
              </Stack>
            </Stack>
          </Box>
        </Container>
      </GridSection>

      {/* Action Buttons */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="md" align="center">
            <Stack direction="horizontal" spacing="md" align="center">
              <Button
                onClick={() => router.push(`/booking/${bookingId}/edit`)}
                variant="primary"
                cmsId="actions-edit"
                disabled={booking.status === 'cancelled' || booking.status === 'completed'}
              >
                {pageCmsData?.['edit-booking'] || 'Edit Booking'}
              </Button>
              <Button
                onClick={() => router.push(`/booking/${bookingId}/edit`)}
                variant="outline"
                cmsId="actions-reschedule"
                disabled={booking.status === 'cancelled' || booking.status === 'completed'}
              >
                {pageCmsData?.['reschedule'] || 'Reschedule'}
              </Button>
              <Button
                onClick={handleCancelBooking}
                variant="outline"
                cmsId="actions-cancel"
                disabled={booking.status === 'cancelled' || booking.status === 'completed' || cancelling}
              >
                {cancelling ? (pageCmsData?.['cancelling'] || 'Cancelling...') : (pageCmsData?.['cancel-booking'] || 'Cancel Booking')}
              </Button>
            </Stack>
            
            <Button
              onClick={() => router.push(`/booking/${bookingId}`)}
              variant="outline"
              cmsId="actions-view-details"
            >
              {pageCmsData?.['view-details'] || 'View Full Details'}
            </Button>
            
            <Button
              onClick={() => router.push('/bookings')}
              variant="outline"
              cmsId="actions-back-to-bookings"
            >
              {pageCmsData?.['backToBookings'] || 'Back to Bookings'}
            </Button>
          </Stack>
        </Container>
      </GridSection>
    </Container>
  );
}

export default function ManageBookingClient({ bookingId }: ManageBookingClientProps) {
  return (
    <ToastProvider>
      <ManageBookingPageContent bookingId={bookingId} />
    </ToastProvider>
  );
}
