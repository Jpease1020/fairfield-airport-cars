'use client';

import { useState, useEffect, useCallback } from 'react';
import { Coordinates } from '@/types/booking';

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
      const response = await fetch('/api/booking/estimate-fare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: pickupLocation,
          destination: dropoffLocation,
          pickupCoords,
          dropoffCoords,
          fareType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFare(data.fare);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to calculate fare');
        setFare(null);
      }
    } catch (err) {
      console.error('Fare calculation error:', err);
      setError('Network error while calculating fare');
      setFare(null);
    } finally {
      setIsCalculating(false);
    }
  }, [pickupLocation, dropoffLocation, pickupCoords, dropoffCoords, fareType]);

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
