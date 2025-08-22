'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCMSData } from '@/design/hooks/useCMSData';
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
              <Text align="center" data-cms-id="pages.payBalance.loading.message">
                {getCMSField(cmsData, 'pages.payBalance.loading.message', 'Loading booking details...')}
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
              <H1 align="center" data-cms-id="pages.payBalance.error.title">
                {getCMSField(cmsData, 'pages.payBalance.error.title', 'Unable to Load Booking')}
              </H1>
              <Text align="center" data-cms-id="pages.payBalance.error.description">
                {getCMSField(cmsData, 'pages.payBalance.error.description', 'We could not load the booking details. Please check your booking ID and try again.')}
              </Text>
              <Button
                onClick={() => router.push('/bookings')}
                variant="primary"
                data-cms-id="pages.payBalance.error.viewBookings"
              >
                {getCMSField(cmsData, 'pages.payBalance.error.viewBookings', 'View My Bookings')}
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
              <H1 align="center" data-cms-id="pages.payBalance.success.title">
                {getCMSField(cmsData, 'pages.payBalance.success.title', 'Payment Successful!')}
              </H1>
              <Text align="center" data-cms-id="pages.payBalance.success.description">
                {getCMSField(cmsData, 'pages.payBalance.success.description', 'Your payment has been processed successfully. Redirecting to confirmation...')}
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
              <H1 align="center" data-cms-id="pages.payBalance.title">
                {getCMSField(cmsData, 'pages.payBalance.title', 'Complete Payment')}
              </H1>
              <Text align="center" data-cms-id="pages.payBalance.subtitle">
                {getCMSField(cmsData, 'pages.payBalance.subtitle', `Complete payment for your booking from ${bookingDetails.pickupLocation} to ${bookingDetails.dropoffLocation}`)}
              </Text>
            </Stack>

            <Stack spacing="md" align="center">
              <Text variant="h3" data-cms-id="pages.payBalance.amount.title">
                {getCMSField(cmsData, 'pages.payBalance.amount.title', 'Amount Due')}
              </Text>
              <Text variant="h2" data-cms-id="pages.payBalance.amount.value">
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

// Helper function to get CMS fields
function getCMSField(cmsData: any, path: string, fallback: string): string {
  return cmsData?.[path] || fallback;
}

export default function BalancePaymentPage({ params }: { params: { bookingId: string } }) {
  const { bookingId } = params;
  
  return (
    <BalancePaymentPageContent bookingId={bookingId} />
  );
} 