'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button, Container, Stack, Text, Alert } from '@/design/ui';
import { useCMSData } from '@/design/hooks/useCMSData';

interface SquarePaymentFormProps {
  amount: number; // Amount in cents
  bookingId: string;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    Square: any;
  }
}

export function SquarePaymentForm({ 
  amount, 
  bookingId, 
  onPaymentSuccess, 
  onPaymentError, 
  disabled = false 
}: SquarePaymentFormProps) {
  const { cmsData } = useCMSData();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<any>(null);
  const paymentsRef = useRef<any>(null);

  useEffect(() => {
    // Load Square Web Payments SDK
    const script = document.createElement('script');
    script.src = process.env.NODE_ENV === 'production' 
      ? 'https://web.squarecdn.com/v1/square.js'
      : 'https://sandbox.web.squarecdn.com/v1/square.js';
    script.async = true;
    script.onload = initializeSquare;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeSquare = async () => {
    try {
      if (!window.Square) {
        throw new Error('Square.js failed to load properly');
      }

      const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID;
      const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

      if (!appId || !locationId) {
        throw new Error('Square credentials not configured');
      }

      // Initialize Square payments
      paymentsRef.current = window.Square.payments(appId, locationId);
      
      // Initialize card component
      cardRef.current = await paymentsRef.current.card();
      await cardRef.current.attach(cardContainerRef.current);
      
    } catch (error) {
      console.error('Failed to initialize Square:', error);
      setPaymentError('Failed to initialize payment system');
    }
  };

  const handlePayment = async () => {
    if (!cardRef.current || disabled || isLoading) return;

    setIsLoading(true);
    setPaymentError(null);

    try {
      // Tokenize the card input
      const verificationDetails = {
        amount: (amount / 100).toFixed(2), // Convert cents to dollars
        billingContact: {
          givenName: 'Customer',
          familyName: 'Name',
          email: 'customer@example.com',
          phone: '555-555-5555',
          addressLines: ['123 Main St'],
          city: 'Fairfield',
          state: 'CA',
          countryCode: 'US',
        },
        currencyCode: 'USD',
        intent: 'CHARGE',
        customerInitiated: true,
        sellerKeyedIn: false,
      };

      const tokenResult = await cardRef.current.tokenize(verificationDetails);
      
      if (tokenResult.status !== 'OK') {
        throw new Error(`Tokenization failed: ${tokenResult.status}`);
      }

      // Send payment token to backend
      const response = await fetch('/api/payment/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentToken: tokenResult.token,
          amount,
          currency: 'USD',
          bookingId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment failed');
      }

      const result = await response.json();
      onPaymentSuccess(result);
      
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setPaymentError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container variant="default" padding="lg">
      <Stack spacing="lg">
        <Text variant="h3" data-cms-id="payment.form.title">
          {getCMSField(cmsData, 'payment.form.title', 'Payment Information')}
        </Text>
        
        <Text variant="body" data-cms-id="payment.form.description">
          {getCMSField(cmsData, 'payment.form.description', 'Enter your payment details to complete your booking')}
        </Text>

        <Container variant="default" padding="md">
          <div id="card-container" ref={cardContainerRef} />
        </Container>

        {paymentError && (
          <Alert variant="error">
            <Text size="sm">{paymentError}</Text>
          </Alert>
        )}

        <Button
          onClick={handlePayment}
          disabled={disabled || isLoading || !cardRef.current}
          variant="primary"
          size="lg"
          data-cms-id="payment.form.submit"
        >
          {isLoading 
            ? getCMSField(cmsData, 'payment.form.processing', 'Processing...')
            : getCMSField(cmsData, 'payment.form.submit', `Pay $${(amount / 100).toFixed(2)}`)
          }
        </Button>

        <Alert variant="info">
          <Text size="sm">
            {getCMSField(cmsData, 'payment.form.security', 'Your payment information is encrypted and securely processed. We never store your payment details.')}
          </Text>
        </Alert>
      </Stack>
    </Container>
  );
}

// Helper function to get CMS fields
function getCMSField(cmsData: any, path: string, fallback: string): string {
  return cmsData?.[path] || fallback;
}
