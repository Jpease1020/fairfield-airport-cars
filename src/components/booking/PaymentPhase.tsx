'use client';

import React from 'react';
import { Container, Stack, StatusMessage, Modal } from '@/design/ui';
import { PaymentSummary } from './payment/PaymentSummary';
import { PaymentNavigation } from './payment/PaymentNavigation';
// Types imported from booking provider context
import { useBooking } from '@/providers/BookingProvider';
import { Button, Text } from '@/design/ui';
import styled from 'styled-components';
import { colors } from '@/design/system/tokens/tokens';

const ErrorWrapper = styled.div`
  width: 100%;
`;

const ErrorModalContent = styled.div`
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const SuggestedTimesBox = styled.div`
  background-color: ${colors.warning[50]};
  border: 2px solid ${colors.warning[400]};
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
`;

const SuggestedTimesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.5rem;
`;

const TimeChip = styled.span`
  background-color: ${colors.primary[100]};
  color: ${colors.primary[700]};
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 1rem;
`;

const ModalHelperText = styled.div`
  margin-top: 1rem;
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
    goToPreviousPhase,
    validation,
    validateCurrentPhase,
    setHasAttemptedValidation,
    setError
  } = useBooking();
  
  // State for error modal
  const [showErrorModal, setShowErrorModal] = React.useState(false);
  const [errorModalContent, setErrorModalContent] = React.useState<{
    title: string;
    message: string;
    suggestedTimes?: string[];
  } | null>(null);

  // Check if error is a time slot conflict and show modal
  React.useEffect(() => {
    if (error) {
      console.error('🚨 [PAYMENT PHASE] Error displayed:', error);

      // Check if this is a time slot conflict error
      const isTimeConflict = error.match(/time slot|already booked|conflict/i);

      if (isTimeConflict) {
        // Extract suggested times from the error message
        const timesMatch = error.match(/(\d{1,2}:\d{2}-\d{1,2}:\d{2}(?:\s*,\s*\d{1,2}:\d{2}-\d{1,2}:\d{2})*)/g);
        const suggestedTimes = timesMatch ? timesMatch[0].split(/\s*,\s*/) : [];

        setErrorModalContent({
          title: '⚠️ Time Slot Unavailable',
          message: 'The time you selected is already booked. Please go back and choose a different time.',
          suggestedTimes: suggestedTimes.length > 0 ? suggestedTimes : undefined
        });
        setShowErrorModal(true);
      }
    }
  }, [error]);

  // Close modal and go back to change time
  const handleGoBackToChangeTime = () => {
    setShowErrorModal(false);
    setError(null);
    goToPreviousPhase();
  };

  // Close modal but stay on page
  const handleCloseModal = () => {
    setShowErrorModal(false);
  };
  
  // Extract data from formData
  const tripData = formData.trip;
  const customerData = formData.customer;
  const [isRefreshingQuote, setIsRefreshingQuote] = React.useState(false);

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

        {/* Limited-time no-payment promo (temp feature). No greyed-out form — confirm CTA only. */}
        <Container variant="card" padding="xl" data-testid="no-deposit-promo">
          <Stack spacing="lg" align="center">
            <Text size="xl" weight="bold" color="primary" cmsId="no-deposit-title">
              Limited time only
            </Text>
            <Text size="lg" weight="bold" color="success" cmsId="no-deposit-message">
              No payment required — book now
            </Text>
            <Text size="md" color="secondary" align="center" cmsId="no-deposit-description">
              Confirm your details below. We'll see you at pickup. Payment will be collected after your ride. This offer is for a short time only.
            </Text>
          </Stack>
        </Container>

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
            setHasAttemptedValidation(true);
            const validation = validateCurrentPhase();
            if (!validation.isValid) {
              setError(validation.errors.join(', '));
              return;
            }
            await submitBooking();
          }}
          isProcessingPayment={isSubmitting}
          cmsData={cmsData}
          validationErrors={validation?.errors || []}
          noPaymentRequired={!(currentQuote?.fare != null && currentQuote.fare > 0)}
        />
      </Stack>

      {/* Error Modal for Time Slot Conflicts */}
      <Modal
        isOpen={showErrorModal}
        title={errorModalContent?.title || 'Error'}
        onClose={handleCloseModal}
        size="md"
        footer={
          <Stack direction="horizontal" spacing="md">
            <Button
              variant="outline"
              onClick={handleCloseModal}
              text="Close"
            />
            <Button
              variant="primary"
              onClick={handleGoBackToChangeTime}
              text="Go Back & Change Time"
            />
          </Stack>
        }
      >
        <ErrorModalContent>
          <ErrorIcon>🚫</ErrorIcon>
          <Text size="lg" weight="medium">
            {errorModalContent?.message}
          </Text>

          {errorModalContent?.suggestedTimes && errorModalContent.suggestedTimes.length > 0 && (
            <SuggestedTimesBox>
              <Text size="md" weight="bold" color="warning" cmsId="time-conflict-suggested-times-label">
                Suggested Available Times:
              </Text>
              <SuggestedTimesList>
                {errorModalContent.suggestedTimes.map((time, index) => (
                  <TimeChip key={index}>{time}</TimeChip>
                ))}
              </SuggestedTimesList>
            </SuggestedTimesBox>
          )}

          <ModalHelperText>
            <Text size="sm" color="secondary" cmsId="time-conflict-helper-text">
              Please go back and select a different pickup time to complete your booking.
            </Text>
          </ModalHelperText>
        </ErrorModalContent>
      </Modal>
    </Container>
  );
}