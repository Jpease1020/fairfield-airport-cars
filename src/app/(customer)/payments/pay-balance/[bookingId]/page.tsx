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
import { EditableText } from '@/ui';

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
            <EditableText field="payments.balance.title" defaultValue="Pay Remaining Balance">
              Pay Remaining Balance
            </EditableText>
          </H1>
          <Text variant="lead" align="center">
            <EditableText field="payments.balance.subtitle" defaultValue="Complete your payment for booking #">
              Complete your payment for booking #
            </EditableText>
            {bookingId}
          </Text>
        </Stack>

        {/* Booking Summary */}
        <Card variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2>
              <EditableText field="payments.balance.booking_summary" defaultValue="Booking Summary">
                Booking Summary
              </EditableText>
            </H2>
            
            <Grid cols={2} gap="lg" responsive>
              <GridItem>
                <Stack spacing="sm">
                  <Text variant="lead">
                    <EditableText field="payments.balance.passenger" defaultValue="Passenger">
                      Passenger
                    </EditableText>
                  </Text>
                  <Text weight="bold">{bookingDetails.name}</Text>
                </Stack>
              </GridItem>
              
              <GridItem>
                <Stack spacing="sm">
                  <Text variant="lead">
                    <EditableText field="payments.balance.status" defaultValue="Status">
                      Status
                    </EditableText>
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
                    <EditableText field="payments.balance.pickup" defaultValue="Pickup">
                      Pickup
                    </EditableText>
                  </Text>
                  <Text>{bookingDetails.pickupLocation}</Text>
                  <Text variant="muted">{formatDate(bookingDetails.pickupDateTime)}</Text>
                </Stack>
              </GridItem>
              
              <GridItem>
                <Stack spacing="sm">
                  <Text variant="lead">
                    <EditableText field="payments.balance.dropoff" defaultValue="Dropoff">
                      Dropoff
                    </EditableText>
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
                      <EditableText field="payments.balance.driver" defaultValue="Driver">
                        Driver
                      </EditableText>
                    </Text>
                    <Text>{bookingDetails.driverName}</Text>
                  </Stack>
                </GridItem>
                
                <GridItem>
                  <Stack spacing="sm">
                    <Text variant="lead">
                      <EditableText field="payments.balance.vehicle" defaultValue="Vehicle">
                        Vehicle
                      </EditableText>
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
              <EditableText field="payments.balance.payment_summary" defaultValue="Payment Summary">
                Payment Summary
              </EditableText>
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
                    <EditableText field="payments.balance.remaining_balance" defaultValue="Remaining Balance">
                      Remaining Balance
                    </EditableText>
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
                <EditableText field="payments.balance.payment_amount" defaultValue="Payment Amount">
                  Payment Amount
                </EditableText>
              </Text>
              <Text variant="body" color="muted">
                <EditableText field="payments.balance.payment_amount_help" defaultValue="You can pay the full balance or a partial amount">
                  You can pay the full balance or a partial amount
                </EditableText>
              </Text>
              
              <Stack direction="horizontal" spacing="md">
                <Button
                  variant="outline"
                  onClick={() => setPaymentAmount(bookingDetails.balanceDue)}
                  disabled={paymentAmount === bookingDetails.balanceDue}
                >
                  <EditableText field="payments.balance.pay_full" defaultValue="Pay Full Balance">
                    Pay Full Balance
                  </EditableText>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setPaymentAmount(Math.min(bookingDetails.balanceDue / 2, bookingDetails.balanceDue))}
                  disabled={paymentAmount === Math.min(bookingDetails.balanceDue / 2, bookingDetails.balanceDue)}
                >
                  <EditableText field="payments.balance.pay_half" defaultValue="Pay Half">
                    Pay Half
                  </EditableText>
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
                <EditableText field="payments.balance.back" defaultValue="Back to Payments">
                  Back to Payments
                </EditableText>
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
                    <EditableText field="payments.balance.pay_now" defaultValue="Pay Now">
                      Pay Now
                    </EditableText>
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