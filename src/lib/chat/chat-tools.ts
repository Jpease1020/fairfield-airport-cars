import { BUSINESS_CONTACT } from '@/utils/constants';
import type {
  Coordinates,
  DraftCustomer,
  DraftLocation,
  FareType,
  ToolDefinition,
} from '@/lib/chat/chat-types';

export interface ToolExecutionContext {
  origin: string;
  fetchImpl?: typeof fetch;
}

interface AddressCandidate {
  address: string;
  coordinates: Coordinates;
  placeId?: string;
}

export interface ResolveAddressResult {
  resolved: boolean;
  candidate?: AddressCandidate;
}

export interface CheckAvailabilityResult {
  isAvailable: boolean;
  message: string;
  suggestedTimes: string[];
}

export interface GetQuoteInput {
  origin: string;
  destination: string;
  pickupCoords: Coordinates;
  dropoffCoords: Coordinates;
  pickupTime: string;
  fareType?: FareType;
}

export interface GetQuoteResult {
  success: boolean;
  quoteId?: string;
  fare?: number;
  distanceMiles?: number;
  durationMinutes?: number;
  expiresAt?: string;
  availabilityWarning?: string | null;
  suggestedTimes?: string[];
  errorCode?: string;
  errorMessage?: string;
}

interface ValidatePhaseResponse {
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    fieldErrors: Record<string, string>;
  };
}

export interface ValidateResult {
  valid: boolean;
  errors: string[];
  fieldErrors: Record<string, string>;
}

export interface CreateBookingInput {
  quoteId: string;
  fare: number;
  customer: DraftCustomer;
  trip: {
    pickup: DraftLocation;
    dropoff: DraftLocation;
    pickupDateTime: string;
    fareType: FareType;
  };
  quoteExpiresAt?: string;
}

export interface CreateBookingResult {
  success: boolean;
  bookingId?: string;
  totalFare?: number;
  errorMessage?: string;
  details?: unknown;
}

export interface HandoffResult {
  handoff: true;
  reason: string;
  phone: string;
}

const TOOL_DEFINITION_VERSION = 'v1';

export const CHAT_TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'resolve_address',
    description:
      'Resolve a freeform user address into a canonical address with coordinates before quoting or booking.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', minLength: 3 },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    name: 'check_availability',
    description:
      'Check whether the requested pickup time is currently available and return suggested alternatives if needed.',
    inputSchema: {
      type: 'object',
      properties: {
        pickupDateTime: { type: 'string', description: 'ISO datetime string' },
      },
      required: ['pickupDateTime'],
      additionalProperties: false,
    },
  },
  {
    name: 'get_quote',
    description:
      'Get a fare quote for canonical pickup/dropoff locations and a confirmed pickup datetime.',
    inputSchema: {
      type: 'object',
      properties: {
        origin: { type: 'string' },
        destination: { type: 'string' },
        pickupCoords: {
          type: 'object',
          properties: { lat: { type: 'number' }, lng: { type: 'number' } },
          required: ['lat', 'lng'],
          additionalProperties: false,
        },
        dropoffCoords: {
          type: 'object',
          properties: { lat: { type: 'number' }, lng: { type: 'number' } },
          required: ['lat', 'lng'],
          additionalProperties: false,
        },
        pickupTime: { type: 'string' },
        fareType: { type: 'string', enum: ['personal', 'business'] },
      },
      required: ['origin', 'destination', 'pickupCoords', 'dropoffCoords', 'pickupTime'],
      additionalProperties: false,
    },
  },
  {
    name: 'validate_trip_details',
    description:
      'Validate trip details against booking rules including service area, airport endpoint and minimum lead time.',
    inputSchema: {
      type: 'object',
      properties: {
        trip: {
          type: 'object',
          properties: {
            pickup: {
              type: 'object',
              properties: {
                address: { type: 'string' },
                coordinates: {
                  type: 'object',
                  properties: { lat: { type: 'number' }, lng: { type: 'number' } },
                  required: ['lat', 'lng'],
                  additionalProperties: false,
                },
              },
              required: ['address', 'coordinates'],
              additionalProperties: false,
            },
            dropoff: {
              type: 'object',
              properties: {
                address: { type: 'string' },
                coordinates: {
                  type: 'object',
                  properties: { lat: { type: 'number' }, lng: { type: 'number' } },
                  required: ['lat', 'lng'],
                  additionalProperties: false,
                },
              },
              required: ['address', 'coordinates'],
              additionalProperties: false,
            },
            pickupDateTime: { type: 'string' },
            fareType: { type: 'string', enum: ['personal', 'business'] },
          },
          required: ['pickup', 'dropoff', 'pickupDateTime', 'fareType'],
          additionalProperties: false,
        },
      },
      required: ['trip'],
      additionalProperties: false,
    },
  },
  {
    name: 'validate_contact_info',
    description: 'Validate customer contact details before booking confirmation.',
    inputSchema: {
      type: 'object',
      properties: {
        customer: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
          },
          required: ['name', 'email', 'phone'],
          additionalProperties: false,
        },
      },
      required: ['customer'],
      additionalProperties: false,
    },
  },
  {
    name: 'handoff_to_human',
    description: 'Use this when policy prevents booking or confidence is low; provide direct support handoff.',
    inputSchema: {
      type: 'object',
      properties: {
        reason: { type: 'string' },
      },
      required: ['reason'],
      additionalProperties: false,
    },
  },
];

function getFetch(context: ToolExecutionContext): typeof fetch {
  return context.fetchImpl ?? fetch;
}

async function postJson<T>(context: ToolExecutionContext, path: string, body: unknown): Promise<{ ok: boolean; status: number; data: T }> {
  const executeFetch = getFetch(context);
  const url = new URL(path, context.origin).toString();
  const response = await executeFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as T;
  return { ok: response.ok, status: response.status, data };
}

export async function resolveAddress(context: ToolExecutionContext, query: string): Promise<ResolveAddressResult> {
  const result = await postJson<{ candidates?: AddressCandidate[] }>(context, '/api/places/autocomplete', { query });
  const candidate = result.data?.candidates?.[0];
  if (!candidate) {
    return { resolved: false };
  }

  return {
    resolved: true,
    candidate,
  };
}

export async function checkAvailability(context: ToolExecutionContext, pickupDateTime: string): Promise<CheckAvailabilityResult> {
  const result = await postJson<{
    isAvailable?: boolean;
    message?: string;
    suggestedTimeSlots?: string[];
  }>(context, '/api/booking/check-availability', { pickupDateTime });

  if (!result.ok) {
    return {
      isAvailable: false,
      message: 'Unable to verify availability right now. Please try again or contact support.',
      suggestedTimes: [],
    };
  }

  return {
    isAvailable: !!result.data.isAvailable,
    message: result.data.message ?? 'Availability checked.',
    suggestedTimes: result.data.suggestedTimeSlots ?? [],
  };
}

export async function getQuote(context: ToolExecutionContext, input: GetQuoteInput): Promise<GetQuoteResult> {
  const result = await postJson<{
    quoteId?: string;
    fare?: number;
    distanceMiles?: number;
    durationMinutes?: number;
    expiresAt?: string;
    availabilityWarning?: string | null;
    suggestedTimes?: string[];
    error?: string;
    code?: string;
  }>(context, '/api/booking/quote', {
    origin: input.origin,
    destination: input.destination,
    pickupCoords: input.pickupCoords,
    dropoffCoords: input.dropoffCoords,
    pickupTime: input.pickupTime,
    fareType: input.fareType ?? 'personal',
  });

  if (!result.ok) {
    return {
      success: false,
      errorCode: result.data.code,
      errorMessage: result.data.error ?? 'Unable to quote this trip right now.',
    };
  }

  if (!result.data.quoteId || typeof result.data.fare !== 'number') {
    return {
      success: false,
      errorCode: 'QUOTE_UNAVAILABLE',
      errorMessage: 'Quote is unavailable. Please try again.',
    };
  }

  return {
    success: true,
    quoteId: result.data.quoteId,
    fare: result.data.fare,
    distanceMiles: result.data.distanceMiles,
    durationMinutes: result.data.durationMinutes,
    expiresAt: result.data.expiresAt,
    availabilityWarning: result.data.availabilityWarning ?? null,
    suggestedTimes: result.data.suggestedTimes ?? [],
  };
}

function mapValidationResponse(payload: ValidatePhaseResponse): ValidateResult {
  return {
    valid: !!payload.validation?.isValid,
    errors: payload.validation?.errors ?? [],
    fieldErrors: payload.validation?.fieldErrors ?? {},
  };
}

export async function validateTripDetails(
  context: ToolExecutionContext,
  input: {
    trip: {
      pickup: DraftLocation;
      dropoff: DraftLocation;
      pickupDateTime: string;
      fareType?: FareType;
    };
  }
): Promise<ValidateResult> {
  const result = await postJson<ValidatePhaseResponse>(context, '/api/booking/validate-phase', {
    phase: 'trip-details',
    skipQuoteRequirement: true,
    formData: {
      trip: {
        pickup: input.trip.pickup,
        dropoff: input.trip.dropoff,
        pickupDateTime: input.trip.pickupDateTime,
        fareType: input.trip.fareType ?? 'personal',
      },
      customer: {
        name: '',
        email: '',
        phone: '',
      },
    },
  });

  if (!result.ok) {
    return {
      valid: false,
      errors: ['Unable to validate trip details. Please try again.'],
      fieldErrors: {},
    };
  }

  return mapValidationResponse(result.data);
}

export async function validateContactInfo(
  context: ToolExecutionContext,
  input: {
    customer: DraftCustomer;
  }
): Promise<ValidateResult> {
  const result = await postJson<ValidatePhaseResponse>(context, '/api/booking/validate-phase', {
    phase: 'contact-info',
    formData: {
      trip: {
        pickup: { address: '', coordinates: null },
        dropoff: { address: '', coordinates: null },
        pickupDateTime: '',
        fareType: 'personal',
      },
      customer: {
        name: input.customer.name,
        email: input.customer.email,
        phone: input.customer.phone,
      },
    },
  });

  if (!result.ok) {
    return {
      valid: false,
      errors: ['Unable to validate contact information. Please try again.'],
      fieldErrors: {},
    };
  }

  return mapValidationResponse(result.data);
}

export async function createBooking(context: ToolExecutionContext, input: CreateBookingInput): Promise<CreateBookingResult> {
  const validation = await postJson<ValidatePhaseResponse>(context, '/api/booking/validate-phase', {
    phase: 'payment',
    skipQuoteRequirement: false,
    formData: {
      trip: {
        pickup: input.trip.pickup,
        dropoff: input.trip.dropoff,
        pickupDateTime: input.trip.pickupDateTime,
        fareType: input.trip.fareType,
      },
      customer: {
        name: input.customer.name,
        email: input.customer.email,
        phone: input.customer.phone,
      },
    },
    quote: {
      quoteId: input.quoteId,
      fare: input.fare,
      expiresAt: input.quoteExpiresAt,
    },
  });

  const validationResult = mapValidationResponse(validation.data);
  if (!validation.ok || !validationResult.valid) {
    return {
      success: false,
      errorMessage: validationResult.errors.join(' ') || 'Booking details are not valid.',
      details: validationResult,
    };
  }

  const submit = await postJson<{
    success?: boolean;
    bookingId?: string;
    totalFare?: number;
    error?: string;
    details?: unknown;
  }>(context, '/api/booking/submit', {
    quoteId: input.quoteId,
    fare: input.fare,
    customer: {
      name: input.customer.name,
      email: input.customer.email,
      phone: input.customer.phone,
      smsOptIn: !!input.customer.smsOptIn,
    },
    trip: {
      pickup: input.trip.pickup,
      dropoff: input.trip.dropoff,
      pickupDateTime: input.trip.pickupDateTime,
      fareType: input.trip.fareType,
    },
  });

  if (!submit.ok || !submit.data.success || !submit.data.bookingId) {
    return {
      success: false,
      errorMessage: submit.data.error ?? 'Booking failed. Please try again.',
      details: submit.data.details,
    };
  }

  return {
    success: true,
    bookingId: submit.data.bookingId,
    totalFare: submit.data.totalFare,
  };
}

export async function handoffToHuman(_context: ToolExecutionContext, reason: string): Promise<HandoffResult> {
  return {
    handoff: true,
    reason,
    phone: BUSINESS_CONTACT.phone,
  };
}

export function getChatToolVersion(): string {
  return TOOL_DEFINITION_VERSION;
}
