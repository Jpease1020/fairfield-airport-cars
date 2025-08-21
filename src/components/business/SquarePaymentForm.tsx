'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button, Container, Stack, Text, Alert, LoadingSpinner } from '@/design/ui';
import { useCMSData } from '@/design/hooks/useCMSData';
import styled from 'styled-components';
import { colors, spacing, borderRadius } from '@/design/foundation/tokens/tokens';

const CardContainer = styled.div`
  min-height: 200px;
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  padding: ${spacing.md};
`;

interface SquarePaymentFormProps {
  amount: number;
  bookingId: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export function SquarePaymentForm({ 
  amount, 
  bookingId, 
  onSuccess, 
  onError, 
  disabled = false 
}: SquarePaymentFormProps) {
  const [processing, setProcessing] = useState(false);
  const [squareLoaded, setSquareLoaded] = useState(false);
  const [card, setCard] = useState<any>(null);
  const [applePay, setApplePay] = useState<any>(null);
  const [googlePay, setGooglePay] = useState<any>(null);
  const { cmsData } = useCMSData();
  const cardContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Square Web Payments SDK
    const script = document.createElement('script');
    // Use sandbox in development, production in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    script.src = isDevelopment 
      ? 'https://sandbox.web.squarecdn.com/v1/square.js'
      : 'https://web.squarecdn.com/v1/square.js';
    script.onload = () => setSquareLoaded(true);
    script.onerror = () => onError('Failed to load Square payment system');
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [onError]);

  useEffect(() => {
    if (squareLoaded && window.Square && cardContainerRef.current) {
      initializePaymentMethods();
    }
  }, [squareLoaded]);

  const initializePaymentMethods = async () => {
    try {
      // Get the correct credentials based on environment
      const isDevelopment = process.env.NODE_ENV === 'development';
      const applicationId = isDevelopment 
        ? process.env.NEXT_PUBLIC_SANDBOX_SQUARE_APPLICATION_ID 
        : process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
      const locationId = isDevelopment 
        ? process.env.NEXT_PUBLIC_SANDBOX_SQUARE_LOCATION_ID 
        : process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;

      if (!applicationId || !locationId) {
        throw new Error('Square credentials not configured');
      }

      console.log('Initializing Square payments with:', { applicationId, locationId, isDevelopment });

      const payments = window.Square.payments(applicationId, locationId);
      
      // Initialize card payment - basic implementation
      console.log('Creating card instance...');
      const cardInstance = await payments.card();
      console.log('Card instance created:', cardInstance);
      
      console.log('Attaching card to container...');
      await cardInstance.attach(cardContainerRef.current!);
      console.log('Card attached successfully');
      
      setCard(cardInstance);

      // Skip Apple Pay and Google Pay for now to focus on basic card functionality
      console.log('Card payment initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize payment methods:', error);
      onError(`Failed to initialize payment form: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const processPaymentToken = async (token: string) => {
    setProcessing(true);
    try {
      const requestData = {
        sourceId: token,
        amount,
        bookingId
      };
      
      console.log('🚀 Sending payment request:', requestData);
      
      const response = await fetch('/api/payment/process-in-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Server error:', errorData);
        throw new Error(`Payment failed: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      const responseData = await response.json();
      console.log('✅ Payment successful:', responseData);
      onSuccess(responseData.paymentId);
    } catch (error) {
      console.error('💥 Payment processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      onError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleCardPayment = async () => {
    if (!card || disabled) return;
    
    try {
      console.log('Starting card tokenization...');
      
      // Tokenize the card directly - no need to check state first
      const result = await card.tokenize();
      console.log('Tokenization result:', result);
      
      console.log('Checking status:', result.status, 'Type:', typeof result.status);
      
      if (result.status === 'OK' || result.status === 'ok') {
        console.log('✅ Tokenization successful, processing payment...');
        await processPaymentToken(result.token);
      } else {
        console.error('❌ Tokenization failed:', result);
        throw new Error(`Card tokenization failed: ${result.status}`);
      }
    } catch (error) {
      console.error('Card payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Card payment failed';
      onError(errorMessage);
    }
  };

  const handleApplePay = async () => {
    if (!applePay || disabled) return;
    
    try {
      const result = await applePay.tokenize();
      
      if (result.status === 'ok') {
        await processPaymentToken(result.token);
      } else {
        throw new Error('Apple Pay failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Apple Pay failed';
      onError(errorMessage);
    }
  };

  const handleGooglePay = async () => {
    if (!googlePay || disabled) return;
    
    try {
      const result = await googlePay.tokenize();
      
      if (result.status === 'ok') {
        await processPaymentToken(result.token);
      } else {
        throw new Error('Google Pay failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google Pay failed';
      onError(errorMessage);
    }
  };

  const getCMSField = (key: string, fallback: string) => {
    return cmsData?.[key] || fallback;
  };

  if (processing) {
    return (
      <Container variant="default" padding="lg">
        <Stack spacing="lg" align="center">
          <LoadingSpinner />
          <Text align="center" data-cms-id="payment.processing.message">
            {getCMSField('payment.processing.message', 'Processing your payment...')}
          </Text>
        </Stack>
      </Container>
    );
  }

  if (!squareLoaded) {
    return (
      <Container variant="default" padding="lg">
        <Stack spacing="lg" align="center">
          <LoadingSpinner />
          <Text align="center" data-cms-id="payment.loading.message">
            {getCMSField('payment.loading.message', 'Loading payment system...')}
          </Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container variant="default" padding="lg">
      <Stack spacing="lg">
        <Text variant="h3" data-cms-id="payment.title">
          {getCMSField('payment.title', 'Complete Your Payment')}
        </Text>
        
        <Text data-cms-id="payment.amount">
          {getCMSField('payment.amount', `Total Amount: $${(amount / 100).toFixed(2)}`)}
        </Text>

        {/* Credit Card Form */}
        <Text variant="h4" data-cms-id="payment.card.title">
          {getCMSField('payment.card.title', 'Enter your payment information')}
        </Text>

        <CardContainer 
          ref={cardContainerRef}
        />

        <Button 
          onClick={handleCardPayment}
          disabled={disabled || !card || processing}
          variant="primary"
          data-cms-id="payment.submit.button"
        >
          {getCMSField('payment.submit.button', 'Pay with Card')}
        </Button>

        <Alert variant="info">
          <Text size="sm" data-cms-id="payment.security.notice" as="span">
            {getCMSField('payment.security.notice', 'Your payment information is encrypted and securely processed by Square. We never store your payment details.')}
          </Text>
        </Alert>

        {disabled && (
          <Alert variant="warning">
            <Text size="sm" data-cms-id="payment.disabled.notice" as="span">
              {getCMSField('payment.disabled.notice', 'Payment is currently disabled. Please try again later.')}
            </Text>
          </Alert>
        )}
      </Stack>
    </Container>
  );
}

// Add Square types to window object
declare global {
  interface Window {
    Square: any;
  }
}
