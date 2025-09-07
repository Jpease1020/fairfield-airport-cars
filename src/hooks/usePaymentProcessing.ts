import { useState, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';

export interface PaymentData {
  amount: number;
  bookingId?: string;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  paymentMethod?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  bookingId?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface PaymentProcessingOptions {
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: string) => void;
  onProcessingStart?: () => void;
  onProcessingEnd?: () => void;
}

export interface PaymentProcessingReturn {
  isProcessing: boolean;
  error: string | null;
  success: boolean;
  processPayment: (data: PaymentData) => Promise<PaymentResult>;
  reset: () => void;
  clearError: () => void;
}

export const usePaymentProcessing = (options: PaymentProcessingOptions = {}): PaymentProcessingReturn => {
  const { onSuccess, onError, onProcessingStart, onProcessingEnd } = options;
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { handleAsync } = useErrorHandler({
    onError: (error) => {
      setError(error);
      setSuccess(false);
      if (onError) {
        onError(error);
      }
    }
  });

  const processPayment = useCallback(async (data: PaymentData): Promise<PaymentResult> => {
    setIsProcessing(true);
    setError(null);
    setSuccess(false);
    
    if (onProcessingStart) {
      onProcessingStart();
    }

    try {
      const result = await handleAsync(async () => {
        // Validate payment data
        if (!data.amount || data.amount <= 0) {
          throw new Error('Invalid payment amount');
        }

        if (!data.bookingId && !data.customerInfo) {
          throw new Error('Booking ID or customer information is required');
        }

        // Call payment API
        const response = await fetch('/api/payment/process-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Payment processing failed');
        }

        const result: PaymentResult = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Payment processing failed');
        }

        return result;
      });

      if (result) {
        setSuccess(true);
        if (onSuccess) {
          onSuccess(result);
        }
        return result;
      }

      throw new Error('Payment processing failed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMessage);
      setSuccess(false);
      
      if (onError) {
        onError(errorMessage);
      }

      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsProcessing(false);
      if (onProcessingEnd) {
        onProcessingEnd();
      }
    }
  }, [handleAsync, onSuccess, onError, onProcessingStart, onProcessingEnd]);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setError(null);
    setSuccess(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isProcessing,
    error,
    success,
    processPayment,
    reset,
    clearError
  };
};