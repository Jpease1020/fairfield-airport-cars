import { z } from 'zod';
import { isValidUSPhone } from '@/lib/validation/phone';

export const coordinatesSchema = z.object({
  lat: z.number().gte(-90).lte(90),
  lng: z.number().gte(-180).lte(180),
});

export const bookingPhaseSchema = z.enum([
  'trip-details',
  'contact-info',
  'payment',
  'quick-booking',
]);

export const fareTypeSchema = z.enum(['personal', 'business']);

const isoDateTimeWithOffsetSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/,
    'pickupDateTime must be an ISO datetime string with timezone offset'
  );

export const bookingTripFormSchema = z.object({
  pickup: z.object({
    address: z.string().optional().default(''),
    coordinates: coordinatesSchema.nullable().optional(),
  }),
  dropoff: z.object({
    address: z.string().optional().default(''),
    coordinates: coordinatesSchema.nullable().optional(),
  }),
  pickupDateTime: z.string().optional().default(''),
  fareType: fareTypeSchema.optional().default('personal'),
});

export const bookingCustomerFormSchema = z.object({
  name: z.string().optional().default(''),
  email: z.string().optional().default(''),
  phone: z.string().optional().default(''),
});

export const validatePhaseRequestSchema = z.object({
  phase: bookingPhaseSchema,
  skipQuoteRequirement: z.boolean().optional().default(false),
  formData: z.object({
    trip: bookingTripFormSchema,
    customer: bookingCustomerFormSchema,
  }),
  quote: z
    .object({
      quoteId: z.string().optional(),
      fare: z.number().optional(),
      expiresAt: z.string().optional(),
    })
    .nullable()
    .optional(),
});

export const validatePhaseResponseSchema = z.object({
  validation: z.object({
    isValid: z.boolean(),
    errors: z.array(z.string()),
    warnings: z.array(z.string()),
    fieldErrors: z.record(z.string(), z.string()),
  }),
});

export const quoteRequestSchema = z.object({
  origin: z.string().min(3).max(256),
  destination: z.string().min(3).max(256),
  pickupCoords: coordinatesSchema.nullable().optional(),
  dropoffCoords: coordinatesSchema.nullable().optional(),
  fareType: fareTypeSchema.default('business'),
  pickupTime: z.string().datetime().nullable().optional(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
});

export const quoteResponseSchema = z.object({
  quoteId: z.string().optional(),
  fare: z.number(),
  distanceMiles: z.number(),
  durationMinutes: z.number(),
  fareType: fareTypeSchema,
  expiresAt: z.string(),
  expiresInMinutes: z.number(),
  availabilityWarning: z.string().nullable().optional(),
  suggestedTimes: z.array(z.string()).optional(),
});

export const submitBookingRequestSchema = z.object({
  quoteId: z.string().optional(),
  fare: z.number().min(1),
  exceptionCode: z.string().optional(),
  customer: z.object({
    name: z.string().trim().min(1),
    email: z.string().trim().email(),
    phone: z.string().trim().refine(isValidUSPhone, { message: 'Please enter a valid US phone number' }),
    notes: z.string().optional().nullable(),
    smsOptIn: z.boolean().optional().default(false),
  }),
  trip: z.object({
    pickup: z.object({
      address: z.string().min(1),
      coordinates: coordinatesSchema.nullable(),
    }),
    dropoff: z.object({
      address: z.string().min(1),
      coordinates: coordinatesSchema.nullable(),
    }),
    pickupDateTime: isoDateTimeWithOffsetSchema.transform((value, ctx) => {
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'pickupDateTime must be a valid ISO datetime string with timezone offset',
        });
        return z.NEVER;
      }
      return parsed;
    }),
    fareType: fareTypeSchema,
    flightInfo: z
      .object({
        hasFlight: z.boolean(),
        airline: z.string(),
        flightNumber: z.string(),
        arrivalTime: z.string(),
        terminal: z.string(),
      })
      // Flight info is explicitly optional in the booking flow (see FlightInfoPhase's copy), so
      // this doesn't reject an incomplete submission — but hasFlight:true with every detail
      // field blank is a distinct, meaningless state that used to reach the driver-notification
      // email as "Airline: N/A / Flight#: N/A / Time: N/A" instead of the plain "no flight info"
      // case. Normalize it back to false rather than storing a misleading "yes, but nothing"
      // record. Mirrors the same normalization in PUT /api/booking/[bookingId].
      .transform((flightInfo) => {
        if (
          flightInfo.hasFlight &&
          !flightInfo.airline.trim() &&
          !flightInfo.flightNumber.trim() &&
          !flightInfo.arrivalTime.trim()
        ) {
          return { ...flightInfo, hasFlight: false };
        }
        return flightInfo;
      })
      .optional(),
  }),
});

export const submitBookingSuccessResponseSchema = z.object({
  success: z.literal(true),
  bookingId: z.string(),
  trackingToken: z.string().optional(),
  totalFare: z.number(),
  message: z.string(),
  emailWarning: z.string().nullable().optional(),
});

export const paymentProcessRequestSchema = z.object({
  paymentToken: z.string().min(1),
  amount: z.number(),
  // The business's Square account only settles in USD — accepting any other currency string
  // would either fail confusingly deep inside the Square API call or, worse, succeed against
  // the wrong merchant settlement currency. Restrict to what's actually supported.
  currency: z.literal('USD'),
  bookingData: z.record(z.string(), z.unknown()).optional(),
  existingBookingId: z.string().optional(),
  tipAmount: z.number().optional().default(0),
});

export const paymentProcessSuccessResponseSchema = z.object({
  success: z.literal(true),
  bookingId: z.string().optional(),
  paymentId: z.string().optional(),
  status: z.string().optional(),
  amount: z.number().optional(),
  currency: z.string().optional(),
  emailWarning: z.string().nullable().optional(),
});

export type ValidatePhaseRequest = z.infer<typeof validatePhaseRequestSchema>;
export type ValidatePhaseResponse = z.infer<typeof validatePhaseResponseSchema>;
export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
export type QuoteResponse = z.infer<typeof quoteResponseSchema>;
export type SubmitBookingRequest = z.infer<typeof submitBookingRequestSchema>;
export type SubmitBookingSuccessResponse = z.infer<typeof submitBookingSuccessResponseSchema>;
export type PaymentProcessRequest = z.infer<typeof paymentProcessRequestSchema>;
export type PaymentProcessSuccessResponse = z.infer<typeof paymentProcessSuccessResponseSchema>;
