import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { sendSms } from '@/lib/services/twilio-service';

vi.mock('@/lib/services/twilio-service', () => ({
  sendSms: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/services/booking-service', () => ({
  getBooking: vi.fn(),
}));

vi.mock('@/lib/services/email-service', () => ({
  sendConfirmationEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/utils/bookingAdapter', () => ({
  adaptOldBookingToNew: vi.fn((booking) => booking),
}));

vi.mock('@/lib/utils/auth-server', () => ({
  requireAdmin: vi.fn().mockResolvedValue({ ok: true, auth: { uid: 'admin' } }),
}));

import { getBooking } from '@/lib/services/booking-service';

const mockGetBooking = getBooking as unknown as ReturnType<typeof vi.fn>;
const mockSendSms = sendSms as unknown as ReturnType<typeof vi.fn>;

let POST: typeof import('@/app/api/notifications/send-confirmation/route').POST;

beforeAll(async () => {
  ({ POST } = await import('@/app/api/notifications/send-confirmation/route'));
});

describe('POST /api/notifications/send-confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses business-time formatted pickup time in SMS', async () => {
    mockGetBooking.mockResolvedValue({
      id: 'booking-123',
      pickupDateTime: '2026-03-02T13:00:00.000Z',
      pickupLocation: 'Fairfield Station',
      dropoffLocation: 'JFK Airport',
      phone: '+15555550123',
    });

    const response = await POST(
      new Request('http://localhost/api/notifications/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: 'booking-123' }),
      })
    );

    expect(response!.status).toBe(200);
    expect(mockSendSms).toHaveBeenCalledWith({
      to: '+15555550123',
      body: expect.stringContaining('3/2/2026, 8:00 AM'),
    });
  });
});
