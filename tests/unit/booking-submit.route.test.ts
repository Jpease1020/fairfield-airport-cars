import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/services/quote-service', () => ({
  getQuote: vi.fn(),
  isQuoteValid: vi.fn(),
}));

vi.mock('@/lib/utils/firebase-admin', () => ({
  getAdminDb: vi.fn(),
}));

vi.mock('@/lib/services/booking-service', () => ({
  createBookingAtomic: vi.fn(),
  getBooking: vi.fn(),
}));

vi.mock('@/lib/services/email-service', () => ({
  sendBookingVerificationEmail: vi.fn(),
  sendDriverNotificationEmail: vi.fn(),
}));

vi.mock('@/lib/services/booking-attempts-service', () => ({
  recordBookingAttempt: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/services/driver-notification-service', () => ({
  notifyDriverOfNewBooking: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/services/admin-notification-service', () => ({
  sendAdminSms: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/services/service-area-validation', () => ({
  classifyTrip: vi.fn().mockReturnValue({
    classification: 'normal',
    code: null,
    message: '',
  }),
}));

vi.mock('@/lib/utils/auth-server', () => ({
  getAuthContext: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/services/notification-service', () => ({
  sendBookingProblem: vi.fn().mockResolvedValue(undefined),
}));

import * as quoteService from '@/lib/services/quote-service';
import * as bookingService from '@/lib/services/booking-service';
import * as firebaseAdmin from '@/lib/utils/firebase-admin';
import { sendAdminSms } from '@/lib/services/admin-notification-service';

let POST: typeof import('@/app/api/booking/submit/route').POST;

beforeAll(async () => {
  ({ POST } = await import('@/app/api/booking/submit/route'));
});

const buildRequest = (body: Record<string, unknown>) =>
  new Request('http://localhost/api/booking/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const basePayload = {
  fare: 120,
  customer: {
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '2035551234',
    notes: '',
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
    pickupDateTime: '2027-03-01T10:00:00.000Z',
    fareType: 'personal' as const,
    flightInfo: {
      hasFlight: false,
      airline: '',
      flightNumber: '',
      arrivalTime: '',
      terminal: '',
    },
  },
};

describe('POST /api/booking/submit', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(firebaseAdmin.getAdminDb).mockReturnValue({} as any);
    vi.mocked(quoteService.isQuoteValid).mockReturnValue(true);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('returns QUOTE_REQUIRED for non-exception bookings without quoteId', async () => {
    const response = await POST(buildRequest(basePayload));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe('QUOTE_REQUIRED');
    expect(payload.error).toContain('Quote is required');
  });

  it('returns structured TIME_SLOT_CONFLICT with suggestedTimes', async () => {
    vi.mocked(quoteService.getQuote).mockResolvedValue({
      pickupAddress: basePayload.trip.pickup.address,
      dropoffAddress: basePayload.trip.dropoff.address,
      pickupDateTime: basePayload.trip.pickupDateTime,
      fareType: basePayload.trip.fareType,
      price: basePayload.fare,
    } as any);

    vi.mocked(bookingService.createBookingAtomic).mockRejectedValue(
      new Error('Time slot conflicts with existing bookings. Suggested times: 05:15-07:15, 08:00-10:00')
    );

    const response = await POST(
      buildRequest({
        ...basePayload,
        quoteId: 'quote_123',
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.code).toBe('TIME_SLOT_CONFLICT');
    expect(payload.error).toContain('time slot');
    expect(payload.suggestedTimes).toEqual(['05:15-07:15', '08:00-10:00']);
  });

  it('returns QUOTE_NOT_FOUND when quoteId does not exist', async () => {
    vi.mocked(quoteService.getQuote).mockResolvedValue(null as any);

    const response = await POST(
      buildRequest({
        ...basePayload,
        quoteId: 'quote_missing',
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.code).toBe('QUOTE_NOT_FOUND');
  });

  it('returns QUOTE_EXPIRED when quote is no longer valid', async () => {
    vi.mocked(quoteService.getQuote).mockResolvedValue({
      pickupAddress: basePayload.trip.pickup.address,
      dropoffAddress: basePayload.trip.dropoff.address,
      pickupDateTime: basePayload.trip.pickupDateTime,
      fareType: basePayload.trip.fareType,
      price: basePayload.fare,
    } as any);
    vi.mocked(quoteService.isQuoteValid).mockReturnValue(false);

    const response = await POST(
      buildRequest({
        ...basePayload,
        quoteId: 'quote_expired',
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(410);
    expect(payload.code).toBe('QUOTE_EXPIRED');
  });

  it('returns ROUTE_CHANGED when trip details differ from quote details', async () => {
    vi.mocked(quoteService.getQuote).mockResolvedValue({
      pickupAddress: basePayload.trip.pickup.address,
      dropoffAddress: basePayload.trip.dropoff.address,
      pickupDateTime: '2027-03-02T10:00:00.000Z',
      fareType: basePayload.trip.fareType,
      price: basePayload.fare,
    } as any);

    const response = await POST(
      buildRequest({
        ...basePayload,
        quoteId: 'quote_route_changed',
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.code).toBe('ROUTE_CHANGED');
  });

  it('returns FARE_MISMATCH when submitted fare does not match quote fare tolerance', async () => {
    vi.mocked(quoteService.getQuote).mockResolvedValue({
      pickupAddress: basePayload.trip.pickup.address,
      dropoffAddress: basePayload.trip.dropoff.address,
      pickupDateTime: basePayload.trip.pickupDateTime,
      fareType: basePayload.trip.fareType,
      price: 200,
    } as any);

    const response = await POST(
      buildRequest({
        ...basePayload,
        quoteId: 'quote_fare_mismatch',
        fare: 120,
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.code).toBe('FARE_MISMATCH');
    expect(payload.expectedFare).toBe(200);
    expect(payload.providedFare).toBe(120);
  });

  it('sends admin SMS with business-timezone formatted pickup time', async () => {
    vi.mocked(quoteService.getQuote).mockResolvedValue({
      pickupAddress: basePayload.trip.pickup.address,
      dropoffAddress: basePayload.trip.dropoff.address,
      pickupDateTime: '2026-03-02T13:00:00.000Z',
      fareType: basePayload.trip.fareType,
      price: 120,
    } as any);

    vi.mocked(bookingService.createBookingAtomic).mockResolvedValue({
      bookingId: 'booking_123',
    } as any);

    vi.mocked(bookingService.getBooking).mockResolvedValue({
      id: 'booking_123',
      confirmation: { token: 'tok_123' },
      customer: { email: basePayload.customer.email },
      trip: {
        pickup: { address: basePayload.trip.pickup.address },
        dropoff: { address: basePayload.trip.dropoff.address },
        pickupDateTime: '2026-03-02T13:00:00.000Z',
      },
      payment: { totalAmount: 120 },
      status: 'pending',
    } as any);

    const response = await POST(
      buildRequest({
        ...basePayload,
        quoteId: 'quote_123',
        trip: {
          ...basePayload.trip,
          pickupDateTime: '2026-03-02T13:00:00.000Z',
        },
      })
    );

    expect(response.status).toBe(200);
    expect(sendAdminSms).toHaveBeenCalledWith(expect.stringContaining('3/2/2026, 8:00 AM'));
    expect(bookingService.createBookingAtomic).toHaveBeenCalledWith(
      expect.objectContaining({
        bookingTimeline: expect.arrayContaining([
          expect.objectContaining({
            source: 'submit',
            event: 'booking_submit_received',
            normalizedPickupDateTimeIso: '2026-03-02T13:00:00.000Z',
            businessPickupDateTime: '3/2/2026, 8:00 AM',
          }),
        ]),
      })
    );
  });
});
