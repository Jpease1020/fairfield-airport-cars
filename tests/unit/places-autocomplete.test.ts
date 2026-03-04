import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fetchMock = vi.fn();

describe('POST /api/places/autocomplete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_MAPS_SERVER_API_KEY = 'maps-key';
    vi.spyOn(globalThis, 'fetch').mockImplementation(fetchMock as typeof fetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 400 when query is missing', async () => {
    const { POST } = await import('@/app/api/places/autocomplete/route');
    const response = await POST(
      new Request('http://localhost/api/places/autocomplete', {
        method: 'POST',
        body: JSON.stringify({}),
      })
    );

    expect(response.status).toBe(400);
  });

  it('returns normalized candidates', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'OK',
        candidates: [
          {
            formatted_address: '44 Elm St, Westport, CT 06880, USA',
            place_id: 'place_123',
            geometry: { location: { lat: 41.141, lng: -73.357 } },
          },
        ],
      }),
    });

    const { POST } = await import('@/app/api/places/autocomplete/route');
    const response = await POST(
      new Request('http://localhost/api/places/autocomplete', {
        method: 'POST',
        body: JSON.stringify({ query: '44 Elm Street Westport CT' }),
        headers: { 'Content-Type': 'application/json' },
      })
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.candidates).toHaveLength(1);
    expect(payload.candidates[0].address).toContain('Westport');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
