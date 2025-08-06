'use client';

import { useEffect, useState } from 'react';
import { 
  Container,
  Stack,
  Text,
  Button,
  Box,
  Alert,
  LoadingSpinner
} from '@/ui';

interface DigitalWalletPaymentProps {
  amount: number;
  bookingId: string;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
  disabled?: boolean;
}

interface PaymentRequestData {
  methodData: PaymentMethodData[];
  details: PaymentDetailsInit;
  options?: PaymentOptions;
}

interface PaymentMethodData {
  supportedMethods: string;
  data?: any;
}

interface PaymentDetailsInit {
  id?: string;
  total: PaymentItem;
  displayItems?: PaymentItem[];
}

interface PaymentItem {
  label: string;
  amount: PaymentCurrencyAmount;
  pending?: boolean;
}

interface PaymentCurrencyAmount {
  currency: string;
  value: string;
}

interface PaymentOptions {
  requestPayerName?: boolean;
  requestPayerEmail?: boolean;
  requestPayerPhone?: boolean;
  requestShipping?: boolean;
  shippingType?: 'shipping' | 'delivery' | 'pickup';
}

// Type definitions for Payment Request API
interface PaymentRequest {
  show(): Promise<PaymentResponse>;
  abort(): Promise<void>;
  canMakePayment(): Promise<PaymentRequestCanMakePaymentResult>;
  hasEnrolledInstrument(): Promise<PaymentRequestHasEnrolledInstrumentResult>;
}

interface PaymentResponse {
  methodName: string;
  details: any;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
  shippingAddress?: any;
  shippingOption?: string;
  complete(result: PaymentComplete): void;
  retry(errorFields: PaymentValidationErrors): void;
}

interface PaymentRequestCanMakePaymentResult {
  canMakePayment: boolean;
  canMakePaymentWithActiveCard?: boolean;
  canMakePaymentWithEnrolledInstrument?: boolean;
  canMakePaymentWithEnrolledInstrumentAndActiveCard?: boolean;
}

interface PaymentRequestHasEnrolledInstrumentResult {
  hasEnrolledInstrument: boolean;
  hasEnrolledInstrumentWithActiveCard?: boolean;
}

interface PaymentComplete {
  status: 'success' | 'fail' | 'unknown';
  methodName?: string;
}

interface PaymentValidationErrors {
  error: string;
  paymentMethod?: any;
  payer?: any;
  payerName?: any;
  payerEmail?: any;
  payerPhone?: any;
  shippingAddress?: any;
  shippingOption?: any;
}

export function DigitalWalletPayment({
  amount,
  bookingId,
  onPaymentSuccess,
  onPaymentError,
  disabled = false
}: DigitalWalletPaymentProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);

  // Check if digital wallet payments are supported
  useEffect(() => {
    const checkSupport = () => {
      // Check if Payment Request API is supported
      if (!window.PaymentRequest) {
        setIsSupported(false);
        return;
      }

      // Check for Apple Pay support
      const isApplePaySupported = (window as any).ApplePaySession && (window as any).ApplePaySession.canMakePayments();
      
      // Check for Google Pay support
      const isGooglePaySupported = (window as any).google && (window as any).google.payments;
      
      setIsSupported(isApplePaySupported || isGooglePaySupported);
    };

    checkSupport();
  }, []);

  // Initialize payment request
  useEffect(() => {
    if (!isSupported || !amount) return;

    try {
      const methodData: PaymentMethodData[] = [
        {
          supportedMethods: 'https://apple.com/apple-pay',
          data: {
            version: 3,
            merchantIdentifier: process.env.NEXT_PUBLIC_APPLE_PAY_MERCHANT_ID,
            merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
            supportedNetworks: ['visa', 'masterCard', 'amex'],
            countryCode: 'US',
          },
        },
        {
          supportedMethods: 'https://google.com/pay',
          data: {
            environment: 'TEST',
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: [
              {
                type: 'CARD',
                parameters: {
                  allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                  allowedCardNetworks: ['VISA', 'MASTERCARD'],
                },
                tokenizationSpecification: {
                  type: 'PAYMENT_GATEWAY',
                  parameters: {
                    gateway: 'square',
                    gatewayMerchantId: process.env.NEXT_PUBLIC_SQUARE_MERCHANT_ID,
                  },
                },
              },
            ],
            merchantInfo: {
              merchantName: 'Fairfield Airport Cars',
            },
            transactionInfo: {
              totalPriceStatus: 'FINAL',
              totalPrice: amount.toString(),
              currencyCode: 'USD',
              countryCode: 'US',
            },
          },
        },
      ];

      const details: PaymentDetailsInit = {
        total: {
          label: 'Fairfield Airport Cars',
          amount: {
            currency: 'USD',
            value: amount.toString(),
          },
        },
        displayItems: [
          {
            label: 'Transportation Service',
            amount: {
              currency: 'USD',
              value: amount.toString(),
            },
          },
        ],
      };

      const options: PaymentOptions = {
        requestPayerName: true,
        requestPayerEmail: true,
        requestPayerPhone: true,
      };

      const request = new (window as any).PaymentRequest(methodData, details, options);
      setPaymentRequest(request);
    } catch (err) {
      console.error('Error initializing payment request:', err);
      setError('Failed to initialize payment');
    }
  }, [isSupported, amount]);

  // Handle payment
  const handlePayment = async () => {
    if (!paymentRequest || disabled) return;

    try {
      setIsLoading(true);
      setError(null);

      // Show payment request
      const response = await paymentRequest.show();
      
      if (response.details) {
        // Process payment with Square
        const paymentResult = await processPaymentWithSquare(response, bookingId);
        
        if (paymentResult.success) {
          onPaymentSuccess(paymentResult);
        } else {
          throw new Error(paymentResult.error || 'Payment failed');
        }
      } else {
        throw new Error('Payment was cancelled');
      }
    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Process payment with Square
  const processPaymentWithSquare = async (
    paymentResponse: PaymentResponse,
    bookingId: string
  ) => {
    try {
      const response = await fetch('/api/payment/digital-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          amount,
          paymentMethod: paymentResponse.methodName,
          paymentDetails: paymentResponse.details,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment processing failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing payment with Square:', error);
      throw error;
    }
  };

  if (!isSupported) {
    return (
      <Container>
        <Alert variant="warning">
          <Text>
            Digital wallet payments are not supported on this device. 
            Please use a different payment method.
          </Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Stack spacing="lg">
        {/* Header */}
        <Stack spacing="sm">
          <Text weight="bold" size="lg">Digital Wallet Payment</Text>
          <Text variant="muted">
            Pay securely with Apple Pay or Google Pay
          </Text>
        </Stack>

        {/* Payment Amount */}
        <Box variant="outlined" padding="lg">
          <Stack direction="horizontal" justify="space-between" align="center">
            <Text weight="bold">Total Amount</Text>
            <Text weight="bold" size="lg">
              ${amount.toFixed(2)}
            </Text>
          </Stack>
        </Box>

        {/* Payment Buttons */}
        <Stack spacing="md">
          <Button
            variant="primary"
            onClick={handlePayment}
            disabled={disabled || isLoading || !paymentRequest}
            fullWidth
            size="lg"
          >
            {isLoading ? (
              <Stack direction="horizontal" align="center" spacing="sm">
                <LoadingSpinner size="sm" />
                <Text>Processing Payment...</Text>
              </Stack>
            ) : (
              <Stack direction="horizontal" align="center" spacing="sm">
                <Text>🍎</Text>
                <Text>Pay with Apple Pay / Google Pay</Text>
              </Stack>
            )}
          </Button>
        </Stack>

        {/* Error Display */}
        {error && (
          <Alert variant="error">
            <Text>{error}</Text>
          </Alert>
        )}

        {/* Security Notice */}
        <Alert variant="info">
          <Text size="sm">
            Your payment information is encrypted and securely processed. 
            We never store your payment details.
          </Text>
        </Alert>
      </Stack>
    </Container>
  );
} 