import { describe, expect, it } from 'vitest';

describe('Deprecated endpoint behavior', () => {
  it('returns 410 for POST /api/booking', async () => {
    const { POST } = await import('@/app/api/booking/route');
    const response = await POST(
      new Request('http://localhost/api/booking', {
        method: 'POST',
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(410);
    expect(payload.code).toBe('DEPRECATED_ENDPOINT');
  });

  it('returns 410 for GET /api/bookings/[id]/eta', async () => {
    const { GET } = await import('@/app/api/bookings/[id]/eta/route');
    const response = await GET(
      new Request('http://localhost/api/bookings/booking-123/eta') as any,
      { params: Promise.resolve({ id: 'booking-123' }) }
    );
    const payload = await response.json();

    expect(response.status).toBe(410);
    expect(payload.code).toBe('DEPRECATED_ENDPOINT');
  });

  it('returns 410 for POST /api/payment/create-checkout-session', async () => {
    const { POST } = await import('@/app/api/payment/create-checkout-session/route');
    const response = await POST(
      new Request('http://localhost/api/payment/create-checkout-session', {
        method: 'POST',
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(410);
    expect(payload.code).toBe('DEPRECATED_ENDPOINT');
  });

  it('returns 410 for POST /api/payment/complete-payment', async () => {
    const { POST } = await import('@/app/api/payment/complete-payment/route');
    const response = await POST(
      new Request('http://localhost/api/payment/complete-payment', {
        method: 'POST',
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(410);
    expect(payload.code).toBe('DEPRECATED_ENDPOINT');
  });

});
