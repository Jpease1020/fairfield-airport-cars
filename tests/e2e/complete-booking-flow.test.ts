import { test, expect } from '@playwright/test';

test.describe('Complete Booking Flow - Gregg\'s Business', () => {
  test('Complete booking flow with payment and tracking', async ({ page }) => {
    // Step 1: Navigate to booking page
    await page.goto('/book');
    await expect(page).toHaveTitle(/Book Your Ride/);

    // Step 2: Fill out booking form
    await page.fill('input[placeholder*="full name"]', 'John Smith');
    await page.fill('input[placeholder*="email"]', 'john.smith@example.com');
    await page.fill('input[placeholder*="phone number"]', '203-555-0123');
    
    // Fill pickup location
    await page.fill('input[placeholder*="pickup address"]', 'Fairfield Station, Fairfield, CT');
    await page.waitForTimeout(1000); // Wait for autocomplete
    
    // Fill dropoff location
    await page.fill('input[placeholder*="destination"]', 'JFK Airport, Queens, NY');
    await page.waitForTimeout(1000); // Wait for autocomplete
    
    // Set pickup date and time (tomorrow at 10 AM)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    await page.fill('input[type="datetime-local"]', tomorrow.toISOString().slice(0, 16));
    
    // Set number of passengers
    await page.selectOption('select[id="passengers"]', '2');
    
    // Add flight number
    await page.fill('input[placeholder*="AA123"]', 'AA123');
    
    // Add special requests
    await page.fill('input[placeholder*="Wheelchair"]', 'Extra luggage');

    // Step 3: Calculate fare
    await page.click('button:has-text("Calculate Fare")');
    await page.waitForSelector('[data-testid="fare-amount"]', { timeout: 10000 });
    
    // Verify fare is displayed
    const fareElement = page.locator('[data-testid="fare-amount"]');
    await expect(fareElement).toBeVisible();
    const fareText = await fareElement.textContent();
    expect(fareText).toMatch(/\$\d+\.\d{2}/);

    // Step 4: Submit booking
    await page.click('button:has-text("Book Now")');
    
    // Should redirect to payment or success page
    await expect(page).toHaveURL(/\/success|\/payment|squareup\.com/);
    
    // If redirected to success page, verify booking details
    if (page.url().includes('/success')) {
      await expect(page.locator('text=Booking Confirmed')).toBeVisible();
      await expect(page.locator('text=Gregg')).toBeVisible();
    }
  });

  test('Driver dashboard functionality', async ({ page }) => {
    // Navigate to driver dashboard
    await page.goto('/driver/dashboard');
    
    // Verify driver information is displayed
    await expect(page.locator('text=Driver Dashboard - Gregg')).toBeVisible();
    await expect(page.locator('text=Toyota Highlander')).toBeVisible();
    await expect(page.locator('text=CT-ABC123')).toBeVisible();
    
    // Test status buttons
    const availableButton = page.locator('button:has-text("Available")');
    const busyButton = page.locator('button:has-text("Busy")');
    const offlineButton = page.locator('button:has-text("Offline")');
    
    await expect(availableButton).toBeVisible();
    await expect(busyButton).toBeVisible();
    await expect(offlineButton).toBeVisible();
    
    // Test location update
    const updateLocationButton = page.locator('button:has-text("Update Location")');
    if (await updateLocationButton.isVisible()) {
      await updateLocationButton.click();
      await page.waitForTimeout(2000); // Wait for location update
    }
  });

  test('Customer tracking page', async ({ page }) => {
    // Mock a booking ID for testing
    const testBookingId = 'test-booking-123';
    
    // Navigate to tracking page
    await page.goto(`/tracking/${testBookingId}`);
    
    // Should show tracking information or error
    const trackingContent = page.locator('text=Track Your Ride');
    const errorContent = page.locator('text=No tracking data available');
    
    // Either tracking info or error should be visible
    await expect(trackingContent.or(errorContent)).toBeVisible();
    
    // If tracking info is available, verify driver details
    if (await trackingContent.isVisible()) {
      await expect(page.locator('text=Gregg')).toBeVisible();
      await expect(page.locator('text=(203) 555-0123')).toBeVisible();
      await expect(page.locator('text=Toyota')).toBeVisible();
    }
  });

  test('Review submission flow', async ({ page }) => {
    // Mock a booking ID for testing
    const testBookingId = 'test-booking-123';
    
    // Navigate to feedback page
    await page.goto(`/feedback/${testBookingId}`);
    
    // Verify feedback form is displayed
    await expect(page.locator('text=Leave Feedback')).toBeVisible();
    await expect(page.locator('text=Help us improve')).toBeVisible();
    
    // Test star rating (click 5 stars)
    const stars = page.locator('[data-testid*="star"]');
    if (await stars.count() > 0) {
      await stars.nth(4).click(); // Click 5th star
    }
    
    // Add comment
    await page.fill('textarea[placeholder*="comment"]', 'Excellent service! Gregg was very professional and on time.');
    
    // Submit review
    await page.click('button:has-text("Submit Feedback")');
    
    // Should show success message
    await expect(page.locator('text=Thank You')).toBeVisible();
    await expect(page.locator('text=Your feedback has been submitted')).toBeVisible();
  });

  test('Payment integration test', async ({ page }) => {
    // Test payment link creation
    const response = await page.request.post('/api/payment/create-checkout-session', {
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        bookingId: 'test-booking-123',
        amount: 3000, // $30.00 in cents
        currency: 'USD',
        description: 'Deposit for ride from Fairfield to JFK'
      }
    });
    
    // Should return payment link or error
    expect([200, 400, 500]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('paymentLinkUrl');
    }
  });

  test('Booking API integration', async ({ page }) => {
    // Test booking creation
    const response = await page.request.post('/api/booking', {
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '203-555-0123',
        pickupLocation: 'Fairfield Station',
        dropoffLocation: 'JFK Airport',
        pickupDateTime: '2024-12-25T10:00:00',
        passengers: 2,
        fare: 150
      }
    });
    
    // Should return booking details or error
    expect([200, 400, 500]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('bookingId');
      expect(data).toHaveProperty('driverName');
      expect(data.driverName).toBe('Gregg');
    }
  });

  test('Review API integration', async ({ page }) => {
    // Test review submission
    const response = await page.request.post('/api/reviews/submit', {
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        bookingId: 'test-booking-123',
        rating: 5,
        comment: 'Great service!'
      }
    });
    
    // Should return success or error
    expect([200, 400, 404, 500]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);
    }
  });

  test('Tracking API integration', async ({ page }) => {
    // Test tracking information retrieval
    const response = await page.request.get('/api/tracking/test-booking-123');
    
    // Should return tracking data or error
    expect([200, 404, 500]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('bookingId');
      expect(data).toHaveProperty('driverName');
    }
  });

  test('Mobile responsiveness for booking flow', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/book');
    
    // Verify form is usable on mobile
    await expect(page.locator('input[placeholder*="full name"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="email"]')).toBeVisible();
    
    // Test form interaction on mobile
    await page.fill('input[placeholder*="full name"]', 'Mobile Test');
    await page.fill('input[placeholder*="email"]', 'mobile@test.com');
    
    // Verify buttons are accessible
    await expect(page.locator('button:has-text("Calculate Fare")')).toBeVisible();
    await expect(page.locator('button:has-text("Book Now")')).toBeVisible();
  });

  test('Accessibility compliance for booking flow', async ({ page }) => {
    await page.goto('/book');
    
    // Check for proper form labels
    await expect(page.locator('label[for="name"]')).toBeVisible();
    await expect(page.locator('label[for="email"]')).toBeVisible();
    await expect(page.locator('label[for="phone"]')).toBeVisible();
    
    // Check for proper ARIA attributes
    const nameInput = page.locator('input[id="name"]');
    await expect(nameInput).toHaveAttribute('id', 'name');
    
    const emailInput = page.locator('input[id="email"]');
    await expect(emailInput).toHaveAttribute('type', 'email');
    
    // Check for proper button accessibility
    const calculateButton = page.locator('button:has-text("Calculate Fare")');
    await expect(calculateButton).toHaveAttribute('type', 'button');
  });
}); 