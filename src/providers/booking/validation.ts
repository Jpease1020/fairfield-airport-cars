import { BookingFormData, QuoteData, ValidationResult } from '@/types/booking';
import { ServerValidationPhase } from './types';

export function getLocalFallbackValidation(
  phase: ServerValidationPhase | null,
  formData: BookingFormData,
  hasAttemptedValidation: boolean
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fieldErrors: Record<string, string> = {};

  const requireTripCore = () => {
    if (!formData.trip.pickup.address.trim()) {
      const msg = 'Pickup location is required';
      errors.push(msg);
      fieldErrors['pickup-location-input'] = msg;
    } else if (formData.trip.pickup.coordinates === null) {
      const msg = 'Please select pickup location from suggestions';
      errors.push(msg);
      fieldErrors['pickup-location-input'] = msg;
    }

    if (!formData.trip.dropoff.address.trim()) {
      const msg = 'Dropoff location is required';
      errors.push(msg);
      fieldErrors['dropoff-location-input'] = msg;
    } else if (formData.trip.dropoff.coordinates === null) {
      const msg = 'Please select dropoff location from suggestions';
      errors.push(msg);
      fieldErrors['dropoff-location-input'] = msg;
    }

    if (!formData.trip.pickupDateTime) {
      const msg = 'Pickup date and time is required';
      errors.push(msg);
      fieldErrors['pickup-datetime-input'] = msg;
    }
  };

  if (phase === 'trip-details') {
    requireTripCore();
  }

  if (phase === 'quick-booking') {
    requireTripCore();
  }

  if (phase === 'contact-info') {
    if (!formData.customer.name.trim()) {
      const msg = 'Name is required';
      errors.push(msg);
      fieldErrors['name-input'] = msg;
    }
    if (!formData.customer.email.trim()) {
      const msg = 'Email is required';
      errors.push(msg);
      fieldErrors['email-input'] = msg;
    }
    if (!formData.customer.phone.trim()) {
      const msg = 'Phone number is required';
      errors.push(msg);
      fieldErrors['phone-input'] = msg;
    }
  }

  if (phase === 'payment') {
    requireTripCore();
    if (!formData.customer.name.trim()) {
      const msg = 'Name is required';
      errors.push(msg);
      fieldErrors['name-input'] = msg;
    }
    if (!formData.customer.email.trim()) {
      const msg = 'Valid email is required';
      errors.push(msg);
      fieldErrors['email-input'] = msg;
    }
    if (!formData.customer.phone.trim()) {
      const msg = 'Valid phone number is required';
      errors.push(msg);
      fieldErrors['phone-input'] = msg;
    }
  }

  return {
    isValid: errors.length === 0,
    errors: hasAttemptedValidation ? errors : [],
    warnings: hasAttemptedValidation ? warnings : [],
    fieldErrors: hasAttemptedValidation ? fieldErrors : {},
  };
}

export async function validatePhaseWithApiRequest(params: {
  phase: ServerValidationPhase;
  skipQuoteRequirement?: boolean;
  formData: BookingFormData;
  quote: QuoteData | null;
  fallbackValidation: ValidationResult;
}): Promise<ValidationResult> {
  const { phase, skipQuoteRequirement, formData, quote, fallbackValidation } = params;

  try {
    const response = await fetch('/api/booking/validate-phase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        phase,
        skipQuoteRequirement: !!skipQuoteRequirement,
        formData,
        quote: quote
          ? {
              quoteId: quote.quoteId,
              fare: quote.fare,
              expiresAt: quote.expiresAt,
            }
          : null,
      }),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.validation) {
      return fallbackValidation;
    }

    return data.validation as ValidationResult;
  } catch (_error) {
    return fallbackValidation;
  }
}
