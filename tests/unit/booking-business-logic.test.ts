import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { validateBookingData, BookingData } from '@/lib/validation/booking-validation';

// Mock external dependencies
jest.mock('@/lib/services/booking-service');
jest.mock('@/lib/services/square-service');

describe('Booking Business Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Booking Validation', () => {
    it('should validate complete booking data', () => {
      const validBooking: BookingData = {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        passengers: 2
      };

      const result = validateBookingData(validBooking);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject booking with missing required fields', () => {
      const invalidBooking: BookingData = {
        name: '',
        email: 'invalid-email',
        phone: '',
        pickupLocation: '',
        dropoffLocation: '',
        pickupDateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        passengers: 0
      };

      const result = validateBookingData(invalidBooking);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name is required');
      expect(result.errors).toContain('Invalid email format');
      expect(result.errors).toContain('Phone is required');
      expect(result.errors).toContain('Pickup location is required');
      expect(result.errors).toContain('Dropoff location is required');
      expect(result.errors).toContain('Pickup date must be in the future');
      expect(result.errors).toContain('At least 1 passenger is required');
    });

    it('should validate passenger limits', () => {
      const largeGroupBooking: BookingData = {
        name: 'Large Group',
        email: 'group@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        passengers: 11
      };

      const result = validateBookingData(largeGroupBooking);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Maximum 10 passengers allowed');
    });
  });

  describe('Business Rules', () => {
    it('should validate booking time constraints', () => {
      // Test that bookings must be in the future
      const pastBooking: BookingData = {
        name: 'Past Booking',
        email: 'past@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        passengers: 1
      };

      const result = validateBookingData(pastBooking);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Pickup date must be in the future');
    });

    it('should validate email format', () => {
      const invalidEmailBooking: BookingData = {
        name: 'Invalid Email',
        email: 'invalid-email',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        passengers: 1
      };

      const result = validateBookingData(invalidEmailBooking);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    it('should validate passenger count limits', () => {
      const zeroPassengersBooking: BookingData = {
        name: 'Zero Passengers',
        email: 'zero@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        passengers: 0
      };

      const result = validateBookingData(zeroPassengersBooking);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least 1 passenger is required');
    });
  });

  describe('Business Logic Rules', () => {
    it('should enforce booking time constraints', () => {
      // Test that bookings must be in the future
      const pastBooking: BookingData = {
        name: 'Past Booking',
        email: 'past@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        passengers: 1
      };

      const result = validateBookingData(pastBooking);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Pickup date must be in the future');
    });

    it('should validate required field completeness', () => {
      const incompleteBooking: BookingData = {
        name: '',
        email: '',
        phone: '',
        pickupLocation: '',
        dropoffLocation: '',
        pickupDateTime: '',
        passengers: 0
      };

      const result = validateBookingData(incompleteBooking);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name is required');
      expect(result.errors).toContain('Email is required');
      expect(result.errors).toContain('Phone is required');
      expect(result.errors).toContain('Pickup location is required');
      expect(result.errors).toContain('Dropoff location is required');
      expect(result.errors).toContain('Pickup date and time is required');
      expect(result.errors).toContain('At least 1 passenger is required');
    });
  });
}); 