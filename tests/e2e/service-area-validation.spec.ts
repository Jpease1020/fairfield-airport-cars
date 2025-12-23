/**
 * Service Area Validation Tests
 * 
 * Tests the geographic service area restrictions and airport requirements
 * for booking quotes and submissions.
 */

import { test, expect } from '@playwright/test';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

test.describe('Service Area Validation', () => {
  const futurePickupTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  test('Valid trip within service area with airport should succeed', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/booking/quote`, {
      data: {
        origin: 'Fairfield Station, Fairfield, CT',
        destination: 'JFK Airport, Queens, NY',
        pickupCoords: { lat: 41.1408, lng: -73.2613 },
        dropoffCoords: { lat: 40.6413, lng: -73.7781 },
        fareType: 'personal',
        pickupTime: futurePickupTime,
        sessionId: 'test_valid_trip'
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('fare');
    expect(data.fare).toBeGreaterThan(0);
  });

  test('Trip without airport endpoint should return MISSING_AIRPORT_ENDPOINT', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/booking/quote`, {
      data: {
        origin: 'Fairfield Station, Fairfield, CT',
        destination: 'Fairfield University, Fairfield, CT',
        pickupCoords: { lat: 41.1408, lng: -73.2613 },
        dropoffCoords: { lat: 41.1415, lng: -73.2620 },
        fareType: 'personal',
        pickupTime: futurePickupTime,
        sessionId: 'test_missing_airport'
      }
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.code).toBe('MISSING_AIRPORT_ENDPOINT');
    expect(data.error).toContain('airport');
  });

  test('Trip completely out of service area should return OUT_OF_SERVICE_HARD', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/booking/quote`, {
      data: {
        origin: 'Miami, FL',
        destination: 'Dallas, TX',
        pickupCoords: { lat: 25.7617, lng: -80.1918 }, // Miami
        dropoffCoords: { lat: 32.7767, lng: -96.7970 }, // Dallas
        fareType: 'personal',
        pickupTime: futurePickupTime,
        sessionId: 'test_hard_block'
      }
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.code).toBe('OUT_OF_SERVICE_HARD');
    expect(data.error).toContain('not able to serve');
  });

  test('Booking submit validates service area', async ({ request }) => {
    // Try to submit a booking without an airport
    const response = await request.post(`${API_BASE_URL}/api/booking/submit`, {
      data: {
        fare: 50,
        customer: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '2035551234',
          notes: ''
        },
        trip: {
          pickup: {
            address: 'Fairfield Station, Fairfield, CT',
            coordinates: { lat: 41.1408, lng: -73.2613 }
          },
          dropoff: {
            address: 'Fairfield University, Fairfield, CT',
            coordinates: { lat: 41.1415, lng: -73.2620 }
          },
          pickupDateTime: futurePickupTime,
          fareType: 'personal'
        }
      }
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.code).toBe('MISSING_AIRPORT_ENDPOINT');
  });

  test('Valid trip with different airports should succeed', async ({ request }) => {
    const airports = [
      { name: 'JFK', coords: { lat: 40.6413, lng: -73.7781 } },
      { name: 'LGA', coords: { lat: 40.7769, lng: -73.8740 } },
      { name: 'EWR', coords: { lat: 40.6895, lng: -74.1745 } },
      { name: 'BDL', coords: { lat: 41.9389, lng: -72.6831 } },
      { name: 'HVN', coords: { lat: 41.2639, lng: -72.8867 } },
      { name: 'HPN', coords: { lat: 41.0670, lng: -73.7076 } },
    ];

    for (const airport of airports) {
      const response = await request.post(`${API_BASE_URL}/api/booking/quote`, {
        data: {
          origin: 'Fairfield Station, Fairfield, CT',
          destination: `${airport.name} Airport`,
          pickupCoords: { lat: 41.1408, lng: -73.2613 },
          dropoffCoords: airport.coords,
          fareType: 'personal',
          pickupTime: futurePickupTime,
          sessionId: `test_${airport.name.toLowerCase()}`
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.fare).toBeGreaterThan(0);
    }
  });

  test('Reverse trip (airport to home) should succeed', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/booking/quote`, {
      data: {
        origin: 'JFK Airport, Queens, NY',
        destination: 'Fairfield Station, Fairfield, CT',
        pickupCoords: { lat: 40.6413, lng: -73.7781 },
        dropoffCoords: { lat: 41.1408, lng: -73.2613 },
        fareType: 'personal',
        pickupTime: futurePickupTime,
        sessionId: 'test_reverse_trip'
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.fare).toBeGreaterThan(0);
  });
});

test.describe('Service Area Validation - Edge Cases', () => {
  const futurePickupTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  test('Trip with coordinates but no address text should still validate', async ({ request }) => {
    // Test that coordinates are used for validation even if address text is minimal
    const response = await request.post(`${API_BASE_URL}/api/booking/quote`, {
      data: {
        origin: 'Fairfield, CT',
        destination: 'JFK',
        pickupCoords: { lat: 41.1408, lng: -73.2613 },
        dropoffCoords: { lat: 40.6413, lng: -73.7781 },
        fareType: 'personal',
        pickupTime: futurePickupTime,
        sessionId: 'test_minimal_address'
      }
    });

    // Should succeed because coordinates indicate valid locations
    expect(response.status()).toBe(200);
  });

  test('Trip with missing coordinates should still validate using address text', async ({ request }) => {
    // Test that address text is used for airport detection when coordinates missing
    const response = await request.post(`${API_BASE_URL}/api/booking/quote`, {
      data: {
        origin: 'Fairfield Station, Fairfield, CT',
        destination: 'John F. Kennedy International Airport, Queens, NY',
        fareType: 'personal',
        pickupTime: futurePickupTime,
        sessionId: 'test_address_only'
      }
    });

    // Should succeed because "International Airport" in address indicates airport
    expect(response.status()).toBe(200);
  });
});

