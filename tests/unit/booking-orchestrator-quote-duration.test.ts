import { beforeEach, describe, expect, it, vi } from 'vitest';

const getAdminDb = vi.fn();
const getQuote = vi.fn();
const isQuoteValid = vi.fn();
const createBookingAtomic = vi.fn();
const getBooking = vi.fn();
const classifyTrip = vi.fn();

vi.mock('@/lib/utils/firebase-admin', () => ({ getAdminDb: () => getAdminDb() }));
vi.mock('firebase-admin/firestore', () => ({ FieldValue: { serverTimestamp: () => 'server-timestamp' } }));
vi.mock('@/lib/services/quote-service', () => ({ getQuote: (...args: any[]) => getQuote(...args), isQuoteValid: (...args: any[]) => isQuoteValid(...args) }));
vi.mock('@/lib/services/booking-service', () => ({
  createBookingAtomic: (...args: any[]) => createBookingAtomic(...args),
  getBooking: (...args: any[]) => getBooking(...args),
}));
vi.mock('@/lib/services/email-service', () => ({
  sendBookingVerificationEmail: vi.fn().mockResolvedValue(undefined),
  sendDriverNotificationEmail: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/lib/services/booking-attempts-service', () => ({ recordBookingAttempt: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/services/driver-notification-service', () => ({ notifyDriverOfNewBooking: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/services/service-area-validation', () => ({ classifyTrip: (...args: any[]) => classifyTrip(...args) }));
vi.mock('@/lib/services/notification-service', () => ({ sendBookingProblem: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/services/admin-notification-service', () => ({ sendAdminSms: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/services/twilio-service', () => ({ sendSms: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/services/google-calendar', () => ({
  createBookingCalendarEvent: vi.fn().mockResolvedValue(null),
  toCalendarBookingInput: vi.fn(() => ({})),
}));

let submitBookingOrchestration: typeof import('@/lib/services/booking-orchestrator').submitBookingOrchestration;

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  ({ submitBookingOrchestration } = await import('@/lib/services/booking-orchestrator'));

  getAdminDb.mockReturnValue({
    collection: () => ({ doc: () => ({ update: vi.fn().mockResolvedValue(undefined) }) }),
  });
  classifyTrip.mockReturnValue({ classification: 'normal' });
  isQuoteValid.mockReturnValue(true);
  createBookingAtomic.mockResolvedValue({ bookingId: 'booking-1' });
  getBooking.mockResolvedValue({
    id: 'booking-1',
    confirmation: { token: 'existing-token' },
    trip: {},
    customer: {},
  });
});

const buildPayload = () => ({
  quoteId: 'quote-1',
  fare: 100,
  customer: { name: 'Jane Doe', email: 'jane@example.com', phone: '+12035551212', smsOptIn: false },
  trip: {
    pickup: { address: '123 Main St', coordinates: { lat: 1, lng: 1 } },
    dropoff: { address: 'JFK Airport', coordinates: { lat: 2, lng: 2 } },
    pickupDateTime: new Date('2026-08-01T22:00:00.000Z'),
    fareType: 'personal' as const,
  },
});

describe('submitBookingOrchestration — quote duration propagation', () => {
  it('carries the quote\'s (traffic-adjusted) estimatedMinutes onto the booking\'s trip so scheduling reserves the actually-quoted slot length (regression: validateQuoteForSubmit stopped returning the matched quote, so the booking never recorded a duration and every schedule slot silently fell back to the flat 120-minute default)', async () => {
    const payload = buildPayload();
    getQuote.mockResolvedValue({
      pickupAddress: payload.trip.pickup.address,
      dropoffAddress: payload.trip.dropoff.address,
      pickupCoords: payload.trip.pickup.coordinates,
      dropoffCoords: payload.trip.dropoff.coordinates,
      pickupDateTime: payload.trip.pickupDateTime,
      fareType: payload.trip.fareType,
      price: payload.fare,
      estimatedMinutes: 100,
    });

    await submitBookingOrchestration({ payload, submittedPickupDateTimeRaw: payload.trip.pickupDateTime.toISOString() });

    expect(createBookingAtomic).toHaveBeenCalledTimes(1);
    const bookingData = createBookingAtomic.mock.calls[0][0];
    expect(bookingData.trip.estimatedMinutes).toBe(100);
  });
});
