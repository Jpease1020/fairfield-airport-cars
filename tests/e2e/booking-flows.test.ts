/**
 * Booking Flow Test Suite
 * 
 * This suite documents and tests the complete user flows for:
 * 1. Quick booking form (homepage)
 * 2. Full booking form (/book page)
 * 3. Cross-form navigation and persistence
 * 4. Quote lifecycle management
 * 5. Edge cases and error scenarios
 */

import { test, expect } from '@playwright/test';

// Test data
const TEST_DATA = {
  pickup: '123 Main St, Fairfield, CT',
  dropoff: 'JFK Airport, Queens, NY',
  pickupCoords: { lat: 41.1408, lng: -73.2613 },
  dropoffCoords: { lat: 40.6413, lng: -73.7781 },
  customer: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-123-4567',
    notes: 'Please call when arriving'
  },
  pickupDateTime: '2024-12-25T10:00:00',
  fareType: 'business' as const
};

// Helper functions
const fillLocationInput = async (page: any, selector: string, address: string) => {
  await page.fill(selector, address);
  await page.keyboard.press('Enter'); // Trigger autocomplete selection
  await page.waitForTimeout(1000); // Wait for coordinates to load
};

const waitForQuote = async (page: any) => {
  await page.waitForSelector('[data-testid*="price-display"], [data-testid*="fare-display"]', { timeout: 10000 });
  await page.waitForSelector('text=Estimated Fare', { timeout: 5000 });
};

const expectValidQuote = async (page: any) => {
  await expect(page.locator('text=Estimated Fare')).toBeVisible();
  await expect(page.locator('text=Valid for')).toBeVisible();
  await expect(page.locator('text=Calculating...')).not.toBeVisible();
};

const expectExpiredQuote = async (page: any) => {
  await expect(page.locator('text=Quote expired')).toBeVisible();
};

// Test Suite 1: Quick Booking Form (Homepage)
test.describe('Quick Booking Form - Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should calculate fare when both locations are entered', async ({ page }) => {
    // Fill pickup location
    await fillLocationInput(page, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    
    // Fill dropoff location
    await fillLocationInput(page, '[data-testid="dropoff-location"]', TEST_DATA.dropoff);
    
    // Wait for quote calculation
    await waitForQuote(page);
    
    // Verify quote is displayed
    await expectValidQuote(page);
    await expect(page.locator('[data-testid="quick-book-price-display"]')).toBeVisible();
  });

  test('should show countdown timer for quote validity', async ({ page }) => {
    await fillLocationInput(page, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    await fillLocationInput(page, '[data-testid="dropoff-location"]', TEST_DATA.dropoff);
    await waitForQuote(page);
    
    // Verify countdown is visible
    await expect(page.locator('text=Valid for')).toBeVisible();
    await expect(page.locator('text=15:')).toBeVisible(); // Should show ~15 minutes
  });

  test('should invalidate quote when pickup location changes', async ({ page }) => {
    await fillLocationInput(page, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    await fillLocationInput(page, '[data-testid="dropoff-location"]', TEST_DATA.dropoff);
    await waitForQuote(page);
    
    // Change pickup location
    await fillLocationInput(page, '[data-testid="pickup-location"]', '456 Oak St, Fairfield, CT');
    
    // Should show calculating state briefly
    await expect(page.locator('text=Calculating...')).toBeVisible();
    
    // Then show new quote
    await waitForQuote(page);
    await expectValidQuote(page);
  });

  test('should invalidate quote when dropoff location changes', async ({ page }) => {
    await fillLocationInput(page, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    await fillLocationInput(page, '[data-testid="dropoff-location"]', TEST_DATA.dropoff);
    await waitForQuote(page);
    
    // Change dropoff location
    await fillLocationInput(page, '[data-testid="dropoff-location"]', 'LaGuardia Airport, Queens, NY');
    
    await expect(page.locator('text=Calculating...')).toBeVisible();
    await waitForQuote(page);
    await expectValidQuote(page);
  });

  test('should handle Google Maps API errors gracefully', async ({ page }) => {
    // Mock Google Maps API failure
    await page.route('**/api/booking/quote', route => {
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Google Maps API unavailable' })
      });
    });

    await fillLocationInput(page, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    await fillLocationInput(page, '[data-testid="dropoff-location"]', TEST_DATA.dropoff);
    
    // Should show error message
    await expect(page.locator('text=Unable to calculate route')).toBeVisible();
    await expect(page.locator('[data-testid="quick-book-get-price-button"]')).toBeDisabled();
  });

  test('should navigate to full booking form when "Book Now" is clicked', async ({ page }) => {
    await fillLocationInput(page, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    await fillLocationInput(page, '[data-testid="dropoff-location"]', TEST_DATA.dropoff);
    await waitForQuote(page);
    
    // Click Book Now button
    await page.click('[data-testid="quick-book-get-price-button"]');
    
    // Should navigate to booking page
    await expect(page).toHaveURL('/book');
    
    // Should preserve quote data
    await expect(page.locator('text=Estimated Fare')).toBeVisible();
  });
});

// Test Suite 2: Full Booking Form (/book page)
test.describe('Full Booking Form - /book page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/book');
    await page.waitForLoadState('networkidle');
  });

  test('should auto-calculate fare when trip details are complete', async ({ page }) => {
    // Fill trip details
    await fillLocationInput(page, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    await fillLocationInput(page, '[data-testid="dropoff-location"]', TEST_DATA.dropoff);
    
    // Set pickup date/time
    await page.fill('[data-testid="pickup-date"]', '2024-12-25');
    await page.fill('[data-testid="pickup-time"]', '10:00');
    
    // Wait for auto-calculation
    await waitForQuote(page);
    
    // Verify quote is displayed
    await expectValidQuote(page);
    await expect(page.locator('[data-testid="fare-display"]')).toBeVisible();
  });

  test('should show countdown timer in fare display section', async ({ page }) => {
    await fillLocationInput(page, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    await fillLocationInput(page, '[data-testid="dropoff-location"]', TEST_DATA.dropoff);
    await page.fill('[data-testid="pickup-date"]', '2024-12-25');
    await page.fill('[data-testid="pickup-time"]', '10:00');
    await waitForQuote(page);
    
    // Verify countdown in fare display
    await expect(page.locator('text=Valid for')).toBeVisible();
    await expect(page.locator('text=15:')).toBeVisible();
  });

  test('should invalidate quote when fare type changes', async ({ page }) => {
    await fillLocationInput(page, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    await fillLocationInput(page, '[data-testid="dropoff-location"]', TEST_DATA.dropoff);
    await page.fill('[data-testid="pickup-date"]', '2024-12-25');
    await page.fill('[data-testid="pickup-time"]', '10:00');
    await waitForQuote(page);
    
    // Change fare type
    await page.click('[data-testid="fare-type-personal"]');
    
    await expect(page.locator('text=Calculating...')).toBeVisible();
    await waitForQuote(page);
    await expectValidQuote(page);
  });

  test('should proceed to contact info phase with valid quote', async ({ page }) => {
    await fillLocationInput(page, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    await fillLocationInput(page, '[data-testid="dropoff-location"]', TEST_DATA.dropoff);
    await page.fill('[data-testid="pickup-date"]', '2024-12-25');
    await page.fill('[data-testid="pickup-time"]', '10:00');
    await waitForQuote(page);
    
    // Click Continue button
    await page.click('[data-testid="continue-to-contact"]');
    
    // Should be on contact info phase
    await expect(page.locator('[data-testid="contact-info-phase"]')).toBeVisible();
    
    // Quote should still be valid
    await expectValidQuote(page);
  });

  test('should proceed to payment phase with valid quote', async ({ page }) => {
    // Complete trip details
    await fillLocationInput(page, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    await fillLocationInput(page, '[data-testid="dropoff-location"]', TEST_DATA.dropoff);
    await page.fill('[data-testid="pickup-date"]', '2024-12-25');
    await page.fill('[data-testid="pickup-time"]', '10:00');
    await waitForQuote(page);
    
    // Complete contact info
    await page.click('[data-testid="continue-to-contact"]');
    await page.fill('[data-testid="customer-name"]', TEST_DATA.customer.name);
    await page.fill('[data-testid="customer-email"]', TEST_DATA.customer.email);
    await page.fill('[data-testid="customer-phone"]', TEST_DATA.customer.phone);
    await page.click('[data-testid="continue-to-payment"]');
    
    // Should be on payment phase
    await expect(page.locator('[data-testid="payment-phase-container"]')).toBeVisible();
    
    // Confirm booking should be enabled
    await expect(page.locator('[data-testid="confirm-booking-button"]')).toBeEnabled();
  });

  test('should disable booking confirmation with expired quote', async ({ page }) => {
    // Complete all phases
    await fillLocationInput(page, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    await fillLocationInput(page, '[data-testid="dropoff-location"]', TEST_DATA.dropoff);
    await page.fill('[data-testid="pickup-date"]', '2024-12-25');
    await page.fill('[data-testid="pickup-time"]', '10:00');
    await waitForQuote(page);
    
    await page.click('[data-testid="continue-to-contact"]');
    await page.fill('[data-testid="customer-name"]', TEST_DATA.customer.name);
    await page.fill('[data-testid="customer-email"]', TEST_DATA.customer.email);
    await page.fill('[data-testid="customer-phone"]', TEST_DATA.customer.phone);
    await page.click('[data-testid="continue-to-payment"]');
    
    // Mock quote expiration
    await page.evaluate(() => {
      // Simulate expired quote by modifying the quote expiration time
      const event = new CustomEvent('quoteExpired');
      window.dispatchEvent(event);
    });
    
    // Wait for expiration UI
    await expect(page.locator('text=Quote expired')).toBeVisible();
    
    // Confirm booking should be disabled
    await expect(page.locator('[data-testid="confirm-booking-button"]')).toBeDisabled();
  });
});

// Test Suite 3: Cross-Form Navigation and Persistence
test.describe('Cross-Form Navigation and Persistence', () => {
  test('should preserve quote when navigating from quick book to full booking', async ({ page }) => {
    // Start on homepage
    await page.goto('/');
    
    // Fill quick booking form
    await fillLocationInput(page, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    await fillLocationInput(page, '[data-testid="dropoff-location"]', TEST_DATA.dropoff);
    await waitForQuote(page);
    
    const quickBookFare = await page.textContent('[data-testid="quick-book-price-display"]');
    
    // Navigate to full booking
    await page.click('[data-testid="quick-book-get-price-button"]');
    await expect(page).toHaveURL('/book');
    
    // Quote should be preserved
    await expectValidQuote(page);
    const fullBookFare = await page.textContent('[data-testid="fare-display"]');
    
    // Fares should match
    expect(quickBookFare).toContain(fullBookFare?.split('$')[1] || '');
  });

  test('should maintain quote across page refreshes', async ({ page }) => {
    await page.goto('/book');
    
    // Fill trip details
    await fillLocationInput(page, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    await fillLocationInput(page, '[data-testid="dropoff-location"]', TEST_DATA.dropoff);
    await page.fill('[data-testid="pickup-date"]', '2024-12-25');
    await page.fill('[data-testid="pickup-time"]', '10:00');
    await waitForQuote(page);
    
    const fareBeforeRefresh = await page.textContent('[data-testid="fare-display"]');
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Quote should be restored from sessionStorage
    await expectValidQuote(page);
    const fareAfterRefresh = await page.textContent('[data-testid="fare-display"]');
    
    expect(fareBeforeRefresh).toBe(fareAfterRefresh);
  });

  test('should clear quote when user changes trip details after refresh', async ({ page }) => {
    await page.goto('/book');
    
    // Fill trip details
    await fillLocationInput(page, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    await fillLocationInput(page, '[data-testid="dropoff-location"]', TEST_DATA.dropoff);
    await page.fill('[data-testid="pickup-date"]', '2024-12-25');
    await page.fill('[data-testid="pickup-time"]', '10:00');
    await waitForQuote(page);
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Change pickup location
    await fillLocationInput(page, '[data-testid="pickup-location"]', '789 Pine St, Fairfield, CT');
    
    // Should recalculate with new quote
    await expect(page.locator('text=Calculating...')).toBeVisible();
    await waitForQuote(page);
    await expectValidQuote(page);
  });

  test('should handle multiple browser tabs with different quotes', async ({ browser }) => {
    // Open two tabs
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    
    // Tab 1: Quick booking
    await page1.goto('/');
    await fillLocationInput(page1, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    await fillLocationInput(page1, '[data-testid="dropoff-location"]', TEST_DATA.dropoff);
    await waitForQuote(page1);
    
    // Tab 2: Different route
    await page2.goto('/book');
    await fillLocationInput(page2, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    await fillLocationInput(page2, '[data-testid="dropoff-location"]', 'LaGuardia Airport, Queens, NY');
    await page2.fill('[data-testid="pickup-date"]', '2024-12-25');
    await page2.fill('[data-testid="pickup-time"]', '10:00');
    await waitForQuote(page2);
    
    // Both tabs should have different quotes
    const fare1 = await page1.textContent('[data-testid="quick-book-price-display"]');
    const fare2 = await page2.textContent('[data-testid="fare-display"]');
    
    expect(fare1).not.toBe(fare2);
    
    await context.close();
  });
});

// Test Suite 4: Quote Lifecycle Management
test.describe('Quote Lifecycle Management', () => {
  test('should handle quote expiration gracefully', async ({ page }) => {
    await page.goto('/book');
    
    // Fill trip details
    await fillLocationInput(page, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    await fillLocationInput(page, '[data-testid="dropoff-location"]', TEST_DATA.dropoff);
    await page.fill('[data-testid="pickup-date"]', '2024-12-25');
    await page.fill('[data-testid="pickup-time"]', '10:00');
    await waitForQuote(page);
    
    // Mock quote expiration after 15 minutes
    await page.evaluate(() => {
      // Simulate time passing
      const originalDate = Date;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      global.Date = class extends originalDate {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(Date.now() + 16 * 60 * 1000); // 16 minutes later
          } else {
            // @ts-expect-error - Dynamic constructor spreading
            super(...args);
          }
        }
      } as typeof Date;
    });
    
    // Try to submit booking
    await page.click('[data-testid="continue-to-contact"]');
    await page.fill('[data-testid="customer-name"]', TEST_DATA.customer.name);
    await page.fill('[data-testid="customer-email"]', TEST_DATA.customer.email);
    await page.fill('[data-testid="customer-phone"]', TEST_DATA.customer.phone);
    await page.click('[data-testid="continue-to-payment"]');
    
    // Should show expired quote error
    await expect(page.locator('text=Your quote has expired')).toBeVisible();
    
    // Should provide refresh option
    await expect(page.locator('text=Please request a new quote')).toBeVisible();
  });

  test('should handle fare mismatch on submission', async ({ page }) => {
    await page.goto('/book');
    
    // Fill trip details
    await fillLocationInput(page, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    await fillLocationInput(page, '[data-testid="dropoff-location"]', TEST_DATA.dropoff);
    await page.fill('[data-testid="pickup-date"]', '2024-12-25');
    await page.fill('[data-testid="pickup-time"]', '10:00');
    await waitForQuote(page);
    
    // Complete all phases
    await page.click('[data-testid="continue-to-contact"]');
    await page.fill('[data-testid="customer-name"]', TEST_DATA.customer.name);
    await page.fill('[data-testid="customer-email"]', TEST_DATA.customer.email);
    await page.fill('[data-testid="customer-phone"]', TEST_DATA.customer.phone);
    await page.click('[data-testid="continue-to-payment"]');
    
    // Mock fare mismatch on server
    await page.route('**/api/booking/submit', route => {
      route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Fare has changed. Please request a new quote.',
          code: 'FARE_MISMATCH',
          expectedFare: 150,
          providedFare: 120
        })
      });
    });
    
    // Submit booking
    await page.click('[data-testid="confirm-booking-button"]');
    
    // Should show fare mismatch error
    await expect(page.locator('text=Fare has changed')).toBeVisible();
    await expect(page.locator('text=Please request a new quote')).toBeVisible();
  });

  test('should handle route change detection', async ({ page }) => {
    await page.goto('/book');
    
    // Fill trip details
    await fillLocationInput(page, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    await fillLocationInput(page, '[data-testid="dropoff-location"]', TEST_DATA.dropoff);
    await page.fill('[data-testid="pickup-date"]', '2024-12-25');
    await page.fill('[data-testid="pickup-time"]', '10:00');
    await waitForQuote(page);
    
    // Complete all phases
    await page.click('[data-testid="continue-to-contact"]');
    await page.fill('[data-testid="customer-name"]', TEST_DATA.customer.name);
    await page.fill('[data-testid="customer-email"]', TEST_DATA.customer.email);
    await page.fill('[data-testid="customer-phone"]', TEST_DATA.customer.phone);
    await page.click('[data-testid="continue-to-payment"]');
    
    // Mock route change detection
    await page.route('**/api/booking/submit', route => {
      route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Trip details have changed. Please request a new quote.',
          code: 'ROUTE_CHANGED'
        })
      });
    });
    
    // Submit booking
    await page.click('[data-testid="confirm-booking-button"]');
    
    // Should show route change error
    await expect(page.locator('text=Trip details have changed')).toBeVisible();
  });
});

// Test Suite 5: Error Recovery and Edge Cases
test.describe('Error Recovery and Edge Cases', () => {
  test('should recover from network errors during quote calculation', async ({ page }) => {
    await page.goto('/book');
    
    // Fill trip details
    await fillLocationInput(page, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    await fillLocationInput(page, '[data-testid="dropoff-location"]', TEST_DATA.dropoff);
    
    // Mock network error
    await page.route('**/api/booking/quote', route => {
      route.abort('failed');
    });
    
    // Should show error state
    await expect(page.locator('text=Network error')).toBeVisible();
    
    // Restore network
    await page.unroute('**/api/booking/quote');
    
    // Retry should work
    await page.click('[data-testid="retry-quote-button"]');
    await waitForQuote(page);
    await expectValidQuote(page);
  });

  test('should handle invalid location inputs', async ({ page }) => {
    await page.goto('/book');
    
    // Enter invalid location
    await page.fill('[data-testid="pickup-location"]', 'Invalid Location XYZ');
    await page.fill('[data-testid="dropoff-location"]', 'Another Invalid Location');
    
    // Should show validation error
    await expect(page.locator('text=Please enter a valid location')).toBeVisible();
    
    // Quote calculation should not trigger
    await expect(page.locator('text=Calculating...')).not.toBeVisible();
  });

  test('should handle past pickup times', async ({ page }) => {
    await page.goto('/book');
    
    // Set past pickup time
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const pastDate = yesterday.toISOString().split('T')[0];
    
    await fillLocationInput(page, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    await fillLocationInput(page, '[data-testid="dropoff-location"]', TEST_DATA.dropoff);
    await page.fill('[data-testid="pickup-date"]', pastDate);
    await page.fill('[data-testid="pickup-time"]', '10:00');
    
    // Should show validation error
    await expect(page.locator('text=Pickup time must be in the future')).toBeVisible();
  });

  test('should handle very long routes', async ({ page }) => {
    await page.goto('/book');
    
    // Set very long route
    await fillLocationInput(page, '[data-testid="pickup-location"]', 'Los Angeles, CA');
    await fillLocationInput(page, '[data-testid="dropoff-location"]', 'New York, NY');
    await page.fill('[data-testid="pickup-date"]', '2024-12-25');
    await page.fill('[data-testid="pickup-time"]', '10:00');
    
    // Should either show high fare or service unavailable message
    await page.waitForTimeout(5000);
    
    // Either valid quote or service unavailable
    const hasQuote = await page.locator('[data-testid="fare-display"]').isVisible();
    const hasError = await page.locator('text=Service unavailable').isVisible();
    
    expect(hasQuote || hasError).toBe(true);
  });
});

// Test Suite 6: Performance and Load Testing
test.describe('Performance and Load Testing', () => {
  test('should calculate quote within acceptable time limits', async ({ page }) => {
    await page.goto('/book');
    
    const startTime = Date.now();
    
    await fillLocationInput(page, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    await fillLocationInput(page, '[data-testid="dropoff-location"]', TEST_DATA.dropoff);
    await page.fill('[data-testid="pickup-date"]', '2024-12-25');
    await page.fill('[data-testid="pickup-time"]', '10:00');
    await waitForQuote(page);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete within 10 seconds
    expect(duration).toBeLessThan(10000);
  });

  test('should handle multiple rapid quote requests', async ({ page }) => {
    await page.goto('/book');
    
    // Rapidly change locations
    const locations = [
      '123 Main St, Fairfield, CT',
      '456 Oak St, Fairfield, CT',
      '789 Pine St, Fairfield, CT',
      '321 Elm St, Fairfield, CT'
    ];
    
    for (const location of locations) {
      await fillLocationInput(page, '[data-testid="pickup-location"]', location);
      await page.waitForTimeout(500); // Brief pause between changes
    }
    
    // Should eventually settle on final quote
    await waitForQuote(page);
    await expectValidQuote(page);
  });
});

// Test Suite 5: Data Structure Validation
test.describe('Booking Data Structure Validation', () => {
  test('should create booking with clean nested structure only (no legacy flat fields)', async ({ page, request }) => {
    // Complete full booking flow
    await page.goto('/book');
    await page.waitForLoadState('networkidle');
    
    // Fill trip details
    await fillLocationInput(page, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    await fillLocationInput(page, '[data-testid="dropoff-location"]', TEST_DATA.dropoff);
    await page.fill('[data-testid="pickup-date"]', '2025-12-25');
    await page.fill('[data-testid="pickup-time"]', '10:00');
    await waitForQuote(page);
    
    // Add flight info
    const hasFlightCheckbox = page.locator('[data-testid="has-flight-checkbox"]');
    if (await hasFlightCheckbox.count() > 0) {
      await hasFlightCheckbox.check();
      await page.fill('[data-testid="airline-input"]', 'Test Airways');
      await page.fill('[data-testid="flight-number-input"]', 'TA123');
    }
    
    // Continue to contact info
    await page.click('[data-testid="continue-to-contact"]');
    await page.fill('[data-testid="customer-name"]', TEST_DATA.customer.name);
    await page.fill('[data-testid="customer-email"]', TEST_DATA.customer.email);
    await page.fill('[data-testid="customer-phone"]', TEST_DATA.customer.phone);
    if (await page.locator('[data-testid="customer-notes"]').count() > 0) {
      await page.fill('[data-testid="customer-notes"]', TEST_DATA.customer.notes);
    }
    await page.click('[data-testid="continue-to-payment"]');
    
    // Intercept booking creation to capture booking ID
    let bookingId: string | null = null;
    page.on('response', async (response) => {
      if (response.url().includes('/api/booking/submit') && response.status() === 200) {
        const data = await response.json();
        bookingId = data.bookingId;
      }
    });
    
    // Complete booking
    await page.click('[data-testid="confirm-booking-button"]');
    await page.waitForTimeout(2000); // Wait for booking creation
    
    // Verify booking ID was captured
    expect(bookingId).toBeTruthy();
    
    // Fetch booking data via API to validate structure
    const bookingResponse = await request.get(`http://localhost:3000/api/booking/get-bookings-simple?id=${bookingId}`);
    expect(bookingResponse.status()).toBe(200);
    
    const bookingData = await bookingResponse.json();
    const booking = bookingData.booking;
    
    // ✅ VERIFY CLEAN NESTED STRUCTURE EXISTS
    expect(booking.trip).toBeDefined();
    expect(booking.customer).toBeDefined();
    expect(booking.payment).toBeDefined();
    
    // ✅ VERIFY NESTED TRIP DATA
    expect(booking.trip.pickup).toBeDefined();
    expect(booking.trip.pickup.address).toContain('Fairfield');
    expect(booking.trip.pickup.coordinates).toBeDefined();
    expect(booking.trip.pickup.coordinates.lat).toBeCloseTo(TEST_DATA.pickupCoords.lat, 1);
    
    expect(booking.trip.dropoff).toBeDefined();
    expect(booking.trip.dropoff.address).toContain('JFK');
    expect(booking.trip.dropoff.coordinates).toBeDefined();
    expect(booking.trip.dropoff.coordinates.lat).toBeCloseTo(TEST_DATA.dropoffCoords.lat, 1);
    
    expect(booking.trip.fareType).toBe('business');
    expect(booking.trip.fare).toBeGreaterThan(0);
    
    // ✅ VERIFY NESTED CUSTOMER DATA
    expect(booking.customer.name).toBe(TEST_DATA.customer.name);
    expect(booking.customer.email).toBe(TEST_DATA.customer.email);
    expect(booking.customer.phone).toBe(TEST_DATA.customer.phone);
    
    // ✅ VERIFY FLIGHT INFO WAS SAVED (if flight checkbox was present)
    if (await page.locator('[data-testid="has-flight-checkbox"]').count() > 0) {
      expect(booking.trip.flightInfo).toBeDefined();
      expect(booking.trip.flightInfo.hasFlight).toBe(true);
      expect(booking.trip.flightInfo.airline).toBe('Test Airways');
      expect(booking.trip.flightInfo.flightNumber).toBe('TA123');
    }
    
    // ✅ VERIFY NO LEGACY FLAT FIELDS EXIST
    expect(booking.pickupLocation).toBeUndefined();
    expect(booking.dropoffLocation).toBeUndefined();
    expect(booking.name).toBeUndefined();
    expect(booking.email).toBeUndefined();
    expect(booking.phone).toBeUndefined();
    expect(booking.fare).toBeUndefined(); // Only booking.trip.fare should exist
  });
  
  test('should handle booking without flight info correctly', async ({ page, request }) => {
    // Complete booking WITHOUT flight info
    await page.goto('/book');
    await page.waitForLoadState('networkidle');
    
    await fillLocationInput(page, '[data-testid="pickup-location"]', TEST_DATA.pickup);
    await fillLocationInput(page, '[data-testid="dropoff-location"]', TEST_DATA.dropoff);
    await page.fill('[data-testid="pickup-date"]', '2025-12-25');
    await page.fill('[data-testid="pickup-time"]', '10:00');
    await waitForQuote(page);
    
    // Do NOT check flight info checkbox (if it exists)
    
    await page.click('[data-testid="continue-to-contact"]');
    await page.fill('[data-testid="customer-name"]', 'Test User No Flight');
    await page.fill('[data-testid="customer-email"]', 'noflight@test.com');
    await page.fill('[data-testid="customer-phone"]', '555-999-0000');
    await page.click('[data-testid="continue-to-payment"]');
    
    let bookingId: string | null = null;
    page.on('response', async (response) => {
      if (response.url().includes('/api/booking/submit') && response.status() === 200) {
        const data = await response.json();
        bookingId = data.bookingId;
      }
    });
    
    await page.click('[data-testid="confirm-booking-button"]');
    await page.waitForTimeout(2000);
    
    expect(bookingId).toBeTruthy();
    
    // Fetch booking and verify flight info
    const bookingResponse = await request.get(`http://localhost:3000/api/booking/get-bookings-simple?id=${bookingId}`);
    const bookingData = await bookingResponse.json();
    const booking = bookingData.booking;
    
    // ✅ VERIFY FLIGHT INFO EXISTS WITH hasFlight = false
    expect(booking.trip.flightInfo).toBeDefined();
    expect(booking.trip.flightInfo.hasFlight).toBe(false);
    expect(booking.trip.flightInfo.airline).toBe('');
    expect(booking.trip.flightInfo.flightNumber).toBe('');
  });
});
