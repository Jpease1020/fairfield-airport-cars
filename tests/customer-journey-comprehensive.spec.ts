import { test, expect } from '@playwright/test';

// Realistic test data
const testCustomer = {
  name: 'John Smith',
  email: 'john.smith@example.com',
  phone: '203-555-0123',
  pickupLocation: 'Fairfield Station, Fairfield, CT',
  dropoffLocation: 'JFK Airport, Queens, NY',
  pickupDateTime: '2024-12-25T10:00',
  passengers: 2,
  flightNumber: 'AA123',
  notes: 'Please pick up at the main entrance'
};

const expectedFare = {
  fare: 150,
  distance: '45 miles',
  duration: '1 hour 15 minutes'
};

test.describe('Comprehensive Customer Journey', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock all external APIs
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

    await page.route('**/api/estimate-fare', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(expectedFare)
      });
    });

    await page.route('**/api/create-checkout-session', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          paymentLinkUrl: 'https://squareup.com/checkout/test-session'
        })
      });
    });

    await page.route('**/api/send-confirmation', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Confirmation sent successfully' })
      });
    });
  });

  test('Complete booking flow - happy path', async ({ page }) => {
    // 1. Homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/Fairfield Airport Cars/);
    
    // Verify key elements are present
    await expect(page.locator('h1')).toContainText(/Premium Airport Transportation/);
    await expect(page.locator('a[href="/book"], button:has-text("Book Now")')).toBeVisible();
    
    // 2. Navigate to booking page
    await page.click('a[href="/book"], button:has-text("Book Now")');
    await expect(page).toHaveURL('/book');
    
    // 3. Fill booking form
    await page.fill('input[name="name"], #name', testCustomer.name);
    await page.fill('input[name="email"], #email', testCustomer.email);
    await page.fill('input[name="phone"], #phone', testCustomer.phone);
    
    // Location inputs with autocomplete
    await page.fill('input[name="pickupLocation"], #pickupLocation', testCustomer.pickupLocation);
    await page.waitForTimeout(500); // Wait for autocomplete
    await page.click('text=Fairfield Station, Fairfield, CT');
    
    await page.fill('input[name="dropoffLocation"], #dropoffLocation', testCustomer.dropoffLocation);
    await page.waitForTimeout(500);
    await page.click('text=JFK Airport, Queens, NY');
    
    // Date and time
    await page.fill('input[name="pickupDateTime"], #pickupDateTime', testCustomer.pickupDateTime);
    
    // Passengers
    await page.selectOption('select[name="passengers"], #passengers', testCustomer.passengers.toString());
    
    // Optional fields
    await page.fill('input[name="flightNumber"], #flightNumber', testCustomer.flightNumber);
    await page.fill('textarea[name="notes"], #notes', testCustomer.notes);
    
    // 4. Calculate fare
    await page.click('button:has-text("Calculate Fare")');
    await expect(page.locator('[data-testid="fare-display"], .fare-display')).toContainText('$150');
    
    // 5. Submit booking
    await page.click('button[type="submit"]');
    
    // 6. Verify booking confirmation page
    await expect(page).toHaveURL(/\/booking\/[a-zA-Z0-9]+/);
    await expect(page.locator('h1')).toContainText(/Booking Confirmation/);
    await expect(page.locator('text=John Smith')).toBeVisible();
    
    // 7. Verify payment link is generated
    await expect(page.locator('a[href*="squareup.com"]')).toBeVisible();
  });

  test('Booking form validation', async ({ page }) => {
    await page.goto('/book');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('.error, [role="alert"]')).toBeVisible();
    
    // Fill required fields
    await page.fill('input[name="name"], #name', testCustomer.name);
    await page.fill('input[name="email"], #email', testCustomer.email);
    await page.fill('input[name="phone"], #phone', testCustomer.phone);
    await page.fill('input[name="pickupLocation"], #pickupLocation', testCustomer.pickupLocation);
    await page.fill('input[name="dropoffLocation"], #dropoffLocation', testCustomer.dropoffLocation);
    await page.fill('input[name="pickupDateTime"], #pickupDateTime', testCustomer.pickupDateTime);
    
    // Should now be able to submit
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/booking\/[a-zA-Z0-9]+/);
  });

  test('Fare calculation accuracy', async ({ page }) => {
    await page.goto('/book');
    
    // Fill form
    await page.fill('input[name="name"], #name', testCustomer.name);
    await page.fill('input[name="email"], #email', testCustomer.email);
    await page.fill('input[name="phone"], #phone', testCustomer.phone);
    await page.fill('input[name="pickupLocation"], #pickupLocation', testCustomer.pickupLocation);
    await page.fill('input[name="dropoffLocation"], #dropoffLocation', testCustomer.dropoffLocation);
    await page.fill('input[name="pickupDateTime"], #pickupDateTime', testCustomer.pickupDateTime);
    
    // Calculate fare
    await page.click('button:has-text("Calculate Fare")');
    
    // Verify fare details
    await expect(page.locator('[data-testid="fare-display"], .fare-display')).toContainText('$150');
    await expect(page.locator('text=45 miles')).toBeVisible();
    await expect(page.locator('text=1 hour 15 minutes')).toBeVisible();
  });

  test('Payment flow integration', async ({ page }) => {
    await page.goto('/book');
    
    // Complete booking form
    await page.fill('input[name="name"], #name', testCustomer.name);
    await page.fill('input[name="email"], #email', testCustomer.email);
    await page.fill('input[name="phone"], #phone', testCustomer.phone);
    await page.fill('input[name="pickupLocation"], #pickupLocation', testCustomer.pickupLocation);
    await page.fill('input[name="dropoffLocation"], #dropoffLocation', testCustomer.dropoffLocation);
    await page.fill('input[name="pickupDateTime"], #pickupDateTime', testCustomer.pickupDateTime);
    await page.click('button[type="submit"]');
    
    // Navigate to booking confirmation
    await expect(page).toHaveURL(/\/booking\/[a-zA-Z0-9]+/);
    
    // Click payment button
    await page.click('button:has-text("Pay Deposit"), a[href*="squareup.com"]');
    
    // Should redirect to Square
    await expect(page).toHaveURL(/squareup\.com/);
  });

  test('Admin dashboard booking management', async ({ page }) => {
    // This would require admin authentication
    // For now, we'll test the admin route exists
    await page.goto('/admin');
    
    // Should redirect to login or show admin interface
    await expect(page.locator('h1, .admin-header')).toBeVisible();
  });

  test('Mobile responsiveness', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/book');
    
    // Verify form is usable on mobile
    await expect(page.locator('input[name="name"], #name')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Test form interaction on mobile
    await page.fill('input[name="name"], #name', testCustomer.name);
    await page.fill('input[name="email"], #email', testCustomer.email);
    
    // Should be able to submit on mobile
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/booking\/[a-zA-Z0-9]+/);
  });

  test('Error handling', async ({ page }) => {
    // Mock API errors
    await page.route('**/api/estimate-fare', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Fare calculation failed' })
      });
    });

    await page.goto('/book');
    
    // Fill form
    await page.fill('input[name="name"], #name', testCustomer.name);
    await page.fill('input[name="email"], #email', testCustomer.email);
    await page.fill('input[name="phone"], #phone', testCustomer.phone);
    await page.fill('input[name="pickupLocation"], #pickupLocation', testCustomer.pickupLocation);
    await page.fill('input[name="dropoffLocation"], #dropoffLocation', testCustomer.dropoffLocation);
    await page.fill('input[name="pickupDateTime"], #pickupDateTime', testCustomer.pickupDateTime);
    
    // Try to calculate fare
    await page.click('button:has-text("Calculate Fare")');
    
    // Should show error message
    await expect(page.locator('.error, [role="alert"]')).toContainText(/error|failed/i);
  });
}); 