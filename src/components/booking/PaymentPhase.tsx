'use client';

import React from 'react';
import { Container, Stack, StatusMessage, Box } from '@/design/ui';
import { PaymentSummary } from './payment/PaymentSummary';
import { PaymentForm } from './payment/PaymentForm';
import { PaymentNavigation } from './payment/PaymentNavigation';
import { TipCalculator } from '@/components/business/TipCalculator';
// Types imported from booking provider context
import { useBooking } from '@/providers/BookingProvider';
import { Button, Text } from '@/design/ui';
import styled from 'styled-components';

const DisabledFormWrapper = styled(Box)`
  opacity: 0.5;
  pointer-events: none;
`;

interface PaymentPhaseProps {
  cmsData: any;
}

export function PaymentPhase({
  cmsData
}: PaymentPhaseProps) {
  // Get all data from provider - single source of truth
  const { 
    formData,
    isSubmitting,
    error,
    success,
    submitBooking, 
    currentFare, 
    setFare,
    goToPreviousPhase,
    updatePaymentInfo,
    currentQuote
  } = useBooking();
  
  // Extract data from formData
  const tripData = formData.trip;
  const customerData = formData.customer;
  const paymentData = formData.payment;
  const [isRefreshingQuote, setIsRefreshingQuote] = React.useState(false);
  const getTotalWithTip = () => (tripData.fare || 0) + paymentData.tipAmount;
  const isQuoteValid = currentQuote && currentQuote.expiresAt > new Date();
  const canProcessPayment = !isSubmitting && currentFare !== null && !!isQuoteValid;

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
            updatePaymentInfo({ tipAmount: amount, tipPercent: percent });
          }}
          cmsData={cmsData}
        />

        {/* No Deposit Required Promo - Above Payment Form */}
        <Container variant="card" padding="xl" data-testid="no-deposit-promo">
          <Stack spacing="lg" align="center">
            <Text size="xl" weight="bold" color="primary" cmsId="no-deposit-title">
              🎉 Limited Time Offer!
            </Text>
            <Text size="lg" weight="bold" color="success" cmsId="no-deposit-message">
              No Deposit Required - Book Now!
            </Text>
            <Text size="md" color="secondary" align="center" cmsId="no-deposit-description">
              Complete your booking without any upfront payment. Payment will be collected after your ride.
            </Text>
          </Stack>
        </Container>

        {/* Payment Form - Greyed Out (for visual context) */}
        <DisabledFormWrapper>
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
            isProcessingPayment={false}
            paymentError={null}
            onPaymentSuccess={() => {}}
            onPaymentError={() => {}}
            onPaymentReady={() => {}}
            cmsData={cmsData}
          />
        </DisabledFormWrapper>

        {!currentFare && (
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
                    setFare(data.fare);
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
          onBack={goToPreviousPhase}
          onProcessPayment={async () => {
            await submitBooking();
          }}
          isProcessingPayment={isSubmitting}
          canProcessPayment={canProcessPayment}
          cmsData={cmsData}
        />
      </Stack>
    </Container>
  );
}