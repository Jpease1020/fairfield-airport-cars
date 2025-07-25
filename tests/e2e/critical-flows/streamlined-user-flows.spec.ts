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
    // Check if we're on mobile (hamburger menu)
    const mobileMenuButton = page.locator('button[aria-label="Toggle mobile menu"]');
    if (await mobileMenuButton.isVisible()) {
      // Mobile: open menu first, then click Book
      await mobileMenuButton.click();
      await page.click('.nav-mobile-link[href="/book"]');
    } else {
      // Desktop: click Book directly
      await page.click('a[href="/book"]');
    }
    await expect(page).toHaveURL('/book');
    
    // 3. Fill out the booking form
    await page.fill('input[placeholder*="full name"]', 'John Smith');
    await page.fill('input[placeholder*="email"]', 'john@example.com');
    await page.fill('input[placeholder*="phone number"]', '203-555-0123');
    await page.fill('input[placeholder*="pickup address"]', 'Fairfield Station, Fairfield, CT');
    await page.fill('input[placeholder*="destination"]', 'JFK Airport, Queens, NY');
    
    // Set future date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.fill('input[type="date"]', dateString);
    await page.fill('input[type="time"]', '10:00');
    
    // Set passengers (already defaults to 1)
    
    // 4. Calculate fare
    await page.click('button:has-text("Calculate Fare")');
    
    // 5. Verify fare calculation
    await expect(page.locator('text=Base Fare:')).toBeVisible();
    
    // 6. Verify book button is enabled
    const bookButton = page.locator('button:has-text("Book Your Ride")');
    await expect(bookButton).toBeEnabled();
    
    // Note: We don't actually submit the booking to avoid creating real records
  });

  test('Navigation flow - all pages accessible', async ({ page }) => {
    // Test basic navigation
    await page.goto('/');
    
    // Helper function to handle mobile navigation
    const navigateTo = async (href: string) => {
      const mobileMenuButton = page.locator('button[aria-label="Toggle mobile menu"]');
      if (await mobileMenuButton.isVisible()) {
        // Mobile: open menu first, then click link
        await mobileMenuButton.click();
        await page.click(`.nav-mobile-link[href="${href}"]`);
      } else {
        // Desktop: click link directly
        await page.click(`a[href="${href}"]`);
      }
    };
    
    // Navigate to book page
    await navigateTo('/book');
    await expect(page).toHaveURL('/book');
    
    // Navigate to help page
    await navigateTo('/help');
    await expect(page).toHaveURL('/help');
    
    // Navigate to about page
    await navigateTo('/about');
    await expect(page).toHaveURL('/about');
    
    // Navigate back to home
    await navigateTo('/');
    await expect(page).toHaveURL('/');
  });

  test('Form validation - required fields', async ({ page }) => {
    await page.goto('/book');
    
    // Fill pickup and dropoff to make Calculate Fare button appear
    await page.fill('input[placeholder*="pickup address"]', 'Fairfield Station');
    await page.fill('input[placeholder*="destination"]', 'JFK Airport');
    
    // Try to calculate fare without filling other required fields
    await page.click('button:has-text("Calculate Fare")');
    
    // Check for validation errors or form submission prevention
    // The button might be enabled but form submission should be prevented
    const bookButton = page.locator('button:has-text("Book Your Ride")');
    
    // Try to submit the form and check if it's prevented
    await bookButton.click();
    
    // Should still be on the same page (form not submitted)
    await expect(page).toHaveURL('/book');
    
    // Check for validation error messages
    const errorMessages = page.locator('.error-message, .validation-error, [role="alert"]');
    await expect(errorMessages.first()).toBeVisible();
  });

  test('Mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Verify mobile menu button is visible
    await expect(page.locator('button[aria-label="Toggle mobile menu"]')).toBeVisible();
    
    // Test mobile navigation
    await page.click('button[aria-label="Toggle mobile menu"]');
    await expect(page.locator('.nav-mobile-menu')).toBeVisible();
    
    // Navigate using mobile menu
    await page.click('.nav-mobile-link[href="/book"]');
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
    expect(loadTime).toBeLessThan(3500); // Adjusted for development environment
    
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
    await page.fill('input[placeholder*="phone number"]', '203-555-0123');
    await page.fill('input[placeholder*="pickup address"]', 'Fairfield Station');
    await page.fill('input[placeholder*="destination"]', 'JFK Airport');
    // Set date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.fill('input[type="date"]', dateString);
    await page.fill('input[type="time"]', '10:00');
    
    // Try to calculate fare
    await page.click('button:has-text("Calculate Fare")');
    
    // Should show error message
    await expect(page.locator('text=error')).toBeVisible();
  });
}); 