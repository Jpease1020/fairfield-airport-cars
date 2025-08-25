'use client';

import React from 'react';
import { Container, Stack, Box, Button, Text, H2, StatusMessage } from '@/ui';
import { SquarePaymentForm } from '@/components/business/SquarePaymentForm';
import { TipCalculator } from '@/components/business/TipCalculator';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

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
  bookingData
}: PaymentPhaseProps) {
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();

  const getTotalWithTip = () => {
    return (fare || 0) + tipAmount;
  };

  return (
    <Container maxWidth="4xl" padding="xl">
      <Stack spacing="xl">
        {/* Trip Summary */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2 align="center" data-cms-id="booking-payment-tripSummary" mode={mode}>
              {getCMSField(cmsData, 'tripSummary', 'Trip Summary')}
            </H2>
            
            <Box variant="outlined" padding="md">
              <Stack spacing="sm">
                <Stack direction="horizontal" justify="space-between">
                  <Text>From:</Text>
                  <Text weight="medium">{pickupLocation}</Text>
                </Stack>
                <Stack direction="horizontal" justify="space-between">
                  <Text>To:</Text>
                  <Text weight="medium">{dropoffLocation}</Text>
                </Stack>
                <Stack direction="horizontal" justify="space-between">
                  <Text>When:</Text>
                  <Text weight="medium">{new Date(pickupDateTime).toLocaleString()}</Text>
                </Stack>
                <Stack direction="horizontal" justify="space-between">
                  <Text weight="bold">Base Fare:</Text>
                  <Text weight="bold" size="lg">${fare?.toFixed(2)}</Text>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* Tip Calculator */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2 align="center" data-cms-id="booking-payment-tip" mode={mode}>
              {getCMSField(cmsData, 'tip', 'Add a Tip')}
            </H2>
            
            <TipCalculator
              baseAmount={fare || 0}
              onTipChange={onTipChange}
            />
            
            <Stack direction="horizontal" justify="space-between">
              <Text weight="bold">Total Amount:</Text>
              <Text weight="bold" size="lg">${getTotalWithTip().toFixed(2)}</Text>
            </Stack>
          </Stack>
        </Box>

        {/* Deposit Information */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="lg">
            <H2 align="center" data-cms-id="booking-payment-deposit" mode={mode}>
              {getCMSField(cmsData, 'deposit', 'Deposit Required')}
            </H2>
            
            <Box variant="outlined" padding="md">
              <Stack spacing="sm">
                <Stack direction="horizontal" justify="space-between">
                  <Text>Total Trip Cost:</Text>
                  <Text weight="medium">${getTotalWithTip().toFixed(2)}</Text>
                </Stack>
                <Stack direction="horizontal" justify="space-between">
                  <Text>Deposit (20%):</Text>
                  <Text weight="bold" size="lg" color="primary">${depositAmount?.toFixed(2)}</Text>
                </Stack>
                <Stack direction="horizontal" justify="space-between">
                  <Text>Balance Due:</Text>
                  <Text weight="medium">${(getTotalWithTip() - (depositAmount || 0)).toFixed(2)}</Text>
                </Stack>
              </Stack>
            </Box>
            
            <Text size="sm" color="secondary" align="center">
              {getCMSField(cmsData, 'depositNote', 'A 20% deposit is required to confirm your booking. The remaining balance will be due before your trip.')}
            </Text>
          </Stack>
        </Box>

        {/* Payment Form */}
        {showPaymentForm ? (
          <Box variant="elevated" padding="lg">
            <Stack spacing="lg">
              <H2 align="center" data-cms-id="booking-payment-form-title" mode={mode}>
                {getCMSField(cmsData, 'title', 'Payment Information')}
              </H2>
              
              <Text size="sm" color="secondary" align="center">
                {getCMSField(cmsData, 'description', 'Enter your payment details to complete your deposit payment.')}
              </Text>
              
              <SquarePaymentForm
                amount={Math.round((depositAmount || 0) * 100)} // Convert to cents
                bookingId={bookingId || undefined} // Don't pass 'temp' - let it be undefined
                onPaymentSuccess={onPaymentSuccess}
                onPaymentError={onPaymentError}
                disabled={isProcessingPayment}
                hideSubmitButton={true} // Hide the Square "Pay" button
                onPaymentReady={onPaymentReady}
                bookingData={bookingData}
              />
              
              <Text size="sm" color="secondary" align="center">
                Please enter your credit card information above, then click "Confirm Booking" to complete your payment.
              </Text>
            </Stack>
          </Box>
        ) : (
          <Box variant="outlined" padding="lg">
            <Stack spacing="md" align="center">
              <Text size="sm" color="secondary">
                Payment form will appear after you click "Continue to Payment"
              </Text>
              <Text size="xs" color="muted">
                Debug: showPaymentForm={showPaymentForm.toString()}, bookingId={bookingId || 'null'}
              </Text>
            </Stack>
          </Box>
        )}

        {/* Payment Error */}
        {paymentError && (
          <StatusMessage 
            type="error" 
            message={paymentError} 
            id="payment-error-message" 
            data-testid="payment-error-message" 
          />
        )}

        {/* Navigation Buttons */}
        <Stack direction="horizontal" spacing="md">
          <Button
            onClick={onBack}
            variant="outline"
            fullWidth
            data-testid="back-to-contact-info-button"
          >
            {getCMSField(cmsData, 'back', 'Back to Contact Info')}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
