'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styled from 'styled-components';
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
import { formatDateTimeNoSeconds } from '@/utils/formatting';
import { getPickupDateTime } from '@/utils/booking-helpers';

interface ManageBookingClientProps {
  bookingId: string;
  cmsData?: any;
}   

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  width: 100%;
`;

const SecondaryActionGrid = styled(ActionGrid)`
  max-width: 520px;
`;

function ManageBookingPageContent({ bookingId, cmsData }: ManageBookingClientProps) {
  // Temporary: no CMS data for now
  const pageCmsData = cmsData || {};
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const trackingToken = searchParams?.get('token') ?? '';
  const hasTokenAccess = trackingToken.length > 0;
  const { addToast } = useToast();
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const tokenQuery = trackingToken ? `?token=${encodeURIComponent(trackingToken)}` : '';
        const response = await authFetch(`/api/booking/${bookingId}${tokenQuery}`);
        if (response.ok) {
          const data = await response.json();
          setBooking(data);
        } else {
          setError('Booking not found');
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
        setError('Failed to load booking');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, trackingToken]);

  const withToken = (path: string) =>
    trackingToken ? `${path}?token=${encodeURIComponent(trackingToken)}` : path;

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
              <Text align="center" >
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
              <H1 align="center" >
                  {pageCmsData?.['title'] || 'Unable to Load Booking'}
              </H1>
              <Text align="center" >
                {pageCmsData?.['description'] || 'We could not load the booking details. Please check your booking ID and try again.'}
              </Text>
              <Button
                onClick={() => router.push('/bookings')}
                variant="primary"

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
              <H1 align="center" >
                {pageCmsData?.['title'] || 'No Booking Found'}
              </H1>
              <Text align="center" >
                {pageCmsData?.['description'] || 'The booking you are looking for could not be found.'}
              </Text>
              <Button
                onClick={() => router.push('/bookings')}
                variant="primary"

              >
                {pageCmsData?.['view-bookings'] || 'View My Bookings'}
              </Button>
            </Stack>
          </Container>
        </GridSection>
      </Container>
    );
  }

  const pickupDateTime = getPickupDateTime(booking);
  const canModifyBooking = !hasTokenAccess && booking.status !== 'cancelled' && booking.status !== 'completed';

  return (
    <Container variant="default" padding="none">
      {/* Page Header */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg" align="center">
            <H1 align="center" >
              {pageCmsData?.['title'] || 'Manage Booking'}
            </H1>
            <Text align="center" >
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
              <H2>
                {pageCmsData?.['booking-details-title'] || 'Booking Information'}
              </H2>

              {hasTokenAccess && (
                <Text color="secondary">
                  {pageCmsData?.['token-access-note'] || 'You are viewing this booking from a secure email link. For security, editing or cancelling still requires a signed-in customer session or help from support.'}
                </Text>
              )}
              
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
                  <Span weight="bold">{pageCmsData?.['dateTimeLabel'] || 'Pickup Time:'}</Span>{' '}
                  {pickupDateTime ? formatDateTimeNoSeconds(pickupDateTime) : 'N/A'}
                </Text>
                <Text>
                  <Span weight="bold">{pageCmsData?.['statusLabel'] || 'Status:'}</Span>{' '}
                  {booking.status || 'pending'}
                </Text>
                <Text>
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
          <Box variant="elevated" padding="lg">
            <Stack spacing="lg" align="center">
              {canModifyBooking ? (
                <ActionGrid>
                  <Button
                    onClick={() => router.push(`/booking/${bookingId}/edit`)}
                    variant="primary"
                    fullWidth
                  >
                    {pageCmsData?.['edit-booking'] || 'Edit Booking'}
                  </Button>
                  <Button
                    onClick={() => router.push(`/booking/${bookingId}/edit`)}
                    variant="outline"
                    fullWidth
                  >
                    {pageCmsData?.['reschedule'] || 'Reschedule'}
                  </Button>
                  <Button
                    onClick={handleCancelBooking}
                    variant="outline"
                    fullWidth
                    disabled={cancelling}
                  >
                    {cancelling ? (pageCmsData?.['cancelling'] || 'Cancelling...') : (pageCmsData?.['cancel-booking'] || 'Cancel Booking')}
                  </Button>
                </ActionGrid>
              ) : (
                <Box variant="outlined" padding="md">
                  <Text align="center" color="secondary">
                    {hasTokenAccess
                      ? (pageCmsData?.['token-access-actions-note'] || 'This secure link is read-only. To edit, reschedule, or cancel, sign in to your customer account or contact support.')
                      : (pageCmsData?.['booking-locked-note'] || 'This booking can no longer be edited online. Please contact support if you need help.')}
                  </Text>
                </Box>
              )}

              <SecondaryActionGrid>
                <Button
                  onClick={() => router.push(withToken(`/booking/${bookingId}`))}
                  variant="outline"
                  fullWidth
                >
                  {pageCmsData?.['view-details'] || 'View Full Details'}
                </Button>

                <Button
                  onClick={() => router.push('/bookings')}
                  variant="outline"
                  fullWidth
                >
                  {pageCmsData?.['backToBookings'] || 'Back to Bookings'}
                </Button>
              </SecondaryActionGrid>
            </Stack>
          </Box>
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
