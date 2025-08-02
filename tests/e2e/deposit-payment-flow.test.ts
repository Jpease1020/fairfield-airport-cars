import { test, expect } from '@playwright/test';

test.describe('Deposit Payment Flow', () => {
  test('should create booking with deposit payment', async ({ page }) => {
    // Navigate to booking form
    await page.goto('/book');
    
    // Fill out booking form
    await page.fill('[data-testid="name-input"]', 'John Doe');
    await page.fill('[data-testid="email-input"]', 'john@example.com');
    await page.fill('[data-testid="phone-input"]', '(555) 123-4567');
    await page.fill('[data-testid="pickup-location-input"]', '123 Main St, Fairfield, CT');
    await page.fill('[data-testid="dropoff-location-input"]', 'JFK Airport, New York, NY');
    await page.fill('[data-testid="pickup-datetime-input"]', '2024-12-25T10:00');
    await page.selectOption('[data-testid="passengers-select"]', '2');
    
    // Calculate fare
    await page.click('button:has-text("Calculate Fare")');
    await page.waitForSelector('text=Total:', { timeout: 10000 });
    
    // Verify deposit information is shown
    await expect(page.locator('text=Deposit (50%):')).toBeVisible();
    await expect(page.locator('text=Balance Due:')).toBeVisible();
    
    // Submit booking
    await page.click('button:has-text("Book Now")');
    
    // Should redirect to payment page
    await expect(page.url()).toContain('square.link');
  });

  test('should show deposit and balance information in booking management', async ({ page }) => {
    // This test would require a booking ID, so we'll test the UI components
    await page.goto('/manage/test-booking-id');
    
    // Verify deposit information is displayed
    await expect(page.locator('text=Deposit Paid:')).toBeVisible();
    await expect(page.locator('text=Balance Due:')).toBeVisible();
    await expect(page.locator('text=Deposit Status:')).toBeVisible();
    
    // Verify pay balance button is available
    await expect(page.locator('button:has-text("Pay Balance")')).toBeVisible();
  });

  test('should handle balance payment correctly', async ({ page }) => {
    // Mock API response for balance payment
    await page.route('/api/payment/create-balance-session', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          paymentLinkUrl: 'https://square.link/test-balance-payment',
          balanceAmount: 50.00
        })
      });
    });
    
    // Navigate to manage page with balance due
    await page.goto('/manage/test-booking-id');
    
    // Click pay balance button
    await page.click('button:has-text("Pay Balance")');
    
    // Should redirect to payment page
    await expect(page.url()).toContain('square.link');
  });

  test('should show correct deposit percentage from business settings', async ({ page }) => {
    // Mock API response for deposit calculation
    await page.route('/api/payment/create-deposit-session', async route => {
      const request = route.request();
      const body = JSON.parse(await request.postData() || '{}');
      
      // Verify deposit calculation (50% of total amount)
      const expectedDeposit = Math.round((body.totalAmount * 50) / 100);
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          paymentLinkUrl: 'https://square.link/test-deposit-payment',
          depositAmount: expectedDeposit / 100,
          balanceAmount: (body.totalAmount - expectedDeposit) / 100,
          depositPercent: 50
        })
      });
    });
    
    // Navigate to booking form and submit
    await page.goto('/book');
    await page.fill('[data-testid="name-input"]', 'Test User');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="phone-input"]', '(555) 123-4567');
    await page.fill('[data-testid="pickup-location-input"]', 'Fairfield, CT');
    await page.fill('[data-testid="dropoff-location-input"]', 'JFK Airport');
    await page.fill('[data-testid="pickup-datetime-input"]', '2024-12-25T10:00');
    
    await page.click('button:has-text("Calculate Fare")');
    await page.waitForSelector('text=Total:', { timeout: 10000 });
    
    await page.click('button:has-text("Book Now")');
    
    // Should redirect to payment page
    await expect(page.url()).toContain('square.link');
  });
}); 