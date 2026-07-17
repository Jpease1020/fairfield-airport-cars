import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCreateBookingAtomic = vi.fn();
const mockGetBooking = vi.fn();
const mockGetAdminDb = vi.fn();

vi.mock('@/lib/services/booking-service', () => ({
  createBookingAtomic: mockCreateBookingAtomic,
  getBooking: mockGetBooking,
}));

vi.mock('@/lib/utils/firebase-admin', () => ({
  getAdminDb: mockGetAdminDb,
}));

vi.mock('@/lib/services/google-calendar', () => ({
  createBookingCalendarEvent: vi.fn().mockResolvedValue(null),
  toCalendarBookingInput: vi.fn().mockReturnValue({}),
}));

vi.mock('@/lib/services/email-service', () => ({
  sendBookingVerificationEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/services/twilio-service', () => ({
  sendSms: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/services/booking-attempts-service', () => ({
  recordBookingAttempt: vi.fn().mockResolvedValue(undefined),
}));

let createPaidBookingAndNotify: typeof import('@/lib/services/booking-orchestrator').createPaidBookingAndNotify;
let BookingApiError: typeof import('@/lib/services/booking-orchestrator').BookingApiError;

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  ({ createPaidBookingAndNotify, BookingApiError } = await import('@/lib/services/booking-orchestrator'));

  mockCreateBookingAtomic.mockResolvedValue({ bookingId: 'booking-123' });
  mockGetAdminDb.mockReturnValue({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        update: vi.fn().mockResolvedValue(undefined),
      })),
    })),
  });
  mockGetBooking.mockResolvedValue(null); // short-circuits the notification block, keeping this focused
});

const soonPickup = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour out — under the 24h floor

describe('createPaidBookingAndNotify — skipMinimumNoticeCheck', () => {
  it('rejects a pickup time under 24h out when skipMinimumNoticeCheck is not set (the backstop still works for a caller that has not already validated)', async () => {
    await expect(
      createPaidBookingAndNotify({
        bookingData: { trip: { pickupDateTime: soonPickup }, customer: { phone: '2035551234' } },
        amountCents: 15000,
        tipCents: 0,
        smokeTest: true,
      })
    ).rejects.toMatchObject({ status: 400, body: { code: 'MINIMUM_ADVANCE_NOTICE' } });
    expect(mockCreateBookingAtomic).not.toHaveBeenCalled();
  });

  it('does NOT reject a pickup time under 24h out when skipMinimumNoticeCheck is true (regression: process-payment/route.ts already validates this against the same pickupDateTime BEFORE charging the card — re-checking it here, after the charge, against a LATER Date.now() could reject a booking that was genuinely compliant when submitted, purely due to Square processing latency, leaving a charged card with no booking)', async () => {
    const result = await createPaidBookingAndNotify({
      bookingData: { trip: { pickupDateTime: soonPickup }, customer: { phone: '2035551234' } },
      amountCents: 15000,
      tipCents: 0,
      smokeTest: true,
      skipMinimumNoticeCheck: true,
    });

    expect(result.bookingId).toBe('booking-123');
    expect(mockCreateBookingAtomic).toHaveBeenCalledTimes(1);
  });
});
