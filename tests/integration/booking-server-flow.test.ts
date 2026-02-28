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
import { sendAdminSms } from '@/lib/services/admin-notification-service';

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
    expect(bookingService.createBookingAtomic).toHaveBeenCalledWith(
      expect.objectContaining({
        trip: expect.objectContaining({
          pickupDateTime: expect.any(Date),
        }),
      })
    );
    const createdBookingArg = vi.mocked(bookingService.createBookingAtomic).mock.calls[0]?.[0] as any;
    expect(createdBookingArg.trip.pickupDateTime.toISOString()).toBe(submitPayload.trip.pickupDateTime);
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

  it('uses business-time formatted pickup time in admin SMS from submitted trip timestamp', async () => {
    const payload = {
      ...submitPayload,
      trip: {
        ...submitPayload.trip,
        pickupDateTime: '2026-03-02T13:00:00.000Z',
      },
    };

    vi.mocked(quoteService.getQuote).mockResolvedValue({
      pickupAddress: payload.trip.pickup.address,
      dropoffAddress: payload.trip.dropoff.address,
      pickupDateTime: payload.trip.pickupDateTime,
      fareType: payload.trip.fareType,
      price: payload.fare,
    } as any);

    vi.mocked(bookingService.createBookingAtomic).mockResolvedValue({ bookingId: 'booking_456' });
    vi.mocked(bookingService.getBooking).mockResolvedValue({
      id: 'booking_456',
      confirmation: { token: 'tok_456' },
      customer: { email: payload.customer.email },
      trip: {
        pickup: { address: payload.trip.pickup.address },
        dropoff: { address: payload.trip.dropoff.address },
        pickupDateTime: payload.trip.pickupDateTime,
      },
      payment: { totalAmount: payload.fare },
      status: 'pending',
    } as any);

    const submitRes = await submitPOST(req('http://localhost/api/booking/submit', payload));
    const submitData = await submitRes.json();

    expect(submitRes.status).toBe(200);
    expect(submitData.success).toBe(true);
    expect(sendAdminSms).toHaveBeenCalledWith(expect.stringContaining('3/2/2026, 8:00 AM'));
  });
});
