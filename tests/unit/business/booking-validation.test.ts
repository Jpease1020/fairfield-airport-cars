import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { validateBookingData } from '@/lib/validation/booking-validation';

describe('Booking Validation - Business Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Required Fields Validation', () => {
    it('validates all required fields are present', () => {
      const validBooking = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: '2024-12-25T10:00',
        passengers: 2
      };

      const result = validateBookingData(validBooking);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects booking with missing required fields', () => {
      const invalidBooking = {
        name: '',
        email: '',
        phone: '',
        pickupLocation: '',
        dropoffLocation: '',
        pickupDateTime: '',
        passengers: 0
      };

      const result = validateBookingData(invalidBooking);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('name'))).toBe(true);
      expect(result.errors.some(error => error.includes('email'))).toBe(true);
      expect(result.errors.some(error => error.includes('phone'))).toBe(true);
    });
  });

  describe('Email Validation', () => {
    it('accepts valid email formats', () => {
      const validEmails = [
        'john@example.com',
        'jane.doe@company.co.uk',
        'user+tag@domain.org',
        'test123@test-domain.net'
      ];

      validEmails.forEach(email => {
        const booking = {
          name: 'John Smith',
          email,
          phone: '203-555-0123',
          pickupLocation: 'Fairfield Station',
          dropoffLocation: 'JFK Airport',
          pickupDateTime: '2024-12-25T10:00',
          passengers: 2
        };

        const result = validateBookingData(booking);
        expect(result.isValid).toBe(true);
      });
    });

    it('rejects invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'john@',
        'john.example.com',
        'john@.com',
        'john@example.',
        'john example@domain.com'
      ];

      invalidEmails.forEach(email => {
        const booking = {
          name: 'John Smith',
          email,
          phone: '203-555-0123',
          pickupLocation: 'Fairfield Station',
          dropoffLocation: 'JFK Airport',
          pickupDateTime: '2024-12-25T10:00',
          passengers: 2
        };

        const result = validateBookingData(booking);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('email'))).toBe(true);
      });
    });
  });

  describe('Phone Number Validation', () => {
    it('accepts valid phone number formats', () => {
      const validPhones = [
        '203-555-0123',
        '(203) 555-0123',
        '203.555.0123',
        '203 555 0123',
        '+1-203-555-0123',
        '1-203-555-0123'
      ];

      validPhones.forEach(phone => {
        const booking = {
          name: 'John Smith',
          email: 'john@example.com',
          phone,
          pickupLocation: 'Fairfield Station',
          dropoffLocation: 'JFK Airport',
          pickupDateTime: '2024-12-25T10:00',
          passengers: 2
        };

        const result = validateBookingData(booking);
        expect(result.isValid).toBe(true);
      });
    });

    it('rejects invalid phone number formats', () => {
      const invalidPhones = [
        '123',
        'abc-def-ghij',
        '203-555',
        '203-555-0123-456',
        '203-555-012',
        '203-555-01234'
      ];

      invalidPhones.forEach(phone => {
        const booking = {
          name: 'John Smith',
          email: 'john@example.com',
          phone,
          pickupLocation: 'Fairfield Station',
          dropoffLocation: 'JFK Airport',
          pickupDateTime: '2024-12-25T10:00',
          passengers: 2
        };

        const result = validateBookingData(booking);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('phone'))).toBe(true);
      });
    });
  });

  describe('Date and Time Validation', () => {
    it('accepts future pickup dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      const booking = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: futureDate.toISOString(),
        passengers: 2
      };

      const result = validateBookingData(booking);
      expect(result.isValid).toBe(true);
    });

    it('rejects past pickup dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      const booking = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: pastDate.toISOString(),
        passengers: 2
      };

      const result = validateBookingData(booking);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('future'))).toBe(true);
    });

    it('rejects same-day bookings too close to pickup time', () => {
      const now = new Date();
      const tooClose = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
      
      const booking = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: tooClose.toISOString(),
        passengers: 2
      };

      const result = validateBookingData(booking);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('advance'))).toBe(true);
    });
  });

  describe('Passenger Count Validation', () => {
    it('accepts reasonable passenger counts', () => {
      const validPassengerCounts = [1, 2, 3, 4, 5, 6, 7, 8];

      validPassengerCounts.forEach(passengers => {
        const booking = {
          name: 'John Smith',
          email: 'john@example.com',
          phone: '203-555-0123',
          pickupLocation: 'Fairfield Station',
          dropoffLocation: 'JFK Airport',
          pickupDateTime: '2024-12-25T10:00',
          passengers
        };

        const result = validateBookingData(booking);
        expect(result.isValid).toBe(true);
      });
    });

    it('rejects invalid passenger counts', () => {
      const invalidPassengerCounts = [0, -1, 15, 100];

      invalidPassengerCounts.forEach(passengers => {
        const booking = {
          name: 'John Smith',
          email: 'john@example.com',
          phone: '203-555-0123',
          pickupLocation: 'Fairfield Station',
          dropoffLocation: 'JFK Airport',
          pickupDateTime: '2024-12-25T10:00',
          passengers
        };

        const result = validateBookingData(booking);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('passenger'))).toBe(true);
      });
    });
  });

  describe('Location Validation', () => {
    it('accepts valid pickup and dropoff locations', () => {
      const booking = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station, Fairfield, CT',
        dropoffLocation: 'JFK Airport, Queens, NY',
        pickupDateTime: '2024-12-25T10:00',
        passengers: 2
      };

      const result = validateBookingData(booking);
      expect(result.isValid).toBe(true);
    });

    it('rejects empty or invalid locations', () => {
      const invalidLocations = [
        { pickupLocation: '', dropoffLocation: 'JFK Airport' },
        { pickupLocation: 'Fairfield Station', dropoffLocation: '' },
        { pickupLocation: 'A', dropoffLocation: 'B' }, // Too short
        { pickupLocation: 'Same Location', dropoffLocation: 'Same Location' } // Same location
      ];

      invalidLocations.forEach(({ pickupLocation, dropoffLocation }) => {
        const booking = {
          name: 'John Smith',
          email: 'john@example.com',
          phone: '203-555-0123',
          pickupLocation,
          dropoffLocation,
          pickupDateTime: '2024-12-25T10:00',
          passengers: 2
        };

        const result = validateBookingData(booking);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(error => error.includes('location'))).toBe(true);
      });
    });
  });

  describe('Business Rules Validation', () => {
    it('enforces minimum booking notice', () => {
      const now = new Date();
      const tooSoon = new Date(now.getTime() + 45 * 60 * 1000); // 45 minutes from now
      
      const booking = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: tooSoon.toISOString(),
        passengers: 2
      };

      const result = validateBookingData(booking);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('advance'))).toBe(true);
    });

    it('enforces maximum booking advance', () => {
      const tooFar = new Date();
      tooFar.setDate(tooFar.getDate() + 91); // 91 days from now
      
      const booking = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: tooFar.toISOString(),
        passengers: 2
      };

      const result = validateBookingData(booking);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('advance'))).toBe(true);
    });

    it('validates service area restrictions', () => {
      const outOfAreaBooking = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Los Angeles, CA',
        dropoffLocation: 'San Francisco, CA',
        pickupDateTime: '2024-12-25T10:00',
        passengers: 2
      };

      const result = validateBookingData(outOfAreaBooking);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(error => error.includes('service area'))).toBe(true);
    });
  });
}); 