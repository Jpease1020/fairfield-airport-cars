'use client';

import React from 'react';
import { Container, Stack, Box, Button, Text, H2, StatusMessage } from '@/ui';
import { SquarePaymentForm } from '@/components/business/SquarePaymentForm';
import { TipCalculator } from '@/components/business/TipCalculator';
import { useCMSData } from '../../design/providers/CMSDataProvider';

interface PaymentPhaseProps {
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: string;
  fare: number | null;
  tipAmount: number;
  depositAmount: number | null;
  bookingId: string | null;
  isProcessingPayment: boolean;
  paymentError: string | null;
  showPaymentForm: boolean;
  onTipChange: (amount: number, percent: number) => void;
  onBack: () => void;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
  onPaymentReady: (processPayment: () => Promise<void>) => void;
  cmsData: any;
  
  // Add booking data for new bookings
  bookingData?: {
    name: string;
    email: string;
    phone: string;
    pickupLocation: string;
    dropoffLocation: string;
    pickupDateTime: string;
    fare: number | null;
    flightNumber?: string;
    notes?: string;
    tipAmount?: number;
    totalAmount?: number;
    flightInfo?: any;
    fareType?: string;
    saveInfoForFuture?: boolean;
  };
}

export function PaymentPhase({
  pickupLocation,
  dropoffLocation,
  pickupDateTime,
  fare,
  tipAmount,
  depositAmount,
  bookingId,
  isProcessingPayment,
  paymentError,
  showPaymentForm,
  onTipChange,
  onBack,
  onPaymentSuccess,
  onPaymentError,
  onPaymentReady,
  bookingData,
  cmsData
}: PaymentPhaseProps) {
  // Get CMS data from provider
  const { cmsData: allCmsData } = useCMSData();
  const pageCmsData = allCmsData?.booking || {};
  

  const getTotalWithTip = () => {
    return (fare || 0) + tipAmount;
  };

  return (
    <Container maxWidth="4xl" padding="xl">
      <Stack spacing="xl">
        {/* Trip Summary */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2 align="center" cmsId="payment-trip-summary" >
              {pageCmsData?.['paymentPhase-tripSummary'] || 'Trip Summary'}
            </H2>
            
            <Box variant="outlined" padding="md">
              <Stack spacing="sm">
                <Stack direction="horizontal" justify="space-between">
                  <Text cmsId="trip-summary-from">{pageCmsData?.['trip-summary-from'] || 'From:'}</Text>
                  <Text weight="medium">{pickupLocation}</Text>
                </Stack>
                <Stack direction="horizontal" justify="space-between">
                  <Text cmsId="trip-summary-to">{pageCmsData?.['trip-summary-to'] || 'To:'}</Text>
                  <Text weight="medium">{dropoffLocation}</Text>
                </Stack>
                <Stack direction="horizontal" justify="space-between">
                  <Text cmsId="trip-summary-when">{pageCmsData?.['trip-summary-when'] || 'When:'}</Text>
                  <Text weight="medium">{new Date(pickupDateTime).toLocaleString()}</Text>
                </Stack>
                <Stack direction="horizontal" justify="space-between">
                  <Text weight="bold" cmsId="trip-summary-base-fare">{pageCmsData?.['trip-summary-base-fare'] || 'Base Fare:'}</Text>
                  <Text weight="bold" size="lg" cmsId="ignore">${fare?.toFixed(2)}</Text>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Tip Calculator */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2 align="center" cmsId="payment-tip-calculator" >
              {pageCmsData?.['paymentPhase-tipCalculator'] || 'Tip Calculator'}
            </H2>
            
            <TipCalculator
              baseAmount={fare || 0}
              onTipChange={onTipChange}
              cmsData={cmsData}
            />
          </Stack>
        </Box>

        {/* Deposit Information */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2 align="center" cmsId="payment-deposit" >
              {pageCmsData?.['paymentPhase-deposit'] || 'Deposit Required'}
            </H2>
            
            <Box variant="outlined" padding="md">
              <Stack spacing="sm">
                <Stack direction="horizontal" justify="space-between">
                  <Text cmsId="paymentPhaseTotalTripCost">{pageCmsData?.['paymentPhaseTotalTripCost'] || 'Total Trip Cost:'}</Text>
                  <Text weight="medium" cmsId="ignore">${getTotalWithTip().toFixed(2)}</Text>
                </Stack>
                <Stack direction="horizontal" justify="space-between">
                  <Text cmsId="paymentPhaseDeposit20">{pageCmsData?.['paymentPhaseDeposit20'] || 'Deposit (20%):'}</Text>
                  <Text weight="bold" size="lg" color="primary" cmsId="ignore">${depositAmount?.toFixed(2)}</Text>
                </Stack>
                <Stack direction="horizontal" justify="space-between">
                  <Text cmsId="paymentPhaseBalanceDue">{pageCmsData?.['paymentPhaseBalanceDue'] || 'Balance Due:'}</Text>
                  <Text weight="medium" cmsId="ignore">${(getTotalWithTip() - (depositAmount || 0)).toFixed(2)}</Text>
                </Stack>
              </Stack>
            </Box>
            
            <Text size="sm" color="secondary" align="center" cmsId="payment-phase-deposit-note">
              {pageCmsData?.['paymentPhase-depositNote'] || 'A 20% deposit is required to confirm your booking. The remaining balance will be due before your trip.'}
            </Text>
          </Stack>
        </Box>

        {/* Payment Form */}
        {showPaymentForm && (
          <Box variant="elevated" padding="lg">
            <Stack spacing="lg">
              <H2 align="center" cmsId="payment-form-title" >
                {pageCmsData?.['paymentPhasePaymentForm'] || 'Payment Information'}
              </H2>
              
              <Text align="center" color="secondary" cmsId="payment-form-description">
                {pageCmsData?.['paymentPhase-paymentDescription'] || 'Complete your booking by providing payment information.'}
              </Text>
              
              <SquarePaymentForm
                amount={Math.round(getTotalWithTip() * 100)} // Convert dollars to cents
                onPaymentSuccess={onPaymentSuccess}
                onPaymentError={onPaymentError}
                onPaymentReady={onPaymentReady}
                bookingData={bookingData}
                cmsData={cmsData}
              />
            </Stack>
          </Box>
        )}

        {/* Error Display */}
        {paymentError && (
          <StatusMessage 
            type="error" 
            message={paymentError} 
            data-testid="payment-error-message"
            cmsId="payment-error-message"
          />
        )}

        {/* Navigation */}
        <Stack direction="horizontal" spacing="md">
          <Button
            onClick={onBack}
            variant="outline"
            cmsId="payment-back-button"
            data-testid="payment-back-button"
            text={pageCmsData?.['payment-back-button'] || 'Back to Contact Info'}
          />
        </Stack>
      </Stack>
    </Container>
  );
}
