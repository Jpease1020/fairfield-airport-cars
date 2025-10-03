'use client';

import { useState, useEffect, useCallback } from 'react';
import { Coordinates } from '@/types/booking';
import { useBooking } from '@/providers/BookingProvider';

interface UseFareCalculationProps {
  pickupLocation: string;
  dropoffLocation: string;
  pickupCoords: Coordinates | null;
  dropoffCoords: Coordinates | null;
  fareType: 'personal' | 'business';
}

export const useFareCalculation = ({
  pickupLocation,
  dropoffLocation,
  pickupCoords,
  dropoffCoords,
  fareType
}: UseFareCalculationProps) => {
  const { setQuote } = useBooking();
  const [fare, setFare] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateFare = useCallback(async () => {
    // Only calculate if we have both locations and coordinates
    if (!pickupLocation || !dropoffLocation || !pickupCoords || !dropoffCoords) {
      setFare(null);
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const response = await fetch('/api/booking/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: pickupLocation,
          destination: dropoffLocation,
          pickupCoords,
          dropoffCoords,
          fareType,
          pickupTime: undefined,
        })
      });

      if (response.ok) {
        const data = await response.json();
        setQuote(data); // Set quote in BookingProvider
        setFare(data.total);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate quote');
        setFare(null);
      }
    } catch (err) {
      console.error('Fare calculation error:', err);
      setError('Network error while generating quote');
      setFare(null);
    } finally {
      setIsCalculating(false);
    }
  }, [pickupLocation, dropoffLocation, pickupCoords, dropoffCoords, fareType, setQuote]);

  // Auto-calculate fare when dependencies change
  useEffect(() => {
    calculateFare();
  }, [calculateFare]);

  return {
    fare,
    isCalculating,
    error
  };
};
