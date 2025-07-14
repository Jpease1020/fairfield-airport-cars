import { test, expect } from '@playwright/test';

test.describe('Visual Testing', () => {
  test('homepage should match snapshot', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the entire page
    await expect(page).toHaveScreenshot('homepage.png');
  });

  test('booking form should match snapshot', async ({ page }) => {
    await page.goto('/book');
    
    // Wait for the form to load
    await page.waitForSelector('form');
    
    // Take a screenshot of the booking form
    await expect(page).toHaveScreenshot('booking-form.png');
  });

  test('admin dashboard should match snapshot', async ({ page }) => {
    await page.goto('/admin');
    
    // Wait for the admin page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the admin dashboard
    await expect(page).toHaveScreenshot('admin-dashboard.png');
  });

  test('mobile responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of mobile homepage
    await expect(page).toHaveScreenshot('homepage-mobile.png');
  });

  test('booking form with autocomplete suggestions', async ({ page }) => {
    await page.goto('/book');
    
    // Wait for the form to load
    await page.waitForSelector('input[name="pickupLocation"]');
    
    // Type in pickup location to trigger autocomplete
    await page.fill('input[name="pickupLocation"]', 'Fairfield');
    await page.waitForTimeout(500); // Wait for autocomplete to load
    
    // Take a screenshot with autocomplete suggestions
    await expect(page).toHaveScreenshot('booking-form-with-autocomplete.png');
  });

  test('admin navigation should match snapshot', async ({ page }) => {
    await page.goto('/admin/bookings');
    
    // Wait for the admin navigation to load
    await page.waitForSelector('nav');
    
    // Take a screenshot of the admin navigation
    await expect(page).toHaveScreenshot('admin-navigation.png');
  });

  test('color scheme changes', async ({ page }) => {
    await page.goto('/admin/cms/colors');
    
    // Wait for the color scheme editor to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the color scheme editor
    await expect(page).toHaveScreenshot('color-scheme-editor.png');
  });

  test('AI assistant interface', async ({ page }) => {
    await page.goto('/admin/ai-assistant');
    
    // Wait for the AI assistant to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the AI assistant interface
    await expect(page).toHaveScreenshot('ai-assistant-interface.png');
  });
});

test.describe('Component Visual Testing', () => {
  test('booking card component', async ({ page }) => {
    await page.goto('/booking/test-booking-id');
    
    // Wait for the booking card to load
    await page.waitForSelector('[data-testid="booking-card"]');
    
    // Take a screenshot of the booking card
    await expect(page.locator('[data-testid="booking-card"]')).toHaveScreenshot('booking-card.png');
  });

  test('status badge component', async ({ page }) => {
    await page.goto('/admin/bookings');
    
    // Wait for status badges to load
    await page.waitForSelector('[data-testid="status-badge"]');
    
    // Take a screenshot of status badges
    await expect(page.locator('[data-testid="status-badge"]').first()).toHaveScreenshot('status-badge.png');
  });
});

test.describe('Error State Visual Testing', () => {
  test('form validation errors', async ({ page }) => {
    await page.goto('/book');
    
    // Submit form without filling required fields
    await page.click('button[type="submit"]');
    
    // Wait for validation errors to appear
    await page.waitForSelector('.text-red-500');
    
    // Take a screenshot of form validation errors
    await expect(page).toHaveScreenshot('form-validation-errors.png');
  });

  test('loading states', async ({ page }) => {
    await page.goto('/book');
    
    // Fill form and click calculate fare to trigger loading state
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '555-123-4567');
    await page.fill('input[name="pickupLocation"]', 'Fairfield Station');
    await page.fill('input[name="dropoffLocation"]', 'JFK Airport');
    await page.fill('input[name="pickupDateTime"]', '2024-12-25T10:00');
    
    // Click calculate fare button
    await page.click('button:has-text("Calculate Fare")');
    
    // Wait for loading state
    await page.waitForSelector('button:has-text("Calculating...")');
    
    // Take a screenshot of loading state
    await expect(page).toHaveScreenshot('loading-state.png');
  });
}); 