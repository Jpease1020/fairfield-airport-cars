import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mockDistanceMatrix = vi.fn();
const mockGetSettings = vi.fn();
const mockCreateQuote = vi.fn();
const mockCheckBookingConflicts = vi.fn();
const mockClassifyTrip = vi.fn();
const mockIsAirportLocation = vi.fn();
const mockEnforceRateLimit = vi.fn();

vi.mock('@googlemaps/google-maps-services-js', () => ({
  Client: vi.fn().mockImplementation(() => ({
    distancematrix: mockDistanceMatrix,
  })),
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
});
