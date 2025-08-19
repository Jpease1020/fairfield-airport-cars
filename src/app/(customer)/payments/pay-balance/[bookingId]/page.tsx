'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Container, 
  Stack, 
  Text, 
  Button, 
  LoadingSpinner,
  Box,
  H1,
  H2
} from '@/ui';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { GridSection } from '@/ui';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';


interface BookingDetails {
  id: string;
  name: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: string;
  fare: number;
  depositAmount: number;
  balanceDue: number;
  totalFare: number;
  tipAmount?: number;
  tipPercent?: number;
  status: string;
  driverName?: string;
}

function BalancePaymentPageContent() {
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [tipPercent, setTipPercent] = useState<number>(15);

  useEffect(() => {
    const loadBookingDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/booking/get-booking/${bookingId}`);
        if (response.ok) {
          const data = await response.json();
          setBookingDetails(data);
          setPaymentAmount(data.balanceDue);
        } else {
          setError(getCMSField(cmsData, 'pages.payBalance.errors.loadFailed', 'Failed to load booking details'));
        }
      } catch (error) {
        console.error('Error loading booking details:', error);
        setError(getCMSField(cmsData, 'pages.payBalance.errors.loadFailed', 'Failed to load booking details'));
      } finally {
        setLoading(false);
      }
    };
    
    loadBookingDetails();
  }, [bookingId, cmsData]);

  const handlePayBalance = async () => {
    if (!bookingDetails || paymentAmount <= 0) return;

    try {
      setProcessing(true);
      
      const response = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: bookingId,
          amount: paymentAmount,
          type: 'balance',
          description: getCMSField(cmsData, 'pages.payBalance.payment.description', `Balance payment for booking #${bookingId}`),
        }),
      });

      if (!response.ok) {
        throw new Error(getCMSField(cmsData, 'pages.payBalance.errors.createSessionFailed', 'Failed to create payment session'));
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating payment session:', error);
      setError(getCMSField(cmsData, 'pages.payBalance.errors.paymentFailed', 'Failed to process payment. Please try again.'));
    } finally {
      setProcessing(false);
    }
  };

  const handleTipChange = (percent: number) => {
    setTipPercent(percent);
    const tipAmount = (paymentAmount * percent) / 100;
    setTipAmount(tipAmount);
  };

  const getTotalAmount = () => {
    return paymentAmount + tipAmount;
  };

  // Helper function to get status variant for badge
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'info';
      case 'confirmed':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'pending':
        return 'pending';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            <Stack spacing="lg" align="center">
              <LoadingSpinner />
              <Text align="center" data-cms-id="pages.payBalance.loading.message" mode={mode}>
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
              <H1 align="center" data-cms-id="pages.payBalance.error.title" mode={mode}>
                {getCMSField(cmsData, 'pages.payBalance.error.title', 'Unable to Load Booking')}
              </H1>
              <Text align="center" data-cms-id="pages.payBalance.error.description" mode={mode}>
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

  if (!bookingDetails) {
    return (
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            <Stack spacing="lg" align="center">
              <H1 align="center" data-cms-id="pages.payBalance.noBooking.title" mode={mode}>
                {getCMSField(cmsData, 'pages.payBalance.noBooking.title', 'No Booking Found')}
              </H1>
              <Text align="center" data-cms-id="pages.payBalance.noBooking.description" mode={mode}>
                {getCMSField(cmsData, 'pages.payBalance.noBooking.description', 'The booking you are looking for could not be found.')}
              </Text>
              <Button
                onClick={() => router.push('/bookings')}
                variant="primary"
                data-cms-id="pages.payBalance.noBooking.viewBookings"
              >
                {getCMSField(cmsData, 'pages.payBalance.noBooking.viewBookings', 'View My Bookings')}
              </Button>
            </Stack>
          </Container>
        </GridSection>
      </Container>
    );
  }

  if (bookingDetails.balanceDue <= 0) {
    return (
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            <Stack spacing="lg" align="center">
              <H1 align="center" data-cms-id="pages.payBalance.noBalance.title" mode={mode}>
                {getCMSField(cmsData, 'pages.payBalance.noBalance.title', 'No Balance Due')}
              </H1>
              <Text align="center" data-cms-id="pages.payBalance.noBalance.description" mode={mode}>
                {getCMSField(cmsData, 'pages.payBalance.noBalance.description', 'This booking has no outstanding balance. All payments have been completed.')}
              </Text>
              <Button
                onClick={() => router.push('/bookings')}
                variant="primary"
                data-cms-id="pages.payBalance.noBalance.viewBookings"
              >
                {getCMSField(cmsData, 'pages.payBalance.noBalance.viewBookings', 'View My Bookings')}
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
            <H1 align="center" data-cms-id="pages.payBalance.title" mode={mode}>
              {getCMSField(cmsData, 'pages.payBalance.title', 'Pay Outstanding Balance')}
            </H1>
            <Text align="center" data-cms-id="pages.payBalance.subtitle" mode={mode}>
              {getCMSField(cmsData, 'pages.payBalance.subtitle', `Complete payment for your ride from booking #${bookingId}`)}
            </Text>
          </Stack>
        </Container>
      </GridSection>

      {/* Booking Summary */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Box variant="elevated" padding="lg">
            <Stack spacing="lg">
              <H2 data-cms-id="pages.payBalance.bookingSummary.title" mode={mode}>
                {getCMSField(cmsData, 'pages.payBalance.bookingSummary.title', 'Booking Summary')}
              </H2>
              
              <Stack direction="horizontal" spacing="lg">
                <Stack spacing="sm">
                  <Text variant="muted" size="sm" data-cms-id="pages.pay-balance.pickup" mode={mode}>
                    {getCMSField(cmsData, 'pages.pay-balance.pickup', 'Pickup')}
                  </Text>
                  <Text weight="bold">{bookingDetails.pickupLocation}</Text>
                </Stack>
                
                <Stack spacing="sm">
                  <Text variant="muted" size="sm" data-cms-id="pages.pay-balance.dropoff" mode={mode}>
                    {getCMSField(cmsData, 'pages.pay-balance.dropoff', 'Dropoff')}
                  </Text>
                  <Text weight="bold">{bookingDetails.dropoffLocation}</Text>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </Container>
      </GridSection>

      {/* Payment Details */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Box variant="elevated" padding="lg">
            <Stack spacing="lg">
              <H2 data-cms-id="pages.payBalance.paymentDetails.title" mode={mode}>
                {getCMSField(cmsData, 'pages.payBalance.paymentDetails.title', 'Payment Details')}
              </H2>
              
              <Stack direction="horizontal" spacing="lg">
                <Stack spacing="md">
                  <Text data-cms-id="pages.payBalance.paymentDetails.totalFare" mode={mode}>
                    <strong>{getCMSField(cmsData, 'pages.payBalance.paymentDetails.totalFareLabel', 'Total Fare:')}</strong> ${bookingDetails.totalFare.toFixed(2)}
                  </Text>
                  <Text data-cms-id="pages.payBalance.paymentDetails.depositPaid" mode={mode}>
                    <strong>{getCMSField(cmsData, 'pages.payBalance.paymentDetails.depositPaidLabel', 'Deposit Paid:')}</strong> ${bookingDetails.depositAmount.toFixed(2)}
                  </Text>
                  <Text data-cms-id="pages.payBalance.paymentDetails.balanceDue" mode={mode}>
                    <strong>{getCMSField(cmsData, 'pages.payBalance.paymentDetails.balanceDueLabel', 'Balance Due:')}</strong> ${bookingDetails.balanceDue.toFixed(2)}
                  </Text>
                </Stack>
                
                <Stack spacing="md">
                  <Text data-cms-id="pages.payBalance.paymentDetails.tipAmount" mode={mode}>
                    <strong>{getCMSField(cmsData, 'pages.payBalance.paymentDetails.tipAmountLabel', 'Tip Amount:')}</strong> ${tipAmount.toFixed(2)}
                  </Text>
                  <Text data-cms-id="pages.payBalance.paymentDetails.totalPayment" mode={mode}>
                    <strong>{getCMSField(cmsData, 'pages.payBalance.paymentDetails.totalPaymentLabel', 'Total Payment:')}</strong> ${getTotalAmount().toFixed(2)}
                  </Text>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </Container>
      </GridSection>

      {/* Tip Selection */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Box variant="elevated" padding="lg">
            <Stack spacing="lg">
              <H2 data-cms-id="pages.payBalance.tipSelection.title" mode={mode}>
                {getCMSField(cmsData, 'pages.payBalance.tipSelection.title', 'Add a Tip (Optional)')}
              </H2>
              
              <Text data-cms-id="pages.payBalance.tipSelection.description" mode={mode}>
                {getCMSField(cmsData, 'pages.payBalance.tipSelection.description', 'Show your appreciation for excellent service by adding a tip to your payment.')}
              </Text>
              
              <Stack direction="horizontal" spacing="md" align="center">
                {[0, 10, 15, 20, 25].map((percent) => (
                  <Button
                    key={percent}
                    variant={tipPercent === percent ? 'primary' : 'outline'}
                    onClick={() => handleTipChange(percent)}
                    data-cms-id={`pages.payBalance.tipSelection.${percent}percent`}
                  >
                    {percent === 0 ? getCMSField(cmsData, 'pages.payBalance.tipSelection.noTip', 'No Tip') : `${percent}%`}
                  </Button>
                ))}
              </Stack>
              
              {tipPercent > 0 && (
                <Text align="center" data-cms-id="pages.payBalance.tipSelection.tipAmount" mode={mode}>
                  {getCMSField(cmsData, 'pages.payBalance.tipSelection.tipAmountText', `Tip amount: $${tipAmount.toFixed(2)} (${tipPercent}% of balance due)`)}
                </Text>
              )}
            </Stack>
          </Box>
        </Container>
      </GridSection>

      {/* Payment Actions */}
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack spacing="lg" align="center">
            <Stack spacing="md" align="center">
              <Text size="lg" data-cms-id="pages.payBalance.payment.totalAmount" mode={mode}>
                <strong>{getCMSField(cmsData, 'pages.payBalance.payment.totalAmountLabel', 'Total Amount to Pay:')}</strong> ${getTotalAmount().toFixed(2)}
              </Text>
              
              <Button
                onClick={handlePayBalance}
                variant="primary"
                size="lg"
                disabled={processing || paymentAmount <= 0}
                data-cms-id="pages.payBalance.payment.payButton"
              >
                {processing ? (
                  getCMSField(cmsData, 'pages.payBalance.payment.processing', 'Processing...')
                ) : (
                  getCMSField(cmsData, 'pages.payBalance.payment.payNow', 'Pay Now')
                )}
              </Button>
            </Stack>
            
            <Text size="sm" variant="muted" data-cms-id="pages.payBalance.payment.securityNote" mode={mode}>
              {getCMSField(cmsData, 'pages.payBalance.payment.securityNote', '🔒 Your payment information is secure and encrypted. We use industry-standard security measures to protect your data.')}
            </Text>
            
            <Button
              onClick={() => router.push('/bookings')}
              variant="outline"
              data-cms-id="pages.payBalance.payment.backToBookings"
            >
              {getCMSField(cmsData, 'pages.payBalance.payment.backToBookings', 'Back to Bookings')}
            </Button>
          </Stack>
        </Container>
      </GridSection>
    </Container>
  );
}

export default function BalancePaymentPage() {
  return <BalancePaymentPageContent />;
} 