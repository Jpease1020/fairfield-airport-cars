import { Booking, BookingFormData, BookingPhase, QuoteData, ValidationResult } from '@/types/booking';
import { normalizePickupDateTimeForApi } from '@/lib/utils/pickup-datetime';

interface SubmitFormParams {
  currentPhase: BookingPhase;
  existingBookingId?: string;
  formData: BookingFormData;
  validatePhaseWithApi: (_phase: 'trip-details' | 'contact-info' | 'payment' | 'quick-booking', _options?: { skipQuoteRequirement?: boolean }) => Promise<ValidationResult>;
  createBooking: (_data: Partial<Booking>) => Promise<Booking>;
  updateBooking: (_id: string, _data: Partial<Booking>) => Promise<Booking>;
  setIsSubmitting: (_value: boolean) => void;
  setError: (_value: string | null) => void;
  setSuccess: (_value: string | null) => void;
  setHasAttemptedValidation: (_value: boolean) => void;
}

interface SubmitBookingParams {
  exceptionCode?: string;
  formData: BookingFormData;
  currentQuote: QuoteData | null;
  validatePhaseWithApi: (_phase: 'trip-details' | 'contact-info' | 'payment' | 'quick-booking', _options?: { skipQuoteRequirement?: boolean }) => Promise<ValidationResult>;
  submitBookingRequest: (_requestBody: Record<string, unknown>) => Promise<globalThis.Response>;
  setIsSubmitting: (_value: boolean) => void;
  setError: (_value: string | null) => void;
  setWarning: (_value: string | null) => void;
  setSuccess: (_value: string | null) => void;
  setHasAttemptedValidation: (_value: boolean) => void;
  setCompletedBookingId: (_value: string | null) => void;
  setCurrentPhase: (_phase: BookingPhase) => void;
}

export async function submitFormFlow(params: SubmitFormParams): Promise<void> {
  const {
    currentPhase,
    existingBookingId,
    formData,
    validatePhaseWithApi,
    createBooking,
    updateBooking,
    setIsSubmitting,
    setError,
    setSuccess,
    setHasAttemptedValidation,
  } = params;

  setIsSubmitting(true);
  setError(null);
  setSuccess(null);

  try {
    setHasAttemptedValidation(true);
    const phaseForValidation =
      currentPhase === 'trip-details' ||
      currentPhase === 'contact-info' ||
      currentPhase === 'payment'
        ? currentPhase
        : 'payment';

    const validation = await validatePhaseWithApi(phaseForValidation);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    if (existingBookingId) {
      await updateBooking(existingBookingId, formData);
      setSuccess('Booking updated successfully!');
    } else {
      await createBooking(formData);
      setSuccess('Booking created successfully!');
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to submit booking';
    setError(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
}

export async function submitBookingFlow(params: SubmitBookingParams): Promise<{ success: boolean; newTotal?: number }> {
  const {
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
  } = params;

  setIsSubmitting(true);
  setError(null);
  setWarning(null);
  setSuccess(null);

  setHasAttemptedValidation(true);
  const phaseValidation = await validatePhaseWithApi('payment', {
    skipQuoteRequirement: !!exceptionCode,
  });
  if (!phaseValidation.isValid) {
    setIsSubmitting(false);
    setError(phaseValidation.errors.join(', '));
    return { success: false };
  }

  let pickupDateTime: string;
  try {
    pickupDateTime = normalizePickupDateTimeForApi(formData.trip.pickupDateTime);
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : 'Please enter a valid pickup date and time.';
    setIsSubmitting(false);
    setError(message);
    return { success: false };
  }

  try {
    const requestBody: Record<string, unknown> = {
      customer: formData.customer,
      trip: {
        ...formData.trip,
        pickupDateTime,
      },
    };

    if (exceptionCode) {
      requestBody.exceptionCode = exceptionCode;
      requestBody.fare = formData.trip.fare || currentQuote?.fare || 0;
    } else {
      if (!currentQuote) {
        setIsSubmitting(false);
        setError('Please get a quote before submitting booking.');
        return { success: false };
      }
      requestBody.quoteId = currentQuote.quoteId;
      requestBody.fare = currentQuote.fare;
    }

    const res = await submitBookingRequest(requestBody);

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: 'Failed to submit booking' }));

      if (data.code === 'TIME_SLOT_CONFLICT') {
        const suggestedTimesText = Array.isArray(data.suggestedTimes)
          ? data.suggestedTimes.join(', ')
          : '';
        const conflictMessage = suggestedTimesText
          ? `⚠️ This time slot is already booked. Suggested available times: ${suggestedTimesText}. Please go back and select a different time.`
          : '⚠️ This time slot is already booked. Please go back and select a different time.';

        setError(conflictMessage);
        setIsSubmitting(false);
        return { success: false };
      }

      const errorMsg = data.error || data.details || 'Failed to submit booking';
      setError(errorMsg);
      setIsSubmitting(false);
      return { success: false };
    }

    const responseData = await res.json();
    setCompletedBookingId(responseData.bookingId || null);
    if (responseData.emailWarning) {
      setWarning(responseData.emailWarning);
    }
    setCurrentPhase('flight-info');
    return { success: true };
  } catch (_e) {
    const offlineMessage =
      'We can\'t confirm your booking right now because we\'re offline. Please check your connection and try again—your details are still in the form.';
    const connectivityMessage =
      'We couldn\'t reach our scheduling system, so your booking is not yet confirmed. Please try again shortly or text us so we can lock in your ride.';

    if (typeof navigator !== 'undefined' && navigator?.onLine === false) {
      setError(offlineMessage);
    } else {
      setError(connectivityMessage);
    }
    return { success: false };
  } finally {
    setIsSubmitting(false);
  }
}
