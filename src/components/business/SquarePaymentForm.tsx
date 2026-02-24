'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button, Container, Stack, Text, Alert } from '@/design/ui';
import { authFetch } from '@/lib/utils/auth-fetch';

interface SquarePaymentFormProps {
  amount: number; // Amount in cents
  bookingId?: string; // Optional - only used for existing bookings
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
  disabled?: boolean;
  hideSubmitButton?: boolean;
  onPaymentReady?: (processPayment: () => Promise<void>) => void;
  cmsData: any;
  
  // Booking data for new bookings
  bookingData?: {
    name: string;
    email: string;
    phone: string;
    pickupLocation: string;
    dropoffLocation: string;
    pickupDateTime: string; // Accept string, convert to Date internally
    fare: number | null; // Accept null, handle internally
    quoteId?: string;
    flightNumber?: string;
    notes?: string;
    tipAmount?: number;
    totalAmount?: number;
    flightInfo?: any;
    fareType?: string;
    saveInfoForFuture?: boolean;
    smsOptIn?: boolean;
  };
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
  disabled = false,
  hideSubmitButton = false,
  onPaymentReady,
  bookingData,
  cmsData
}: SquarePaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<any>(null);
  const paymentsRef = useRef<any>(null);
  const initializationRef = useRef(false);
  const onPaymentReadyCalledRef = useRef(false);

  // Define handlePayment function first
  const handlePayment = React.useCallback(async () => {
    if (!cardRef.current || disabled || isLoading || onPaymentReadyCalledRef.current === false) {
      return;
    }

    setIsLoading(true);
    setPaymentError(null);

    try {
      // Add a small delay to ensure card component is fully ready
      await new Promise(resolve => setTimeout(resolve, 500));
    
      // Step 1: Tokenize the card input
      const verificationDetails = {
        amount: (amount / 100).toFixed(2), // Convert cents to dollars
        billingContact: {
          givenName: bookingData?.name?.split(' ')[0] || 'Customer',
          familyName: bookingData?.name?.split(' ').slice(1).join(' ') || 'Name',
          email: bookingData?.email || 'customer@example.com',
          phone: bookingData?.phone || '555-555-5555',
          addressLines: ['Address'],
          city: 'City',
          state: 'State',
          countryCode: 'US',
        },
        currencyCode: 'USD',
        intent: 'CHARGE',
        customerInitiated: true,
        sellerKeyedIn: false,
      };

      
      const tokenResult = await cardRef.current.tokenize(verificationDetails);
      
      if (tokenResult.status !== 'OK') {
        console.error('Tokenization failed:', tokenResult);
        if (tokenResult.status === 'INVALID') {
          if (tokenResult.errors && tokenResult.errors.length > 0) {
            console.error('Square validation errors:', tokenResult.errors);
            const errorMessages = tokenResult.errors.map((err: any) => err.message || err.code).join(', ');
            throw new Error(`Card validation failed: ${errorMessages}`);
          } else {
            throw new Error('Please enter valid card information. Make sure all fields are filled correctly.');
          }
        } else {
          throw new Error(`Payment processing failed: ${tokenResult.status}`);
        }
      }

      // Step 2: Process payment FIRST (security requirement)
      const paymentResponse = await authFetch('/api/payment/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentToken: tokenResult.token,
          amount, // Amount is already in cents
          currency: 'USD',
          bookingData: {
            // Use real booking data from props
            name: bookingData?.name || 'Customer Name',
            email: bookingData?.email || 'customer@example.com',
            phone: bookingData?.phone || '555-555-5555',
            pickupLocation: bookingData?.pickupLocation || 'Pickup Location',
            dropoffLocation: bookingData?.dropoffLocation || 'Dropoff Location',
            pickupDateTime: bookingData?.pickupDateTime || new Date().toISOString(),
            fare: bookingData?.fare || (amount / 100),
            quoteId: bookingData?.quoteId,
            flightNumber: bookingData?.flightNumber || '',
            notes: bookingData?.notes || '',
            tipAmount: Math.round((bookingData?.tipAmount ?? 0) * 100), // Send tip in cents
            totalAmount: bookingData?.totalAmount || (amount / 100),
            flightInfo: bookingData?.flightInfo || {},
            fareType: bookingData?.fareType || 'business',
            saveInfoForFuture: bookingData?.saveInfoForFuture || false,
            smsOptIn: bookingData?.smsOptIn ?? false,
          },
          existingBookingId: bookingId, // Use existing ID if provided
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || 'Payment failed');
      }

      const result = await paymentResponse.json();
      onPaymentSuccess(result);
      
    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setPaymentError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [disabled, isLoading, amount, onPaymentSuccess, onPaymentError, bookingId, bookingData]);

  const initializeSquare = async () => {
    // Prevent double initialization in React 18+ development mode
    if (initializationRef.current) {
      return;
    }
    initializationRef.current = true;
    
    try {
      if (!window.Square) {
        throw new Error('Square.js failed to load properly');
      }

      const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID || process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
      const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

      if (!appId || !locationId) {
        console.warn('Square credentials not configured - payment form will be disabled');
        setPaymentError('Payment system not available');
        return;
      }

      // Initialize Square payments
      paymentsRef.current = window.Square.payments(appId, locationId);
      
      // Initialize card component
      cardRef.current = await paymentsRef.current.card();
      await cardRef.current.attach(cardContainerRef.current);
      
      // Mark as ready - parent can check isReady status
      setIsReady(true);
      
    } catch (error) {
      console.error('Failed to initialize Square:', error);
      // Don't throw - just disable payment form gracefully
      setPaymentError('Payment system temporarily unavailable');
    }
  };

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

  useEffect(() => {
    if (isReady && onPaymentReady && !onPaymentReadyCalledRef.current) {
      onPaymentReadyCalledRef.current = true;
      
      const safePaymentFunction = async () => {
        try {
          await handlePayment();
        } catch (error) {
          console.error('Payment processing error:', error);
        }
      };
      
      onPaymentReady(safePaymentFunction);
    }
  }, [isReady, onPaymentReady, handlePayment]);

  return (
    <Container variant="default" padding="md">
      <Stack spacing="lg">
        <Container variant="default" padding="md">
          <div id="card-container" ref={cardContainerRef} />
        </Container>

        {paymentError && (
          <Alert variant="error">
            <Text size="sm" cmsId="payment-error-message">{paymentError}</Text>
          </Alert>
        )}

        {!hideSubmitButton && (
          <Button
            onClick={handlePayment}
            disabled={disabled || isLoading || !cardRef.current}
            variant="primary"
            size="lg"
            cmsId="payment-form-submit"
            text={isLoading 
              ? cmsData?.['payment-form-processing'] || 'Processing...'
              : cmsData?.['payment-form-submit'] || `Pay $${(amount / 100).toFixed(2)} & Confirm Booking`
            }
          />
        )}

      </Stack>
    </Container>
  );
}

