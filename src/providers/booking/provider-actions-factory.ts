import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { Booking, BookingPhase, QuoteData, ValidationResult } from '@/types/booking';
import {
  clearAllErrorsAction,
  resetFormAction,
  submitQuickBookingFormAction,
} from '@/providers/booking/actions';
import { submitBookingFlow, submitFormFlow } from '@/providers/booking/submission';
import { submitBookingRequest } from '@/providers/booking/booking-api-client';

interface CreateBookingProviderActionsParams {
  router: AppRouterInstance;
  currentPhase: BookingPhase;
  existingBooking?: Booking;
  formData: any;
  currentQuote: QuoteData | null;
  validatePhaseWithApi: (_phase: 'trip-details' | 'contact-info' | 'payment' | 'quick-booking', _options?: { skipQuoteRequirement?: boolean }) => Promise<ValidationResult>;
  validateCurrentPhase: () => ValidationResult;
  createBooking: (_data: Partial<Booking>) => Promise<Booking>;
  updateBooking: (_id: string, _data: Partial<Booking>) => Promise<Booking>;
  resetFormData: () => void;
  clearStoredFormData: () => void;
  clearAllApiValidation: () => void;
  setCurrentQuote: (_value: QuoteData | null) => void;
  setCurrentPhase: (_phase: BookingPhase) => void;
  setIsSubmitting: (_value: boolean) => void;
  setError: (_value: string | null) => void;
  setWarning: (_value: string | null) => void;
  setSuccess: (_value: string | null) => void;
  setHasAttemptedValidation: (_value: boolean) => void;
  setCompletedBookingId: (_value: string | null) => void;
}

export function createBookingProviderActions(params: CreateBookingProviderActionsParams) {
  const {
    router,
    currentPhase,
    existingBooking,
    formData,
    currentQuote,
    validatePhaseWithApi,
    validateCurrentPhase,
    createBooking,
    updateBooking,
    resetFormData,
    clearStoredFormData,
    clearAllApiValidation,
    setCurrentQuote,
    setCurrentPhase,
    setIsSubmitting,
    setError,
    setWarning,
    setSuccess,
    setHasAttemptedValidation,
    setCompletedBookingId,
  } = params;

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

  const submitBooking = async (exceptionCode?: string): Promise<{ success: boolean; newTotal?: number }> =>
    submitBookingFlow({
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

  const submitQuickBookingForm = async () => {
    await submitQuickBookingFormAction({
      setHasAttemptedValidation,
      validatePhaseWithApi: async () => validatePhaseWithApi('quick-booking'),
      router,
      setError,
    });
  };

  const completeFlightInfo = () => {
    setSuccess('Booking submitted — confirm via email.');
  };

  return {
    clearAllErrors,
    validateForm,
    submitForm,
    submitBooking,
    resetForm,
    submitQuickBookingForm,
    completeFlightInfo,
  };
}
