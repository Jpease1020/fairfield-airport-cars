import { useCallback, useEffect, useState } from 'react';
import { Booking, BookingFormData } from '@/types/booking';
import { getEmptyBookingFormData, getFormDataFromExistingBooking } from '@/providers/booking/form-data';

interface UseBookingFormStateParams {
  existingBooking?: Booking;
}

export function useBookingFormState(params: UseBookingFormStateParams) {
  const { existingBooking } = params;

  const [formData, setFormData] = useState<BookingFormData>(() => getEmptyBookingFormData());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedFormData = sessionStorage.getItem('booking-form-data');

    if (storedFormData) {
      try {
        const parsedData = JSON.parse(storedFormData);
        setFormData(parsedData);
      } catch (error) {
        console.error('Failed to parse stored booking form data:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const timeoutId = setTimeout(() => {
      try {
        sessionStorage.setItem('booking-form-data', JSON.stringify(formData));
      } catch (error) {
        console.error('Failed to save booking form data to session storage:', error);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData, isInitialized]);

  useEffect(() => {
    if (existingBooking) {
      setFormData(getFormDataFromExistingBooking(existingBooking));
    }
  }, [existingBooking]);

  const updateFormData = useCallback((data: Partial<BookingFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const clearStoredFormData = useCallback(() => {
    sessionStorage.removeItem('booking-form-data');
  }, []);

  const resetFormData = useCallback(() => {
    setFormData(getEmptyBookingFormData());
  }, []);

  return {
    formData,
    setFormData,
    updateFormData,
    clearStoredFormData,
    resetFormData,
  };
}
