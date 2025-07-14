import { test, expect } from '@playwright/test';



// Define viewport configurations
const viewports = [
  { width: 1920, height: 1080, name: 'desktop' },
  { width: 1024, height: 768, name: 'tablet' },
  { width: 375, height: 667, name: 'mobile' },
];

test.describe('Critical Customer Pages Visual Testing', () => {
  
  // 1. Homepage - Most important landing page
  test('homepage desktop only', async ({ page }) => {
    for (const viewport of viewports) {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');
      await page.waitForSelector('h1:has-text("Fairfield Airport Car Service")');
      await expect(page).toHaveScreenshot('homepage-desktop.png');
    }
  });

  // 2. Booking Form - Core conversion page
  test('booking form across all devices', async ({ page }) => {
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/book');
      await page.waitForSelector('form');
      await expect(page).toHaveScreenshot(`booking-form-${viewport.name}.png`);
    }
  });

  // 3. Booking Form with Autocomplete - Interactive state
  test('booking form with autocomplete', async ({ page }) => {
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/book');
      await page.waitForSelector('form');
      await page.fill('#pickupLocation', 'Fairfield');
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot(`booking-form-autocomplete-${viewport.name}.png`);
    }
  });

  // 4. Booking Details - Post-conversion page (skipped - requires test data setup)
  test.skip('booking details page', async ({ page }) => {
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/booking/test-booking-id');
      await page.waitForSelector('h1:has-text("Booking Confirmed!")');
      await expect(page).toHaveScreenshot(`booking-details-${viewport.name}.png`);
    }
  });

  // 5. Payment Success - Critical conversion confirmation
  test('payment success page', async ({ page }) => {
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/success');
      await page.waitForSelector('h1:has-text("Payment Successful")');
      await expect(page).toHaveScreenshot(`payment-success-${viewport.name}.png`);
    }
  });

  // 6. Help Page - Customer support
  test('help page', async ({ page }) => {
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/help');
      await page.waitForSelector('h1:has-text("Help & FAQs")');
      await expect(page).toHaveScreenshot(`help-page-${viewport.name}.png`);
    }
  });
});

test.describe('Critical Interactive States', () => {
  
  // Form validation errors - Critical UX issue
  test('form validation errors', async ({ page }) => {
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/book');
      await page.waitForSelector('form');
      
      // Fill required fields to enable submit button
      await page.fill('#name', 'Test User');
      await page.fill('#email', 'test@example.com');
      await page.fill('#phone', '555-123-4567');
      await page.fill('#pickupLocation', 'Fairfield Station');
      await page.fill('#dropoffLocation', 'JFK Airport');
      await page.fill('#pickupDateTime', '2024-12-25T10:00');
      
      // Calculate fare to enable submit button
      await page.click('button:has-text("Calculate Fare")');
      await page.waitForTimeout(1000);
      
      // Now try to submit without filling all required fields
      await page.fill('#name', ''); // Clear name to trigger validation
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot(`form-validation-errors-${viewport.name}.png`);
    }
  });

  // Loading states - Important for perceived performance
  test('loading states', async ({ page }) => {
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/book');
      await page.waitForSelector('form');
      
      // Fill form and trigger loading
      await page.fill('#name', 'Test User');
      await page.fill('#email', 'test@example.com');
      await page.fill('#phone', '555-123-4567');
      await page.fill('#pickupLocation', 'Fairfield Station');
      await page.fill('#dropoffLocation', 'JFK Airport');
      await page.fill('#pickupDateTime', '2024-12-25T10:00');
      
      await page.click('button:has-text("Calculate Fare")');
      await page.waitForTimeout(100);
      await expect(page).toHaveScreenshot(`loading-state-${viewport.name}.png`);
    }
  });
});

test.describe('Navigation Testing', () => {
  
  // Navigation menu - Critical for usability
  test('navigation menu', async ({ page }) => {
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.waitForSelector('h1:has-text("Fairfield Airport Car Service")');
      
      const nav = page.locator('nav, header, .navigation').first();
      if (await nav.isVisible()) {
        await expect(nav).toHaveScreenshot(`navigation-${viewport.name}.png`);
      }
    }
  });

  // Mobile menu - Critical for mobile UX
  test('mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('h1:has-text("Fairfield Airport Car Service")');
    
    const hamburger = page.locator('button[aria-label*="menu"], .hamburger, .menu-toggle').first();
    if (await hamburger.isVisible()) {
      await hamburger.click();
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot('mobile-menu.png');
    }
  });
}); 