import { describe, expect, it, vi } from 'vitest';
import { submitBookingFlow } from '@/providers/booking/submission';
import type { BookingFormData, QuoteData } from '@/types/booking';

function createFormData(pickupDateTime: string): BookingFormData {
  return {
    trip: {
      pickup: {
        address: 'Fairfield Station, Fairfield, CT',
        coordinates: { lat: 41.1408, lng: -73.2613 },
      },
      dropoff: {
        address: 'JFK Airport, Queens, NY',
        coordinates: { lat: 40.6413, lng: -73.7781 },
      },
      pickupDateTime,
      fareType: 'personal',
      fare: 120,
      flightInfo: {
        hasFlight: false,
        airline: '',
        flightNumber: '',
        arrivalTime: '',
        terminal: '',
      },
    },
    customer: {
      name: 'Test User',
      email: 'test@example.com',
      phone: '2035551234',
      notes: '',
      smsOptIn: true,
      saveInfoForFuture: false,
    },
    payment: {
      depositAmount: null,
      balanceDue: 120,
      depositPaid: false,
      tipAmount: 0,
      tipPercent: 0,
      totalAmount: 120,
    },
  };
}

function createQuote(): QuoteData {
  return {
    quoteId: 'quote_123',
    fare: 120,
    distanceMiles: 30,
    durationMinutes: 55,
    fareType: 'personal',
    expiresAt: '2027-03-01T10:15:00.000Z',
    expiresInMinutes: 15,
  };
}

describe('submitBookingFlow time serialization', () => {
  it('converts datetime-local pickup time into ISO before submit', async () => {
    const submitBookingRequest = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ bookingId: 'booking_1' }),
    });

    await submitBookingFlow({
      formData: createFormData('2026-03-02T08:00'),
      currentQuote: createQuote(),
      validatePhaseWithApi: vi.fn().mockResolvedValue({ isValid: true, errors: [] }),
      submitBookingRequest,
      setIsSubmitting: vi.fn(),
      setError: vi.fn(),
      setWarning: vi.fn(),
      setSuccess: vi.fn(),
      setHasAttemptedValidation: vi.fn(),
      setCompletedBookingId: vi.fn(),
      setCurrentPhase: vi.fn(),
    });

    const requestBody = submitBookingRequest.mock.calls[0][0] as any;
    expect(requestBody.trip.pickupDateTime).toContain('T');
    expect(requestBody.trip.pickupDateTime).toContain('.000Z');
  });

  it('passes through existing ISO pickup time unchanged', async () => {
    const submitBookingRequest = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ bookingId: 'booking_2' }),
    });

    const pickupDateTime = '2026-03-02T13:00:00.000Z';
    await submitBookingFlow({
      formData: createFormData(pickupDateTime),
      currentQuote: createQuote(),
      validatePhaseWithApi: vi.fn().mockResolvedValue({ isValid: true, errors: [] }),
      submitBookingRequest,
      setIsSubmitting: vi.fn(),
      setError: vi.fn(),
      setWarning: vi.fn(),
      setSuccess: vi.fn(),
      setHasAttemptedValidation: vi.fn(),
      setCompletedBookingId: vi.fn(),
      setCurrentPhase: vi.fn(),
    });

    const requestBody = submitBookingRequest.mock.calls[0][0] as any;
    expect(requestBody.trip.pickupDateTime).toBe(pickupDateTime);
  });
});
