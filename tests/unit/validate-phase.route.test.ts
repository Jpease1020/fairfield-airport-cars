import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { classifyTrip } from '@/lib/services/service-area-validation';

vi.mock('@/lib/services/service-area-validation', () => ({
  classifyTrip: vi.fn().mockReturnValue({
    classification: 'normal',
    code: null,
    message: '',
  }),
}));

let POST: typeof import('@/app/api/booking/validate-phase/route').POST;

beforeAll(async () => {
  ({ POST } = await import('@/app/api/booking/validate-phase/route'));
});

const baseFormData = {
  trip: {
    pickup: {
      address: 'Fairfield Station, Fairfield, CT',
      coordinates: { lat: 41.1408, lng: -73.2613 },
    },
    dropoff: {
      address: 'JFK Airport, Queens, NY',
      coordinates: { lat: 40.6413, lng: -73.7781 },
    },
    pickupDateTime: new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString(),
    fareType: 'personal' as const,
  },
  customer: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '2035551234',
  },
};

const buildRequest = (body: Record<string, unknown>) =>
  new Request('http://localhost/api/booking/validate-phase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('POST /api/booking/validate-phase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(classifyTrip).mockReturnValue({
      classification: 'normal',
      code: null,
      message: '',
    } as any);
  });

  it('returns 24-hour minimum error for trip-details', async () => {
    const tooSoon = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    const response = await POST(
      buildRequest({
        phase: 'trip-details',
        formData: {
          ...baseFormData,
          trip: {
            ...baseFormData.trip,
            pickupDateTime: tooSoon,
          },
        },
        quote: {
          quoteId: 'quote_123',
          fare: 100,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        },
      })
    );

    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.validation.isValid).toBe(false);
    expect(payload.validation.fieldErrors['pickup-datetime-input']).toContain('24 hours');
  });

  it('returns service-area error when classifyTrip blocks route', async () => {
    vi.mocked(classifyTrip).mockReturnValue({
      classification: 'hard_block',
      code: 'OUT_OF_SERVICE_HARD',
      message: 'Sorry, this route is outside our service area.',
    } as any);

    const response = await POST(
      buildRequest({
        phase: 'trip-details',
        formData: baseFormData,
        quote: {
          quoteId: 'quote_123',
          fare: 100,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        },
      })
    );

    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.validation.isValid).toBe(false);
    expect(payload.validation.fieldErrors['dropoff-location-input']).toContain('outside our service area');
  });

  it('validates contact-info email and phone', async () => {
    const response = await POST(
      buildRequest({
        phase: 'contact-info',
        formData: {
          ...baseFormData,
          customer: {
            name: 'Test User',
            email: 'not-an-email',
            phone: 'abc',
          },
        },
      })
    );

    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.validation.isValid).toBe(false);
    expect(payload.validation.fieldErrors['email-input']).toContain('valid email');
    expect(payload.validation.fieldErrors['phone-input']).toContain('valid US phone');
  });

  it('returns quote expired on payment when quote is expired', async () => {
    const response = await POST(
      buildRequest({
        phase: 'payment',
        formData: baseFormData,
        quote: {
          quoteId: 'quote_123',
          fare: 100,
          expiresAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
      })
    );

    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.validation.isValid).toBe(false);
    expect(payload.validation.errors.join(' ')).toContain('quote has expired');
  });

  it('passes payment validation for valid payload', async () => {
    const response = await POST(
      buildRequest({
        phase: 'payment',
        formData: baseFormData,
        quote: {
          quoteId: 'quote_123',
          fare: 100,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        },
      })
    );

    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.validation.isValid).toBe(true);
    expect(payload.validation.errors).toEqual([]);
  });
});
