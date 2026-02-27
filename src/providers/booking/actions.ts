import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { BookingPhase, ValidationResult } from '@/types/booking';
import { scrollToQuickBookingValidationError } from '@/providers/booking/scroll-to-validation-error';

interface ClearAllErrorsParams {
  setError: (_value: string | null) => void;
  setHasAttemptedValidation: (_value: boolean) => void;
  setWarning: (_value: string | null) => void;
  clearAllApiValidation: () => void;
}

interface ResetFormParams {
  resetFormData: () => void;
  setCurrentQuote: (_value: null) => void;
  setCurrentPhase: (_phase: BookingPhase) => void;
  setWarning: (_value: string | null) => void;
  setError: (_value: string | null) => void;
  setSuccess: (_value: string | null) => void;
  setHasAttemptedValidation: (_value: boolean) => void;
  clearAllApiValidation: () => void;
  clearStoredFormData: () => void;
}

interface SubmitQuickBookingFormParams {
  setHasAttemptedValidation: (_value: boolean) => void;
  validatePhaseWithApi: (_phase: 'quick-booking') => Promise<ValidationResult>;
  router: AppRouterInstance;
  setError: (_value: string | null) => void;
}

export async function submitQuickBookingFormAction(params: SubmitQuickBookingFormParams): Promise<void> {
  const { setHasAttemptedValidation, validatePhaseWithApi, router, setError } = params;

  setHasAttemptedValidation(true);
  const validation = await validatePhaseWithApi('quick-booking');

  if (validation.isValid) {
    router.push('/book');
  } else {
    setError(validation.errors.join(', '));
    scrollToQuickBookingValidationError(validation);
  }
}

export function clearAllErrorsAction(params: ClearAllErrorsParams): void {
  const { setError, setHasAttemptedValidation, setWarning, clearAllApiValidation } = params;

  setError(null);
  setHasAttemptedValidation(false);
  setWarning(null);
  clearAllApiValidation();
}

export function resetFormAction(params: ResetFormParams): void {
  const {
    resetFormData,
    setCurrentQuote,
    setCurrentPhase,
    setWarning,
    setError,
    setSuccess,
    setHasAttemptedValidation,
    clearAllApiValidation,
    clearStoredFormData,
  } = params;

  resetFormData();
  setCurrentQuote(null);
  setCurrentPhase('trip-details');
  setWarning(null);
  setError(null);
  setSuccess(null);
  setHasAttemptedValidation(false);
  clearAllApiValidation();
  clearStoredFormData();
}
