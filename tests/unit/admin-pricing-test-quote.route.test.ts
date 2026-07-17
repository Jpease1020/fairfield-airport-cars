import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mockDistanceMatrix = vi.fn();
const mockGetPricingConfig = vi.fn();
const mockRequireAdmin = vi.fn();
const mockIsAirportLocation = vi.fn();

vi.mock('@googlemaps/google-maps-services-js', () => ({
  Client: vi.fn().mockImplementation(function () {
    return { distancematrix: mockDistanceMatrix };
  }),
}));

vi.mock('@/lib/business/pricing-config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/business/pricing-config')>();
  return {
    ...actual,
    getPricingConfig: mockGetPricingConfig,
  };
});

vi.mock('@/lib/utils/auth-server', () => ({
  requireAdmin: mockRequireAdmin,
}));

vi.mock('@/lib/services/service-area-validation', () => ({
  isAirportLocation: mockIsAirportLocation,
}));

let POST: typeof import('@/app/api/admin/pricing/test-quote/route').POST;

beforeAll(async () => {
  ({ POST } = await import('@/app/api/admin/pricing/test-quote/route'));
});

const buildRequest = (body: Record<string, unknown>) =>
  new Request('http://localhost/api/admin/pricing/test-quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as any;

describe('POST /api/admin/pricing/test-quote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAdmin.mockResolvedValue({ ok: true, auth: { role: 'admin' } });
    mockGetPricingConfig.mockResolvedValue({
      baseFare: 20,
      perMile: 2,
      perMinute: 0.5,
      airportReturnMultiplier: 1.15,
      personalDiscountPercent: 10,
      minimumFare: 0,
    });
    mockIsAirportLocation.mockReturnValue(false);
    mockDistanceMatrix.mockResolvedValue({
      data: {
        rows: [
          {
            elements: [
              {
                status: 'OK',
                distance: { value: 16093 },
                duration: { value: 1800 },
                duration_in_traffic: { value: 2400 },
              },
            ],
          },
        ],
      },
    });
  });

  it('always geocodes the address text for the Distance Matrix call, ignoring client-supplied coordinates (regression: this admin preview route used client coordinates directly, unlike the hardened production quote endpoint, so a stale/mismatched coordinate pair could make the admin preview diverge from what a customer is actually charged)', async () => {
    await POST(
      buildRequest({
        origin: 'Fairfield Station, Fairfield, CT',
        destination: 'JFK Airport, Queens, NY',
        fareType: 'personal',
        pickupCoords: { lat: 41.1000, lng: -73.2000 },
        dropoffCoords: { lat: 41.1001, lng: -73.2001 },
      })
    );

    expect(mockDistanceMatrix).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          origins: ['Fairfield Station, Fairfield, CT'],
          destinations: ['JFK Airport, Queens, NY'],
        }),
      })
    );
  });

  it('returns a fare preview for a valid request', async () => {
    const response = await POST(
      buildRequest({
        origin: 'Fairfield Station, Fairfield, CT',
        destination: 'JFK Airport, Queens, NY',
        fareType: 'personal',
      })
    );
    const payload = await response!.json();

    expect(response!.status).toBe(200);
    expect(payload.fare).toBeGreaterThan(0);
  });
});
