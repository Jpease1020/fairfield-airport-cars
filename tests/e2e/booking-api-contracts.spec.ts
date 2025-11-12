/**
 * API Contract Tests
 * 
 * These tests verify the API contracts work as expected with real data.
 * Fast, reliable, and tests the actual business logic.
 * 
 * Goal: Ensure APIs work correctly for real user scenarios.
 */

import { test, expect } from '@playwright/test';

// Real test data that represents actual user requests
const REAL_API_SCENARIOS = {
  fairfieldToJFK: {
    origin: 'Fairfield Station, Fairfield, CT',
    destination: 'JFK Airport, Queens, NY',
    pickupCoords: { lat: 41.1408, lng: -73.2613 },
    dropoffCoords: { lat: 40.6413, lng: -73.7781 },
    fareType: 'personal' as const,
    expectedFareRange: { min: 80, max: 150 }
  },
  jfkToFairfield: {
    origin: 'JFK Airport, Queens, NY',
    destination: 'Fairfield Station, Fairfield, CT',
    pickupCoords: { lat: 40.6413, lng: -73.7781 },
    dropoffCoords: { lat: 41.1408, lng: -73.2613 },
    fareType: 'personal' as const,
    expectedFareRange: { min: 140, max: 260 }
  },
  businessTrip: {
    origin: '123 Main St, Fairfield, CT',
    destination: 'JFK Airport, Queens, NY',
    pickupCoords: { lat: 41.1408, lng: -73.2613 },
    dropoffCoords: { lat: 40.6413, lng: -73.7781 },
    fareType: 'business' as const,
    expectedFareRange: { min: 90, max: 160 }
  },
  shortTrip: {
    origin: 'Fairfield Station, Fairfield, CT',
    destination: 'Fairfield University, Fairfield, CT',
    pickupCoords: { lat: 41.1408, lng: -73.2613 },
    dropoffCoords: { lat: 41.1415, lng: -73.2620 },
    fareType: 'personal' as const,
    expectedFareRange: { min: 15, max: 35 }
  }
};

// Test 1: Quote API Returns Valid Data
test('Quote API returns valid fare for real routes', async ({ request }) => {
  const scenario = REAL_API_SCENARIOS.fairfieldToJFK;
  
  const response = await request.post('/api/booking/quote', {
    data: {
      origin: scenario.origin,
      destination: scenario.destination,
      pickupCoords: scenario.pickupCoords,
      dropoffCoords: scenario.dropoffCoords,
      fareType: scenario.fareType,
      sessionId: 'test_session_real_route'
    }
  });

  expect(response.status()).toBe(200);
  
  const data = await response.json();
  
  // Verify response structure
  expect(data).toHaveProperty('fare');
  expect(data).toHaveProperty('distanceMiles');
  expect(data).toHaveProperty('durationMinutes');
  expect(data).toHaveProperty('fareType');
  expect(data).toHaveProperty('expiresAt');
  expect(data).toHaveProperty('expiresInMinutes');
  
  // Verify data types
  expect(typeof data.fare).toBe('number');
  expect(typeof data.distanceMiles).toBe('number');
  expect(typeof data.durationMinutes).toBe('number');
  expect(typeof data.fareType).toBe('string');
  expect(typeof data.expiresAt).toBe('string');
  expect(typeof data.expiresInMinutes).toBe('number');
  
  // Verify fare is reasonable
  expect(data.fare).toBeGreaterThanOrEqual(scenario.expectedFareRange.min);
  expect(data.fare).toBeLessThanOrEqual(scenario.expectedFareRange.max);
  
  // Verify distance is reasonable (Fairfield to JFK is ~42 miles)
  expect(data.distanceMiles).toBeGreaterThan(35);
  expect(data.distanceMiles).toBeLessThan(50);
  
  // Verify duration is reasonable (1-2 hours)
  expect(data.durationMinutes).toBeGreaterThan(45);
  expect(data.durationMinutes).toBeLessThan(120);
  
  // Verify expiration is 15 minutes
  expect(data.expiresInMinutes).toBe(15);
  
  // Verify expiration time is in the future
  const expiresAt = new Date(data.expiresAt);
  const now = new Date();
  expect(expiresAt.getTime()).toBeGreaterThan(now.getTime());
});

// Test 2: Business vs Personal Fare Difference
test('Business fares are higher than personal fares for same route', async ({ request }) => {
  const baseScenario = REAL_API_SCENARIOS.fairfieldToJFK;
  
  // Get personal fare
  const personalResponse = await request.post('/api/booking/quote', {
    data: {
      ...baseScenario,
      fareType: 'personal',
      sessionId: 'test_personal_fare'
    }
  });
  
  // Get business fare
  const businessResponse = await request.post('/api/booking/quote', {
    data: {
      ...baseScenario,
      fareType: 'business',
      sessionId: 'test_business_fare'
    }
  });
  
  expect(personalResponse.status()).toBe(200);
  expect(businessResponse.status()).toBe(200);
  
  const personalData = await personalResponse.json();
  const businessData = await businessResponse.json();
  
  // Business fare should be higher (or equal)
  expect(businessData.fare).toBeGreaterThanOrEqual(personalData.fare);
  
  // Should be significantly different (at least 10% higher for business)
  const difference = (businessData.fare - personalData.fare) / personalData.fare;
  expect(difference).toBeGreaterThanOrEqual(0.1);
});

// Test 3: Airport Return Multiplier
test('Airport return rides apply airport multiplier', async ({ request }) => {
  const toAirportScenario = REAL_API_SCENARIOS.fairfieldToJFK;
  const fromAirportScenario = REAL_API_SCENARIOS.jfkToFairfield;

  const toAirportResponse = await request.post('/api/booking/quote', {
    data: {
      ...toAirportScenario,
      sessionId: 'test_to_airport_multiplier'
    }
  });

  const fromAirportResponse = await request.post('/api/booking/quote', {
    data: {
      ...fromAirportScenario,
      sessionId: 'test_from_airport_multiplier'
    }
  });

  expect(toAirportResponse.status()).toBe(200);
  expect(fromAirportResponse.status()).toBe(200);

  const toAirportData = await toAirportResponse.json();
  const fromAirportData = await fromAirportResponse.json();

  expect(fromAirportData.fare).toBeGreaterThan(toAirportData.fare);

  const ratio = fromAirportData.fare / toAirportData.fare;
  expect(ratio).toBeGreaterThanOrEqual(1.7);
  expect(ratio).toBeLessThanOrEqual(2.1);
});

// Test 4: Short vs Long Distance Pricing
test('Longer routes cost more than shorter routes', async ({ request }) => {
  const longRoute = REAL_API_SCENARIOS.fairfieldToJFK;
  const shortRoute = REAL_API_SCENARIOS.shortTrip;
  
  // Get long route fare
  const longResponse = await request.post('/api/booking/quote', {
    data: {
      ...longRoute,
      sessionId: 'test_long_route'
    }
  });
  
  // Get short route fare
  const shortResponse = await request.post('/api/booking/quote', {
    data: {
      ...shortRoute,
      sessionId: 'test_short_route'
    }
  });
  
  expect(longResponse.status()).toBe(200);
  expect(shortResponse.status()).toBe(200);
  
  const longData = await longResponse.json();
  const shortData = await shortResponse.json();
  
  // Long route should cost more
  expect(longData.fare).toBeGreaterThan(shortData.fare);
  
  // Long route should have more distance
  expect(longData.distanceMiles).toBeGreaterThan(shortData.distanceMiles);
  
  // Long route should take more time
  expect(longData.durationMinutes).toBeGreaterThan(shortData.durationMinutes);
});

// Test 5: Quote Validation on Booking Submission
test('Valid quote allows booking submission', async ({ request }) => {
  const scenario = REAL_API_SCENARIOS.fairfieldToJFK;
  
  // First create a quote
  const quoteResponse = await request.post('/api/booking/quote', {
    data: {
      ...scenario,
      sessionId: 'test_booking_submission'
    }
  });
  
  expect(quoteResponse.status()).toBe(200);
  const quoteData = await quoteResponse.json();
  
  // Submit booking with valid quote
  const bookingResponse = await request.post('/api/booking/submit', {
    data: {
      fare: quoteData.fare,
      customer: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-123-4567',
        notes: 'Test booking'
      },
      trip: {
        pickup: {
          address: scenario.origin,
          coordinates: scenario.pickupCoords
        },
        dropoff: {
          address: scenario.destination,
          coordinates: scenario.dropoffCoords
        },
        pickupDateTime: new Date('2024-12-25T10:00:00'),
        fareType: scenario.fareType
      }
    }
  });
  
  expect(bookingResponse.status()).toBe(200);
  
  const bookingData = await bookingResponse.json();
  expect(bookingData).toHaveProperty('success', true);
  expect(bookingData).toHaveProperty('bookingId');
  expect(typeof bookingData.bookingId).toBe('string');
});

// Test 6: Invalid Input Handling
test('API handles invalid inputs gracefully', async ({ request }) => {
  // Test missing required fields
  const missingFieldsResponse = await request.post('/api/booking/quote', {
    data: {
      // Missing origin and destination
      fareType: 'personal',
      sessionId: 'test_missing_fields'
    }
  });
  
  expect(missingFieldsResponse.status()).toBe(400);
  
  // Test invalid fare type
  const invalidFareTypeResponse = await request.post('/api/booking/quote', {
    data: {
      origin: 'Fairfield Station, Fairfield, CT',
      destination: 'JFK Airport, Queens, NY',
      pickupCoords: { lat: 41.1408, lng: -73.2613 },
      dropoffCoords: { lat: 40.6413, lng: -73.7781 },
      fareType: 'invalid_type',
      sessionId: 'test_invalid_fare_type'
    }
  });
  
  expect(invalidFareTypeResponse.status()).toBe(400);
  
  // Test invalid coordinates
  const invalidCoordsResponse = await request.post('/api/booking/quote', {
    data: {
      origin: 'Fairfield Station, Fairfield, CT',
      destination: 'JFK Airport, Queens, NY',
      pickupCoords: { lat: 999, lng: 999 }, // Invalid coordinates
      dropoffCoords: { lat: 40.6413, lng: -73.7781 },
      fareType: 'personal',
      sessionId: 'test_invalid_coords'
    }
  });
  
  // Should either work (with fallback) or return specific error
  expect([200, 400, 503]).toContain(invalidCoordsResponse.status());
});

// Test 7: Rate Limiting and Performance
test('API responds within acceptable time limits', async ({ request }) => {
  const scenario = REAL_API_SCENARIOS.fairfieldToJFK;
  
  const startTime = Date.now();
  
  const response = await request.post('/api/booking/quote', {
    data: {
      ...scenario,
      sessionId: 'test_performance'
    }
  });
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  expect(response.status()).toBe(200);
  
  // Should respond within 5 seconds
  expect(duration).toBeLessThan(5000);
  
  // Should respond within 2 seconds for good UX
  expect(duration).toBeLessThan(2000);
});

// Test 8: Concurrent Requests
test('API handles multiple concurrent requests', async ({ request }) => {
  const scenario = REAL_API_SCENARIOS.fairfieldToJFK;
  
  // Send 5 concurrent requests
  const promises = Array.from({ length: 5 }, (_, i) => 
    request.post('/api/booking/quote', {
      data: {
        ...scenario,
        sessionId: `test_concurrent_${i}`
      }
    })
  );
  
  const responses = await Promise.all(promises);
  
  // All should succeed
  responses.forEach(response => {
    expect(response.status()).toBe(200);
  });
  
  // All should return valid data
  const dataPromises = responses.map(response => response.json());
  const allData = await Promise.all(dataPromises);
  
  allData.forEach(data => {
    expect(data).toHaveProperty('fare');
    expect(data).toHaveProperty('distanceMiles');
    expect(data).toHaveProperty('durationMinutes');
    expect(typeof data.fare).toBe('number');
    expect(data.fare).toBeGreaterThan(0);
  });
});
