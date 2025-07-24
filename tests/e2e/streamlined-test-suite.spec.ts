import { test, expect } from '@playwright/test';
import { 
  setupPlaywrightMocks, 
  fillPlaywrightBookingForm, 
  expectPlaywrightBookingForm,
  expectAccessibilityCompliance,
  measurePageLoadTime
} from '../utils/test-helpers';

test.describe('Streamlined E2E Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await setupPlaywrightMocks(page);
  });

  test.describe('Core User Journeys', () => {
    test('Complete booking flow - happy path', async ({ page }) => {
      // 1. Visit homepage
      await page.goto('/');
      await expect(page).toHaveTitle(/Fairfield Airport Cars/);
      
      // 2. Navigate to booking
      await page.click('a[href="/book"]');
      await expect(page).toHaveURL('/book');
      
      // 3. Verify booking form is present
      await expectPlaywrightBookingForm(page);
      
      // 4. Fill out the form
      await fillPlaywrightBookingForm(page);
      
      // 5. Calculate fare
      await page.click('button:has-text("Calculate Fare")');
      await page.waitForTimeout(1000);
      
      // 6. Verify book button is enabled
      const bookButton = page.locator('button:has-text("Book Now")');
      await expect(bookButton).toBeEnabled();
    });

    test('Navigation between pages', async ({ page }) => {
      // Test navigation from homepage
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
  });

  test.describe('Visual Regression & Layout', () => {
    test('Homepage layout and styling', async ({ page }) => {
      await page.goto('/');
      
      // Test navigation is present
      await expect(page.locator('nav')).toBeVisible();
      
      // Test logo is present
      await expect(page.locator('img[alt*="Logo"]')).toBeVisible();
      
      // Test phone number is present
      await expect(page.locator('a[href*="tel:"]')).toBeVisible();
    });

    test('Booking page layout and styling', async ({ page }) => {
      await page.goto('/book');
      
      // Wait for content to load
      await page.waitForSelector('text="Book Your Airport Transfer"');
      
      // Test form layout
      const form = page.locator('form');
      await expect(form).toBeVisible();
      
      // Test grid layout for form fields
      const gridContainer = page.locator('.grid');
      await expect(gridContainer).toBeVisible();
    });
  });

  test.describe('Component Integration', () => {
    test('Form validation and interaction', async ({ page }) => {
      await page.goto('/book');
      
      // Test form fields are interactive
      const nameInput = page.locator('input[placeholder*="full name"]');
      await nameInput.fill('John Smith');
      await expect(nameInput).toHaveValue('John Smith');
      
      const emailInput = page.locator('input[placeholder*="email"]');
      await emailInput.fill('john@example.com');
      await expect(emailInput).toHaveValue('john@example.com');
      
      // Test number input
      const passengersInput = page.locator('input[type="number"]');
      await passengersInput.fill('3');
      await expect(passengersInput).toHaveValue('3');
    });
  });

  test.describe('Error Handling & Edge Cases', () => {
    test('Form validation errors', async ({ page }) => {
      await page.goto('/book');
      
      // Try to submit without filling required fields
      const bookButton = page.locator('button:has-text("Book Now")');
      await expect(bookButton).toBeDisabled();
    });

    test('API error handling', async ({ page }) => {
      await page.goto('/book');
      
      // Fill form and try to calculate fare with API error
      await fillPlaywrightBookingForm(page);
      
      // Simulate API error
      await page.route('**/api/booking/estimate-fare', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        });
      });
      
      await page.click('button:has-text("Calculate Fare")');
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Performance & Accessibility', () => {
    test('Page load performance', async ({ page }) => {
      const loadTime = await measurePageLoadTime(page, '/');
      expect(loadTime).toBeLessThan(3000);
    });

    test('Accessibility compliance', async ({ page }) => {
      await page.goto('/');
      await expectAccessibilityCompliance(page);
    });

    test('Booking form accessibility', async ({ page }) => {
      await page.goto('/book');
      await expectPlaywrightBookingForm(page);
    });
  });
}); 