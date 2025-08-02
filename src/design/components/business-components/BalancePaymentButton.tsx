'use client';

import React, { useState } from 'react';
import { Button, LoadingSpinner, useToast } from '@/ui';

interface BalancePaymentButtonProps {
  bookingId: string;
  balanceDue: number;
  onPaymentComplete?: () => void;
  disabled?: boolean;
}

export function BalancePaymentButton({ 
  bookingId, 
  balanceDue, 
  onPaymentComplete,
  disabled = false 
}: BalancePaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleBalancePayment = async () => {
    if (balanceDue <= 0) {
      addToast('info', 'No balance due for this booking');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/payment/create-balance-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          currency: 'USD',
          description: `Balance Payment - Booking ${bookingId}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create balance payment');
      }

      const data = await response.json();
      
      // Redirect to payment page
      if (typeof window !== 'undefined') {
        window.location.href = data.paymentLinkUrl;
      }
    } catch (error) {
      // Error creating balance payment
      addToast('error', 'Failed to create balance payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleBalancePayment}
      disabled={disabled || isLoading || balanceDue <= 0}
      variant="primary"
      size="sm"
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" />
          Processing...
        </>
      ) : (
        `Pay Balance $${balanceDue.toFixed(2)}`
      )}
    </Button>
  );
} 