import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { refundPayment } from '@/lib/services/square-service';

const docUpdate = vi.fn().mockResolvedValue(undefined);
const docGet = vi.fn().mockResolvedValue({ exists: true, data: () => ({}) });
const getAdminDb = vi.fn(() => ({
  collection: vi.fn(() => ({
    doc: vi.fn(() => ({ get: docGet, update: docUpdate })),
  })),
}));

vi.mock('@/lib/utils/firebase-admin', () => ({
  getAdminDb,
}));

vi.mock('@/lib/services/square-service', () => ({
  refundPayment: vi.fn().mockResolvedValue({ success: true, refundId: 'refund-123' }),
}));

vi.mock('@/lib/services/driver-scheduling-service', () => ({
  driverSchedulingService: {
    cancelBooking: vi.fn().mockResolvedValue(undefined),
  },
}));

const mockRefundPayment = refundPayment as unknown as ReturnType<typeof vi.fn>;

describe('cancelBooking', () => {
  const previousSmokeTestMode = process.env.SMOKE_TEST_MODE;

  beforeEach(() => {
    vi.clearAllMocks();
    docGet.mockResolvedValue({ exists: true, data: () => ({}) });
  });

  afterEach(() => {
    process.env.SMOKE_TEST_MODE = previousSmokeTestMode;
  });

  it('refunds via Square when a payment ID and refund amount are present', async () => {
    process.env.SMOKE_TEST_MODE = 'false';
    const { cancelBooking } = await import('@/lib/services/booking-cancellation');

    await cancelBooking('booking-123', 'Changed plans', {
      refundAmount: 75,
      squarePaymentId: 'pay-123',
      cancellationFee: 0,
    });

    expect(mockRefundPayment).toHaveBeenCalledWith('pay-123', 7500, 'USD', 'Changed plans');
  });

  it('SMOKE_TEST_MODE=true skips the Square refund entirely (regression: Codex flagged that a smoke-mode cancellation could still hit Square for real because the route only gated notifications, not this service call)', async () => {
    process.env.SMOKE_TEST_MODE = 'true';
    const { cancelBooking } = await import('@/lib/services/booking-cancellation');

    await cancelBooking('booking-123', 'Changed plans', {
      refundAmount: 75,
      squarePaymentId: 'pay-123',
      cancellationFee: 0,
    });

    expect(mockRefundPayment).not.toHaveBeenCalled();
  });
});
