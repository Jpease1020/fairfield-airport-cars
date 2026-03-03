import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  paymentProcessSuccessResponseSchema,
  quoteResponseSchema,
  submitBookingSuccessResponseSchema,
  validatePhaseResponseSchema,
} from '@/lib/contracts/booking-api';

vi.mock('@googlemaps/google-maps-services-js', () => ({
  Client: vi.fn().mockImplementation(() => ({
    distancematrix: vi.fn().mockResolvedValue({
      data: {
        rows: [
          {
            elements: [
              {
                status: 'OK',
                distance: { value: 16093 },
                duration: { value: 1800 },
                duration_in_traffic: { value: 2100 },
              },
            ],
          },
        ],
      },
    }),
  })),
}));

vi.mock('@/lib/business/settings-service', () => ({
  getSettings: vi.fn().mockResolvedValue({
    baseFare: 10,
    perMile: 2,
    perMinute: 1,
    airportReturnMultiplier: 1.8,
  }),
}));

vi.mock('@/lib/services/quote-service', () => ({
  createQuote: vi.fn().mockResolvedValue({ quoteId: 'quote_test_123' }),
  getQuote: vi.fn(),
  isQuoteValid: vi.fn(),
}));

vi.mock('@/lib/services/driver-scheduling-service', () => ({
  driverSchedulingService: {
    checkBookingConflicts: vi.fn().mockResolvedValue({
      hasConflict: false,
      suggestedTimeSlots: [],
    }),
  },
}));

vi.mock('@/lib/services/service-area-validation', () => ({
  classifyTrip: vi.fn().mockReturnValue({
    classification: 'normal',
    code: null,
    message: '',
  }),
  isAirportLocation: vi.fn().mockReturnValue(false),
}));

vi.mock('@/lib/utils/auth-server', () => ({
  getAuthContext: vi.fn().mockResolvedValue(null),
  requireOwnerOrAdmin: vi.fn(),
}));

vi.mock('@/lib/services/booking-orchestrator', () => ({
  BookingApiError: class extends Error {
    status = 400;
    body = { error: 'booking api error' };
  },
  submitBookingOrchestration: vi.fn().mockResolvedValue({
    success: true,
    bookingId: 'booking_123',
    totalFare: 125,
    message: 'Booking confirmed',
  }),
  createPaidBookingAndNotify: vi.fn().mockResolvedValue({
    bookingId: 'booking_456',
    emailWarning: null,
  }),
}));

vi.mock('@/lib/services/square-service', () => ({
  processPayment: vi.fn().mockResolvedValue({
    success: true,
    paymentId: 'payment_123',
    status: 'COMPLETED',
    amount: 15000,
    currency: 'USD',
    orderId: 'order_123',
  }),
}));

vi.mock('@/lib/services/booking-service', () => ({
  getBooking: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/services/booking-attempts-service', () => ({
  recordBookingAttempt: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/services/notification-service', () => ({
  sendBookingProblem: vi.fn().mockResolvedValue(undefined),
}));

let quotePost: typeof import('@/app/api/booking/quote/route').POST;
let validatePhasePost: typeof import('@/app/api/booking/validate-phase/route').POST;
let submitPost: typeof import('@/app/api/booking/submit/route').POST;
let processPaymentPost: typeof import('@/app/api/payment/process-payment/route').POST;

beforeAll(async () => {
  ({ POST: quotePost } = await import('@/app/api/booking/quote/route'));
  ({ POST: validatePhasePost } = await import('@/app/api/booking/validate-phase/route'));
  ({ POST: submitPost } = await import('@/app/api/booking/submit/route'));
  ({ POST: processPaymentPost } = await import('@/app/api/payment/process-payment/route'));
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Canonical endpoint contracts', () => {
  it('POST /api/booking/quote returns shared quote contract', async () => {
    const request = new Request('http://localhost/api/booking/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: 'Fairfield Station, Fairfield, CT',
        destination: 'JFK Airport, Queens, NY',
        pickupCoords: { lat: 41.1408, lng: -73.2613 },
        dropoffCoords: { lat: 40.6413, lng: -73.7781 },
        fareType: 'personal',
        pickupTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      }),
    });

    const response = await quotePost(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(() => quoteResponseSchema.parse(body)).not.toThrow();
  });

  it('POST /api/booking/validate-phase returns shared validation contract', async () => {
    const request = new Request('http://localhost/api/booking/validate-phase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phase: 'trip-details',
        formData: {
          trip: {
            pickup: {
              address: 'Fairfield Station, Fairfield, CT',
              coordinates: { lat: 41.1408, lng: -73.2613 },
            },
            dropoff: {
              address: 'JFK Airport, Queens, NY',
              coordinates: { lat: 40.6413, lng: -73.7781 },
            },
            pickupDateTime: new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString(),
            fareType: 'personal',
          },
          customer: {
            name: 'Jane Doe',
            email: 'jane@example.com',
            phone: '2035551234',
          },
        },
        quote: {
          quoteId: 'quote_123',
          fare: 100,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        },
      }),
    });

    const response = await validatePhasePost(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(() => validatePhaseResponseSchema.parse(body)).not.toThrow();
  });

  it('POST /api/booking/submit returns shared submit success contract', async () => {
    const request = new Request('http://localhost/api/booking/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteId: 'quote_123',
        fare: 125,
        customer: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '2035551234',
          notes: 'Front door',
        },
        trip: {
          pickup: {
            address: 'Fairfield Station, Fairfield, CT',
            coordinates: { lat: 41.1408, lng: -73.2613 },
          },
          dropoff: {
            address: 'JFK Airport, Queens, NY',
            coordinates: { lat: 40.6413, lng: -73.7781 },
          },
          pickupDateTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          fareType: 'personal',
        },
      }),
    });

    const response = await submitPost(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(() => submitBookingSuccessResponseSchema.parse(body)).not.toThrow();
  });

  it('POST /api/payment/process-payment returns shared payment success contract', async () => {
    const request = new Request('http://localhost/api/payment/process-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentToken: 'tok_123',
        amount: 15000,
        currency: 'USD',
        tipAmount: 0,
        bookingData: {
          customer: {
            email: 'jane@example.com',
            phone: '2035551234',
          },
        },
      }),
    });

    const response = await processPaymentPost(request);
    expect(response).toBeDefined();
    const body = await response!.json();

    expect(response!.status).toBe(200);
    expect(() => paymentProcessSuccessResponseSchema.parse(body)).not.toThrow();
  });
});
