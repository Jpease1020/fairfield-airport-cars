import { useState, useCallback } from 'react';

export interface AvailabilityCheck {
  isAvailable: boolean;
  hasConflict: boolean;
  conflictingBookings: Array<{
    bookingId: string;
    customerName: string;
    timeSlot: string;
    driverName: string;
  }>;
  suggestedTimeSlots: string[];
  availableDrivers: number;
  drivers: Array<{ driverId: string; driverName: string }>;
  message?: string;
}

export interface AvailabilityCheckResult {
  data: AvailabilityCheck | null;
  isLoading: boolean;
  error: string | null;
  checkAvailability: (payload: {
    pickupDateTime?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  }) => Promise<void>;
}

export const useBookingAvailability = (): AvailabilityCheckResult => {
  const [data, setData] = useState<AvailabilityCheck | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAvailability = useCallback(async (payload: {
    pickupDateTime?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/booking/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to check availability');
      }

      const result = await response.json();
      setData(result);
      if (!result.isAvailable) {
        setError(result.message || 'No drivers are available at that time. Please choose a different time.');
        return;
      }

      setError(null);
    } catch (err) {
      console.error('Error checking availability:', err);
      const isNetworkFailure =
        err instanceof Error &&
        (err.message.includes('Failed to fetch') ||
          err.message.includes('NetworkError') ||
          err.message.includes('offline'));

      if (isNetworkFailure) {
        setError(
          'We can’t reach our scheduling calendar right now. Your ride isn’t confirmed yet—we’ll finalize it as soon as we reconnect.'
        );
      } else {
        setError(err instanceof Error ? err.message : 'Failed to check availability');
      }
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    data,
    isLoading,
    error,
    checkAvailability
  };
};
