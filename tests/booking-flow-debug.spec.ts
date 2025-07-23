import { test, expect } from '@playwright/test';

test.describe('Booking Flow Debug', () => {
  
  test.beforeEach(async ({ page }) => {
    // Mock APIs
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
    await page.selectOption('select[name="passengers"], #passengers', '2');
    
    // Check if Calculate Fare button is visible
    const calculateButton = page.locator('button:has-text("Calculate Fare")');
    await expect(calculateButton).toBeVisible();
    
    // Click Calculate Fare
    await calculateButton.click();
    
    // Wait for fare to be calculated
    await expect(page.locator('text=$150')).toBeVisible();
    
    // Check if Book Now button is enabled
    const bookNowButton = page.locator('button[type="submit"]');
    await expect(bookNowButton).toBeEnabled();
    
    // Check button text
    await expect(bookNowButton).toContainText('Book Now');
    
    // Click Book Now
    await bookNowButton.click();
    
    // Should navigate to booking confirmation page
    await expect(page).toHaveURL(/\/booking\/[a-zA-Z0-9]+/);
  });

  test('Debug form validation', async ({ page }) => {
    await page.goto('/book');
    
    // Try to submit empty form
    const bookNowButton = page.locator('button[type="submit"]');
    await expect(bookNowButton).toBeDisabled();
    
    // Fill only some fields
    await page.fill('input[name="name"], #name', 'John Smith');
    await expect(bookNowButton).toBeDisabled();
    
    // Fill more fields
    await page.fill('input[name="email"], #email', 'john@example.com');
    await page.fill('input[name="phone"], #phone', '203-555-0123');
    await expect(bookNowButton).toBeDisabled();
    
    // Calculate fare
    await page.fill('input[name="pickupLocation"], #pickupLocation', 'Fairfield Station');
    await page.fill('input[name="dropoffLocation"], #dropoffLocation', 'JFK Airport');
    await page.fill('input[name="pickupDateTime"], #pickupDateTime', '2024-12-25T10:00');
    
    await page.click('button:has-text("Calculate Fare")');
    await expect(page.locator('text=$150')).toBeVisible();
    
    // Now button should be enabled
    await expect(bookNowButton).toBeEnabled();
  });
}); 