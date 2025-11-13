'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Coordinates, QuoteData } from '@/types/booking';
import { useBooking } from '@/providers/BookingProvider';
import { getOrCreateAnonymousSession } from '@/lib/utils/anonymous-session';

interface UseFareCalculationProps {
  pickupLocation: string;
  dropoffLocation: string;
  pickupCoords: Coordinates | null;
  dropoffCoords: Coordinates | null;
  fareType: 'personal' | 'business';
  pickupDateTime?: string; // For traffic-aware pricing
}

export const useFareCalculation = ({
  pickupLocation,
  dropoffLocation,
  pickupCoords,
  dropoffCoords,
  fareType,
  pickupDateTime
}: UseFareCalculationProps) => {
  const { setQuote: setProviderQuote } = useBooking();
  const setQuoteRef = useRef(setProviderQuote);
  setQuoteRef.current = setProviderQuote; // Keep ref updated
  
  const [fare, setFare] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);

  // Use ref to track if calculation is in progress to prevent multiple simultaneous calls
  const calculatingRef = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculateFare = useCallback(async () => {
    // Only calculate if we have both locations, coordinates, AND pickup date/time
    if (!pickupLocation || !dropoffLocation || !pickupCoords || !dropoffCoords || !pickupDateTime) {
      console.log('useFareCalculation: Missing required data', {
        pickupLocation,
        dropoffLocation,
        pickupCoords,
        dropoffCoords,
        pickupDateTime
      });
      setFare(null);
      setQuoteData(null);
      return;
    }

    // Prevent multiple simultaneous calculations
    if (calculatingRef.current) {
      return;
    }

    calculatingRef.current = true;
    setIsCalculating(true);
    setError(null);

    try {
      // Get or create anonymous session for quote storage
      const sessionId = getOrCreateAnonymousSession();
      
      // Convert datetime-local format (YYYY-MM-DDTHH:mm) to ISO string
      // pickupDateTime is guaranteed to exist due to check above
      const pickupTimeISO = new Date(pickupDateTime).toISOString();
      
      const response = await fetch('/api/booking/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: pickupLocation,
          destination: dropoffLocation,
          pickupCoords,
          dropoffCoords,
          fareType,
          pickupTime: pickupTimeISO, // Required - validated above
          sessionId, // Include session for anonymous users
        })
      });

      if (response.ok) {
        const data: QuoteData = await response.json();
        setQuoteRef.current(data); // Set FULL quote in BookingProvider
        setFare(data.fare);
        setQuoteData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate quote');
        setFare(null);
        setQuoteData(null);
      }
    } catch (err) {
      console.error('Fare calculation error:', err);
      setError('Network error while generating quote');
      setFare(null);
    } finally {
      setIsCalculating(false);
      calculatingRef.current = false;
    }
  }, [pickupLocation, dropoffLocation, pickupCoords, dropoffCoords, fareType, pickupDateTime]);

  // Smart calculation: only when we have complete data
  const shouldCalculate = useMemo(() => {
    return (
      pickupLocation.trim() !== '' &&
      dropoffLocation.trim() !== '' &&
      pickupCoords !== null &&
      dropoffCoords !== null &&
      fareType !== null
    );
  }, [pickupLocation, dropoffLocation, pickupCoords, dropoffCoords, fareType]);
  
  // Note: pickupDateTime is optional - quote API will use current time if not provided

  // Debounced calculation: wait 500ms after user stops changing inputs
  useEffect(() => {
    if (!shouldCalculate) {
      // Clear any pending calculation if data is incomplete
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      return;
    }

    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      if (!calculatingRef.current) {
        calculateFare();
      }
    }, 500); // 500ms delay

    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [shouldCalculate, calculateFare]);

  return {
    fare,
    isCalculating,
    error,
    quoteData,
    expiresAt: quoteData?.expiresAt,
    expiresInMinutes: quoteData?.expiresInMinutes
  };
};
