'use client';

import React from 'react';
import { Box, Stack, H2, Text, StatusMessage } from '@/design/ui';
import { SquarePaymentForm } from '@/components/business/SquarePaymentForm';

interface PaymentFormProps {
  showPaymentForm: boolean;
  totalAmount: number;
  bookingData: any;
  isProcessingPayment: boolean;
  paymentError: string | null;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
  onPaymentReady: (processPayment: () => Promise<void>) => void;
  cmsData: any;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  showPaymentForm,
  totalAmount,
  bookingData,
  isProcessingPayment,
  paymentError,
  onPaymentSuccess,
  onPaymentError,
  onPaymentReady,
  cmsData
}) => {
  if (!showPaymentForm) return null;

  return (
    <Box variant="elevated" padding="lg" data-testid="payment-form">
      <Stack spacing="lg">
        <H2 align="center" cmsId="payment-form-title">
          {cmsData?.['paymentPhasePaymentForm'] || 'Payment Information'}
        </H2>
        
        <Text align="center" color="secondary" cmsId="payment-form-description">
          {cmsData?.['paymentPhase-paymentDescription'] || 'Complete your booking by providing payment information.'}
        </Text>
        
        <SquarePaymentForm
          amount={Math.round(totalAmount * 100)} // Convert dollars to cents
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
          onPaymentReady={onPaymentReady}
          bookingData={bookingData}
          cmsData={cmsData}
        />
        
        {/* Error Display */}
        {paymentError && (
          <StatusMessage 
            type="error"
            message={paymentError}
            id="payment-error-message"
            data-testid="payment-error-message"
          />
        )}
      </Stack>
    </Box>
  );
};
