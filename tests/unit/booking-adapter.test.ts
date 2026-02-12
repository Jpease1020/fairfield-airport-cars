import { describe, it, expect, vi, beforeEach } from 'vitest';

// We need to test the safeToISOString function which is private,
// so we'll test it through adaptOldBookingToNew
import { adaptOldBookingToNew } from '@/utils/bookingAdapter';

describe('bookingAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('adaptOldBookingToNew - pickupDateTime handling', () => {
    // This is the exact bug scenario: Firestore Timestamp with _seconds
    // that was being converted to "[object Object]" via String()
    it('should correctly parse Firestore Timestamp with _seconds (the Kim booking bug)', () => {
      const firestoreTimestamp = {
        _seconds: 1782534600, // June 27, 2026 00:30:00 UTC
        _nanoseconds: 0
      };

      const oldBooking = {
        id: '3QD7AM',
        status: 'confirmed' as const,
        trip: {
          pickup: { address: 'JFK Airport' },
          dropoff: { address: '10 Black Cherry Ln, Sandy Hook, CT' },
          pickupDateTime: firestoreTimestamp,
          fare: 249,
        },
        customer: {
          name: 'Kimberly',
          email: 'kim.coschigano@gmail.com',
          phone: '2037942017',
        },
      };

      const result = adaptOldBookingToNew(oldBooking as any);

      // The pickupDateTime should be a valid ISO string for June 27, 2026
      expect(result.trip.pickupDateTime).toBeDefined();
      expect(result.trip.pickupDateTime).not.toBe('[object Object]');
      expect(result.trip.pickupDateTime).not.toContain('Invalid');

      // Verify it's the correct date (June 27, 2026)
      const parsedDate = new Date(result.trip.pickupDateTime);
      expect(parsedDate.getFullYear()).toBe(2026);
      expect(parsedDate.getMonth()).toBe(5); // June is month 5 (0-indexed)
      expect(parsedDate.getDate()).toBe(27);
    });

    it('should correctly parse Firestore Timestamp with seconds property', () => {
      const firestoreTimestamp = {
        seconds: 1782534600, // June 27, 2026
        nanoseconds: 0
      };

      const oldBooking = {
        id: 'test-booking',
        status: 'pending' as const,
        trip: {
          pickup: { address: 'Test Pickup' },
          dropoff: { address: 'Test Dropoff' },
          pickupDateTime: firestoreTimestamp,
          fare: 100,
        },
        customer: { name: 'Test', email: 'test@test.com', phone: '1234567890' },
      };

      const result = adaptOldBookingToNew(oldBooking as any);

      const parsedDate = new Date(result.trip.pickupDateTime);
      expect(parsedDate.getFullYear()).toBe(2026);
      expect(parsedDate.getMonth()).toBe(5); // June
    });

    it('should correctly parse Date object', () => {
      const dateObj = new Date('2026-06-27T12:00:00Z');

      const oldBooking = {
        id: 'test-booking',
        status: 'pending' as const,
        trip: {
          pickup: { address: 'Test Pickup' },
          dropoff: { address: 'Test Dropoff' },
          pickupDateTime: dateObj,
          fare: 100,
        },
        customer: { name: 'Test', email: 'test@test.com', phone: '1234567890' },
      };

      const result = adaptOldBookingToNew(oldBooking as any);

      expect(result.trip.pickupDateTime).toBe('2026-06-27T12:00:00.000Z');
    });

    it('should correctly parse ISO string', () => {
      const isoString = '2026-06-27T12:00:00.000Z';

      const oldBooking = {
        id: 'test-booking',
        status: 'pending' as const,
        trip: {
          pickup: { address: 'Test Pickup' },
          dropoff: { address: 'Test Dropoff' },
          pickupDateTime: isoString,
          fare: 100,
        },
        customer: { name: 'Test', email: 'test@test.com', phone: '1234567890' },
      };

      const result = adaptOldBookingToNew(oldBooking as any);

      expect(result.trip.pickupDateTime).toBe('2026-06-27T12:00:00.000Z');
    });

    it('should correctly parse Firestore Timestamp with toDate() method', () => {
      const mockTimestamp = {
        toDate: () => new Date('2026-06-27T12:00:00Z'),
        seconds: 1782561600,
        nanoseconds: 0,
      };

      const oldBooking = {
        id: 'test-booking',
        status: 'pending' as const,
        trip: {
          pickup: { address: 'Test Pickup' },
          dropoff: { address: 'Test Dropoff' },
          pickupDateTime: mockTimestamp,
          fare: 100,
        },
        customer: { name: 'Test', email: 'test@test.com', phone: '1234567890' },
      };

      const result = adaptOldBookingToNew(oldBooking as any);

      expect(result.trip.pickupDateTime).toBe('2026-06-27T12:00:00.000Z');
    });

    it('should correctly parse Unix timestamp (number)', () => {
      const unixTimestamp = 1782561600000; // June 27, 2026 in milliseconds

      const oldBooking = {
        id: 'test-booking',
        status: 'pending' as const,
        trip: {
          pickup: { address: 'Test Pickup' },
          dropoff: { address: 'Test Dropoff' },
          pickupDateTime: unixTimestamp,
          fare: 100,
        },
        customer: { name: 'Test', email: 'test@test.com', phone: '1234567890' },
      };

      const result = adaptOldBookingToNew(oldBooking as any);

      const parsedDate = new Date(result.trip.pickupDateTime);
      expect(parsedDate.getFullYear()).toBe(2026);
      expect(parsedDate.getMonth()).toBe(5); // June
    });

    it('should fall back to root-level pickupDateTime if trip.pickupDateTime is missing', () => {
      const oldBooking = {
        id: 'test-booking',
        status: 'pending' as const,
        pickupDateTime: new Date('2026-06-27T12:00:00Z'),
        trip: {
          pickup: { address: 'Test Pickup' },
          dropoff: { address: 'Test Dropoff' },
          fare: 100,
        },
        customer: { name: 'Test', email: 'test@test.com', phone: '1234567890' },
      };

      const result = adaptOldBookingToNew(oldBooking as any);

      expect(result.trip.pickupDateTime).toBe('2026-06-27T12:00:00.000Z');
    });

    it('should return current date when pickupDateTime is null/undefined', () => {
      const beforeTest = new Date();

      const oldBooking = {
        id: 'test-booking',
        status: 'pending' as const,
        trip: {
          pickup: { address: 'Test Pickup' },
          dropoff: { address: 'Test Dropoff' },
          pickupDateTime: null,
          fare: 100,
        },
        customer: { name: 'Test', email: 'test@test.com', phone: '1234567890' },
      };

      const result = adaptOldBookingToNew(oldBooking as any);
      const afterTest = new Date();

      const parsedDate = new Date(result.trip.pickupDateTime);
      expect(parsedDate.getTime()).toBeGreaterThanOrEqual(beforeTest.getTime());
      expect(parsedDate.getTime()).toBeLessThanOrEqual(afterTest.getTime());
    });

    it('should handle invalid string dates by returning current date', () => {
      const beforeTest = new Date();

      const oldBooking = {
        id: 'test-booking',
        status: 'pending' as const,
        trip: {
          pickup: { address: 'Test Pickup' },
          dropoff: { address: 'Test Dropoff' },
          pickupDateTime: 'not-a-valid-date',
          fare: 100,
        },
        customer: { name: 'Test', email: 'test@test.com', phone: '1234567890' },
      };

      const result = adaptOldBookingToNew(oldBooking as any);
      const afterTest = new Date();

      // Should fall back to current date, not throw or return "[object Object]"
      const parsedDate = new Date(result.trip.pickupDateTime);
      expect(isNaN(parsedDate.getTime())).toBe(false);
      expect(parsedDate.getTime()).toBeGreaterThanOrEqual(beforeTest.getTime());
      expect(parsedDate.getTime()).toBeLessThanOrEqual(afterTest.getTime());
    });

    // This test verifies the bug is fixed - String() on an object returns "[object Object]"
    it('should NOT return "[object Object]" for any input type', () => {
      const testCases = [
        { _seconds: 1782534600, _nanoseconds: 0 }, // Firestore Timestamp (JSON)
        { seconds: 1782534600, nanoseconds: 0 }, // Firestore Timestamp
        { toDate: () => new Date('2026-06-27T12:00:00Z') }, // Firestore Timestamp with method
        new Date('2026-06-27T12:00:00Z'), // Date object
        '2026-06-27T12:00:00Z', // ISO string
        1782534600000, // Unix timestamp
        null, // null
        undefined, // undefined
        {}, // Empty object (edge case)
      ];

      testCases.forEach((testCase, index) => {
        const oldBooking = {
          id: `test-booking-${index}`,
          status: 'pending' as const,
          trip: {
            pickup: { address: 'Test Pickup' },
            dropoff: { address: 'Test Dropoff' },
            pickupDateTime: testCase,
            fare: 100,
          },
          customer: { name: 'Test', email: 'test@test.com', phone: '1234567890' },
        };

        const result = adaptOldBookingToNew(oldBooking as any);

        // The key assertion: never return "[object Object]"
        expect(result.trip.pickupDateTime).not.toBe('[object Object]');
        expect(result.trip.pickupDateTime).not.toContain('[object');

        // Should always be a valid ISO string
        const parsedDate = new Date(result.trip.pickupDateTime);
        expect(isNaN(parsedDate.getTime())).toBe(false);
      });
    });
  });

  describe('adaptOldBookingToNew - other fields', () => {
    it('should correctly map customer data from nested structure', () => {
      const oldBooking = {
        id: 'test-booking',
        status: 'confirmed' as const,
        trip: {
          pickup: { address: 'Test Pickup' },
          dropoff: { address: 'Test Dropoff' },
          pickupDateTime: new Date('2026-06-27T12:00:00Z'),
          fare: 249,
        },
        customer: {
          name: 'Kimberly',
          email: 'kim@example.com',
          phone: '2037942017',
          notes: 'Test notes',
          smsOptIn: true,
        },
      };

      const result = adaptOldBookingToNew(oldBooking as any);

      expect(result.customer.name).toBe('Kimberly');
      expect(result.customer.email).toBe('kim@example.com');
      expect(result.customer.phone).toBe('2037942017');
      expect(result.customer.notes).toBe('Test notes');
      expect(result.customer.smsOptIn).toBe(true);
    });

    it('should correctly map trip addresses', () => {
      const oldBooking = {
        id: 'test-booking',
        status: 'confirmed' as const,
        trip: {
          pickup: {
            address: 'JFK Airport',
            coordinates: { lat: 40.6446, lng: -73.7797 }
          },
          dropoff: {
            address: '10 Black Cherry Ln, Sandy Hook, CT',
            coordinates: { lat: 41.4269, lng: -73.2719 }
          },
          pickupDateTime: new Date('2026-06-27T12:00:00Z'),
          fare: 249,
        },
        customer: { name: 'Test', email: 'test@test.com', phone: '1234567890' },
      };

      const result = adaptOldBookingToNew(oldBooking as any);

      expect(result.trip.pickup.address).toBe('JFK Airport');
      expect(result.trip.pickup.coordinates).toEqual({ lat: 40.6446, lng: -73.7797 });
      expect(result.trip.dropoff.address).toBe('10 Black Cherry Ln, Sandy Hook, CT');
      expect(result.trip.dropoff.coordinates).toEqual({ lat: 41.4269, lng: -73.2719 });
    });

    it('should handle legacy flat structure bookings', () => {
      // Old bookings might have flat structure instead of nested
      const oldBooking = {
        id: 'legacy-booking',
        status: 'pending' as const,
        pickupLocation: 'JFK Airport',
        dropoffLocation: '10 Black Cherry Ln',
        pickupDateTime: new Date('2026-06-27T12:00:00Z'),
        fare: 249,
        name: 'Legacy Customer',
        email: 'legacy@example.com',
        phone: '1234567890',
        notes: 'Legacy notes',
      };

      const result = adaptOldBookingToNew(oldBooking as any);

      expect(result.trip.pickup.address).toBe('JFK Airport');
      expect(result.trip.dropoff.address).toBe('10 Black Cherry Ln');
      expect(result.customer.name).toBe('Legacy Customer');
      expect(result.customer.email).toBe('legacy@example.com');
    });
  });
});
