'use client';

import React from 'react';
import { Container, Stack, StatusMessage } from '@/ui';
import { PaymentSummary } from './payment/PaymentSummary';
import { PaymentForm } from './payment/PaymentForm';
import { PaymentNavigation } from './payment/PaymentNavigation';
import { TipCalculator } from '@/components/business/TipCalculator';
import { TripDetails, CustomerInfo, PaymentInfo } from '@/types/booking';
import { useBooking } from '@/providers/BookingProvider';
import { Button, Text } from '@/ui';

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
  const { submitBookingWithQuote, currentQuote, isQuoteValid, setQuote } = useBooking();
  const [isRefreshingQuote, setIsRefreshingQuote] = React.useState(false);
  const getTotalWithTip = () => (tripData.fare || 0) + paymentData.tipAmount;
  const canProcessPayment = !isProcessing && isQuoteValid();

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

        {!isQuoteValid() && (
          <Stack spacing="md" align="center">
            <Text color="warning" cmsId="paymentPhase-expiredQuote">Price quote expired. Please refresh to continue.</Text>
            <Button
              variant="outline"
              size="md"
              onClick={async () => {
                if (isRefreshingQuote) return; // Prevent multiple clicks
                setIsRefreshingQuote(true);
                try {
                  const res = await fetch('/api/booking/quote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      origin: tripData.pickup.address,
                      destination: tripData.dropoff.address,
                      pickupCoords: tripData.pickup.coordinates,
                      dropoffCoords: tripData.dropoff.coordinates,
                      fareType: tripData.fareType,
                      pickupTime: tripData.pickupDateTime || undefined,
                    })
                  });
                  if (res.ok) {
                    const data = await res.json();
                    setQuote(data);
                  }
                } catch (error) {
                  console.error('Quote refresh error:', error);
                } finally {
                  setIsRefreshingQuote(false);
                }
              }}
              disabled={isRefreshingQuote}
              loading={isRefreshingQuote}
              data-testid="refresh-quote-button"
              cmsId="refresh-quote-button"
              text={cmsData?.['paymentPhase-refreshQuote'] || 'Refresh Quote'}
            />
          </Stack>
        )}

        <PaymentNavigation
          onBack={onBack}
          onProcessPayment={async () => {
            await submitBookingWithQuote();
          }}
          isProcessingPayment={isProcessing}
          canProcessPayment={canProcessPayment}
          cmsData={cmsData}
        />
      </Stack>
    </Container>
  );
}