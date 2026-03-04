import { z } from 'zod';

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
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
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
    pickupDateTime: z.string().transform((value, ctx) => {
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'pickupDateTime must be a valid ISO datetime string',
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
      .optional(),
  }),
});

export const submitBookingSuccessResponseSchema = z.object({
  success: z.literal(true),
  bookingId: z.string(),
  totalFare: z.number(),
  message: z.string(),
  emailWarning: z.string().nullable().optional(),
});

export const paymentProcessRequestSchema = z.object({
  paymentToken: z.string().min(1),
  amount: z.number(),
  currency: z.string().min(1),
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
