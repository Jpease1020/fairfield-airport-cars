import { test, expect } from '@playwright/test';
import { setupPlaywrightMocks } from '../../utils/test-helpers';

test.describe('Critical User Flows - Streamlined', () => {
  test.beforeEach(async ({ page }) => {
    // Setup API mocking for all tests
    await setupPlaywrightMocks(page);
  });

  test('Complete booking flow - happy path', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/Fairfield Airport Cars/);
    
    // 2. Navigate to booking page
    await page.click('a[href="/book"]');
    await expect(page).toHaveURL('/book');
    
    // 3. Fill out the booking form
    await page.fill('input[placeholder*="full name"]', 'John Smith');
    await page.fill('input[placeholder*="email"]', 'john@example.com');
    await page.fill('input[placeholder*="\\(123\\) 456-7890"]', '203-555-0123');
    await page.fill('input[placeholder*="pickup"]', 'Fairfield Station, Fairfield, CT');
    await page.fill('input[placeholder*="dropoff"]', 'JFK Airport, Queens, NY');
    
    // Set future date and time
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    futureDate.setHours(10, 0, 0, 0);
    await page.fill('input[type="datetime-local"]', futureDate.toISOString().slice(0, 16));
    
    // Set passengers
    await page.fill('input[type="number"]', '2');
    
    // 4. Calculate fare
    await page.click('button:has-text("Calculate Fare")');
    
    // 5. Verify fare calculation
    await expect(page.locator('text=$150')).toBeVisible();
    
    // 6. Verify book button is enabled
    const bookButton = page.locator('button:has-text("Book Now")');
    await expect(bookButton).toBeEnabled();
    
    // Note: We don't actually submit the booking to avoid creating real records
  });

  test('Navigation flow - all pages accessible', async ({ page }) => {
    // Test basic navigation
    await page.goto('/');
    
    // Navigate to book page
    await page.click('a[href="/book"]');
    await expect(page).toHaveURL('/book');
    
    // Navigate to help page
    await page.click('a[href="/help"]');
    await expect(page).toHaveURL('/help');
    
    // Navigate to about page
    await page.click('a[href="/about"]');
    await expect(page).toHaveURL('/about');
    
    // Navigate back to home
    await page.click('a[href="/"]');
    await expect(page).toHaveURL('/');
  });

  test('Form validation - required fields', async ({ page }) => {
    await page.goto('/book');
    
    // Try to calculate fare without filling required fields
    await page.click('button:has-text("Calculate Fare")');
    
    // Should show validation errors or keep book button disabled
    const bookButton = page.locator('button:has-text("Book Now")');
    await expect(bookButton).toBeDisabled();
  });

  test('Mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Verify mobile menu button is visible
    await expect(page.locator('button[aria-label*="menu"]')).toBeVisible();
    
    // Test mobile navigation
    await page.click('button[aria-label*="menu"]');
    await expect(page.locator('nav')).toBeVisible();
    
    // Navigate using mobile menu
    await page.click('a[href="/book"]');
    await expect(page).toHaveURL('/book');
  });

  test('Accessibility compliance', async ({ page }) => {
    await page.goto('/');
    
    // Test for heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
    
    // Test for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    for (let i = 0; i < imageCount; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }
    
    // Test for form labels
    await page.goto('/book');
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        const hasAriaLabel = await input.getAttribute('aria-label');
        expect(hasLabel || hasAriaLabel).toBeTruthy();
      }
    }
  });

  test('Performance - page load times', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
    
    // Test booking page load time
    const bookingStartTime = Date.now();
    await page.goto('/book');
    await page.waitForLoadState('networkidle');
    
    const bookingLoadTime = Date.now() - bookingStartTime;
    expect(bookingLoadTime).toBeLessThan(3000);
  });

  test('Error handling - API failures', async ({ page }) => {
    // Mock API error
    await page.route('**/api/booking/estimate-fare', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/book');
    
    // Fill out form
    await page.fill('input[placeholder*="full name"]', 'John Smith');
    await page.fill('input[placeholder*="email"]', 'john@example.com');
    await page.fill('input[placeholder*="\\(123\\) 456-7890"]', '203-555-0123');
    await page.fill('input[placeholder*="pickup"]', 'Fairfield Station');
    await page.fill('input[placeholder*="dropoff"]', 'JFK Airport');
    await page.fill('input[type="number"]', '2');
    
    // Try to calculate fare
    await page.click('button:has-text("Calculate Fare")');
    
    // Should show error message
    await expect(page.locator('text=error')).toBeVisible();
  });
}); 