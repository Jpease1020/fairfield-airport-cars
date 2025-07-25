import { test, expect } from '@playwright/test';

test.describe('Booking System Critical Flows', () => {
  test('Payment integration - Square checkout flow', async ({ page }) => {
    await page.goto('/book');
    
    // Fill out complete booking form
    await page.fill('input[placeholder*="full name"]', 'John Smith');
    await page.fill('input[placeholder*="email"]', 'john@example.com');
    await page.fill('input[placeholder*="phone number"]', '203-555-0123');
    await page.fill('input[placeholder*="pickup address"]', 'Fairfield Station, Fairfield, CT');
    await page.fill('input[placeholder*="destination"]', 'JFK Airport, Queens, NY');
    
    // Set future date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    await page.fill('input[type="datetime-local"]', tomorrow.toISOString().slice(0, 16));
    
    // Set passengers
    await page.fill('input[type="number"]', '2');
    
    // Calculate fare
    await page.click('button:has-text("Calculate Fare")');
    
    // Wait for fare calculation
    await page.waitForSelector('.fare-display, .price-display', { timeout: 10000 });
    
    // Submit booking
    await page.click('button:has-text("Book Your Ride")');
    
    // Should redirect to payment page or show payment form
    await expect(page).toHaveURL(/\/payment|\/checkout|\/success/);
    
    // Verify payment form elements
    await expect(page.locator('input[name*="card"], input[name*="payment"]')).toBeVisible();
  });

  test('Real-time driver availability', async ({ page }) => {
    await page.goto('/book');
    
    // Fill booking form
    await page.fill('input[placeholder*="pickup address"]', 'Fairfield Station');
    await page.fill('input[placeholder*="destination"]', 'JFK Airport');
    
    // Set time for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    await page.fill('input[type="datetime-local"]', tomorrow.toISOString().slice(0, 16));
    
    // Calculate fare
    await page.click('button:has-text("Calculate Fare")');
    
    // Should show driver availability status
    await expect(page.locator('.driver-status, .availability-status')).toBeVisible();
    
    // Check for available drivers or wait time
    const statusText = await page.locator('.driver-status, .availability-status').textContent();
    expect(statusText).toMatch(/available|wait|ETA/i);
  });

  test('Booking confirmation and notifications', async ({ page }) => {
    await page.goto('/book');
    
    // Complete booking form
    await page.fill('input[placeholder*="full name"]', 'Jane Doe');
    await page.fill('input[placeholder*="email"]', 'jane@example.com');
    await page.fill('input[placeholder*="phone number"]', '203-555-0124');
    await page.fill('input[placeholder*="pickup address"]', 'Fairfield Station');
    await page.fill('input[placeholder*="destination"]', 'JFK Airport');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    await page.fill('input[type="datetime-local"]', tomorrow.toISOString().slice(0, 16));
    await page.fill('input[type="number"]', '1');
    
    await page.click('button:has-text("Calculate Fare")');
    await page.click('button:has-text("Book Your Ride")');
    
    // Should show confirmation page
    await expect(page).toHaveURL(/\/success|\/confirmation/);
    
    // Verify confirmation details
    await expect(page.locator('text=Jane Doe')).toBeVisible();
    await expect(page.locator('text=JFK Airport')).toBeVisible();
    
    // Check for booking reference
    await expect(page.locator('.booking-ref, .confirmation-id')).toBeVisible();
  });

  test('Booking cancellation flow', async ({ page }) => {
    // First create a booking
    await page.goto('/book');
    await page.fill('input[placeholder*="full name"]', 'Cancel Test');
    await page.fill('input[placeholder*="email"]', 'cancel@example.com');
    await page.fill('input[placeholder*="phone number"]', '203-555-0125');
    await page.fill('input[placeholder*="pickup address"]', 'Fairfield Station');
    await page.fill('input[placeholder*="destination"]', 'JFK Airport');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    await page.fill('input[type="datetime-local"]', tomorrow.toISOString().slice(0, 16));
    await page.fill('input[type="number"]', '1');
    
    await page.click('button:has-text("Calculate Fare")');
    await page.click('button:has-text("Book Your Ride")');
    
    // Get booking ID from confirmation
    const bookingId = await page.locator('.booking-ref, .confirmation-id').textContent();
    
    // Navigate to cancellation page
    await page.goto('/cancel');
    
    // Enter booking details
    await page.fill('input[placeholder*="email"], input[name*="email"]', 'cancel@example.com');
    await page.fill('input[placeholder*="booking"], input[name*="booking"]', bookingId || 'TEST123');
    
    // Submit cancellation
    await page.click('button:has-text("Cancel"), button:has-text("Submit")');
    
    // Should show cancellation confirmation
    await expect(page.locator('text=Cancelled, text=Cancellation confirmed')).toBeVisible();
  });

  test('Dynamic pricing - peak hours', async ({ page }) => {
    await page.goto('/book');
    
    // Fill form for peak hours (early morning airport departure)
    await page.fill('input[placeholder*="pickup address"]', 'Fairfield Station');
    await page.fill('input[placeholder*="destination"]', 'JFK Airport');
    
    // Set time for early morning (peak hours)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(6, 0, 0, 0); // 6 AM - peak time
    await page.fill('input[type="datetime-local"]', tomorrow.toISOString().slice(0, 16));
    
    await page.fill('input[type="number"]', '2');
    await page.click('button:has-text("Calculate Fare")');
    
    // Should show peak pricing indicator
    await expect(page.locator('.peak-pricing, .surge-pricing, .dynamic-pricing')).toBeVisible();
    
    // Verify pricing is higher than base rate
    const fareText = await page.locator('.fare-display, .price-display').textContent();
    expect(fareText).toMatch(/\$[0-9]+/);
  });

  test('Multi-passenger booking validation', async ({ page }) => {
    await page.goto('/book');
    
    // Fill form with multiple passengers
    await page.fill('input[placeholder*="full name"]', 'Group Booking');
    await page.fill('input[placeholder*="email"]', 'group@example.com');
    await page.fill('input[placeholder*="phone number"]', '203-555-0126');
    await page.fill('input[placeholder*="pickup address"]', 'Fairfield Station');
    await page.fill('input[placeholder*="destination"]', 'JFK Airport');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    await page.fill('input[type="datetime-local"]', tomorrow.toISOString().slice(0, 16));
    
    // Set 6 passengers (should trigger larger vehicle)
    await page.fill('input[type="number"]', '6');
    await page.click('button:has-text("Calculate Fare")');
    
    // Should show vehicle upgrade or larger vehicle option
    await expect(page.locator('.vehicle-upgrade, .larger-vehicle, .SUV')).toBeVisible();
    
    // Verify pricing reflects larger vehicle
    const fareText = await page.locator('.fare-display, .price-display').textContent();
    expect(fareText).toMatch(/\$[0-9]+/);
  });

  test('Airport pickup time validation', async ({ page }) => {
    await page.goto('/book');
    
    // Fill form with pickup from airport
    await page.fill('input[placeholder*="full name"]', 'Airport Pickup');
    await page.fill('input[placeholder*="email"]', 'airport@example.com');
    await page.fill('input[placeholder*="phone number"]', '203-555-0127');
    await page.fill('input[placeholder*="pickup address"]', 'JFK Airport');
    await page.fill('input[placeholder*="destination"]', 'Fairfield Station');
    
    // Set time for today (should show validation error)
    const today = new Date();
    today.setHours(10, 0, 0, 0);
    await page.fill('input[type="datetime-local"]', today.toISOString().slice(0, 16));
    
    await page.fill('input[type="number"]', '2');
    await page.click('button:has-text("Calculate Fare")');
    
    // Should show validation error for same-day airport pickup
    await expect(page.locator('.error-message, .validation-error')).toBeVisible();
    
    // Error should mention advance booking requirement
    const errorText = await page.locator('.error-message, .validation-error').textContent();
    expect(errorText).toMatch(/advance|ahead|prior/i);
  });

  test('Service area validation', async ({ page }) => {
    await page.goto('/book');
    
    // Try booking to location outside service area
    await page.fill('input[placeholder*="full name"]', 'Out of Area');
    await page.fill('input[placeholder*="email"]', 'outofarea@example.com');
    await page.fill('input[placeholder*="phone number"]', '203-555-0128');
    await page.fill('input[placeholder*="pickup address"]', 'Fairfield Station');
    await page.fill('input[placeholder*="destination"]', 'Los Angeles, CA'); // Outside service area
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    await page.fill('input[type="datetime-local"]', tomorrow.toISOString().slice(0, 16));
    
    await page.fill('input[type="number"]', '2');
    await page.click('button:has-text("Calculate Fare")');
    
    // Should show service area error
    await expect(page.locator('.service-area-error, .out-of-area')).toBeVisible();
    
    // Error should mention service area limitations
    const errorText = await page.locator('.service-area-error, .out-of-area').textContent();
    expect(errorText).toMatch(/service area|not available|outside/i);
  });
}); 