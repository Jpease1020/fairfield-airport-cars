import { beforeEach, describe, expect, it, vi } from 'vitest';

const getBooking = vi.fn();
const cancelBooking = vi.fn();
const sendSms = vi.fn().mockResolvedValue(undefined);
const sendConfirmationEmail = vi.fn().mockResolvedValue(undefined);
const adaptOldBookingToNew = vi.fn((booking) => booking);
const getBusinessRules = vi.fn();
const getCancellationFeePercent = vi.fn();
const sendBookingProblem = vi.fn().mockResolvedValue(undefined);
const requireOwnerOrAdmin = vi.fn();

vi.mock('@/lib/services/booking-service', async () => {
  const actual = await vi.importActual('@/lib/services/booking-service');
  return { ...(actual as object), getBooking, cancelBooking };
});
vi.mock('@/lib/services/twilio-service', () => ({ sendSms }));
vi.mock('@/lib/services/email-service', () => ({ sendConfirmationEmail }));
vi.mock('@/utils/bookingAdapter', () => ({ adaptOldBookingToNew }));
vi.mock('@/lib/business/business-rules', () => ({ getBusinessRules, getCancellationFeePercent }));
vi.mock('@/lib/services/notification-service', () => ({ sendBookingProblem }));
vi.mock('@/lib/utils/auth-server', () => ({ requireOwnerOrAdmin }));
vi.mock('@/lib/security/rate-limit', () => ({ enforceRateLimit: vi.fn(() => null) }));
vi.mock('@/lib/utils/booking-date-time', () => ({ formatBusinessDateTime: vi.fn(() => 'Mar 5, 2026 10:00 AM') }));

describe('Admin journey', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    requireOwnerOrAdmin.mockResolvedValue({ ok: true, auth: { role: 'admin' } });
    getBusinessRules.mockResolvedValue({ cancellationFeeTiers: [] });
    getBooking.mockResolvedValue({
      id: 'booking-123',
      status: 'confirmed',
      name: 'Test Rider',
      email: 'test@example.com',
      phone: '+12035550123',
      trip: { pickupDateTime: new Date(Date.now() + 48 * 60 * 60 * 1000), fare: 100 },
      customer: { name: 'Test Rider', email: 'test@example.com', phone: '+12035550123' },
      payment: { depositAmount: 100, squarePaymentId: 'pay_123' },
    });
    cancelBooking.mockResolvedValue(undefined);
  });

  it('GET /api/booking/[bookingId]/status with admin auth returns status', async () => {
    const { GET } = await import('@/app/api/booking/[bookingId]/status/route');

    const req = new Request('http://localhost/api/booking/booking-123/status') as any;
    req.nextUrl = new URL(req.url);

    const res = await GET(req, { params: Promise.resolve({ bookingId: 'booking-123' }) });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.status).toBe('confirmed');
  });

  it.each([
    { feePercent: 0, expectedRefund: 100, expectedFee: 0 },
    { feePercent: 50, expectedRefund: 50, expectedFee: 50 },
    { feePercent: 100, expectedRefund: 0, expectedFee: 100 },
  ])('POST /api/booking/cancel-booking applies refund policy (fee $feePercent%)', async ({ feePercent, expectedRefund, expectedFee }) => {
    getCancellationFeePercent.mockReturnValue(feePercent);
    const { POST } = await import('@/app/api/booking/cancel-booking/route');

    const req = new Request('http://localhost/api/booking/cancel-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: 'booking-123', reason: 'Admin cancel' }),
    }) as any;
    req.nextUrl = new URL(req.url);

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.refundAmount).toBe(expectedRefund);
    expect(data.cancellationFee).toBe(expectedFee);
    expect(cancelBooking).toHaveBeenCalledWith(
      'booking-123',
      'Admin cancel',
      expect.objectContaining({ refundAmount: expectedRefund, cancellationFee: expectedFee, squarePaymentId: 'pay_123' })
    );
  });
});
