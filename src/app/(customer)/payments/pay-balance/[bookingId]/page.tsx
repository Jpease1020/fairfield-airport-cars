'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCMSField, useCMSData } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';
import {
  Container,
  GridSection,
  Stack,
  H1,
  Text,
  Button,
  LoadingSpinner
} from '@/ui';
import { SquarePaymentForm } from '@/components/business/SquarePaymentForm';

interface BookingDetails {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: string;
  fare: number;
  depositAmount: number;
  balanceDue: number;
  status: string;
}

function BalancePaymentPageContent({ bookingId }: { bookingId: string }) {
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();
  const router = useRouter();
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await fetch(`/api/booking/${bookingId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch booking details');
        }
        const data = await response.json();
        setBookingDetails(data);
      } catch (err) {
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handlePaymentSuccess = (result: any) => {
    setPaymentSuccess(true);
    // Redirect to success page after a short delay
    setTimeout(() => {
      router.push(`/payment-success?bookingId=${bookingDetails?.id}`);
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  if (loading) {
    return (
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            <Stack spacing="lg" align="center">
              <LoadingSpinner />
              <Text align="center" data-cms-id="loading-message">
                {getCMSField(cmsData, 'payments-message', 'Loading booking details...')}
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
              <H1 align="center" data-cms-id="error-title">
                {getCMSField(cmsData, 'payments-title', 'Unable to Load Booking')}
              </H1>
              <Text align="center" data-cms-id="error-description">
                {getCMSField(cmsData, 'payments-description', 'We could not load the booking details. Please check your booking ID and try again.')}
              </Text>
              <Button
                onClick={() => router.push('/bookings')}
                variant="primary"
                data-cms-id="error-view-bookings"
              >
                {getCMSField(cmsData, 'payments-viewBookings', 'View My Bookings')}
              </Button>
            </Stack>
          </Container>
        </GridSection>
      </Container>
    );
  }

  if (paymentSuccess) {
    return (
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            <Stack spacing="lg" align="center">
              <H1 align="center" data-cms-id="success-title">
                {getCMSField(cmsData, 'payments-title', 'Payment Successful!')}
              </H1>
              <Text align="center" data-cms-id="success-description">
                {getCMSField(cmsData, 'payments-description', 'Your payment has been processed successfully. Redirecting to confirmation...')}
              </Text>
            </Stack>
          </Container>
        </GridSection>
      </Container>
    );
  }

  if (!bookingDetails) {
    return (
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            <Stack spacing="lg" align="center">
              <Text align="center">No booking details found.</Text>
            </Stack>
          </Container>
        </GridSection>
      </Container>
    );
  }

  const paymentAmount = Math.round(bookingDetails.balanceDue * 100); // Convert to cents

  return (
    <Container variant="default" padding="none">
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg">
            <Stack spacing="sm" align="center">
              <H1 align="center" data-cms-id="title">
                {getCMSField(cmsData, 'payments-title', 'Complete Payment')}
              </H1>
              <Text align="center" data-cms-id="subtitle">
                {getCMSField(cmsData, 'payments-subtitle', `Complete payment for your booking from ${bookingDetails.pickupLocation} to ${bookingDetails.dropoffLocation}`)}
              </Text>
            </Stack>

            <Stack spacing="md" align="center">
              <Text variant="h3" data-cms-id="amount-title">
                {getCMSField(cmsData, 'payments-title', 'Amount Due')}
              </Text>
              <Text variant="h2" data-cms-id="amount-value">
                ${bookingDetails.balanceDue.toFixed(2)}
              </Text>
            </Stack>

            <SquarePaymentForm
              amount={paymentAmount}
              bookingId={bookingDetails.id}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </Stack>
        </Container>
      </GridSection>
    </Container>
  );
}

export default async function BalancePaymentPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  
  return (
    <BalancePaymentPageContent bookingId={bookingId} />
  );
} 