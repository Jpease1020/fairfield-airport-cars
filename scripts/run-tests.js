#!/usr/bin/env node

// Simple test runner for critical business logic
// No external dependencies, fast and reliable

const { validateBookingData } = require('../src/lib/booking-validation.ts');

function describe(name, fn) {
  console.log(`\n🧪 ${name}`);
  fn();
}

function test(name, fn) {
  console.log(`  ✓ ${name}`);
  try {
    fn();
    console.log(`    ✅ PASS`);
  } catch (error) {
    console.log(`    ❌ FAIL: ${error.message}`);
  }
}

function expect(value) {
  return {
    toBe(expected) {
      if (value !== expected) {
        throw new Error(`Expected ${value} to be ${expected}`);
      }
    },
    toContain(expected) {
      if (!value.includes(expected)) {
        throw new Error(`Expected ${value} to contain ${expected}`);
      }
    }
  };
}

// Run booking validation tests
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
});

console.log('\n🎉 All tests completed!'); 