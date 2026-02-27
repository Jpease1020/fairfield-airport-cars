import { useCallback, useState } from 'react';
import { BookingFormData, BookingPhase, QuoteData, ValidationResult } from '@/types/booking';
import { ServerValidationPhase } from '@/providers/booking/types';
import { getLocalFallbackValidation, validatePhaseWithApiRequest } from '@/providers/booking/validation';
import { scrollToPhaseValidationError } from '@/providers/booking/scroll-to-validation-error';

interface UseBookingPhaseValidationParams {
  currentPhase: BookingPhase;
  setCurrentPhase: (_phase: BookingPhase) => void;
  formData: BookingFormData;
  currentQuote: QuoteData | null;
  setError: (_value: string | null) => void;
}

export function useBookingPhaseValidation(params: UseBookingPhaseValidationParams) {
  const { currentPhase, setCurrentPhase, formData, currentQuote, setError } = params;

  const [hasAttemptedValidation, setHasAttemptedValidation] = useState(false);
  const [apiValidationByPhase, setApiValidationByPhase] = useState<
    Partial<Record<ServerValidationPhase, ValidationResult>>
  >({});

  const clearApiValidation = useCallback((phases: ServerValidationPhase[]) => {
    setApiValidationByPhase((prev) => {
      const next = { ...prev };
      for (const phase of phases) {
        delete next[phase];
      }
      return next;
    });
  }, []);

  const clearAllApiValidation = useCallback(() => {
    setApiValidationByPhase({});
  }, []);

  const getFallbackValidation = useCallback(
    (phase: ServerValidationPhase | null): ValidationResult => {
      return getLocalFallbackValidation(phase, formData, hasAttemptedValidation);
    },
    [formData, hasAttemptedValidation]
  );

  const validateCurrentPhase = useCallback((): ValidationResult => {
    const currentPhaseKey: ServerValidationPhase | null =
      currentPhase === 'trip-details' ||
      currentPhase === 'contact-info' ||
      currentPhase === 'payment'
        ? currentPhase
        : null;

    if (hasAttemptedValidation && currentPhaseKey && apiValidationByPhase[currentPhaseKey]) {
      return apiValidationByPhase[currentPhaseKey] as ValidationResult;
    }

    return getFallbackValidation(currentPhaseKey);
  }, [hasAttemptedValidation, currentPhase, apiValidationByPhase, getFallbackValidation]);

  const validatePhaseWithApi = useCallback(
    async (
      phase: ServerValidationPhase,
      options?: { skipQuoteRequirement?: boolean }
    ): Promise<ValidationResult> => {
      const fallbackValidation = getFallbackValidation(phase);
      const validation = await validatePhaseWithApiRequest({
        phase,
        skipQuoteRequirement: options?.skipQuoteRequirement,
        formData,
        quote: currentQuote,
        fallbackValidation,
      });
      setApiValidationByPhase((prev) => ({ ...prev, [phase]: validation }));
      return validation;
    },
    [formData, currentQuote, getFallbackValidation]
  );

  const goToPhase = useCallback(
    (phase: BookingPhase) => {
      setCurrentPhase(phase);
    },
    [setCurrentPhase]
  );

  const goToNextPhase = useCallback(async () => {
    setHasAttemptedValidation(true);
    const phaseForValidation: ServerValidationPhase =
      currentPhase === 'trip-details' ||
      currentPhase === 'contact-info' ||
      currentPhase === 'payment'
        ? currentPhase
        : 'payment';
    const validation = await validatePhaseWithApi(phaseForValidation);

    if (validation.isValid) {
      const phases: BookingPhase[] = ['trip-details', 'contact-info', 'payment', 'payment-processing', 'flight-info'];
      const currentIndex = phases.indexOf(currentPhase);
      if (currentIndex < phases.length - 1) {
        setCurrentPhase(phases[currentIndex + 1]);
      }
    } else {
      setError(validation.errors.join(', '));
      scrollToPhaseValidationError(currentPhase, validation);
    }
  }, [currentPhase, setCurrentPhase, setError, validatePhaseWithApi]);

  const goToPreviousPhase = useCallback(() => {
    const phases: BookingPhase[] = ['trip-details', 'contact-info', 'payment', 'payment-processing', 'flight-info'];
    const currentIndex = phases.indexOf(currentPhase);
    if (currentIndex > 0) {
      setCurrentPhase(phases[currentIndex - 1]);
    }
  }, [currentPhase, setCurrentPhase]);

  const validateQuickBookingForm = useCallback((): ValidationResult => {
    if (hasAttemptedValidation && apiValidationByPhase['quick-booking']) {
      return apiValidationByPhase['quick-booking'] as ValidationResult;
    }

    return getFallbackValidation('quick-booking');
  }, [hasAttemptedValidation, apiValidationByPhase, getFallbackValidation]);

  return {
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
  };
}
