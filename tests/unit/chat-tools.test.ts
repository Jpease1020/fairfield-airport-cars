import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  checkAvailability,
  createBooking,
  getQuote,
  resolveAddress,
  validateContactInfo,
  validateTripDetails,
  type ToolExecutionContext,
} from '@/lib/chat/chat-tools';

const fetchMock = vi.fn();
const context: ToolExecutionContext = {
  origin: 'http://localhost:3000',
  fetchImpl: fetchMock as unknown as typeof fetch,
};

describe('chat tools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolveAddress returns first candidate', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            address: '44 Elm St, Westport, CT 06880, USA',
            coordinates: { lat: 41.141, lng: -73.357 },
            placeId: 'abc123',
          },
        ],
      }),
    });

    const result = await resolveAddress(context, '44 Elm Street Westport');

    expect(result.resolved).toBe(true);
    expect(result.candidate?.address).toContain('Westport');
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/places/autocomplete',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('checkAvailability maps response payload', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        isAvailable: false,
        message: 'conflict',
        suggestedTimeSlots: ['09:00-11:00'],
      }),
    });

    const result = await checkAvailability(context, '2026-03-10T11:00:00.000Z');

    expect(result.isAvailable).toBe(false);
    expect(result.suggestedTimes).toEqual(['09:00-11:00']);
  });

  it('getQuote returns error details on failure', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'blocked', code: 'OUT_OF_SERVICE_HARD' }),
    });

    const result = await getQuote(context, {
      origin: 'X',
      destination: 'Y',
      pickupCoords: { lat: 1, lng: 1 },
      dropoffCoords: { lat: 2, lng: 2 },
      pickupTime: '2026-03-10T11:00:00.000Z',
      fareType: 'personal',
    });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('OUT_OF_SERVICE_HARD');
  });

  it('validateTripDetails calls validate-phase with trip-details', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ validation: { isValid: true, errors: [], warnings: [], fieldErrors: {} } }),
    });

    const result = await validateTripDetails(context, {
      trip: {
        pickup: { address: 'Fairfield, CT', coordinates: { lat: 41.1, lng: -73.2 } },
        dropoff: { address: 'JFK Airport', coordinates: { lat: 40.6, lng: -73.7 } },
        pickupDateTime: '2026-03-12T12:00:00.000Z',
        fareType: 'personal',
      },
    });

    expect(result.valid).toBe(true);
    const callBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(callBody.phase).toBe('trip-details');
  });

  it('validateContactInfo calls validate-phase with contact-info', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ validation: { isValid: false, errors: ['bad'], warnings: [], fieldErrors: {} } }),
    });

    const result = await validateContactInfo(context, {
      customer: {
        name: 'Test',
        email: 'bad',
        phone: '1',
      },
    });

    expect(result.valid).toBe(false);
    const callBody = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(callBody.phase).toBe('contact-info');
  });

  it('createBooking validates then submits booking', async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ validation: { isValid: true, errors: [], warnings: [], fieldErrors: {} } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, bookingId: 'FAC-123', totalFare: 145 }),
      });

    const result = await createBooking(context, {
      quoteId: 'quote_1',
      fare: 145,
      quoteExpiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
      customer: {
        name: 'Justin',
        email: 'justin@example.com',
        phone: '2035550101',
        smsOptIn: false,
      },
      trip: {
        pickup: { address: '44 Elm St, Westport, CT', coordinates: { lat: 41.1, lng: -73.2 } },
        dropoff: { address: 'JFK Airport', coordinates: { lat: 40.6, lng: -73.7 } },
        pickupDateTime: '2026-03-12T12:00:00.000Z',
        fareType: 'personal',
      },
    });

    expect(result.success).toBe(true);
    expect(result.bookingId).toBe('FAC-123');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
