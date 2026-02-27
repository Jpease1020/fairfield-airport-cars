import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/services/service-area-validation', () => ({
  classifyTrip: vi.fn().mockReturnValue({ classification: 'normal', code: null, message: '' }),
}));

vi.mock('@/lib/services/quote-service', () => ({
  getQuote: vi.fn(),
  isQuoteValid: vi.fn().mockReturnValue(true),
}));

vi.mock('@/lib/utils/firebase-admin', () => ({
  getAdminDb: vi.fn().mockReturnValue({}),
}));

vi.mock('@/lib/services/booking-service', () => ({
  createBookingAtomic: vi.fn(),
  getBooking: vi.fn(),
}));

vi.mock('@/lib/services/email-service', () => ({
  sendBookingVerificationEmail: vi.fn().mockResolvedValue(undefined),
  sendDriverNotificationEmail: vi.fn().mockResolvedValue(undefined),
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

vi.mock('@/lib/services/notification-service', () => ({
  sendBookingProblem: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/utils/auth-server', () => ({
  getAuthContext: vi.fn().mockResolvedValue(null),
}));

import * as quoteService from '@/lib/services/quote-service';
import * as bookingService from '@/lib/services/booking-service';

let validatePhasePOST: typeof import('@/app/api/booking/validate-phase/route').POST;
let submitPOST: typeof import('@/app/api/booking/submit/route').POST;

beforeAll(async () => {
  ({ POST: validatePhasePOST } = await import('@/app/api/booking/validate-phase/route'));
  ({ POST: submitPOST } = await import('@/app/api/booking/submit/route'));
});

const formData = {
  trip: {
    pickup: { address: 'Fairfield Station, Fairfield, CT', coordinates: { lat: 41.1408, lng: -73.2613 } },
    dropoff: { address: 'JFK Airport, Queens, NY', coordinates: { lat: 40.6413, lng: -73.7781 } },
    pickupDateTime: '2027-03-01T10:00:00.000Z',
    fareType: 'personal' as const,
  },
  customer: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '2035551234',
  },
};

const submitPayload = {
  quoteId: 'quote_123',
  fare: 120,
  customer: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '2035551234',
    notes: '',
  },
  trip: {
    pickup: { address: 'Fairfield Station, Fairfield, CT', coordinates: { lat: 41.1408, lng: -73.2613 } },
    dropoff: { address: 'JFK Airport, Queens, NY', coordinates: { lat: 40.6413, lng: -73.7781 } },
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

const req = (url: string, body: Record<string, unknown>) =>
  new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('Booking server golden path', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it('completes validate-phase -> submit for happy path', async () => {
    const validateRes = await validatePhasePOST(req('http://localhost/api/booking/validate-phase', {
      phase: 'payment',
      formData,
      quote: {
        quoteId: 'quote_123',
        fare: 120,
        expiresAt: '2027-03-01T10:15:00.000Z',
      },
    }));

    const validateData = await validateRes.json();
    expect(validateData.validation.isValid).toBe(true);

    vi.mocked(quoteService.getQuote).mockResolvedValue({
      pickupAddress: submitPayload.trip.pickup.address,
      dropoffAddress: submitPayload.trip.dropoff.address,
      pickupDateTime: submitPayload.trip.pickupDateTime,
      fareType: submitPayload.trip.fareType,
      price: submitPayload.fare,
    } as any);

    vi.mocked(bookingService.createBookingAtomic).mockResolvedValue({ bookingId: 'booking_123' });
    vi.mocked(bookingService.getBooking).mockResolvedValue({
      id: 'booking_123',
      confirmation: { token: 'tok_123' },
      customer: { email: submitPayload.customer.email },
      trip: {
        pickup: { address: submitPayload.trip.pickup.address },
        dropoff: { address: submitPayload.trip.dropoff.address },
        pickupDateTime: submitPayload.trip.pickupDateTime,
      },
      payment: { totalAmount: submitPayload.fare },
      status: 'pending',
    } as any);

    const submitRes = await submitPOST(req('http://localhost/api/booking/submit', submitPayload));
    const submitData = await submitRes.json();

    expect(submitRes.status).toBe(200);
    expect(submitData.success).toBe(true);
    expect(submitData.bookingId).toBe('booking_123');
  });

  it('returns structured conflict on submit when slot is unavailable', async () => {
    vi.mocked(quoteService.getQuote).mockResolvedValue({
      pickupAddress: submitPayload.trip.pickup.address,
      dropoffAddress: submitPayload.trip.dropoff.address,
      pickupDateTime: submitPayload.trip.pickupDateTime,
      fareType: submitPayload.trip.fareType,
      price: submitPayload.fare,
    } as any);

    vi.mocked(bookingService.createBookingAtomic).mockRejectedValue(
      new Error('Time slot conflicts with existing bookings. Suggested times: 06:00-08:00')
    );

    const submitRes = await submitPOST(req('http://localhost/api/booking/submit', submitPayload));
    const submitData = await submitRes.json();

    expect(submitRes.status).toBe(409);
    expect(submitData.code).toBe('TIME_SLOT_CONFLICT');
    expect(submitData.suggestedTimes).toEqual(['06:00-08:00']);
  });
});
