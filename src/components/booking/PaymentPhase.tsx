'use client';

import React from 'react';
import { Container, Stack, StatusMessage } from '@/ui';
import { PaymentSummary } from './payment/PaymentSummary';
import { PaymentForm } from './payment/PaymentForm';
import { PaymentNavigation } from './payment/PaymentNavigation';
import { TipCalculator } from '@/components/business/TipCalculator';
import { TripDetails, CustomerInfo, PaymentInfo } from '@/types/booking';

interface PaymentPhaseProps {
  tripData: TripDetails;
  customerData: CustomerInfo;
  paymentData: PaymentInfo;
  onPaymentUpdate: (data: Partial<PaymentInfo>) => void;
  onBack: () => void;
  isProcessing: boolean;
  error: string | null;
  success: string | null;
  cmsData: any;
}

export function PaymentPhase({
  tripData,
  customerData,
  paymentData,
  onPaymentUpdate,
  onBack,
  isProcessing,
  error,
  success,
  cmsData
}: PaymentPhaseProps) {
  const getTotalWithTip = () => (tripData.fare || 0) + paymentData.tipAmount;
  const canProcessPayment = !isProcessing;

  return (
    <Container maxWidth="7xl" padding="xl" data-testid="payment-phase-container">
      <Stack spacing="xl" data-testid="payment-phase-stack">
        {/* Success Message */}
        {success && (
          <StatusMessage
            type="success"
            message={success}
            id="payment-success-message"
            data-testid="payment-success-message"
          />
        )}

        {/* Error Message */}
        {error && (
          <StatusMessage
            type="error"
            message={error}
            id="payment-error-message"
            data-testid="payment-error-message"
          />
        )}

        <PaymentSummary
          pickupLocation={tripData.pickup.address}
          dropoffLocation={tripData.dropoff.address}
          pickupDateTime={tripData.pickupDateTime}
          fare={tripData.fare}
          tipAmount={paymentData.tipAmount}
          depositAmount={paymentData.depositAmount}
          cmsData={cmsData}
        />

        {/* Tip Calculator */}
        <TipCalculator
          baseAmount={tripData.fare || 0}
          initialTipPercentage={paymentData.tipPercent}
          onTipChange={(amount, percent) => {
            onPaymentUpdate({ tipAmount: amount, tipPercent: percent });
          }}
          cmsData={cmsData}
        />

        <PaymentForm
          showPaymentForm={true}
          totalAmount={getTotalWithTip()}
          bookingData={{
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            pickupLocation: tripData.pickup.address,
            dropoffLocation: tripData.dropoff.address,
            pickupDateTime: tripData.pickupDateTime,
            fare: tripData.fare,
            flightNumber: tripData.flightInfo?.flightNumber || '',
            notes: customerData.notes,
            tipAmount: paymentData.tipAmount,
            totalAmount: getTotalWithTip(),
            flightInfo: tripData.flightInfo,
            fareType: tripData.fareType,
            saveInfoForFuture: customerData.saveInfoForFuture,
          }}
          isProcessingPayment={isProcessing}
          paymentError={error}
          onPaymentSuccess={(result: any) => {
            console.log('Payment successful:', result);
            // Handle success - this would be managed by the parent component
          }}
          onPaymentError={(error: string) => {
            console.error('Payment error:', error);
            // Handle error - this would be managed by the parent component
          }}
          onPaymentReady={(processPayment: () => Promise<void>) => {
            // Handle payment ready - this would be managed by the parent component
          }}
          cmsData={cmsData}
        />

        <PaymentNavigation
          onBack={onBack}
          onProcessPayment={() => {
            // This will be handled by the parent component
            console.log('Process payment clicked');
          }}
          isProcessingPayment={isProcessing}
          canProcessPayment={canProcessPayment}
          cmsData={cmsData}
        />
      </Stack>
    </Container>
  );
}