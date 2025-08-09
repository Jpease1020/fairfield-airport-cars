'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Container, 
  Stack, 
  Text, 
  Button, 
  LoadingSpinner,
  Alert,
  Card,
  Box,
  H1,
  H2,
  Badge,
  Grid,
  GridItem
} from '@/ui';
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';

interface BalancePaymentPageProps {
  bookingId: string;
}

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
  vehicleType?: string;
  serviceLevel?: string;
}

function BalancePaymentPageContent() {
  const { cmsData } = useCMSData();
    const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

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
          setError('Failed to load booking details');
        }
      } catch (error) {
        console.error('Error loading booking details:', error);
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };
    
    loadBookingDetails();
  }, [bookingId]);

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
          description: `Balance payment for booking #${bookingId}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment session');
      }

      const data = await response.json();
      
      // Redirect to Square checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('Failed to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'in-progress': return 'warning';
      case 'completed': return 'confirmed';
      case 'cancelled': return 'error';
      default: return 'info';
    }
  };

  if (loading) {
    return (
      <Container padding="lg" maxWidth="xl">
        <Stack spacing="lg" align="center">
          <LoadingSpinner size="lg" />
          <Text>Loading booking details...</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container padding="lg" maxWidth="xl">
        <Stack spacing="lg">
          <Alert variant="error">
            <Text>{error}</Text>
          </Alert>
          <Button onClick={() => router.push('/payments')}>
            Back to Payments
          </Button>
        </Stack>
      </Container>
    );
  }

  if (!bookingDetails) {
    return (
      <Container padding="lg" maxWidth="xl">
        <Stack spacing="lg">
          <Alert variant="error">
            <Text>Booking not found</Text>
          </Alert>
          <Button onClick={() => router.push('/payments')}>
            Back to Payments
          </Button>
        </Stack>
      </Container>
    );
  }

  if (bookingDetails.balanceDue <= 0) {
    return (
      <Container padding="lg" maxWidth="xl">
        <Stack spacing="lg">
          <Alert variant="success">
            <Text>This booking is fully paid!</Text>
          </Alert>
          <Button onClick={() => router.push(`/booking/${bookingId}`)}>
            View Booking Details
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <Container padding="lg" maxWidth="xl">
      <Stack spacing="xl">
        {/* Header */}
        <Stack spacing="lg">
          <H1 align="center">
            {getCMSField(cmsData, 'payments.balance.title', 'Pay Remaining Balance')}
          </H1>
          <Text variant="lead" align="center">
            {getCMSField(cmsData, 'payments.balance.subtitle', 'Complete your payment for booking #')}
            {bookingId}
          </Text>
        </Stack>

        {/* Booking Summary */}
        <Card variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2>
              {getCMSField(cmsData, 'payments.balance.booking_summary', 'Booking Summary')}
            </H2>
            
            <Grid cols={2} gap="lg" responsive>
              <GridItem>
                <Stack spacing="sm">
                  <Text variant="lead">
                    {getCMSField(cmsData, 'payments.balance.passenger', 'Passenger')}
                  </Text>
                  <Text weight="bold">{bookingDetails.name}</Text>
                </Stack>
              </GridItem>
              
              <GridItem>
                <Stack spacing="sm">
                  <Text variant="lead">
                    {getCMSField(cmsData, 'payments.balance.status', 'Status')}
                  </Text>
                  <Badge variant={getStatusColor(bookingDetails.status)}>
                    {bookingDetails.status}
                  </Badge>
                </Stack>
              </GridItem>
            </Grid>

            <Grid cols={2} gap="lg" responsive>
              <GridItem>
                <Stack spacing="sm">
                  <Text variant="lead">
                    {getCMSField(cmsData, 'payments.balance.pickup', 'Pickup')}
                  </Text>
                  <Text>{bookingDetails.pickupLocation}</Text>
                  <Text variant="muted">{formatDate(bookingDetails.pickupDateTime)}</Text>
                </Stack>
              </GridItem>
              
              <GridItem>
                <Stack spacing="sm">
                  <Text variant="lead">
                    {getCMSField(cmsData, 'payments.balance.dropoff', 'Dropoff')}
                  </Text>
                  <Text>{bookingDetails.dropoffLocation}</Text>
                </Stack>
              </GridItem>
            </Grid>

            {bookingDetails.driverName && (
              <Grid cols={2} gap="lg" responsive>
                <GridItem>
                  <Stack spacing="sm">
                    <Text variant="lead">
                      {getCMSField(cmsData, 'payments.balance.driver', 'Driver')}
                    </Text>
                    <Text>{bookingDetails.driverName}</Text>
                  </Stack>
                </GridItem>
                
                <GridItem>
                  <Stack spacing="sm">
                    <Text variant="lead">
                      {getCMSField(cmsData, 'payments.balance.vehicle', 'Vehicle')}
                    </Text>
                    <Text>{bookingDetails.vehicleType || 'Standard'}</Text>
                    {bookingDetails.serviceLevel && (
                      <Text variant="muted">{bookingDetails.serviceLevel} service</Text>
                    )}
                  </Stack>
                </GridItem>
              </Grid>
            )}
          </Stack>
        </Card>

        {/* Payment Summary */}
        <Card variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2>
              {getCMSField(cmsData, 'payments.balance.payment_summary', 'Payment Summary')}
            </H2>
            
            <Box variant="outlined" padding="md">
              <Stack spacing="sm">
                <Stack direction="horizontal" justify="space-between" align="center">
                  <Text>Total Fare:</Text>
                  <Text weight="medium">{formatCurrency(bookingDetails.totalFare)}</Text>
                </Stack>
                
                <Stack direction="horizontal" justify="space-between" align="center">
                  <Text>Deposit Paid:</Text>
                  <Text weight="medium" color="success">-{formatCurrency(bookingDetails.depositAmount)}</Text>
                </Stack>
                
                {bookingDetails.tipAmount && bookingDetails.tipAmount > 0 && (
                  <Stack direction="horizontal" justify="space-between" align="center">
                    <Text>Tip ({bookingDetails.tipPercent}%):</Text>
                    <Text weight="medium">+{formatCurrency(bookingDetails.tipAmount)}</Text>
                  </Stack>
                )}
                
                <Stack direction="horizontal" justify="space-between" align="center">
                  <Text variant="h4" weight="bold">
                      {getCMSField(cmsData, 'payments.balance.remaining_balance', 'Remaining Balance')}
                  </Text>
                  <Text variant="h4" weight="bold" color="primary">
                    {formatCurrency(bookingDetails.balanceDue)}
                  </Text>
                </Stack>
              </Stack>
            </Box>

            {/* Payment Amount Input */}
            <Stack spacing="sm">
              <Text variant="lead">
                {getCMSField(cmsData, 'payments.balance.payment_amount', 'Payment Amount')}
              </Text>
              <Text variant="body" color="muted">
                {getCMSField(cmsData, 'payments.balance.payment_amount_help', 'You can pay the full balance or a partial amount')}
              </Text>
              
              <Stack direction="horizontal" spacing="md">
                <Button
                  variant="outline"
                  onClick={() => setPaymentAmount(bookingDetails.balanceDue)}
                  disabled={paymentAmount === bookingDetails.balanceDue}
                >
                  {getCMSField(cmsData, 'payments.balance.pay_full', 'Pay Full Balance')}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setPaymentAmount(Math.min(bookingDetails.balanceDue / 2, bookingDetails.balanceDue))}
                  disabled={paymentAmount === Math.min(bookingDetails.balanceDue / 2, bookingDetails.balanceDue)}
                >
                  {getCMSField(cmsData, 'payments.balance.pay_half', 'Pay Half')}
                </Button>
              </Stack>
              
              <Text variant="h4" weight="bold" color="primary">
                {formatCurrency(paymentAmount)}
              </Text>
            </Stack>

            {/* Action Buttons */}
            <Stack direction="horizontal" spacing="md">
              <Button
                onClick={() => router.push('/payments')}
                variant="outline"
                fullWidth
              >
                {getCMSField(cmsData, 'payments.balance.back', 'Back to Payments')}
              </Button>
              
              <Button
                onClick={handlePayBalance}
                disabled={processing || paymentAmount <= 0}
                variant="primary"
                fullWidth
              >
                {processing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Processing...
                  </>
                ) : (
                  <>
                    {getCMSField(cmsData, 'payments.balance.pay_now', 'Pay Now')}
                  </>
                )}
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}

export default function BalancePaymentPage() {
  return <BalancePaymentPageContent />;
} 