import { test, expect } from '@playwright/test';

test.describe('Booking Flow Debug', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock ALL external APIs to prevent real calls
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
        body: JSON.stringify({ fare: 150, distance: '45 miles', duration: '1 hour 15 minutes' })
      });
    });

    await page.route('**/api/create-checkout-session', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ paymentLinkUrl: 'https://squareup.com/checkout/test-session' })
      });
    });

    await page.route('**/api/send-confirmation', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Confirmation sent successfully' })
      });
    });

    // Mock Google Maps API calls
    await page.route('**/maps.googleapis.com/**', async route => {
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

    // Mock Firebase calls
    await page.route('**/firebase/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
  });

  test('Debug booking form submission', async ({ page }) => {
    await page.goto('/book');
    
    // Fill out the form
    await page.fill('input[name="name"], #name', 'John Smith');
    await page.fill('input[name="email"], #email', 'john@example.com');
    await page.fill('input[name="phone"], #phone', '203-555-0123');
    await page.fill('input[name="pickupLocation"], #pickupLocation', 'Fairfield Station');
    await page.fill('input[name="dropoffLocation"], #dropoffLocation', 'JFK Airport');
    await page.fill('input[name="pickupDateTime"], #pickupDateTime', '2024-12-25T10:00');
    
    // Fix: passengers is a number input, not a select
    await page.fill('input[name="passengers"], #passengers', '2');
    
    // Check if Calculate Fare button is visible
    const calculateButton = page.locator('button:has-text("Calculate Fare")');
    await expect(calculateButton).toBeVisible();
    
    // Click Calculate Fare
    await calculateButton.click();
    
    // Wait for fare to be calculated
    await expect(page.locator('text=$150')).toBeVisible();
    
    // Check if Book Now button is enabled - use the actual button text
    const bookNowButton = page.locator('button[type="submit"]:has-text("Book Now")');
    await expect(bookNowButton).toBeEnabled();
    
    // Click Book Now
    await bookNowButton.click();
    
    // Should navigate to booking confirmation page
    await expect(page).toHaveURL(/\/booking\/[a-zA-Z0-9]+/);
  });

  test('Debug form validation', async ({ page }) => {
    await page.goto('/book');
    
    // Try to submit empty form - button should be disabled and show "Calculate fare first"
    const bookNowButton = page.locator('button[type="submit"]');
    await expect(bookNowButton).toBeDisabled();
    await expect(bookNowButton).toContainText('Calculate fare first');
    
    // Fill only some fields
    await page.fill('input[name="name"], #name', 'John Smith');
    await expect(bookNowButton).toBeDisabled();
    await expect(bookNowButton).toContainText('Calculate fare first');
    
    // Fill more fields
    await page.fill('input[name="email"], #email', 'john@example.com');
    await page.fill('input[name="phone"], #phone', '203-555-0123');
    await expect(bookNowButton).toBeDisabled();
    await expect(bookNowButton).toContainText('Calculate fare first');
    
    // Calculate fare
    await page.fill('input[name="pickupLocation"], #pickupLocation', 'Fairfield Station');
    await page.fill('input[name="dropoffLocation"], #dropoffLocation', 'JFK Airport');
    await page.fill('input[name="pickupDateTime"], #pickupDateTime', '2024-12-25T10:00');
    
    await page.click('button:has-text("Calculate Fare")');
    await expect(page.locator('text=$150')).toBeVisible();
    
    // Now button should be enabled and show "Book Now"
    await expect(bookNowButton).toBeEnabled();
    await expect(bookNowButton).toContainText('Book Now');
  });

  test('Test complete booking flow with all mocks', async ({ page }) => {
    await page.goto('/book');
    
    console.log('🔧 Test: Starting booking flow test');
    
    // Fill all required fields
    await page.fill('input[name="name"], #name', 'Test Customer');
    await page.fill('input[name="email"], #email', 'test@example.com');
    await page.fill('input[name="phone"], #phone', '203-555-0123');
    await page.fill('input[name="pickupLocation"], #pickupLocation', 'Fairfield Station');
    await page.fill('input[name="dropoffLocation"], #dropoffLocation', 'JFK Airport');
    await page.fill('input[name="pickupDateTime"], #pickupDateTime', '2024-12-25T10:00');
    await page.fill('input[name="passengers"], #passengers', '2');
    
    console.log('🔧 Test: Filled all form fields');
    
    // Calculate fare
    await page.click('button:has-text("Calculate Fare")');
    await expect(page.locator('text=$150')).toBeVisible();
    
    console.log('🔧 Test: Fare calculated successfully');
    
    // Submit booking
    const bookNowButton = page.locator('button[type="submit"]:has-text("Book Now")');
    await expect(bookNowButton).toBeEnabled();
    await bookNowButton.click();
    
    console.log('🔧 Test: Booking submitted');
    
    // Should navigate to booking confirmation
    await expect(page).toHaveURL(/\/booking\/[a-zA-Z0-9]+/);
    
    console.log('🔧 Test: Booking flow completed successfully');
  });
}); 