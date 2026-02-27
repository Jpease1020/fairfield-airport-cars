import { BookingPhase, ValidationResult } from '@/types/booking';

export function scrollToPhaseValidationError(currentPhase: BookingPhase, validation: ValidationResult): void {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  setTimeout(() => {
    if (isMobile) {
      const errorMessageId = currentPhase === 'trip-details'
        ? 'trip-details-error-message'
        : currentPhase === 'contact-info'
        ? 'contact-info-error-message'
        : currentPhase === 'payment'
        ? 'payment-validation-error-message'
        : null;

      if (errorMessageId) {
        const errorMessage = document.getElementById(errorMessageId) ||
          document.querySelector(`[data-testid="${errorMessageId}"]`);
        if (errorMessage) {
          errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }
    }

    if (validation.fieldErrors && Object.keys(validation.fieldErrors).length > 0) {
      const firstErrorFieldId = Object.keys(validation.fieldErrors)[0];
      const errorElement = document.getElementById(firstErrorFieldId) ||
        document.querySelector(`[data-testid="${firstErrorFieldId}"]`) ||
        document.querySelector(`[id="${firstErrorFieldId}"]`);

      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (errorElement instanceof HTMLInputElement || errorElement instanceof HTMLTextAreaElement) {
          errorElement.focus();
        } else {
          const input = errorElement.querySelector('input, textarea, select');
          if (input && (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) {
            input.focus();
          }
        }
      }
    }
  }, 150);
}

export function scrollToQuickBookingValidationError(validation: ValidationResult): void {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  setTimeout(() => {
    if (isMobile) {
      const errorMessage = document.getElementById('quick-book-validation-error') ||
        document.querySelector('[data-testid="quick-book-validation-error"]');
      if (errorMessage) {
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }

    const firstErrorFieldId = validation.fieldErrors ? Object.keys(validation.fieldErrors)[0] : undefined;
    if (!firstErrorFieldId) {
      return;
    }

    const fieldIdMap: Record<string, string[]> = {
      'pickup-location-input': ['pickup-location', 'quick-book-pickup-input'],
      'dropoff-location-input': ['dropoff-location', 'quick-book-dropoff-input'],
      'pickup-datetime-input': ['pickup-datetime-date', 'pickup-datetime-time', 'quick-book-datetime-input'],
    };

    const possibleIds = fieldIdMap[firstErrorFieldId] || [firstErrorFieldId];
    let errorElement: HTMLElement | null = null;

    for (const id of possibleIds) {
      errorElement = document.getElementById(id) ||
        document.querySelector(`[data-testid="${id}"]`) as HTMLElement;
      if (errorElement) break;
    }

    if (errorElement) {
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (errorElement instanceof HTMLInputElement) {
        errorElement.focus();
      } else {
        const input = errorElement.querySelector('input');
        if (input) {
          input.focus();
        }
      }
    }
  }, 150);
}
