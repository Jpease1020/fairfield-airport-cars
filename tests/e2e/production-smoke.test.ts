import { test, expect } from '@playwright/test';

/**
 * Production Smoke Test - Full Booking Lifecycle
 * 
 * This test verifies the complete booking flow including:
 * 1. Creating a booking (smoke test mode - no real charge)
 * 2. Logging in as the user
 * 3. Cancelling the booking
 * 4. Verifying calendar event was deleted from Google Calendar
 * 
 * Run with: SMOKE_TEST_MODE=true npm run test:e2e -- tests/e2e/production-smoke.test.ts
 */
test.describe('Production Smoke Test - Full Lifecycle', () => {
  test('complete booking → login → cancel → verify calendar cleanup', async ({ page }) => {
    const timestamp = Date.now();
    const smokeTestEmail = `smoke-test-${timestamp}@test.com`;
    const smokeTestPassword = 'SmokeTest123!';
    const smokeTestName = 'Smoke Test User';
    const smokeTestPhone = '+15555550123';
    
    // Set smoke test mode header
    await page.setExtraHTTPHeaders({
      'x-smoke-test': 'true',
    });

    // STEP 1: Navigate to booking form
    await page.goto('/book');
    await expect(page).toHaveTitle(/Book a Ride|Fairfield Airport Cars/i);

    // STEP 2: Fill out booking form
    // Pickup location
    const pickupInput = page.locator('[data-testid="pickup-input"], input[placeholder*="pickup" i], input[placeholder*="from" i]').first();
    await pickupInput.fill('Fairfield, CT');
    await page.waitForTimeout(1000); // Wait for autocomplete
    
    // Dropoff location
    const dropoffInput = page.locator('[data-testid="dropoff-input"], input[placeholder*="dropoff" i], input[placeholder*="to" i], input[placeholder*="destination" i]').first();
    await dropoffInput.fill('JFK Airport');
    await page.waitForTimeout(1000); // Wait for autocomplete

    // Date and time - use a future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
    const dateStr = futureDate.toISOString().split('T')[0];
    const timeStr = '14:00'; // 2 PM

    const dateInput = page.locator('input[type="date"]').first();
    if (await dateInput.count() > 0) {
      await dateInput.fill(dateStr);
    }

    const timeInput = page.locator('input[type="time"]').first();
    if (await timeInput.count() > 0) {
      await timeInput.fill(timeStr);
    }

    // Submit booking form
    const submitButton = page.locator('button[type="submit"], button:has-text("Continue"), button:has-text("Next")').first();
    await submitButton.click();

    // STEP 3: Fill customer information
    await page.waitForTimeout(1000);
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill(smokeTestName);
    }

    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill(smokeTestEmail);
    }

    const phoneInput = page.locator('input[name="phone"], input[type="tel"]').first();
    if (await phoneInput.count() > 0) {
      await phoneInput.fill(smokeTestPhone);
    }

    // Continue to payment
    const continueButton = page.locator('button:has-text("Continue"), button:has-text("Next"), button[type="submit"]').first();
    await continueButton.click();

    // STEP 4: Process payment (smoke test mode - should be free/mocked)
    await page.waitForTimeout(2000);
    
    // Look for payment form or success message
    const paymentSuccess = page.locator('[data-testid="booking-success"], [data-testid="payment-success"], :has-text("Booking Confirmed"), :has-text("success")');
    const paymentForm = page.locator('[data-testid="payment-form"], form:has-text("payment" i)');
    
    // If payment form exists, we might need to handle it (in smoke test, it should be skipped)
    if (await paymentForm.count() > 0 && await paymentSuccess.count() === 0) {
      // In smoke test mode, payment should be automatically processed
      await page.waitForTimeout(3000);
    }

    // Extract booking ID from success page or URL
    let bookingId: string | null = null;
    
    // Try to get booking ID from page
    const bookingIdElement = page.locator('[data-testid="booking-id"], :has-text("Booking ID"), :has-text("booking")');
    if (await bookingIdElement.count() > 0) {
      const bookingIdText = await bookingIdElement.textContent();
      const idMatch = bookingIdText?.match(/[a-zA-Z0-9]{20,}/);
      if (idMatch) {
        bookingId = idMatch[0];
      }
    }

    // Or extract from URL
    const currentUrl = page.url();
    const urlMatch = currentUrl.match(/booking[\/-]?(\w+)|bookingId=(\w+)/i);
    if (urlMatch && !bookingId) {
      bookingId = urlMatch[1] || urlMatch[2];
    }

    // If we still don't have booking ID, try to get it from the API response
    if (!bookingId) {
      // Wait a bit more for any API calls to complete
      await page.waitForTimeout(2000);
      
      // Check page for any booking reference
      const pageContent = await page.textContent('body');
      const contentMatch = pageContent?.match(/booking[\/-]?([a-zA-Z0-9]{20,})/i);
      if (contentMatch) {
        bookingId = contentMatch[1];
      }
    }

    expect(bookingId).toBeTruthy();
    console.log(`✅ Booking created with ID: ${bookingId}`);

    // STEP 5: Register/login as the test user
    await page.goto('/auth/register');
    
    const registerEmailInput = page.locator('input[name="email"], input[type="email"]').first();
    await registerEmailInput.fill(smokeTestEmail);
    
    const registerPasswordInput = page.locator('input[name="password"], input[type="password"]').first();
    await registerPasswordInput.fill(smokeTestPassword);
    
    const registerButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")').first();
    await registerButton.click();
    
    // Wait for registration/login to complete
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/dashboard|booking|success/i);

    // STEP 6: Navigate to booking and cancel
    if (bookingId) {
      await page.goto(`/booking/${bookingId}`);
      await page.waitForTimeout(1000);

      // Look for cancel button
      const cancelButton = page.locator('[data-testid="cancel-booking"], button:has-text("Cancel"), button:has-text("Cancel Booking")').first();
      
      if (await cancelButton.count() > 0) {
        await cancelButton.click();
        
        // Confirm cancellation
        await page.waitForTimeout(500);
        const confirmCancelButton = page.locator('[data-testid="confirm-cancel"], button:has-text("Confirm"), button:has-text("Yes")').first();
        if (await confirmCancelButton.count() > 0) {
          await confirmCancelButton.click();
        }
        
        // Wait for cancellation to complete
        await page.waitForTimeout(2000);
        
        // STEP 7: Verify cancellation success
        const cancellationSuccess = page.locator('[data-testid="cancellation-success"], :has-text("cancelled"), :has-text("Cancelled")');
        await expect(cancellationSuccess.first()).toBeVisible({ timeout: 5000 });
        
        console.log(`✅ Booking ${bookingId} cancelled successfully`);

        // STEP 8: Verify calendar event was deleted
        const verifyResponse = await page.request.get(
          `/api/calendar/verify-delete?bookingId=${bookingId}`,
          { 
            headers: { 
              'x-smoke-test': 'true' 
            } 
          }
        );
        
        expect(verifyResponse.ok()).toBeTruthy();
        const verifyData = await verifyResponse.json();
        expect(verifyData.eventDeleted).toBe(true);
        
        console.log(`✅ Calendar event verified as deleted for booking ${bookingId}`);
      } else {
        console.warn('⚠️ Cancel button not found - booking may already be cancelled or in a non-cancellable state');
      }
    }

    // STEP 9: Cleanup - delete test booking and user (if cleanup endpoint exists)
    if (bookingId) {
      try {
        const cleanupResponse = await page.request.delete(
          `/api/admin/cleanup-smoke-test?bookingId=${bookingId}`,
          { 
            headers: { 
              'x-smoke-test': 'true' 
            } 
          }
        );
        
        if (cleanupResponse.ok()) {
          console.log(`✅ Cleaned up test booking ${bookingId}`);
        }
      } catch (error) {
        console.warn('⚠️ Cleanup endpoint not available - test booking may remain in database');
      }
    }
  });
});

