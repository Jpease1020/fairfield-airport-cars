import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGet = vi.fn();
const mockSend = vi.fn();

vi.mock('@/lib/utils/firebase-admin', () => ({
  getAdminDb: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: mockGet,
      })),
    })),
  })),
}));

vi.mock('firebase-admin/messaging', () => ({
  getMessaging: vi.fn(() => ({
    send: mockSend,
  })),
}));

describe('driver-notification-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('formats pickup time using business timezone in push notification body', async () => {
    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({ token: 'driver-token-123' }),
    });
    mockSend.mockResolvedValue('message-id-123');

    const { notifyDriverOfNewBooking } = await import('@/lib/services/driver-notification-service');

    await notifyDriverOfNewBooking({
      bookingId: 'booking-123',
      customerName: 'Test Rider',
      pickupAddress: 'Fairfield, CT',
      dropoffAddress: 'JFK Airport, NY',
      pickupDateTime: '2026-03-02T13:00:00.000Z',
      fare: 120,
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        notification: expect.objectContaining({
          body: expect.stringContaining('3/2/2026, 8:00 AM'),
        }),
      })
    );
  });
});
