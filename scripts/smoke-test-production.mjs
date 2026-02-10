#!/usr/bin/env node

/**
 * Production Smoke Test
 *
 * READ-ONLY tests that verify critical paths work in production
 * without creating bookings, sending notifications, or charging cards.
 *
 * Safe to run anytime - won't bother Gregg or pollute data.
 *
 * Usage:
 *   node scripts/smoke-test-production.mjs
 *   npm run smoke:prod
 */

// Allow custom URL via environment variable or default to production
const PROD_URL = process.env.SMOKE_TEST_URL || 'https://www.fairfieldairportcars.com';

const results = [];

async function runTest(name, testFn) {
  const start = Date.now();
  try {
    await testFn();
    results.push({ name, passed: true, duration: Date.now() - start });
    console.log(`✅ ${name}`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, duration: Date.now() - start, error: errorMsg });
    console.log(`❌ ${name}: ${errorMsg}`);
  }
}

// ============================================
// TEST 1: Health endpoint returns OK
// ============================================
async function testHealthEndpoint() {
  const response = await fetch(`${PROD_URL}/api/health`);

  if (!response.ok) {
    throw new Error(`Health endpoint returned ${response.status}`);
  }

  const data = await response.json();

  if (data.status !== 'healthy') {
    throw new Error(`Health status: ${data.status} - ${JSON.stringify(data.issues || [])}`);
  }
}

// ============================================
// TEST 2: Homepage loads
// ============================================
async function testHomepageLoads() {
  const response = await fetch(PROD_URL);

  if (!response.ok) {
    throw new Error(`Homepage returned ${response.status}`);
  }

  const html = await response.text();

  // Check for key elements that should be on the page
  if (!html.includes('Fairfield')) {
    throw new Error('Homepage missing expected content');
  }
}

// ============================================
// TEST 3: Quote API works (read-only, no side effects that matter)
// ============================================
async function testQuoteAPI() {
  const quoteRequest = {
    origin: 'Fairfield Metro Station, Fairfield, CT',
    destination: 'John F. Kennedy International Airport',
    pickupCoords: { lat: 41.1428, lng: -73.2562 },
    dropoffCoords: { lat: 40.6413, lng: -73.7781 },
    fareType: 'personal',
    pickupTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours from now
    sessionId: `smoke-test-${Date.now()}` // Unique session for this test
  };

  const response = await fetch(`${PROD_URL}/api/booking/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(quoteRequest)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Quote API returned ${response.status}: ${errorData.error || 'Unknown error'}`);
  }

  const data = await response.json();

  // Verify we got a valid fare
  if (typeof data.fare !== 'number' || data.fare <= 0) {
    throw new Error(`Invalid fare returned: ${data.fare}`);
  }

  // Verify quote ID was generated
  if (!data.quoteId) {
    throw new Error('No quoteId returned');
  }

  console.log(`   → Fare: $${data.fare.toFixed(2)}`);
}

// ============================================
// TEST 4: Booking health check (tests booking flow dependencies)
// ============================================
async function testBookingFlowHealth() {
  const response = await fetch(`${PROD_URL}/api/health/booking-flow`);

  if (!response.ok) {
    throw new Error(`Booking flow health returned ${response.status}`);
  }

  const data = await response.json();

  // Check for any critical failures
  if (data.overallStatus === 'unhealthy') {
    const failedChecks = Object.entries(data.checks || {})
      .filter(([_, check]) => check.status === 'fail')
      .map(([name]) => name);
    throw new Error(`Failed checks: ${failedChecks.join(', ')}`);
  }
}

// ============================================
// MAIN: Run all tests
// ============================================
async function main() {
  console.log('🔍 Running production smoke tests...\n');
  console.log(`Target: ${PROD_URL}\n`);

  await runTest('Health endpoint returns OK', testHealthEndpoint);
  await runTest('Homepage loads', testHomepageLoads);
  await runTest('Quote API returns valid fare', testQuoteAPI);
  await runTest('Booking flow dependencies healthy', testBookingFlowHealth);

  // Summary
  console.log('\n' + '='.repeat(50));
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  if (failed === 0) {
    console.log(`\n🎉 All ${passed} smoke tests passed!`);
    console.log('\nProduction is healthy. Safe to proceed.');
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${failed} of ${passed + failed} tests failed!\n`);

    results.filter(r => !r.passed).forEach(r => {
      console.log(`  ❌ ${r.name}`);
      console.log(`     Error: ${r.error}\n`);
    });

    console.log('🚨 Production may have issues. Investigate before proceeding.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Smoke test runner failed:', err);
  process.exit(1);
});
