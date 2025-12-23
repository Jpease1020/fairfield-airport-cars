import { test, expect } from '@playwright/test';

/**
 * Local API Test for Booking Submit Endpoint
 * 
 * This test validates the booking submit endpoint works correctly locally
 * and will work in production. It specifically tests:
 * 
 * 1. Firebase Admin initialization
 * 2. Transaction timeout prevention (moved client SDK calls outside transaction)
 * 3. Booking creation flow
 * 4. Error handling
 * 
 * Run with: BASE_URL=http://localhost:3000 npm run test:e2e -- tests/e2e/booking-submit-api.spec.ts
 * 
 * Prerequisites:
 * - Firebase emulators running (npm run firebase:emulators)
 * - Dev server running (npm run dev)
 * - NEXT_PUBLIC_USE_EMULATORS=true in .env.local
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Booking Submit API - Local Validation', () => {
  test('Submit endpoint validates Firebase Admin initialization', async ({ request }) => {
    // Test that endpoint fails gracefully if Firebase Admin not initialized
    // This should return 500 with clear error message
    const response = await request.post(`${BASE_URL}/api/booking/submit`, {
      data: {
        fare: 100,
        customer: { name: 'Test', email: 'test@test.com', phone: '1234567890' },
        trip: {
          pickup: { address: 'Test Pickup', coordinates: { lat: 41.1, lng: -73.2 } },
          dropoff: { address: 'Test Dropoff', coordinates: { lat: 41.2, lng: -73.3 } },
          pickupDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          fareType: 'personal'
        }
      }
    });

    // Should not be 500 with "Firebase Admin not initialized" error
    if (response.status() === 500) {
      const error = await response.json();
      if (error.details && error.details.includes('Firebase Admin not initialized')) {
        throw new Error('❌ Firebase Admin not initialized. Check environment variables.');
      }
    }

    // Should be 400 (validation) or 200 (success), not 500 (server error)
    expect([200, 400]).toContain(response.status());
    console.log('✅ Firebase Admin initialization check passed');
  });

  test('Submit endpoint completes within timeout limit', async ({ request }) => {
    const startTime = Date.now();
    
    // Get a quote first
    const quoteResponse = await request.post(`${BASE_URL}/api/booking/quote`, {
      data: {
        origin: 'Fairfield Station, Fairfield, CT',
        destination: 'JFK Airport, Queens, NY',
        pickupCoords: { lat: 41.1408, lng: -73.2613 },
        dropoffCoords: { lat: 40.6413, lng: -73.7781 },
        fareType: 'personal',
        pickupTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });

    expect(quoteResponse.status()).toBe(200);
    const quote = await quoteResponse.json();
    expect(quote.fare).toBeGreaterThan(0);

    // Submit booking with timeout check
    const submitResponse = await request.post(`${BASE_URL}/api/booking/submit`, {
      data: {
        fare: quote.fare,
        customer: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '+12035550123'
        },
        trip: {
          pickup: {
            address: 'Fairfield Station, Fairfield, CT',
            coordinates: { lat: 41.1408, lng: -73.2613 }
          },
          dropoff: {
            address: 'JFK Airport, Queens, NY',
            coordinates: { lat: 40.6413, lng: -73.7781 }
          },
          pickupDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          fareType: 'personal',
          fare: quote.fare
        }
      }
    });

    const duration = Date.now() - startTime;
    
    // Should complete in under 10 seconds (well under 50s timeout)
    expect(duration).toBeLessThan(10000);
    console.log(`✅ Booking submit completed in ${duration}ms (under 10s limit)`);

    // Should succeed or fail with validation error, not timeout
    expect([200, 400]).toContain(submitResponse.status());
    
    if (submitResponse.status() === 200) {
      const result = await submitResponse.json();
      expect(result).toHaveProperty('bookingId');
      expect(result.bookingId).toBeTruthy();
      console.log(`✅ Booking created successfully: ${result.bookingId}`);
    } else {
      const error = await submitResponse.json();
      console.log(`⚠️ Validation error (expected): ${error.error || JSON.stringify(error)}`);
    }
  });

  test('Full booking flow: quote → submit → verify → cancel', async ({ request }) => {
    console.log('\n🔍 Testing full booking flow locally...\n');
    
    // Step 1: Get quote
    console.log('1️⃣ Getting quote...');
    const pickupTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const quoteData = {
      origin: 'Fairfield Station, Fairfield, CT',
      destination: 'JFK Airport, Queens, NY',
      pickupCoords: { lat: 41.1408, lng: -73.2613 },
      dropoffCoords: { lat: 40.6413, lng: -73.7781 },
      fareType: 'personal',
      pickupTime: pickupTime
    };

    const quoteResponse = await request.post(`${BASE_URL}/api/booking/quote`, {
      data: quoteData
    });

    expect(quoteResponse.status()).toBe(200);
    const quote = await quoteResponse.json();
    expect(quote.fare).toBeGreaterThan(0);
    console.log(`   ✅ Quote: $${quote.fare}`);

    // Step 2: Submit booking
    console.log('2️⃣ Submitting booking...');
    const bookingData = {
      fare: quote.fare,
      customer: {
        name: 'Local Test User',
        email: 'local-test@example.com',
        phone: '+12035550123'
      },
      trip: {
        pickup: {
          address: quoteData.origin,
          coordinates: quoteData.pickupCoords
        },
        dropoff: {
          address: quoteData.destination,
          coordinates: quoteData.dropoffCoords
        },
        pickupDateTime: pickupTime,
        fareType: 'personal',
        fare: quote.fare
      }
    };

    const submitStartTime = Date.now();
    const submitResponse = await request.post(`${BASE_URL}/api/booking/submit`, {
      data: bookingData
    });
    const submitDuration = Date.now() - submitStartTime;

    if (submitResponse.status() !== 200) {
      const error = await submitResponse.json();
      console.error(`   ❌ Submit failed:`, error);
      throw new Error(`Booking submit failed: ${error.error || JSON.stringify(error)}`);
    }

    const submitResult = await submitResponse.json();
    expect(submitResult).toHaveProperty('bookingId');
    expect(submitResult.bookingId).toBeTruthy();
    console.log(`   ✅ Booking created: ${submitResult.bookingId} (${submitDuration}ms)`);
    
    // Verify it completed quickly (under 10s)
    expect(submitDuration).toBeLessThan(10000);
    console.log(`   ✅ No timeout - completed in ${submitDuration}ms`);

    const bookingId = submitResult.bookingId;

    // Step 3: Verify booking exists
    console.log('3️⃣ Verifying booking exists...');
    const getResponse = await request.get(`${BASE_URL}/api/booking/${bookingId}`);
    
    expect(getResponse.status()).toBe(200);
    const booking = await getResponse.json();
    expect(booking.id).toBe(bookingId);
    expect(booking.status).toBeDefined();
    console.log(`   ✅ Booking verified: ${booking.id}, status: ${booking.status}`);

    // Step 4: Cleanup - cancel booking
    console.log('4️⃣ Cleaning up test booking...');
    const cancelResponse = await request.post(`${BASE_URL}/api/booking/cancel-booking`, {
      data: {
        bookingId: bookingId,
        cancellationReason: 'Local API test cleanup'
      }
    });

    if (cancelResponse.status() === 200) {
      console.log('   ✅ Test booking cancelled');
    } else {
      console.log('   ⚠️  Could not cancel (may need manual cleanup)');
    }

    console.log('\n✅ Full booking flow test passed!');
    console.log(`   Booking ID: ${bookingId}`);
    console.log(`   Submit duration: ${submitDuration}ms`);
    console.log(`   No timeout errors ✅`);
  });

  test('Submit endpoint handles validation errors correctly', async ({ request }) => {
    // Test missing required fields
    const response = await request.post(`${BASE_URL}/api/booking/submit`, {
      data: {
        // Missing required fields
        fare: 100
      }
    });

    // Should return 400 (validation error), not 500 (server error)
    expect(response.status()).toBe(400);
    const error = await response.json();
    expect(error).toHaveProperty('error');
    console.log('✅ Validation error handling works correctly');
  });

  test('Submit endpoint handles conflict detection', async ({ request }) => {
    // This test verifies conflict checking works (even if no conflicts exist)
    // The important thing is it doesn't timeout
    
    const quoteResponse = await request.post(`${BASE_URL}/api/booking/quote`, {
      data: {
        origin: 'Fairfield Station, Fairfield, CT',
        destination: 'JFK Airport, Queens, NY',
        pickupCoords: { lat: 41.1408, lng: -73.2613 },
        dropoffCoords: { lat: 40.6413, lng: -73.7781 },
        fareType: 'personal',
        pickupTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });

    const quote = await quoteResponse.json();
    
    const startTime = Date.now();
    const response = await request.post(`${BASE_URL}/api/booking/submit`, {
      data: {
        fare: quote.fare,
        customer: {
          name: 'Conflict Test',
          email: 'conflict@test.com',
          phone: '+12035550123'
        },
        trip: {
          pickup: {
            address: 'Fairfield Station, Fairfield, CT',
            coordinates: { lat: 41.1408, lng: -73.2613 }
          },
          dropoff: {
            address: 'JFK Airport, Queens, NY',
            coordinates: { lat: 40.6413, lng: -73.7781 }
          },
          pickupDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          fareType: 'personal',
          fare: quote.fare
        }
      }
    });

    const duration = Date.now() - startTime;
    
    // Should complete quickly (conflict check happens before transaction)
    expect(duration).toBeLessThan(10000);
    console.log(`✅ Conflict check completed in ${duration}ms (no timeout)`);
    
    // Should succeed or return conflict error, not timeout
    expect([200, 400, 409]).toContain(response.status());
  });
});

