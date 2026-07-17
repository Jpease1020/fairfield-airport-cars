import { beforeEach, describe, expect, it, vi } from 'vitest';

const getAdminDb = vi.fn();

vi.mock('@/lib/utils/firebase-admin', () => ({
  getAdminDb: () => getAdminDb(),
}));

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: { serverTimestamp: () => 'server-timestamp' },
}));

let claimPaymentForBookingCreation: typeof import('@/lib/services/booking-service').claimPaymentForBookingCreation;

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  ({ claimPaymentForBookingCreation } = await import('@/lib/services/booking-service'));
});

describe('claimPaymentForBookingCreation', () => {
  it('returns true when this is the first request to claim a paymentId (regression: nothing previously stopped two concurrent requests from both creating a booking for the same Square payment)', async () => {
    const create = vi.fn().mockResolvedValue(undefined);
    getAdminDb.mockReturnValue({
      collection: vi.fn(() => ({ doc: vi.fn(() => ({ create })) })),
    });

    const result = await claimPaymentForBookingCreation('pay-123');

    expect(result).toBe(true);
    expect(create).toHaveBeenCalledWith({ claimedAt: 'server-timestamp' });
  });

  it('returns false when the claim doc already exists (a concurrent or duplicate request already claimed this paymentId)', async () => {
    const create = vi.fn().mockRejectedValue(Object.assign(new Error('ALREADY_EXISTS'), { code: 6 }));
    getAdminDb.mockReturnValue({
      collection: vi.fn(() => ({ doc: vi.fn(() => ({ create })) })),
    });

    const result = await claimPaymentForBookingCreation('pay-123');

    expect(result).toBe(false);
  });
});
