'use client';

import React, { useState, useMemo, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Booking, BookingPhase, ValidationResult, TripDetails, CustomerInfo, PaymentInfo, QuoteData } from '@/types/booking';
import { useRouteCalculation } from '@/hooks/useRouteCalculation';
import { submitBookingRequest } from '@/providers/booking/booking-api-client';
import { BookingProviderType } from '@/providers/booking/provider-types';
import { BookingContext, useBooking } from '@/providers/booking/context';
import {
  clearAllErrorsAction,
  resetFormAction,
  submitQuickBookingFormAction,
} from '@/providers/booking/actions';
import { submitBookingFlow, submitFormFlow } from '@/providers/booking/submission';
import { useBookingPhaseValidation } from '@/providers/booking/use-phase-validation';
import { useBookingCrud } from '@/providers/booking/use-booking-crud';
import { useBookingFormState } from '@/providers/booking/use-booking-form-state';
import {
  hasAnyFormData,
  isContactInfoComplete as isContactInfoCompleteSelector,
  isQuickBookingFormValid as isQuickBookingFormValidSelector,
} from '@/providers/booking/form-selectors';

interface BookingProviderProps {
  children: ReactNode;
  existingBooking?: Booking; // For editing existing bookings
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children, existingBooking }) => {
  const router = useRouter();
  
  const [error, setError] = useState<string | null>(null);

  const {
    currentBooking,
    setCurrentBooking,
    isLoading,
    createBooking,
    updateBooking,
    getBooking,
    deleteBooking,
  } = useBookingCrud({ setError });
  
  const [currentPhase, setCurrentPhase] = useState<BookingPhase>('trip-details');
const [isSubmitting, setIsSubmitting] = useState(false);
const [success, setSuccess] = useState<string | null>(null);
const [warning, setWarning] = useState<string | null>(null);
  const [completedBookingId, setCompletedBookingId] = useState<string | null>(null);
  const [currentQuote, setCurrentQuote] = useState<QuoteData | null>(null);

  const {
    formData,
    setFormData,
    updateFormData,
    clearStoredFormData,
    resetFormData,
  } = useBookingFormState({ existingBooking });

  const {
    hasAttemptedValidation,
    setHasAttemptedValidation,
    clearApiValidation,
    clearAllApiValidation,
    validateCurrentPhase,
    validatePhaseWithApi,
    goToPhase,
    goToNextPhase,
    goToPreviousPhase,
    validateQuickBookingForm,
  } = useBookingPhaseValidation({
    currentPhase,
    setCurrentPhase,
    formData,
    currentQuote,
    setError,
  });

  // Calculate route with traffic data (for traffic-aware pricing)
  const { route, loading: routeLoading, error: routeError } = useRouteCalculation(
    formData.trip.pickup.coordinates,
    formData.trip.dropoff.coordinates,
    formData.trip.pickupDateTime
  );

  // Set full quote data (replaces setFare)
  const setQuote = useCallback((quote: QuoteData | null) => {
    setCurrentQuote(quote);
    clearApiValidation(['trip-details', 'payment', 'quick-booking']);
    // Note: fare is now managed via currentQuote only, not duplicated in formData
  }, [clearApiValidation]);

  const updateTripDetails = useCallback((data: Partial<TripDetails>) => {
    setFormData(prev => ({
      ...prev,
      trip: { ...prev.trip, ...data }
    }));

    setCurrentQuote(null);
    setError(null);
    setHasAttemptedValidation(false);
    clearApiValidation(['trip-details', 'payment', 'quick-booking']);
  }, [clearApiValidation, setFormData, setHasAttemptedValidation]);

  const updateCustomerInfo = useCallback((data: Partial<CustomerInfo>) => {
    setFormData(prev => ({
      ...prev,
      customer: { ...prev.customer, ...data }
    }));

    setError(null);
    setHasAttemptedValidation(false);
    clearApiValidation(['contact-info', 'payment']);
  }, [clearApiValidation, setFormData, setHasAttemptedValidation]);

  const updatePaymentInfo = useCallback((data: Partial<PaymentInfo>) => {
    setFormData(prev => ({
      ...prev,
      payment: { ...prev.payment, ...data }
    }));

    setError(null);
    setHasAttemptedValidation(false);
    clearApiValidation(['payment']);
  }, [clearApiValidation, setFormData, setHasAttemptedValidation]);

  // Check if quick booking form is valid (for button state)
  const isQuickBookingFormValid = (): boolean => {
    return isQuickBookingFormValidSelector(formData);
  };

  // Check if contact info is complete (for button state)
  const isContactInfoComplete = (): boolean => {
    return isContactInfoCompleteSelector(formData);
  };

  // Check if form has any data (for unsaved changes warning)
  const hasFormData = (): boolean => {
    return hasAnyFormData(formData);
  };

  // Clear all form errors
  const clearAllErrors = () => {
    clearAllErrorsAction({
      setError,
      setHasAttemptedValidation,
      setWarning,
      clearAllApiValidation,
    });
  };

  const validateForm = (): ValidationResult => {
    setHasAttemptedValidation(true);
    return validateCurrentPhase();
  };

  // Form submission
  const submitForm = async () => {
    await submitFormFlow({
      currentPhase,
      existingBookingId: existingBooking?.id,
      formData,
      validatePhaseWithApi,
      createBooking,
      updateBooking,
      setIsSubmitting,
      setError,
      setSuccess,
      setHasAttemptedValidation,
    });
  };

  // Submit booking using current quote (secure pricing)
  const submitBooking = async (exceptionCode?: string): Promise<{ success: boolean; newTotal?: number }> => {
    return submitBookingFlow({
      exceptionCode,
      formData,
      currentQuote,
      validatePhaseWithApi,
      submitBookingRequest,
      setIsSubmitting,
      setError,
      setWarning,
      setSuccess,
      setHasAttemptedValidation,
      setCompletedBookingId,
      setCurrentPhase,
    });
  };

  const completeFlightInfo = useCallback(() => {
    setSuccess('Booking submitted — confirm via email.');
    // Stay in flight-info phase but show success state
  }, []);
  

  // No need for quote validation - fare is always valid when current

  // Reset form
  const resetForm = () => {
    resetFormAction({
      resetFormData,
      setCurrentQuote,
      setCurrentPhase,
      setWarning,
      setError,
      setSuccess,
      setHasAttemptedValidation,
      clearAllApiValidation,
      clearStoredFormData,
    });
  };

  // Submit quick booking form (for hero form)
  const submitQuickBookingForm = async () => {
    await submitQuickBookingFormAction({
      setHasAttemptedValidation,
      validatePhaseWithApi: async () => validatePhaseWithApi('quick-booking'),
      router,
      setError,
    });
  };

  // Compute validation reactively
  const validation = useMemo(() => validateCurrentPhase(), [validateCurrentPhase]);

  // Subscribe to real-time booking updates
  const subscribeToBooking = (id: string) => {
    // TODO: Implement real-time subscription
    console.log(`Subscribing to booking ${id}`);
  };

  // Unsubscribe from booking updates
  const unsubscribeFromBooking = (id: string) => {
    // TODO: Implement real-time unsubscription
    console.log(`Unsubscribing from booking ${id}`);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

const clearWarning = () => {
  setWarning(null);
};

  const value: BookingProviderType = {
    // Existing booking properties
    currentBooking,
    createBooking,
    updateBooking,
    getBooking,
    deleteBooking,
    subscribeToBooking,
    unsubscribeFromBooking,
    isLoading,
    error,
    warning,
    setCurrentBooking,
    setError,
    clearError,
    clearWarning,
    
    // New form properties
    formData,
    currentPhase,
    validation,
    hasAttemptedValidation,
    setHasAttemptedValidation,
    updateFormData,
    updateTripDetails,
    updateCustomerInfo,
    updatePaymentInfo,
    goToPhase,
    goToNextPhase,
    goToPreviousPhase,
    validateForm,
    validateCurrentPhase,
    validateQuickBookingForm,
    isQuickBookingFormValid,
    isContactInfoComplete,
    hasFormData,
    clearAllErrors,
    clearStoredFormData,
    submitForm,
    submitQuickBookingForm,
    resetForm,
    isSubmitting,
    success,
    completedBookingId,
    currentQuote,
    setQuote,
    submitBooking,
    completeFlightInfo,
    route,
    routeLoading,
    routeError,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
export { useBooking };
