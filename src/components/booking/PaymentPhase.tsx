'use client';

import React from 'react';
import { Container, Stack, StatusMessage, Box } from '@/design/ui';
import { PaymentSummary } from './payment/PaymentSummary';
import { PaymentForm } from './payment/PaymentForm';
import { PaymentNavigation } from './payment/PaymentNavigation';
// Types imported from booking provider context
import { useBooking } from '@/providers/BookingProvider';
import { Button, Text } from '@/design/ui';
import styled from 'styled-components';

const DisabledFormWrapper = styled(Box)`
  opacity: 0.5;
  pointer-events: none;
`;

const ErrorWrapper = styled.div`
  width: 100%;
`;

// Component to handle error message scrolling and prominence
const ErrorMessageWithScroll: React.FC<{ message: string }> = ({ message }) => {
  const errorRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (errorRef.current && message) {
      // Scroll immediately and again after a short delay to ensure visibility
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [message]);
  
  if (!message) return null;
  
  return (
    <ErrorWrapper ref={errorRef}>
      <StatusMessage
        type="error"
        message={message}
        id="payment-error-message"
        data-testid="payment-error-message"
        size="lg"
      />
    </ErrorWrapper>
  );
};

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
    currentQuote,
    setQuote,
    goToPreviousPhase
  } = useBooking();
  
  // Debug: Log error state changes
  React.useEffect(() => {
    if (error) {
      console.error('🚨 [PAYMENT PHASE] Error displayed:', error);
    }
  }, [error]);
  
  // Extract data from formData
  const tripData = formData.trip;
  const customerData = formData.customer;
  const paymentData = formData.payment;
  const [isRefreshingQuote, setIsRefreshingQuote] = React.useState(false);
  const getTotalWithTip = () => (currentQuote?.fare || 0) + paymentData.tipAmount;

  return (
    <Container maxWidth="7xl" padding="xl" data-testid="payment-phase-container">
      <Stack spacing="xl" data-testid="payment-phase-stack">
        {/* Error Message - Show FIRST and prominently */}
        {error && (
          <ErrorMessageWithScroll message={error} />
        )}

        {/* Success Message */}
        {success && (
          <StatusMessage
            type="success"
            message={success}
            id="payment-success-message"
            data-testid="payment-success-message"
          />
        )}

        <PaymentSummary
          pickupLocation={tripData.pickup.address}
          dropoffLocation={tripData.dropoff.address}
          pickupDateTime={tripData.pickupDateTime}
          fare={currentQuote?.fare || null}
          cmsData={cmsData}
        />

        {/* No Deposit Required Promo - Above Payment Form */}
        <Container variant="card" padding="xl" data-testid="no-deposit-promo">
          <Stack spacing="lg" align="center">
            <Text size="xl" weight="bold" color="primary" cmsId="no-deposit-title">
              🎉 Limited Time Offer!
            </Text>
            <Text size="lg" weight="bold" color="success" cmsId="no-deposit-message">
              No Payment Required - Book Now!
            </Text>
            <Text size="md" color="secondary" align="center" cmsId="no-deposit-description">
              Complete your booking without any payment. Simply confirm your details and we'll see you at pickup! Payment will be collected after your ride.
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
              fare: currentQuote?.fare || null,
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

        {!currentQuote && (
          <Stack spacing="md" align="center">
            <Text color="warning" cmsId="paymentPhase-expiredQuote">Price quote expired. Please refresh to continue.</Text>
            <Button
              variant="outline"
              size="md"
              onClick={async () => {
                if (isRefreshingQuote) return; // Prevent multiple clicks
                
                // Validate pickup time is present before requesting quote
                if (!tripData.pickupDateTime) {
                  console.error('Cannot refresh quote: pickup date/time is required');
                  return;
                }
                
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
                      pickupTime: new Date(tripData.pickupDateTime).toISOString(), // Required
                    })
                  });
                  if (res.ok) {
                    const data = await res.json();
                    setQuote(data); // Set full quote
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
          cmsData={cmsData}
        />
      </Stack>
    </Container>
  );
}