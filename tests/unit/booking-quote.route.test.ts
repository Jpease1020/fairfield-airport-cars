import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mockDistanceMatrix = vi.fn();
const mockGetSettings = vi.fn();
const mockCreateQuote = vi.fn();
const mockCheckBookingConflicts = vi.fn();
const mockClassifyTrip = vi.fn();
const mockIsAirportLocation = vi.fn();
const mockEnforceRateLimit = vi.fn();

vi.mock('@googlemaps/google-maps-services-js', () => ({
  // Regular function (not arrow) so it works as a constructor: the route calls
  // `new Client()`, and vitest 4 no longer allows arrow-fn mock impls with `new`.
  Client: vi.fn().mockImplementation(function () {
    return { distancematrix: mockDistanceMatrix };
  }),
}));

vi.mock('@/lib/business/settings-service', () => ({
  getSettings: mockGetSettings,
}));

vi.mock('@/lib/services/quote-service', () => ({
  createQuote: mockCreateQuote,
}));

vi.mock('@/lib/services/driver-scheduling-service', () => ({
  driverSchedulingService: {
    checkBookingConflicts: mockCheckBookingConflicts,
  },
}));

vi.mock('@/lib/services/service-area-validation', () => ({
  classifyTrip: mockClassifyTrip,
  isAirportLocation: mockIsAirportLocation,
}));

vi.mock('@/lib/security/rate-limit', () => ({
  enforceRateLimit: mockEnforceRateLimit,
}));

let POST: typeof import('@/app/api/booking/quote/route').POST;

beforeAll(async () => {
  ({ POST } = await import('@/app/api/booking/quote/route'));
});

const buildRequest = (body: Record<string, unknown>) =>
  new Request('http://localhost/api/booking/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

describe('POST /api/booking/quote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnforceRateLimit.mockReturnValue(null);
    mockGetSettings.mockResolvedValue({
      baseFare: 20,
      perMile: 2,
      perMinute: 0.5,
      airportReturnMultiplier: 1.8,
    });
    mockClassifyTrip.mockReturnValue({
      classification: 'normal',
      code: null,
      message: '',
    });
    mockIsAirportLocation.mockReturnValue(false);
    mockCheckBookingConflicts.mockResolvedValue({
      hasConflict: false,
      suggestedTimeSlots: [],
    });
    mockDistanceMatrix.mockResolvedValue({
      data: {
        rows: [
          {
            elements: [
              {
                status: 'OK',
                distance: { value: 16093 }, // ~10 miles
                duration: { value: 1800 }, // 30 min
                duration_in_traffic: { value: 2400 }, // 40 min
              },
            ],
          },
        ],
      },
    });
    mockCreateQuote.mockResolvedValue({ quoteId: 'quote_123' });
  });

  it('returns 400 when pickup time is missing', async () => {
    const response = await POST(
      buildRequest({
        origin: 'Fairfield, CT',
        destination: 'JFK Airport, Queens, NY',
        fareType: 'personal',
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe('MISSING_PICKUP_TIME');
  });

  it('returns quote payload for valid request', async () => {
    const pickupTime = new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString();

    const response = await POST(
      buildRequest({
        origin: 'Fairfield Station, Fairfield, CT',
        destination: 'JFK Airport, Queens, NY',
        fareType: 'personal',
        pickupTime,
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.quoteId).toBe('quote_123');
    expect(payload.fare).toBeGreaterThan(0);
    expect(payload.fareType).toBe('personal');
    expect(payload.expiresInMinutes).toBe(15);
    expect(mockGetSettings).toHaveBeenCalledTimes(1);
    expect(mockDistanceMatrix).toHaveBeenCalledTimes(1);
    expect(mockCreateQuote).toHaveBeenCalledTimes(1);
  });

  it('always geocodes the address text for the Distance Matrix call, ignoring client-supplied coordinates (regression: a client could keep the displayed address the same while substituting coordinates for a much shorter route, collapsing the fare)', async () => {
    const pickupTime = new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString();

    await POST(
      buildRequest({
        origin: 'Fairfield Station, Fairfield, CT',
        destination: 'JFK Airport, Queens, NY',
        fareType: 'personal',
        pickupTime,
        // Coordinates for two points a few feet apart, nowhere near the real addresses above —
        // if these were used for the Distance Matrix call, the fare would collapse to near-zero.
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

  it('rounds the fare once at the end instead of compounding Math.ceil across each pipeline stage (regression: ceiling the base fare and then separately ceiling the airport-multiplier result overcharged versus a single combined rounding)', async () => {
    const pickupTime = new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString();
    // perMile/perMinute zeroed out so distance/duration don't contribute — raw fare is exactly
    // baseFare (10.01), chosen so ceil(10.01) = 11 overshoots enough that ceil(11 * 1.09) = 12
    // diverges from the correct ceil(10.01 * 1.09) = 11.
    mockGetSettings.mockResolvedValue({
      baseFare: 10.01,
      perMile: 0,
      perMinute: 0,
      airportReturnMultiplier: 1.09,
      personalDiscountPercent: 0,
    });
    mockIsAirportLocation.mockImplementation((address: string) => address === 'JFK Airport, Queens, NY');

    const response = await POST(
      buildRequest({
        origin: 'JFK Airport, Queens, NY',
        destination: 'Fairfield Station, Fairfield, CT',
        fareType: 'business',
        pickupTime,
      })
    );
    const payload = await response.json();

    // Old per-stage-ceil behavior would have produced ceil(ceil(10.01) * 1.09) = ceil(11.99) = 12.
    expect(payload.fare).toBe(11);
  });
});
