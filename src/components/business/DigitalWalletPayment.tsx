'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Container, Stack, Text, Button, Box, Alert, LoadingSpinner } from '@/ui';

interface DigitalWalletPaymentProps {
  amount: number;
  bookingId: string;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
  disabled?: boolean;
}

type SquarePayments = any;

async function loadSquareSdk(): Promise<void> {
  if (typeof window === 'undefined') return;
  if ((window as any).Square) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://web.squarecdn.com/v1/square.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Square SDK'));
    document.head.appendChild(script);
  });
}

export function DigitalWalletPayment({ amount, bookingId, onPaymentSuccess, onPaymentError, disabled = false }: DigitalWalletPaymentProps) {
  // Feature flag: hide wallets until Square setup is complete
  const walletsEnabled = process.env.NEXT_PUBLIC_WALLETS_ENABLED === 'true';
  if (!walletsEnabled) {
    return null;
  }

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appleSupported, setAppleSupported] = useState(false);
  const [googleSupported, setGoogleSupported] = useState(false);
  const paymentsRef = useRef<SquarePayments | null>(null);

  const initSquare = useCallback(async () => {
    try {
      await loadSquareSdk();
      const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID as string;
      const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID as string;
      if (!appId || !locationId) {
        setError('Square is not configured.');
        return;
      }
      const payments = await (window as any).Square.payments(appId, locationId);
      paymentsRef.current = payments;

      // Apple Pay support
      try {
        const applePay = await payments.applePay({ countryCode: 'US', currencyCode: 'USD' });
        const canApple = await applePay.canMakePayment();
        setAppleSupported(!!canApple);
      } catch {
        setAppleSupported(false);
      }

      // Google Pay support
      try {
        const googlePay = await payments.googlePay({ countryCode: 'US', currencyCode: 'USD' });
        const canGoogle = await googlePay.canMakePayment();
        setGoogleSupported(!!canGoogle);
      } catch {
        setGoogleSupported(false);
      }
    } catch (e) {
      setError('Failed to initialize Square payments');
    }
  }, []);

  useEffect(() => {
    initSquare();
  }, [initSquare]);

  const tokenizeAndPay = useCallback(
    async (method: 'apple' | 'google') => {
      if (!paymentsRef.current || disabled) return;
      setIsLoading(true);
      setError(null);
      try {
        let token: string | undefined;
        if (method === 'apple') {
          const applePay = await paymentsRef.current.applePay({ countryCode: 'US', currencyCode: 'USD' });
          const result = await applePay.tokenize({ total: { amount: amount.toFixed(2), label: 'Fairfield Airport Cars' } });
          if (result.status === 'OK') token = result.token;
          else throw new Error(result.status || 'Apple Pay failed');
        } else {
          const googlePay = await paymentsRef.current.googlePay({ countryCode: 'US', currencyCode: 'USD' });
          const result = await googlePay.tokenize({ total: { amount: amount.toFixed(2), label: 'Fairfield Airport Cars' } });
          if (result.status === 'OK') token = result.token;
          else throw new Error(result.status || 'Google Pay failed');
        }
        if (!token) throw new Error('Tokenization failed');

        const resp = await fetch('/api/payment/digital-wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId, amount, sourceId: token })
        });
        if (!resp.ok) {
          const data = await resp.json().catch(() => ({}));
          throw new Error((data as any).error || 'Payment processing failed');
        }
        const data = await resp.json();
        onPaymentSuccess(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Payment failed';
        setError(message);
        onPaymentError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [amount, bookingId, disabled, onPaymentError, onPaymentSuccess]
  );

  const supported = appleSupported || googleSupported;

  if (!supported) {
    return (
      <Container>
        <Alert variant="warning">
          <Text>Apple Pay / Google Pay not available on this device or domain is not verified.</Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Stack spacing="lg">
        <Stack spacing="sm">
          <Text weight="bold" size="lg">Digital Wallet Payment</Text>
          <Text variant="muted">Pay securely with Apple Pay or Google Pay</Text>
        </Stack>

        <Box variant="outlined" padding="lg">
          <Stack direction="horizontal" justify="space-between" align="center">
            <Text weight="bold">Total Amount</Text>
            <Text weight="bold" size="lg">${amount.toFixed(2)}</Text>
          </Stack>
        </Box>

        <Stack spacing="md">
          {appleSupported && (
            <Button variant="primary" onClick={() => tokenizeAndPay('apple')} disabled={disabled || isLoading} fullWidth size="lg">
              {isLoading ? (
                <Stack direction="horizontal" align="center" spacing="sm">
                  <LoadingSpinner size="sm" />
                  <Text>Processing...</Text>
                </Stack>
              ) : (
                <Stack direction="horizontal" align="center" spacing="sm">
                  <Text>🍎</Text>
                  <Text>Pay with Apple Pay</Text>
                </Stack>
              )}
            </Button>
          )}
          {googleSupported && (
            <Button variant="secondary" onClick={() => tokenizeAndPay('google')} disabled={disabled || isLoading} fullWidth size="lg">
              {isLoading ? (
                <Stack direction="horizontal" align="center" spacing="sm">
                  <LoadingSpinner size="sm" />
                  <Text>Processing...</Text>
                </Stack>
              ) : (
                <Stack direction="horizontal" align="center" spacing="sm">
                  <Text>GPay</Text>
                  <Text>Pay with Google Pay</Text>
                </Stack>
              )}
            </Button>
          )}
        </Stack>

        {error && (
          <Alert variant="error">
            <Text>{error}</Text>
          </Alert>
        )}

        <Alert variant="info">
          <Text size="sm">Your payment information is encrypted and securely processed. We never store your payment details.</Text>
        </Alert>
      </Stack>
    </Container>
  );
}