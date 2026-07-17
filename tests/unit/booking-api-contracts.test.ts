import { describe, it, expect } from 'vitest';
import { submitBookingRequestSchema } from '@/lib/contracts/booking-api';

const basePayload = {
  fare: 120,
  customer: {
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '2035551234',
  },
  trip: {
    pickup: {
      address: 'Fairfield Station, Fairfield, CT',
      coordinates: { lat: 41.1408, lng: -73.2613 },
    },
    dropoff: {
      address: 'JFK Airport, Queens, NY',
      coordinates: { lat: 40.6413, lng: -73.7781 },
    },
    pickupDateTime: '2028-03-01T10:00:00.000Z',
    fareType: 'personal' as const,
  },
};

describe('submitBookingRequestSchema', () => {
  it('accepts the base payload', () => {
    expect(submitBookingRequestSchema.safeParse(basePayload).success).toBe(true);
  });

  it('rejects a phone number that is not a valid US phone (regression: only min(1) was checked at submit, so any non-empty garbage string passed server-side even though the UI validates format)', () => {
    const result = submitBookingRequestSchema.safeParse({
      ...basePayload,
      customer: { ...basePayload.customer, phone: 'not-a-phone' },
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid 10-digit and 11-digit (leading 1) US phone numbers', () => {
    expect(
      submitBookingRequestSchema.safeParse({
        ...basePayload,
        customer: { ...basePayload.customer, phone: '2035551234' },
      }).success
    ).toBe(true);
    expect(
      submitBookingRequestSchema.safeParse({
        ...basePayload,
        customer: { ...basePayload.customer, phone: '12035551234' },
      }).success
    ).toBe(true);
  });

  it('trims a phone number with surrounding whitespace before storing it (regression: name/email were trimmed but phone was not, so a stray leading/trailing space would be stored as-is and could later cause a false "phone changed" comparison against a subsequent trimmed value)', () => {
    const result = submitBookingRequestSchema.safeParse({
      ...basePayload,
      customer: { ...basePayload.customer, phone: '  2035551234  ' },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customer.phone).toBe('2035551234');
    }
  });

  it('rejects a whitespace-only customer name (regression: z.string().min(1) counts whitespace characters, so "   " passed)', () => {
    const result = submitBookingRequestSchema.safeParse({
      ...basePayload,
      customer: { ...basePayload.customer, name: '   ' },
    });
    expect(result.success).toBe(false);
  });

  it('trims a customer name with surrounding whitespace instead of rejecting or storing it as-is', () => {
    const result = submitBookingRequestSchema.safeParse({
      ...basePayload,
      customer: { ...basePayload.customer, name: '  Jane Doe  ' },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customer.name).toBe('Jane Doe');
    }
  });

  it('accepts an email with surrounding whitespace by trimming it (regression: validate-phase trims before checking format, but submit did not, so a value that passed phase validation could be rejected at the final submit step)', () => {
    const result = submitBookingRequestSchema.safeParse({
      ...basePayload,
      customer: { ...basePayload.customer, email: '  jane@example.com  ' },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customer.email).toBe('jane@example.com');
    }
  });

  it('normalizes hasFlight to false when true but every flight detail field is blank, instead of rejecting the submission (regression: hasFlight:true with all-blank fields used to pass through unchanged, producing a driver notification that just says "Airline: N/A / Flight#: N/A / Time: N/A" — flight info is explicitly optional in the UI, so this should not be a hard validation error)', () => {
    const result = submitBookingRequestSchema.safeParse({
      ...basePayload,
      trip: {
        ...basePayload.trip,
        flightInfo: {
          hasFlight: true,
          airline: '',
          flightNumber: '',
          arrivalTime: '',
          terminal: '',
        },
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.trip.flightInfo?.hasFlight).toBe(false);
    }
  });

  it('keeps hasFlight true when at least one flight detail field is provided, even if others are blank (partial info is still useful to the driver)', () => {
    const result = submitBookingRequestSchema.safeParse({
      ...basePayload,
      trip: {
        ...basePayload.trip,
        flightInfo: {
          hasFlight: true,
          airline: 'Delta',
          flightNumber: 'DL123',
          arrivalTime: '14:30',
          terminal: '',
        },
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.trip.flightInfo?.hasFlight).toBe(true);
    }
  });

  it('accepts flightInfo with hasFlight false and all fields blank', () => {
    const result = submitBookingRequestSchema.safeParse({
      ...basePayload,
      trip: {
        ...basePayload.trip,
        flightInfo: {
          hasFlight: false,
          airline: '',
          flightNumber: '',
          arrivalTime: '',
          terminal: '',
        },
      },
    });
    expect(result.success).toBe(true);
  });
});
