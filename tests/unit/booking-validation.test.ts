// Simple unit tests for critical business logic
// These are fast, reliable, and catch real bugs

import { validateBookingData } from '../../src/lib/booking-validation';

// Simple test runner - no external dependencies
function describe(name: string, fn: () => void) {
  console.log(`\n🧪 ${name}`);
  fn();
}

function test(name: string, fn: () => void) {
  console.log(`  ✓ ${name}`);
  fn();
}

function expect(value: any) {
  return {
    toBe(expected: any) {
      if (value !== expected) {
        throw new Error(`Expected ${value} to be ${expected}`);
      }
    },
    toContain(expected: any) {
      if (!value.includes(expected)) {
        throw new Error(`Expected ${value} to contain ${expected}`);
      }
    }
  };
}

describe('Booking Validation', () => {
  test('validates required fields', () => {
    const validBooking = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-123-4567',
      pickupLocation: 'Fairfield Station',
      dropoffLocation: 'JFK Airport',
      pickupDateTime: '2024-12-25T10:00',
      passengers: 2
    };

    const result = validateBookingData(validBooking);
    expect(result.isValid).toBe(true);
  });

  test('rejects missing required fields', () => {
    const invalidBooking = {
      name: '',
      email: 'john@example.com',
      phone: '555-123-4567',
      pickupLocation: 'Fairfield Station',
      dropoffLocation: 'JFK Airport',
      pickupDateTime: '2024-12-25T10:00',
      passengers: 2
    };

    const result = validateBookingData(invalidBooking);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Name is required');
  });

  test('validates email format', () => {
    const invalidBooking = {
      name: 'John Doe',
      email: 'invalid-email',
      phone: '555-123-4567',
      pickupLocation: 'Fairfield Station',
      dropoffLocation: 'JFK Airport',
      pickupDateTime: '2024-12-25T10:00',
      passengers: 2
    };

    const result = validateBookingData(invalidBooking);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid email format');
  });

  test('validates pickup date is in future', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    
    const invalidBooking = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-123-4567',
      pickupLocation: 'Fairfield Station',
      dropoffLocation: 'JFK Airport',
      pickupDateTime: pastDate.toISOString(),
      passengers: 2
    };

    const result = validateBookingData(invalidBooking);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Pickup date must be in the future');
  });
}); 