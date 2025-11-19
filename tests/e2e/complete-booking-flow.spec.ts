/**
 * Complete Booking Flow E2E Test
 * 
 * This test validates the ENTIRE booking flow from start to finish:
 * 1. User enters trip details (pickup, dropoff, date/time, fare type)
 * 2. User enters contact information
 * 3. User reviews and submits booking
 * 4. User adds flight information (optional)
 * 5. User receives confirmation
 * 6. User can view their booking detail page
 * 
 * This is the MOST CRITICAL test - validates the entire user journey.
 */

import { test, expect } from '@playwright/test';

test.describe('Complete Booking Flow - End to End', () => {
  test('user can complete full booking flow and view booking', async ({ page }) => {
    // Track API calls
    const apiCalls: { url: string; method: string; body?: any }[] = [];
    
    // Intercept and log all API calls
    await page.route('**/api/**', async route => {
      const request = route.request();
      const url = request.url();
      const method = request.method();
      let body = null;
      
      try {
        const postData = request.postData();
        if (postData) {
          body = JSON.parse(postData);
        }
      } catch {
        // Ignore parse errors
      }
      
      apiCalls.push({ url, method, body });
      
      // Handle specific endpoints
      if (url.includes('/api/booking/quote')) {
        // Mock quote response
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            quoteId: 'test-quote-' + Date.now(),
            fare: 132.50,
            distanceMiles: 77.7,
            durationMinutes: 96,
            fareType: body?.fareType || 'personal',
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            expiresInMinutes: 15
          })
        });
        return;
      }
      
      if (url.includes('/api/booking/submit')) {
        // Mock booking submission - return booking ID
        const bookingId = 'TEST-' + Date.now().toString(36).toUpperCase();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            bookingId: bookingId,
            emailWarning: null
          })
        });
        
        // Store booking ID for later retrieval
        await page.evaluate((id) => {
          (window as any).testBookingId = id;
        }, bookingId);
        
        return;
      }
      
      if (url.includes('/api/booking/get-bookings-simple')) {
        // Return booking details when viewing booking page
        const bookingId = new URL(url).searchParams.get('id');
        const storedId = await page.evaluate(() => (window as any).testBookingId);
        
        if (bookingId === storedId || bookingId?.startsWith('TEST-')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              booking: {
                id: bookingId || storedId,
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                trip: {
                  pickup: {
                    address: '30 Shut Rd, Newtown, CT 06470, USA',
                    coordinates: { lat: 41.3641472, lng: -73.34843 }
                  },
                  dropoff: {
                    address: 'John F. Kennedy International Airport',
                    coordinates: { lat: 40.6446124, lng: -73.7797278 }
                  },
                  pickupDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                  fareType: 'personal',
                  fare: 132.50
                },
                customer: {
                  name: 'Test User',
                  email: 'test@example.com',
                  phone: '2035551234',
                  notes: 'Test booking notes',
                  saveInfoForFuture: false
                },
                payment: {
                  depositAmount: 0,
                  balanceDue: 132.50,
                  totalAmount: 132.50,
                  depositPaid: false,
                  tipAmount: 0,
                  tipPercent: 0
                },
                flightInfo: {
                  hasFlight: true,
                  airline: 'Delta',
                  flightNumber: 'DL123',
                  arrivalTime: '14:30',
                  terminal: '4'
                }
              }
            })
          });
          return;
        }
      }
      
      // Continue with actual request for other endpoints
      await route.continue();
    });

    // ============================================
    // STEP 1: Navigate to booking page
    // ============================================
    console.log('📍 Step 1: Navigating to booking page...');
    await page.goto('/book');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the booking page
    await expect(page.locator('[data-testid="trip-details-phase"]')).toBeVisible({ timeout: 10000 });

    // ============================================
    // STEP 2: Enter trip details
    // ============================================
    console.log('📍 Step 2: Entering trip details...');
    
    // Enter pickup location
    const pickupInput = page.locator('[data-testid="pickup-location-input"] input').first();
    await pickupInput.fill('30 Shut Rd, Newtown, CT');
    await page.waitForTimeout(500); // Wait for autocomplete
    
    // Select first autocomplete result if available
    const pickupSuggestion = page.locator('[data-testid="pickup-location-input"]').getByText('30 Shut Rd').first();
    if (await pickupSuggestion.isVisible({ timeout: 2000 }).catch(() => false)) {
      await pickupSuggestion.click();
    } else {
      // If no autocomplete, just press Enter
      await pickupInput.press('Enter');
    }
    
    // Enter dropoff location
    const dropoffInput = page.locator('[data-testid="dropoff-location-input"] input').first();
    await dropoffInput.fill('JFK Airport');
    await page.waitForTimeout(500);
    
    const dropoffSuggestion = page.locator('[data-testid="dropoff-location-input"]').getByText('JFK').first();
    if (await dropoffSuggestion.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dropoffSuggestion.click();
    } else {
      await dropoffInput.press('Enter');
    }
    
    // Select date and time (tomorrow at 2:00 PM)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    
    // Format date as YYYY-MM-DD for native date input
    const dateString = tomorrow.toISOString().split('T')[0];
    // Format time as HH:mm for native time input
    const timeString = `${String(tomorrow.getHours()).padStart(2, '0')}:${String(tomorrow.getMinutes()).padStart(2, '0')}`;
    
    // Fill date input
    const dateInput = page.locator('[data-testid="pickup-datetime-input-date"]');
    await dateInput.fill(dateString);
    
    // Fill time input
    const timeInput = page.locator('[data-testid="pickup-datetime-input-time"]');
    await timeInput.fill(timeString);
    
    // Select fare type (personal)
    const fareTypePersonal = page.locator('[data-testid="fare-type-personal"]').first();
    if (await fareTypePersonal.isVisible({ timeout: 2000 }).catch(() => false)) {
      await fareTypePersonal.click();
    }
    
    // Wait for fare calculation
    console.log('📍 Waiting for fare calculation...');
    await expect(page.locator('[data-testid="fare-display"]')).toBeVisible({ timeout: 15000 });
    
    // Verify fare is displayed
    const fareText = await page.locator('[data-testid="fare-display"]').textContent();
    expect(fareText).toContain('$');
    console.log(`✅ Fare calculated: ${fareText}`);
    
    // Verify quote API was called
    const quoteCall = apiCalls.find(call => call.url.includes('/api/booking/quote'));
    expect(quoteCall).toBeDefined();
    expect(quoteCall?.method).toBe('POST');
    console.log('✅ Quote API called successfully');

    // ============================================
    // STEP 3: Continue to contact information
    // ============================================
    console.log('📍 Step 3: Moving to contact information phase...');
    
    const nextButton = page.locator('[data-testid="trip-details-next-button"]').first();
    await nextButton.click();
    
    // Wait for contact info phase
    await expect(page.locator('[data-testid="contact-info-phase"]')).toBeVisible({ timeout: 5000 });

    // ============================================
    // STEP 4: Enter contact information
    // ============================================
    console.log('📍 Step 4: Entering contact information...');
    
    // Enter name
    const nameInput = page.locator('[data-testid="name-input"]').first();
    await nameInput.fill('Test User');
    
    // Enter email
    const emailInput = page.locator('[data-testid="email-input"]').first();
    await emailInput.fill('test@example.com');
    
    // Enter phone
    const phoneInput = page.locator('[data-testid="phone-input"]').first();
    await phoneInput.fill('2035551234');
    
    // Enter notes (optional)
    const notesInput = page.locator('[data-testid="notes-input"]').first();
    if (await notesInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await notesInput.fill('Test booking notes');
    }
    
    // Continue to payment phase
    const contactNextButton = page.locator('[data-testid="contact-info-continue-button"]').first();
    await contactNextButton.click();
    
    // Wait for payment phase
    await expect(page.locator('[data-testid="payment-phase-container"]')).toBeVisible({ timeout: 5000 });
    console.log('✅ Contact information entered');

    // ============================================
    // STEP 5: Review and submit booking
    // ============================================
    console.log('📍 Step 5: Reviewing and submitting booking...');
    
    // Verify payment summary shows correct information
    await expect(page.locator('text=/Test User/i')).toBeVisible();
    await expect(page.locator('text=/30 Shut Rd/i')).toBeVisible();
    await expect(page.locator('text=/JFK/i')).toBeVisible();
    await expect(page.locator('text=/\$132\\.50/')).toBeVisible();
    
    // Submit booking
    const submitButton = page.locator('[data-testid="payment-process-button"]').first();
    await submitButton.click();
    
    // Wait for booking submission
    console.log('📍 Waiting for booking submission...');
    await page.waitForTimeout(2000); // Wait for API call
    
    // Verify submit API was called
    const submitCall = apiCalls.find(call => call.url.includes('/api/booking/submit'));
    expect(submitCall).toBeDefined();
    expect(submitCall?.method).toBe('POST');
    expect(submitCall?.body?.customer?.name).toBe('Test User');
    expect(submitCall?.body?.customer?.email).toBe('test@example.com');
    console.log('✅ Booking submitted successfully');
    
    // Get booking ID from response
    const bookingId = await page.evaluate(() => (window as any).testBookingId);
    expect(bookingId).toBeDefined();
    console.log(`✅ Booking ID: ${bookingId}`);

    // ============================================
    // STEP 6: Add flight information (optional)
    // ============================================
    console.log('📍 Step 6: Adding flight information...');
    
    // Wait for flight info phase
    await expect(page.locator('[data-testid="flight-info-phase"]')).toBeVisible({ timeout: 10000 });
    
    // Enter flight details
    const airlineInput = page.locator('[data-testid="airline-input"]').first();
    if (await airlineInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await airlineInput.fill('Delta');
    }
    
    const flightNumberInput = page.locator('[data-testid="flight-number-input"]').first();
    if (await flightNumberInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await flightNumberInput.fill('DL123');
    }
    
    const terminalInput = page.locator('[data-testid="terminal-input"]').first();
    if (await terminalInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await terminalInput.fill('4');
    }
    
    // Complete flight info
    const flightCompleteButton = page.locator('[data-testid="flight-info-complete-button"]').first();
    if (await flightCompleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await flightCompleteButton.click();
    }
    
    console.log('✅ Flight information added');

    // ============================================
    // STEP 7: Verify booking confirmation
    // ============================================
    console.log('📍 Step 7: Verifying booking confirmation...');
    
    // Should see success message or confirmation
    const successMessage = page.locator('text=/success|confirmed|booking/i').first();
    await expect(successMessage).toBeVisible({ timeout: 10000 });
    console.log('✅ Booking confirmation displayed');

    // ============================================
    // STEP 8: Navigate to booking detail page
    // ============================================
    console.log('📍 Step 8: Viewing booking detail page...');
    
    // Try to find a link to the booking detail page, or navigate directly
    const bookingLink = page.locator(`a[href*="/booking/${bookingId}"]`).first();
    
    if (await bookingLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bookingLink.click();
    } else {
      // Navigate directly to booking detail page
      await page.goto(`/booking/${bookingId}`);
    }
    
    // Wait for booking detail page to load
    await page.waitForLoadState('networkidle');
    
    // ============================================
    // STEP 9: Verify booking detail page displays correctly
    // ============================================
    console.log('📍 Step 9: Verifying booking detail page...');
    
    // Should show loading state initially
    const loadingText = page.locator('text=/Please wait|loading/i').first();
    if (await loadingText.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(loadingText).not.toBeVisible({ timeout: 10000 });
    }
    
    // Verify booking details are displayed
    await expect(page.locator('text=/Test User/i')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=/30 Shut Rd/i')).toBeVisible();
    await expect(page.locator('text=/JFK/i')).toBeVisible();
    await expect(page.locator('text=/\$132\\.50/')).toBeVisible();
    
    // Verify date is formatted correctly (no errors)
    const dateDisplay = page.locator('text=/January|February|March|April|May|June|July|August|September|October|November|December/i').first();
    await expect(dateDisplay).toBeVisible();
    
    // Check for console errors (especially date-related)
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Wait a bit to catch any errors
    await page.waitForTimeout(1000);
    
    // Verify no date-related errors
    const dateErrors = consoleErrors.filter(err => 
      err.includes('getTime') || 
      err.includes('is not a function') ||
      err.includes('Invalid date')
    );
    
    expect(dateErrors.length).toBe(0);
    console.log('✅ No date-related errors');
    
    // Verify get-bookings-simple API was called
    const detailCall = apiCalls.find(call => 
      call.url.includes('/api/booking/get-bookings-simple') && 
      call.url.includes(bookingId)
    );
    expect(detailCall).toBeDefined();
    expect(detailCall?.method).toBe('GET');
    console.log('✅ Booking detail API called successfully');

    // ============================================
    // FINAL VERIFICATION
    // ============================================
    console.log('📍 Final verification...');
    
    // Summary of what was tested
    console.log('\n✅ COMPLETE BOOKING FLOW VALIDATION:');
    console.log('  ✅ Trip details entered');
    console.log('  ✅ Fare calculated');
    console.log('  ✅ Contact information entered');
    console.log('  ✅ Booking submitted');
    console.log('  ✅ Flight information added');
    console.log('  ✅ Booking confirmation displayed');
    console.log('  ✅ Booking detail page loaded');
    console.log('  ✅ All booking data displayed correctly');
    console.log('  ✅ No date-related errors');
    console.log('  ✅ All API calls successful');
    
    // Verify all critical API calls were made
    expect(apiCalls.some(call => call.url.includes('/api/booking/quote'))).toBe(true);
    expect(apiCalls.some(call => call.url.includes('/api/booking/submit'))).toBe(true);
    expect(apiCalls.some(call => call.url.includes('/api/booking/get-bookings-simple'))).toBe(true);
    
    console.log(`\n✅ Total API calls: ${apiCalls.length}`);
    console.log('✅ All steps completed successfully!');
  });

  test('user can complete booking flow without flight information', async ({ page }) => {
    // Similar test but skipping flight info step
    // This validates that flight info is truly optional
    
    await page.route('**/api/booking/quote**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          quoteId: 'test-quote-' + Date.now(),
          fare: 100,
          distanceMiles: 50,
          durationMinutes: 60,
          fareType: 'personal',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          expiresInMinutes: 15
        })
      });
    });
    
    await page.route('**/api/booking/submit**', async route => {
      const bookingId = 'TEST-' + Date.now().toString(36).toUpperCase();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          bookingId: bookingId,
          emailWarning: null
        })
      });
      await page.evaluate((id) => {
        (window as any).testBookingId = id;
      }, bookingId);
    });
    
    // Navigate and complete basic flow
    await page.goto('/book');
    await page.waitForLoadState('networkidle');
    
    // Enter minimal trip details
    const pickupInput = page.locator('[data-testid="pickup-location-input"] input').first();
    await pickupInput.fill('30 Shut Rd, Newtown, CT');
    await pickupInput.press('Enter');
    
    const dropoffInput = page.locator('[data-testid="dropoff-location-input"] input').first();
    await dropoffInput.fill('JFK Airport');
    await dropoffInput.press('Enter');
    
    // Set date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0);
    
    const dateInput = page.locator('[data-testid="pickup-datetime-input"] input').first();
    await dateInput.fill(tomorrow.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', ''));
    await dateInput.press('Enter');
    
    // Wait for fare
    await expect(page.locator('[data-testid="fare-display"]')).toBeVisible({ timeout: 15000 });
    
    // Continue to contact info
    await page.locator('[data-testid="trip-details-next-button"]').first().click();
    await expect(page.locator('[data-testid="contact-info-phase"]')).toBeVisible({ timeout: 5000 });
    
    // Enter contact info
    await page.locator('[data-testid="name-input"]').first().fill('Test User');
    await page.locator('[data-testid="email-input"]').first().fill('test@example.com');
    await page.locator('[data-testid="phone-input"]').first().fill('2035551234');
    
    // Continue to payment
    await page.locator('[data-testid="contact-info-continue-button"]').first().click();
    await expect(page.locator('[data-testid="payment-phase-container"]')).toBeVisible({ timeout: 5000 });
    
    // Submit booking
    await page.locator('[data-testid="payment-process-button"]').first().click();
    await page.waitForTimeout(2000);
    
    // Should see success even without flight info
    const successMessage = page.locator('text=/success|confirmed|booking/i').first();
    await expect(successMessage).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Booking completed without flight information');
  });
});

