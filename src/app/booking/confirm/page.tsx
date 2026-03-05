'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { Container, Stack, H2, Text, Button, LoadingSpinner } from '@/design/ui';

const ButtonWrapper = styled.div`
  flex: 1 1 0;
  min-width: 0;
`;

const ButtonContainer = styled(Stack)`
  width: 100%;
  max-width: 500px;
`;

type ConfirmationState = 'idle' | 'loading' | 'success' | 'error';

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams?.get('bookingId');
  const token = searchParams?.get('token');

  const [state, setState] = useState<ConfirmationState>('idle');
  const [message, setMessage] = useState<string>('');

  const isAlreadyConfirmedMessage =
    state === 'success' && /already confirmed/i.test(message);

  const pageTitle =
    state === 'loading' || state === 'idle'
      ? 'Finalize Your Booking'
      : state === 'success'
        ? isAlreadyConfirmedMessage
          ? 'Booking Already Confirmed'
          : 'Booking Confirmed'
        : 'Booking Confirmation Needed';

  useEffect(() => {
    const confirmBooking = async () => {
      if (!bookingId || !token) {
        setState('error');
        setMessage('Missing confirmation details. Please check the link in your email.');
        return;
      }

      try {
        setState('loading');
        const response = await fetch('/api/booking/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, token })
        });

        const payload = await response.json();

        if (!response.ok) {
          setState('error');
          setMessage(payload.error || 'We could not confirm your booking. Please contact support.');
          return;
        }

        setState('success');
        setMessage(payload.message || 'Your booking is confirmed!');
      } catch (error) {
        console.error('Booking confirmation error:', error);
        setState('error');
        setMessage('Something went wrong while confirming your booking. Please try again or contact support.');
      }
    };

    confirmBooking();
  }, [bookingId, token]);

  const renderContent = () => {
    if (state === 'loading' || state === 'idle') {
      return (
        <Stack spacing="md" align="center">
          <LoadingSpinner size="lg" variant="spinner" />
          <Text size="lg" color="secondary">
            Confirming your booking…
          </Text>
        </Stack>
      );
    }

    if (state === 'success') {
      return (
        <Stack spacing="lg" align="center">
          <Text size="lg" weight="bold" color="success">
            {message}
          </Text>
          <Text align="center" color="secondary">
            We've notified the Fairfield Airport Cars team. You'll receive your final itinerary shortly.
          </Text>
          <ButtonContainer direction="horizontal" spacing="md" align="stretch" justify="center">
            <ButtonWrapper>
              <Button
                variant="primary"
                size="md"
                onClick={() => window.location.href = `/booking/${bookingId}`}

                text="View Booking"
                fullWidth
              />
            </ButtonWrapper>
            <ButtonWrapper>
              <Button
                variant="outline"
                size="md"
                onClick={() => window.location.href = '/'}

                text="Return Home"
                fullWidth
              />
            </ButtonWrapper>
          </ButtonContainer>
        </Stack>
      );
    }

    return (
      <Stack spacing="lg" align="center" justify="center">
        <Text size="lg" weight="bold" color="error">
          {message || 'We could not confirm your booking.'}
        </Text>
        <Text align="center" color="secondary">
          Please forward your confirmation email to rides@fairfieldairportcar.com or text (646) 221-6370 so we can help.
        </Text>
        <Button
          variant="primary"
          size="md"
          onClick={() => window.location.href = '/'}

          text="Return Home"
        />
      </Stack>
    );
  };

  return (
    <Container maxWidth="lg" padding="xl" alignSelf="center">
      <Stack spacing="2xl" align="center">
        <H2>{pageTitle}</H2>
        {renderContent()}
      </Stack>
    </Container>
  );
}
