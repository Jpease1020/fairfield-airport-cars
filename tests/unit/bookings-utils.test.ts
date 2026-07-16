import { describe, it, expect } from 'vitest';
import {
  getFlightNumber,
  getPickupAddress,
  getDropoffAddress,
  getCustomerName,
  getBookingFare,
} from '@/app/(admin)/admin/bookings/bookings-utils';
import type { Booking } from '@/lib/services/database-service';

describe('bookings-utils accessors', () => {
  it('getFlightNumber reads the nested trip.flightInfo.flightNumber for modern bookings (regression: admin table used to read only the flat field, which is never populated at booking creation)', () => {
    const booking = {
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date(),
      trip: {
        pickup: { address: '123 Main St' },
        dropoff: { address: 'JFK' },
        pickupDateTime: new Date(),
        flightInfo: { hasFlight: true, airline: 'Delta', flightNumber: 'DL123', arrivalTime: '', terminal: '4' },
      },
      // Flat legacy field intentionally absent, matching a real booking created through the
      // normal submit flow (createBookingAtomic never populates it at creation time).
    } as unknown as Booking;

    expect(getFlightNumber(booking)).toBe('DL123');
  });

  it('getFlightNumber falls back to the legacy flat field for pre-migration bookings', () => {
    const booking = {
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date(),
      flightNumber: 'AA456',
    } as unknown as Booking;

    expect(getFlightNumber(booking)).toBe('AA456');
  });

  it('getFlightNumber returns empty string when neither shape has flight info', () => {
    const booking = {
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as Booking;

    expect(getFlightNumber(booking)).toBe('');
  });

  it('other accessors continue to prefer the nested shape (existing behavior, unaffected by the type change)', () => {
    const booking = {
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date(),
      trip: {
        pickup: { address: '123 Main St' },
        dropoff: { address: 'JFK' },
        pickupDateTime: new Date(),
        fare: 150,
      },
      customer: { name: 'Jane Doe', email: 'jane@example.com', phone: '+12035550123' },
    } as unknown as Booking;

    expect(getPickupAddress(booking)).toBe('123 Main St');
    expect(getDropoffAddress(booking)).toBe('JFK');
    expect(getCustomerName(booking)).toBe('Jane Doe');
    expect(getBookingFare(booking)).toBe(150);
  });
});
