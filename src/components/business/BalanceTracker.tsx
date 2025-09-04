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
import { useCMSData } from '@/design/providers/CMSDataProvider';

interface BalanceTrackerProps {
  bookingId: string;
  totalFare: number;
  depositAmount: number;
  balanceDue: number;
  tipAmount?: number;
  tipPercent?: number;
  status: string;
  showPayButton?: boolean;
  cmsData: any;
}

export function BalanceTracker({
  bookingId,
  totalFare,
  depositAmount,
  balanceDue,
  tipAmount = 0,
  tipPercent = 0,
  status,
  showPayButton = true,
  cmsData
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

  // Get CMS data from provider
  const { cmsData: allCmsData } = useCMSData();
  const pageCmsData = allCmsData?.booking || {};

  const paymentStatus = getPaymentStatus();
  const totalWithTip = totalFare + tipAmount;

  return (
    <Container>
      <Card variant="elevated" padding="lg">
        <Stack spacing="lg">
          <Stack direction="horizontal" justify="space-between" align="center">
            <Text variant="h3" cmsId="balance-tracker-payment-status">{pageCmsData?.['balanceTrackerPaymentStatus'] || 'Payment Status'}</Text>
            <Badge variant={paymentStatus.color as any}>
              {paymentStatus.text}
            </Badge>
          </Stack>

          <Box variant="outlined" padding="md">
            <Stack spacing="sm">
              <Stack direction="horizontal" justify="space-between" align="center">
                <Text cmsId="balance-tracker-base-fare">{pageCmsData?.['balanceTrackerBaseFare'] || 'Base Fare:'}</Text>
                <Text weight="medium" cmsId="balance-tracker-base-fare-amount">{formatCurrency(totalFare)}</Text>
              </Stack>
              
              {tipAmount > 0 && (
                <Stack direction="horizontal" justify="space-between" align="center">
                  <Text cmsId="balance-tracker-tip">{pageCmsData?.['balanceTrackerTip'] || 'Tip:'}</Text>
                  <Text weight="medium" cmsId="ignore">+{formatCurrency(tipAmount)}</Text>
                </Stack>
              )}
              
              <Stack direction="horizontal" justify="space-between" align="center">
                <Text weight="bold" cmsId="balance-tracker-total-amount">{pageCmsData?.['balanceTrackerTotalAmount'] || 'Total Amount:'}</Text>
                <Text weight="bold" cmsId="balance-tracker-total-amount-amount">{formatCurrency(totalWithTip)}</Text>
              </Stack>
              
              <Stack direction="horizontal" justify="space-between" align="center">
                <Text cmsId="balance-tracker-deposit-paid">{pageCmsData?.['balanceTrackerDepositPaid'] || 'Deposit Paid:'}</Text>
                <Text weight="medium" color="success" cmsId="ignore">-{formatCurrency(depositAmount)}</Text>
              </Stack>
              
              <Stack direction="horizontal" justify="space-between" align="center">
                <Text variant="h4" weight="bold">
                  {balanceDue > 0 ? (pageCmsData?.['balanceTrackerRemainingBalance'] || 'Remaining Balance:') : (pageCmsData?.['balanceTrackerAmountPaid'] || 'Amount Paid:')}
                </Text>
                <Text variant="h4" weight="bold" color={balanceDue > 0 ? 'primary' : 'success'} cmsId="ignore">
                  {formatCurrency(Math.abs(balanceDue))}
                </Text>
              </Stack>
            </Stack>
          </Box>

          {showPayButton && balanceDue > 0 && (
            <Stack spacing="sm">
              <Text variant="body" color="muted">
                {pageCmsData?.['balanceTrackerCompletePayment'] || 'Complete your payment to confirm your booking'}
              </Text>
              <Link href={`/payments/pay-balance/${bookingId}`} cmsId="pay-balance-link" >
                <Button variant="primary" fullWidth cmsId="pay-balance-button"  text="Pay Remaining Balance" />
              </Link>
            </Stack>
          )}

          {balanceDue <= 0 && (
            <Stack spacing="sm">
              <Text variant="body" color="success" cmsId="balance-tracker-payment-complete">
                ✅ {pageCmsData?.['balanceTrackerPaymentComplete'] || 'Payment complete! Your booking is confirmed.'}
              </Text>
              <Link href={`/booking/${bookingId}`} cmsId="view-booking-link" >
                <Button variant="outline" fullWidth cmsId="view-booking-button"  text="View Booking Details" />
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
  cmsData: any;
}

export function BalanceSummary({ bookings, cmsData }: BalanceSummaryProps) {
  // Get CMS data from provider
  const { cmsData: allCmsData } = useCMSData();
  const pageCmsData = allCmsData?.booking || {};
  
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
          <Text variant="h3" cmsId="balance-summary-payment-summary">{pageCmsData?.['balanceSummaryPaymentSummary'] || 'Payment Summary'}</Text>
          
          <Grid cols={3} gap="lg" responsive>
            <GridItem>
              <Stack spacing="sm" align="center">
                <Text variant="lead" cmsId="balance-summary-total-owed">{pageCmsData?.['balanceSummaryTotalOwed'] || 'Total Owed'}</Text>
                <Text variant="h3" weight="bold" color="primary">
                  {formatCurrency(totalOwed)}
                </Text>
                <Text variant="small" color="muted" cmsId="ignore">
                  {pendingPayments.length} pending payment{pendingPayments.length !== 1 ? 's' : ''}
                </Text>
              </Stack>
            </GridItem>
            
            <GridItem>
              <Stack spacing="sm" align="center">
                <Text variant="lead" cmsId="balance-summary-total-paid">{pageCmsData?.['balanceSummaryTotalPaid'] || 'Total Paid'}</Text>
                <Text variant="h3" weight="bold" color="success">
                  {formatCurrency(totalPaid)}
                </Text>
                <Text variant="small" color="muted" cmsId="ignore">
                  {bookings.filter(b => b.balanceDue <= 0).length} completed booking{bookings.filter(b => b.balanceDue <= 0).length !== 1 ? 's' : ''}
                </Text>
              </Stack>
            </GridItem>
            
            <GridItem>
              <Stack spacing="sm" align="center">
                <Text variant="lead" cmsId="balance-summary-active-bookings">{pageCmsData?.['balanceSummaryActiveBookings'] || 'Active Bookings'}</Text>
                <Text variant="h3" weight="bold" cmsId="balance-summary-active-bookings-count">
                  {activeBookings.length}
                </Text>
                <Text variant="small" color="muted">
                  {pageCmsData?.['balanceSummaryNeedPayment'] || `${pendingPayments.length} need payment`}
                </Text>
              </Stack>
            </GridItem>
          </Grid>

          {pendingPayments.length > 0 && (
            <Stack spacing="sm">
              <Text variant="lead" cmsId="balance-summary-pending-payments">{pageCmsData?.['balanceSummaryPendingPayments'] || 'Pending Payments'}</Text>
              <Stack spacing="sm">
                {pendingPayments.map(booking => (
                  <Box key={booking.id} variant="outlined" padding="sm">
                    <Stack direction="horizontal" justify="space-between" align="center">
                      <Stack spacing="xs">
                        <Text weight="medium" cmsId="balance-summary-booking-id">{pageCmsData?.['balanceSummaryBookingId'] || `Booking #${booking.id}`}</Text>
                        <Text variant="small" color="muted">
                          {pageCmsData?.['balanceSummaryBalance'] || 'Balance:'} {formatCurrency(booking.balanceDue)}
                        </Text>
                      </Stack>
                      <Link href={`/payments/pay-balance/${booking.id}`} cmsId="pay-now-link" >
                        <Button size="sm" variant="primary" cmsId="pay-now-button" text={pageCmsData?.['balanceSummaryPayNow'] || 'Pay Now'} />
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