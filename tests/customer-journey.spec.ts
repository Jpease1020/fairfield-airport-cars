import { test, expect } from '@playwright/test';

// Mock data for consistent testing
const mockBookingData = {
  name: 'Test Customer',
  email: 'test@example.com',
  phone: '555-123-4567',
  pickupLocation: 'Fairfield Station, Fairfield, CT',
  dropoffLocation: 'JFK Airport, Queens, NY',
  pickupDateTime: '2024-12-25T10:00',
  passengers: 2,
  flightNumber: 'AA123',
  notes: 'Test booking'
};

const mockFareEstimate = {
  fare: 150,
  distance: '45 miles',
  duration: '1 hour 15 minutes'
};

const mockPaymentResponse = {
  checkoutUrl: 'https://squareup.com/checkout/test-session',
  sessionId: 'test-session-123'
};

test.describe('Customer Journey Tests (Mocked APIs)', () => {
  
  // Mock all external API calls before each test
  test.beforeEach(async ({ page }) => {
    // Mock Google Maps API calls
    await page.route('**/api/places-autocomplete', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          predictions: [
            { description: 'Fairfield Station, Fairfield, CT' },
            { description: 'JFK Airport, Queens, NY' }
          ]
        })
      });
    });

    // Mock fare estimation
    await page.route('**/api/estimate-fare', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockFareEstimate)
      });
    });

    // Mock payment session creation
    await page.route('**/api/create-checkout-session', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPaymentResponse)
      });
    });

    // Mock SMS sending
    await page.route('**/api/send-confirmation', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, messageId: 'test-sms-123' })
      });
    });

    // Mock email sending
    await page.route('**/api/send-email', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, messageId: 'test-email-123' })
      });
    });
  });

  test('complete booking flow - happy path', async ({ page }) => {
    // 1. Navigate to homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/Fairfield Airport Cars/);
    
    // 2. Navigate to booking page
    await page.click('a[href="/book"], button:has-text("Book Now")');
    await expect(page).toHaveURL('/book');
    
    // 3. Fill out booking form
    await page.fill('#name', mockBookingData.name);
    await page.fill('#email', mockBookingData.email);
    await page.fill('#phone', mockBookingData.phone);
    await page.fill('#pickupLocation', mockBookingData.pickupLocation);
    await page.fill('#dropoffLocation', mockBookingData.dropoffLocation);
    await page.fill('#pickupDateTime', mockBookingData.pickupDateTime);
    await page.selectOption('#passengers', mockBookingData.passengers.toString());
    await page.fill('#flightNumber', mockBookingData.flightNumber);
    await page.fill('#notes', mockBookingData.notes);
    
    // 4. Calculate fare
    await page.click('button:has-text("Calculate Fare")');
    await expect(page.locator('[data-testid="fare-display"]')).toContainText('$150');
    
    // 5. Submit booking
    await page.click('button[type="submit"]');
    
    // 6. Verify payment redirect
    await expect(page).toHaveURL(/squareup\.com/);
  });

  test('booking form validation', async ({ page }) => {
    await page.goto('/book');
    
    // Test required field validation
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Name is required');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Email is required');
    
    // Test email format validation
    await page.fill('#email', 'invalid-email');
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid email format');
    
    // Test phone format validation
    await page.fill('#phone', '123');
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid phone number');
    
    // Test date validation (past date)
    await page.fill('#pickupDateTime', '2020-01-01T10:00');
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Date must be in the future');
  });

  test('fare calculation with different scenarios', async ({ page }) => {
    await page.goto('/book');
    
    // Test basic fare calculation
    await page.fill('#pickupLocation', 'Fairfield Station');
    await page.fill('#dropoffLocation', 'JFK Airport');
    await page.click('button:has-text("Calculate Fare")');
    await expect(page.locator('[data-testid="fare-display"]')).toContainText('$150');
    
    // Test fare with extra passengers
    await page.selectOption('#passengers', '4');
    await page.click('button:has-text("Calculate Fare")');
    await expect(page.locator('[data-testid="fare-display"]')).toContainText('$180'); // Higher fare
    
    // Test fare calculation error handling
    await page.fill('#pickupLocation', 'Invalid Location');
    await page.fill('#dropoffLocation', 'Another Invalid Location');
    await page.click('button:has-text("Calculate Fare")');
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Unable to calculate fare');
  });

  test('autocomplete functionality', async ({ page }) => {
    await page.goto('/book');
    
    // Test pickup location autocomplete
    await page.fill('#pickupLocation', 'Fairfield');
    await page.waitForTimeout(500); // Wait for debounce
    await expect(page.locator('[data-testid="autocomplete-suggestions"]')).toBeVisible();
    await page.click('[data-testid="autocomplete-suggestion"]:first-child');
    await expect(page.locator('#pickupLocation')).toHaveValue('Fairfield Station, Fairfield, CT');
    
    // Test dropoff location autocomplete
    await page.fill('#dropoffLocation', 'JFK');
    await page.waitForTimeout(500);
    await expect(page.locator('[data-testid="autocomplete-suggestions"]')).toBeVisible();
    await page.click('[data-testid="autocomplete-suggestion"]:first-child');
    await expect(page.locator('#dropoffLocation')).toHaveValue('JFK Airport, Queens, NY');
  });

  test('booking management flow', async ({ page }) => {
    // Mock booking retrieval
    await page.route('**/api/bookings/*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-booking-123',
          ...mockBookingData,
          status: 'confirmed',
          fare: 150,
          createdAt: new Date().toISOString()
        })
      });
    });

    // Navigate to booking details
    await page.goto('/booking/test-booking-123');
    await expect(page.locator('body')).toContainText('Booking Confirmed');
    await expect(page.locator('body')).toContainText(mockBookingData.name);
    await expect(page.locator('body')).toContainText('$150');
    
    // Test edit booking
    await page.click('button:has-text("Edit Booking")');
    await expect(page).toHaveURL(/\/booking\/test-booking-123\/edit/);
    
    // Test cancel booking
    await page.goto('/booking/test-booking-123');
    await page.click('button:has-text("Cancel Booking")');
    await expect(page.locator('[data-testid="confirmation-dialog"]')).toBeVisible();
  });

  test('payment success flow', async ({ page }) => {
    // Mock successful payment
    await page.route('**/api/complete-payment', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          bookingId: 'test-booking-123'
        })
      });
    });

    await page.goto('/success?session_id=test-session-123');
    await expect(page.locator('body')).toContainText('Payment Successful');
    await expect(page.locator('body')).toContainText('Your booking has been confirmed');
  });

  test('help and support flow', async ({ page }) => {
    await page.goto('/help');
    await expect(page.locator('body')).toContainText('Help & FAQs');
    
    // Test FAQ expansion
    await page.click('[data-testid="faq-item"]:first-child');
    await expect(page.locator('[data-testid="faq-answer"]:first-child')).toBeVisible();
    
    // Test contact buttons
    await page.click('button:has-text("Call Us")');
    // Verify phone number is correct (would open phone app in real scenario)
    
    await page.click('button:has-text("Text Us")');
    // Verify SMS functionality (would open SMS app in real scenario)
  });

  test('feedback submission', async ({ page }) => {
    // Mock feedback submission
    await page.route('**/api/feedback', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await page.goto('/feedback/test-booking-123');
    
    // Test star rating
    await page.click('[data-testid="star-rating"] [data-testid="star"]:nth-child(4)'); // 4 stars
    await expect(page.locator('[data-testid="star-rating"] [data-testid="star"]:nth-child(4)')).toHaveClass(/selected/);
    
    // Test comment submission
    await page.fill('#comments', 'Great service! Very professional driver.');
    await page.click('button:has-text("Submit Feedback")');
    
    await expect(page.locator('body')).toContainText('Thank you for your feedback');
  });
});

test.describe('Error Handling Tests', () => {
  
  test('network error handling', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/estimate-fare', async route => {
      await route.abort('failed');
    });

    await page.goto('/book');
    await page.fill('#pickupLocation', 'Fairfield Station');
    await page.fill('#dropoffLocation', 'JFK Airport');
    await page.click('button:has-text("Calculate Fare")');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Network error');
    await expect(page.locator('button:has-text("Retry")')).toBeVisible();
  });

  test('payment failure handling', async ({ page }) => {
    // Mock payment failure
    await page.route('**/api/create-checkout-session', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Payment failed' })
      });
    });

    await page.goto('/book');
    // Fill form and submit
    await page.fill('#name', mockBookingData.name);
    await page.fill('#email', mockBookingData.email);
    await page.fill('#phone', mockBookingData.phone);
    await page.fill('#pickupLocation', mockBookingData.pickupLocation);
    await page.fill('#dropoffLocation', mockBookingData.dropoffLocation);
    await page.fill('#pickupDateTime', mockBookingData.pickupDateTime);
    await page.click('button[type="submit"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Payment failed');
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
  });
}); 