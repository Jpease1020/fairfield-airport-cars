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
  completedBookingId: string | null;
  completedTrackingToken: string | null;
  validatePhaseWithApi: (_phase: 'trip-details' | 'contact-info' | 'payment' | 'quick-booking', _options?: { skipQuoteRequirement?: boolean }) => Promise<ValidationResult>;
  validateCurrentPhase: () => ValidationResult;
  createBooking: (_data: Partial<Booking>) => Promise<Booking>;
  updateBooking: (_id: string, _data: Partial<Booking>, _trackingToken?: string) => Promise<Booking>;
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
  setCompletedTrackingToken: (_value: string | null) => void;
}

export function createBookingProviderActions(params: CreateBookingProviderActionsParams) {
  const {
    router,
    currentPhase,
    existingBooking,
    formData,
    currentQuote,
    completedBookingId,
    completedTrackingToken,
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
    setCompletedTrackingToken,
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
      setCompletedTrackingToken,
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

  const completeFlightInfo = async () => {
    if (!completedBookingId) {
      setError('Could not save flight info — booking ID is missing. Please text us your flight number at (203) 990-1815.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateBooking(
        completedBookingId,
        { flightInfo: formData.trip.flightInfo } as Partial<Booking>,
        completedTrackingToken ?? undefined
      );
      setError(null);
      setSuccess('Booking submitted — confirm via email.');
    } catch {
      setError('We could not save your flight info. Please text us your flight number at (203) 990-1815.');
    } finally {
      setIsSubmitting(false);
    }
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
