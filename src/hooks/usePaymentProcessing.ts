import { useCallback } from 'react';

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  status?: string;
  amount?: number;
  currency?: string;
  error?: string;
}

export const usePaymentProcessing = (
  bookingId: string | null,
  amount: number,
  onSuccess: (result: PaymentResult) => void,
  onError: (error: string) => void
) => {
  // Create booking first, then show payment form
  const createBooking = useCallback(async (bookingData: any) => {
    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const data = await response.json();
      
      if (data.success && data.bookingId) {
        return {
          success: true,
          bookingId: data.bookingId,
          message: 'Booking created successfully! Please complete payment to confirm your ride.'
        };
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error) {
      console.error('Booking creation error:', error);
      throw new Error('Failed to create booking. Please try again.');
    }
  }, []);

  // Process payment through Square
  const processPayment = useCallback(async (paymentToken: string) => {
    if (!bookingId) {
      throw new Error('No booking ID available');
    }

    try {
      const response = await fetch('/api/payment/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentToken,
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'USD',
          bookingId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment failed');
      }

      const result = await response.json();
      onSuccess(result);
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      onError(errorMessage);
      throw error;
    }
  }, [bookingId, amount, onSuccess, onError]);

  // Handle payment success
  const handlePaymentSuccess = useCallback((result: PaymentResult) => {
    console.log('Payment successful:', result);
    onSuccess(result);
  }, [onSuccess]);

  // Handle payment error
  const handlePaymentError = useCallback((error: string) => {
    console.error('Payment error:', error);
    onError(error);
  }, [onError]);

  return {
    createBooking,
    processPayment,
    handlePaymentSuccess,
    handlePaymentError,
  };
};
