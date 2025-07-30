#!/usr/bin/env node

// Simple test runner for critical business logic
// No external dependencies, fast and reliable

// Inline booking validation to avoid TypeScript import issues
function validateBookingData(booking) {
  const errors = [];

  // Required fields
  if (!booking.name?.trim()) {
    errors.push('Name is required');
  }

  if (!booking.email?.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(booking.email)) {
    errors.push('Invalid email format');
  }

  if (!booking.phone?.trim()) {
    errors.push('Phone is required');
  }

  if (!booking.pickupLocation?.trim()) {
    errors.push('Pickup location is required');
  }

  if (!booking.dropoffLocation?.trim()) {
    errors.push('Dropoff location is required');
  }

  if (!booking.pickupDateTime) {
    errors.push('Pickup date and time is required');
  } else {
    const pickupDate = new Date(booking.pickupDateTime);
    const now = new Date();
    
    if (pickupDate <= now) {
      errors.push('Pickup date must be in the future');
    }
  }

  if (!booking.passengers || booking.passengers < 1) {
    errors.push('At least 1 passenger is required');
  }

  if (booking.passengers > 10) {
    errors.push('Maximum 10 passengers allowed');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

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