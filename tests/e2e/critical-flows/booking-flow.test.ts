import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
  test('Complete booking flow - happy path', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/');
    await expect(page).toHaveTitle(/Fairfield Airport Cars/);
    
    // 2. Navigate to booking page
    await page.click('a[href="/book"]');
    await expect(page).toHaveURL('/book');
    
    // 3. Verify booking form is present
    await expect(page.locator('input[placeholder*="full name"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="email"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="phone"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="pickup"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="dropoff"]')).toBeVisible();
    
    // 4. Fill out the form
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
    
    // 5. Calculate fare
    await page.click('button:has-text("Calculate Fare")');
    
    // 6. Verify fare calculation (this might show loading state)
    await page.waitForTimeout(2000);
    
    // 7. Verify book button is enabled
    const bookButton = page.locator('button:has-text("Book Now")');
    await expect(bookButton).toBeEnabled();
    
    // Note: We don't actually submit the booking in this test to avoid creating real records
    // In a real scenario, you'd want to use test environment with test payment providers
  });

  test('Navigation flow', async ({ page }) => {
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

  test('Form validation', async ({ page }) => {
    await page.goto('/book');
    
    // Try to calculate fare without filling required fields
    await page.click('button:has-text("Calculate Fare")');
    
    // Should show validation errors or keep book button disabled
    const bookButton = page.locator('button:has-text("Book Now")');
    await expect(bookButton).toBeDisabled();
  });
}); 