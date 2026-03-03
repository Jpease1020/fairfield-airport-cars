import { NextResponse } from 'next/server';
import { z } from 'zod';
import { classifyTrip } from '@/lib/services/service-area-validation';
import {
  validatePhaseRequestSchema,
  validatePhaseResponseSchema,
} from '@/lib/contracts/booking-api';
import { enforceRateLimit } from '@/lib/security/rate-limit';

const phaseSchema = z.enum(['trip-details', 'contact-info', 'payment', 'quick-booking']);

const isValidUSPhone = (phone: string): boolean => {
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length === 10) return true;
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) return true;
  return false;
};

const checkTripRules = (
  formData: z.infer<typeof validatePhaseRequestSchema>['formData'],
  errors: string[],
  fieldErrors: Record<string, string>,
  includeQuoteRequirement: boolean,
  quote?: z.infer<typeof validatePhaseRequestSchema>['quote']
) => {
  const pickupAddress = formData.trip.pickup.address.trim();
  const dropoffAddress = formData.trip.dropoff.address.trim();
  const pickupCoords = formData.trip.pickup.coordinates ?? null;
  const dropoffCoords = formData.trip.dropoff.coordinates ?? null;

  if (!pickupAddress) {
    const message = 'Pickup location is required';
    errors.push(message);
    fieldErrors['pickup-location-input'] = message;
  } else if (!pickupCoords) {
    const message = 'Please select pickup location from suggestions';
    errors.push(message);
    fieldErrors['pickup-location-input'] = message;
  }

  if (!dropoffAddress) {
    const message = 'Dropoff location is required';
    errors.push(message);
    fieldErrors['dropoff-location-input'] = message;
  } else if (!dropoffCoords) {
    const message = 'Please select dropoff location from suggestions';
    errors.push(message);
    fieldErrors['dropoff-location-input'] = message;
  }

  if (!formData.trip.pickupDateTime) {
    const message = 'Pickup date and time is required';
    errors.push(message);
    fieldErrors['pickup-datetime-input'] = message;
  } else {
    const pickupDate = new Date(formData.trip.pickupDateTime);
    const now = new Date();
    const minDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    if (Number.isNaN(pickupDate.getTime())) {
      const message = 'Invalid date/time format';
      errors.push(message);
      fieldErrors['pickup-datetime-input'] = message;
    } else if (pickupDate < minDateTime) {
      const message = 'Please book at least 24 hours in advance';
      errors.push(message);
      fieldErrors['pickup-datetime-input'] = message;
    }
  }

  if (pickupAddress && dropoffAddress && pickupCoords && dropoffCoords) {
    const tripClassification = classifyTrip(
      pickupAddress,
      dropoffAddress,
      pickupCoords,
      dropoffCoords
    );

    if (tripClassification.classification !== 'normal') {
      errors.push(tripClassification.message);
      fieldErrors['dropoff-location-input'] = tripClassification.message;
    }
  }

  if (includeQuoteRequirement) {
    if (!quote?.quoteId) {
      errors.push('Please wait for fare calculation to complete');
    } else if (quote.expiresAt) {
      const expiresAt = new Date(quote.expiresAt);
      if (!Number.isNaN(expiresAt.getTime()) && new Date() > expiresAt) {
        errors.push('Your quote has expired. Please get a new quote.');
      }
    }
  }
};

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, {
    bucket: 'api:booking:validate-phase',
    limit: 90,
    windowMs: 60_000,
  });
  if (limited) return limited;

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = validatePhaseRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          validation: {
            isValid: false,
            errors: ['Invalid validation payload'],
            warnings: [],
            fieldErrors: {},
          },
        },
        { status: 400 }
      );
    }

    const { phase, formData, quote, skipQuoteRequirement } = parsed.data;
    const errors: string[] = [];
    const warnings: string[] = [];
    const fieldErrors: Record<string, string> = {};

    if (phase === 'trip-details') {
      checkTripRules(formData, errors, fieldErrors, !skipQuoteRequirement, quote);
    }

    if (phase === 'quick-booking') {
      checkTripRules(formData, errors, fieldErrors, false, quote);
    }

    if (phase === 'contact-info') {
      if (!formData.customer.name.trim()) {
        const message = 'Name is required';
        errors.push(message);
        fieldErrors['name-input'] = message;
      }

      if (!formData.customer.email.trim()) {
        const message = 'Email is required';
        errors.push(message);
        fieldErrors['email-input'] = message;
      } else {
        const emailResult = z.string().email().safeParse(formData.customer.email.trim());
        if (!emailResult.success) {
          const message = 'Please enter a valid email address';
          errors.push(message);
          fieldErrors['email-input'] = message;
        }
      }

      if (!formData.customer.phone.trim()) {
        const message = 'Phone number is required';
        errors.push(message);
        fieldErrors['phone-input'] = message;
      } else if (!isValidUSPhone(formData.customer.phone.trim())) {
        const message = 'Please enter a valid US phone number';
        errors.push(message);
        fieldErrors['phone-input'] = message;
      }
    }

    if (phase === 'payment') {
      checkTripRules(formData, errors, fieldErrors, !skipQuoteRequirement, quote);

      if (!formData.customer.name.trim()) {
        const message = 'Name is required';
        errors.push(message);
        fieldErrors['name-input'] = message;
      }

      if (!formData.customer.email.trim()) {
        const message = 'Valid email is required';
        errors.push(message);
        fieldErrors['email-input'] = message;
      } else {
        const emailResult = z.string().email().safeParse(formData.customer.email.trim());
        if (!emailResult.success) {
          const message = 'Valid email is required';
          errors.push(message);
          fieldErrors['email-input'] = message;
        }
      }

      if (!formData.customer.phone.trim() || !isValidUSPhone(formData.customer.phone.trim())) {
        const message = 'Valid phone number is required';
        errors.push(message);
        fieldErrors['phone-input'] = message;
      }
    }

    const responseBody = validatePhaseResponseSchema.parse({
      validation: {
        isValid: errors.length === 0,
        errors,
        warnings,
        fieldErrors,
      },
    });
    return NextResponse.json(responseBody);
  } catch {
    return NextResponse.json(
      {
        validation: {
          isValid: false,
          errors: ['Failed to validate booking phase'],
          warnings: [],
          fieldErrors: {},
        },
      },
      { status: 500 }
    );
  }
}
