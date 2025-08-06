'use client';

import React from 'react';
import { 
  Container, 
  Stack, 
  Text, 
  Button, 
  Card, 
  Box, 
  Badge,
  Grid,
  GridItem
} from '@/ui';
import { Link } from '@/ui';

interface BalanceTrackerProps {
  bookingId: string;
  totalFare: number;
  depositAmount: number;
  balanceDue: number;
  tipAmount?: number;
  tipPercent?: number;
  status: string;
  showPayButton?: boolean;
}

export function BalanceTracker({
  bookingId,
  totalFare,
  depositAmount,
  balanceDue,
  tipAmount = 0,
  tipPercent = 0,
  status,
  showPayButton = true
}: BalanceTrackerProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPaymentStatus = () => {
    if (balanceDue <= 0) return { status: 'paid', color: 'success', text: 'Fully Paid' };
    if (depositAmount > 0) return { status: 'partial', color: 'warning', text: 'Partial Payment' };
    return { status: 'unpaid', color: 'error', text: 'Unpaid' };
  };

  const paymentStatus = getPaymentStatus();
  const totalWithTip = totalFare + tipAmount;

  return (
    <Container>
      <Card variant="elevated" padding="lg">
        <Stack spacing="lg">
          <Stack direction="horizontal" justify="space-between" align="center">
            <Text variant="h3">Payment Status</Text>
            <Badge variant={paymentStatus.color as any}>
              {paymentStatus.text}
            </Badge>
          </Stack>

          <Box variant="outlined" padding="md">
            <Stack spacing="sm">
              <Stack direction="horizontal" justify="space-between" align="center">
                <Text>Base Fare:</Text>
                <Text weight="medium">{formatCurrency(totalFare)}</Text>
              </Stack>
              
              {tipAmount > 0 && (
                <Stack direction="horizontal" justify="space-between" align="center">
                  <Text>Tip ({tipPercent}%):</Text>
                  <Text weight="medium">+{formatCurrency(tipAmount)}</Text>
                </Stack>
              )}
              
              <Stack direction="horizontal" justify="space-between" align="center">
                <Text weight="bold">Total Amount:</Text>
                <Text weight="bold">{formatCurrency(totalWithTip)}</Text>
              </Stack>
              
              <Stack direction="horizontal" justify="space-between" align="center">
                <Text>Deposit Paid:</Text>
                <Text weight="medium" color="success">-{formatCurrency(depositAmount)}</Text>
              </Stack>
              
              <Stack direction="horizontal" justify="space-between" align="center">
                <Text variant="h4" weight="bold">
                  {balanceDue > 0 ? 'Remaining Balance:' : 'Amount Paid:'}
                </Text>
                <Text variant="h4" weight="bold" color={balanceDue > 0 ? 'primary' : 'success'}>
                  {formatCurrency(Math.abs(balanceDue))}
                </Text>
              </Stack>
            </Stack>
          </Box>

          {showPayButton && balanceDue > 0 && (
            <Stack spacing="sm">
              <Text variant="body" color="muted">
                Complete your payment to confirm your booking
              </Text>
              <Link href={`/payments/pay-balance/${bookingId}`}>
                <Button variant="primary" fullWidth>
                  Pay Remaining Balance
                </Button>
              </Link>
            </Stack>
          )}

          {balanceDue <= 0 && (
            <Stack spacing="sm">
              <Text variant="body" color="success">
                ✅ Payment complete! Your booking is confirmed.
              </Text>
              <Link href={`/booking/${bookingId}`}>
                <Button variant="outline" fullWidth>
                  View Booking Details
                </Button>
              </Link>
            </Stack>
          )}
        </Stack>
      </Card>
    </Container>
  );
}

interface BalanceSummaryProps {
  bookings: Array<{
    id: string;
    totalFare: number;
    depositAmount: number;
    balanceDue: number;
    status: string;
  }>;
}

export function BalanceSummary({ bookings }: BalanceSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalOwed = bookings
    .filter(booking => booking.balanceDue > 0)
    .reduce((sum, booking) => sum + booking.balanceDue, 0);

  const totalPaid = bookings
    .filter(booking => booking.balanceDue <= 0)
    .reduce((sum, booking) => sum + booking.totalFare, 0);

  const activeBookings = bookings.filter(booking => 
    booking.status === 'confirmed' || booking.status === 'in-progress'
  );

  const pendingPayments = activeBookings.filter(booking => booking.balanceDue > 0);

  return (
    <Container>
      <Card variant="elevated" padding="lg">
        <Stack spacing="lg">
          <Text variant="h3">Payment Summary</Text>
          
          <Grid cols={3} gap="lg" responsive>
            <GridItem>
              <Stack spacing="sm" align="center">
                <Text variant="lead">Total Owed</Text>
                <Text variant="h3" weight="bold" color="primary">
                  {formatCurrency(totalOwed)}
                </Text>
                <Text variant="small" color="muted">
                  {pendingPayments.length} pending payment{pendingPayments.length !== 1 ? 's' : ''}
                </Text>
              </Stack>
            </GridItem>
            
            <GridItem>
              <Stack spacing="sm" align="center">
                <Text variant="lead">Total Paid</Text>
                <Text variant="h3" weight="bold" color="success">
                  {formatCurrency(totalPaid)}
                </Text>
                <Text variant="small" color="muted">
                  {bookings.filter(b => b.balanceDue <= 0).length} completed booking{bookings.filter(b => b.balanceDue <= 0).length !== 1 ? 's' : ''}
                </Text>
              </Stack>
            </GridItem>
            
            <GridItem>
              <Stack spacing="sm" align="center">
                <Text variant="lead">Active Bookings</Text>
                <Text variant="h3" weight="bold">
                  {activeBookings.length}
                </Text>
                <Text variant="small" color="muted">
                  {pendingPayments.length} need payment
                </Text>
              </Stack>
            </GridItem>
          </Grid>

          {pendingPayments.length > 0 && (
            <Stack spacing="sm">
              <Text variant="lead">Pending Payments</Text>
              <Stack spacing="sm">
                {pendingPayments.map(booking => (
                  <Box key={booking.id} variant="outlined" padding="sm">
                    <Stack direction="horizontal" justify="space-between" align="center">
                      <Stack spacing="xs">
                        <Text weight="medium">Booking #{booking.id}</Text>
                        <Text variant="small" color="muted">
                          Balance: {formatCurrency(booking.balanceDue)}
                        </Text>
                      </Stack>
                      <Link href={`/payments/pay-balance/${booking.id}`}>
                        <Button size="sm" variant="primary">
                          Pay Now
                        </Button>
                      </Link>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Stack>
          )}
        </Stack>
      </Card>
    </Container>
  );
} 