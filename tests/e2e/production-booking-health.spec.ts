/**
 * Production Booking Health Check
 * 
 * Run this test against production to verify booking functionality is working.
 * 
 * Usage:
 *   BASE_URL=https://your-production-domain.com npm run test:e2e -- tests/e2e/production-booking-health.spec.ts
 * 
 * Or set BASE_URL in .env.local for default production URL
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://fairfield-airport-cars.vercel.app';

test.describe('Production Booking Health Check', () => {
  test('Health check endpoint is accessible', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.services.database).toBe('operational');
    console.log('✅ Basic health check passed');
  });

  test('Booking flow health check endpoint is accessible', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health/booking-flow`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.checks.firebase.status).toBe('pass');
    expect(data.checks.bookingService.status).toBe('pass');
    
    console.log('✅ Booking flow health check passed');
    console.log('   Summary:', data.summary);
    
    // Log any warnings
    if (data.summary.warnings > 0) {
      console.warn('⚠️  Warnings detected:', Object.entries(data.checks)
        .filter(([_, check]: [string, any]) => check.status === 'warning')
        .map(([name, check]: [string, any]) => `${name}: ${check.message}`)
      );
    }
  });

  test('Quote API returns valid response', async ({ request }) => {
    const quoteData = {
      origin: 'Fairfield Station, Fairfield, CT',
      destination: 'JFK Airport, Queens, NY',
      pickupCoords: { lat: 41.1408, lng: -73.2613 },
      dropoffCoords: { lat: 40.6413, lng: -73.7781 },
      fareType: 'personal',
      pickupDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
    };

    const response = await request.post(`${BASE_URL}/api/booking/quote`, {
      data: quoteData
    });

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('fare');
    expect(data).toHaveProperty('distance');
    expect(data).toHaveProperty('duration');
    expect(typeof data.fare).toBe('number');
    expect(data.fare).toBeGreaterThan(0);
    
    console.log('✅ Quote API working - Fare:', data.fare, 'Distance:', data.distance, 'Duration:', data.duration);
  });

  test('Booking submission endpoint is accessible (smoke test)', async ({ request }) => {
    // This test verifies the endpoint is accessible and returns proper error for missing data
    // We don't create a real booking, just verify the endpoint responds correctly
    
    const response = await request.post(`${BASE_URL}/api/booking/submit`, {
      data: {} // Empty data should return validation error, not server error
    });

    // Should return 400 (bad request) not 500 (server error)
    expect([400, 401, 403]).toContain(response.status());
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
    
    // If we get a validation error, that's good - it means the endpoint is working
    // If we get "Firebase Admin not initialized", that's the problem
    if (data.error && data.error.includes('Firebase Admin')) {
      throw new Error(`❌ CRITICAL: Firebase Admin not initialized - ${data.error}`);
    }
    
    console.log('✅ Booking submit endpoint accessible - Response:', response.status(), data.error || 'Validation error (expected)');
  });

  test('Firebase Admin initialization check', async ({ request }) => {
    // Try to get a booking (should return 404 for non-existent, not 500 for server error)
    const response = await request.get(`${BASE_URL}/api/booking/TEST123`);
    
    // 404 = booking not found (good - Firebase is working)
    // 500 = server error (bad - Firebase might not be initialized)
    if (response.status() === 500) {
      const data = await response.json();
      if (data.error && data.error.includes('Firebase Admin')) {
        throw new Error(`❌ CRITICAL: Firebase Admin not initialized - ${data.error}`);
      }
      throw new Error(`❌ Server error when checking booking: ${data.error || 'Unknown error'}`);
    }
    
    // 404 is expected for non-existent booking
    expect([404, 200]).toContain(response.status());
    console.log('✅ Firebase Admin is initialized - Booking endpoint responding correctly');
  });

  test('Full booking API test - create and verify booking', async ({ request }) => {
    console.log(`\n🔍 Testing full booking API at: ${BASE_URL}\n`);
    
    // Step 1: Get a quote
    const quoteData = {
      origin: 'Fairfield Station, Fairfield, CT',
      destination: 'JFK Airport, Queens, NY',
      pickupCoords: { lat: 41.1408, lng: -73.2613 },
      dropoffCoords: { lat: 40.6413, lng: -73.7781 },
      fareType: 'personal',
      pickupDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
    };

    console.log('1️⃣ Getting quote...');
    const quoteResponse = await request.post(`${BASE_URL}/api/booking/quote`, {
      data: quoteData
    });

    if (quoteResponse.status() !== 200) {
      const error = await quoteResponse.json();
      throw new Error(`Quote API failed: ${error.error || 'Unknown error'}`);
    }

    const quote = await quoteResponse.json();
    console.log(`   ✅ Quote received: $${quote.fare}`);
    expect(quote.fare).toBeGreaterThan(0);

    // Step 2: Submit booking (using smoke test mode to avoid real payment)
    console.log('2️⃣ Submitting booking (smoke test mode)...');
    const bookingData = {
      fare: quote.fare,
      trip: {
        pickup: {
          address: quoteData.origin,
          coordinates: quoteData.pickupCoords
        },
        dropoff: {
          address: quoteData.destination,
          coordinates: quoteData.dropoffCoords
        },
        pickupDateTime: quoteData.pickupDateTime,
        fare: quote.fare,
        fareType: 'personal'
      },
      customer: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+12035550123'
      },
      payment: {
        depositAmount: Math.round(quote.fare * 0.3),
        tipAmount: 0
      }
    };

    const submitResponse = await request.post(`${BASE_URL}/api/booking/submit`, {
      headers: {
        'x-smoke-test': 'true'
      },
      data: bookingData
    });

    if (submitResponse.status() !== 200) {
      const error = await submitResponse.json();
      console.error('   ❌ Booking submission failed:', error);
      throw new Error(`Booking submission failed: ${error.error || JSON.stringify(error)}`);
    }

    const submitResult = await submitResponse.json();
    console.log(`   ✅ Booking submitted: ${submitResult.bookingId}`);
    expect(submitResult).toHaveProperty('bookingId');
    expect(submitResult.bookingId).toBeTruthy();

    const bookingId = submitResult.bookingId;

    // Step 3: Verify booking was created
    console.log('3️⃣ Verifying booking exists...');
    const getBookingResponse = await request.get(`${BASE_URL}/api/booking/${bookingId}`);

    if (getBookingResponse.status() !== 200) {
      const error = await getBookingResponse.json();
      throw new Error(`Failed to retrieve booking: ${error.error || 'Unknown error'}`);
    }

    const booking = await getBookingResponse.json();
    console.log(`   ✅ Booking retrieved: ${booking.id}`);
    expect(booking.id).toBe(bookingId);
    expect(booking.status).toBeDefined();
    expect(booking.trip || booking.pickupLocation).toBeDefined();

    // Step 4: Verify booking can be cancelled (cleanup)
    console.log('4️⃣ Cleaning up test booking...');
    const cancelResponse = await request.post(`${BASE_URL}/api/booking/cancel-booking`, {
      headers: {
        'x-smoke-test': 'true'
      },
      data: {
        bookingId: bookingId,
        cancellationReason: 'Production API test cleanup'
      }
    });

    if (cancelResponse.status() === 200) {
      console.log('   ✅ Test booking cancelled');
    } else {
      console.log('   ⚠️  Could not cancel test booking (may need manual cleanup)');
    }

    console.log('\n✅ Full booking API test passed!');
    console.log(`   Booking ID: ${bookingId}`);
    console.log(`   Status: ${booking.status}`);
  });

  test('Complete booking flow health check', async ({ request }) => {
    console.log(`\n🔍 Testing production booking flow at: ${BASE_URL}\n`);
    
    const results = {
      healthCheck: false,
      bookingFlowHealth: false,
      quoteAPI: false,
      bookingSubmit: false,
      firebaseAdmin: false
    };

    try {
      // 1. Basic health check
      const healthResponse = await request.get(`${BASE_URL}/api/health`);
      results.healthCheck = healthResponse.status() === 200;
      console.log(results.healthCheck ? '✅' : '❌', 'Basic health check');
    } catch (e) {
      console.log('❌ Basic health check failed:', e);
    }

    try {
      // 2. Booking flow health check
      const bookingHealthResponse = await request.get(`${BASE_URL}/api/health/booking-flow`);
      const bookingHealthData = await bookingHealthResponse.json();
      results.bookingFlowHealth = bookingHealthResponse.status() === 200 && 
                                  bookingHealthData.checks?.firebase?.status === 'pass';
      console.log(results.bookingFlowHealth ? '✅' : '❌', 'Booking flow health check');
      
      if (!results.bookingFlowHealth) {
        console.log('   Details:', JSON.stringify(bookingHealthData.checks?.firebase, null, 2));
      }
    } catch (e) {
      console.log('❌ Booking flow health check failed:', e);
    }

    try {
      // 3. Quote API
      const quoteResponse = await request.post(`${BASE_URL}/api/booking/quote`, {
        data: {
          origin: 'Fairfield Station, Fairfield, CT',
          destination: 'JFK Airport, Queens, NY',
          pickupCoords: { lat: 41.1408, lng: -73.2613 },
          dropoffCoords: { lat: 40.6413, lng: -73.7781 },
          fareType: 'personal',
          pickupDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      });
      results.quoteAPI = quoteResponse.status() === 200;
      console.log(results.quoteAPI ? '✅' : '❌', 'Quote API');
    } catch (e) {
      console.log('❌ Quote API failed:', e);
    }

    try {
      // 4. Booking submit endpoint
      const submitResponse = await request.post(`${BASE_URL}/api/booking/submit`, {
        data: {}
      });
      // Should return 400 (validation error) not 500 (server error)
      results.bookingSubmit = submitResponse.status() !== 500;
      console.log(results.bookingSubmit ? '✅' : '❌', 'Booking submit endpoint');
      
      if (!results.bookingSubmit) {
        const errorData = await submitResponse.json();
        console.log('   Error:', errorData.error);
      }
    } catch (e) {
      console.log('❌ Booking submit endpoint failed:', e);
    }

    try {
      // 5. Firebase Admin check
      const bookingResponse = await request.get(`${BASE_URL}/api/booking/TEST123`);
      results.firebaseAdmin = bookingResponse.status() !== 500;
      console.log(results.firebaseAdmin ? '✅' : '❌', 'Firebase Admin initialization');
      
      if (!results.firebaseAdmin) {
        const errorData = await bookingResponse.json();
        console.log('   Error:', errorData.error);
      }
    } catch (e) {
      console.log('❌ Firebase Admin check failed:', e);
    }

    console.log('\n📊 Summary:');
    console.log(JSON.stringify(results, null, 2));
    
    const allPassed = Object.values(results).every(r => r === true);
    
    if (!allPassed) {
      console.log('\n❌ Some checks failed. Review the output above.');
      throw new Error('Production booking health check failed');
    }
    
    console.log('\n✅ All production booking checks passed!');
  });
});

