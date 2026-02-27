import { useCallback, useState } from 'react';
import { Booking } from '@/types/booking';
import {
  createBookingRequest,
  updateBookingRequest,
  getBookingRequest,
  deleteBookingRequest,
} from '@/providers/booking/booking-api-client';

interface UseBookingCrudParams {
  setError: (_value: string | null) => void;
}

export function useBookingCrud(params: UseBookingCrudParams) {
  const { setError } = params;

  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createBooking = useCallback(async (data: Partial<Booking>): Promise<Booking> => {
    setIsLoading(true);
    setError(null);

    try {
      const booking = await createBookingRequest(data);
      setCurrentBooking(booking);
      return booking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setError]);

  const updateBooking = useCallback(async (id: string, data: Partial<Booking>): Promise<Booking> => {
    setIsLoading(true);
    setError(null);

    try {
      const booking = await updateBookingRequest(id, data);
      setCurrentBooking(booking);
      return booking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update booking';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setError]);

  const getBooking = useCallback(async (id: string): Promise<Booking | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const booking = await getBookingRequest(id);
      if (!booking) {
        return null;
      }
      setCurrentBooking(booking);
      return booking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch booking';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setError]);

  const deleteBooking = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await deleteBookingRequest(id);
      setCurrentBooking(prev => (prev?.id === id ? null : prev));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete booking';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setError]);

  return {
    currentBooking,
    setCurrentBooking,
    isLoading,
    createBooking,
    updateBooking,
    getBooking,
    deleteBooking,
  };
}
