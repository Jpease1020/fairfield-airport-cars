import { test, expect } from '@playwright/test';

test.describe('Success Page - Page Level Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock a successful booking ID for testing
    const mockBookingId = 'TEST123456789';
    await page.goto(`/success?bookingId=${mockBookingId}`);
    await page.waitForLoadState('networkidle');
  });

  test('renders correctly with booking confirmation', async ({ page }) => {
    // Check that success page elements are visible
    await expect(page.locator('[data-testid="success-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="booking-id"]')).toBeVisible();

    // Check that labels are not showing fallback strings
    await expect(page.locator('text=[LABEL]')).toHaveCount(0);
    await expect(page.locator('text=form name label')).toHaveCount(0);
  });

  test('displays booking details correctly', async ({ page }) => {
    // Check that booking details are shown
    await expect(page.locator('[data-testid="booking-details"]')).toBeVisible();
    
    // Check for specific booking information
    await expect(page.locator('[data-testid="pickup-location"]')).toBeVisible();
    await expect(page.locator('[data-testid="dropoff-location"]')).toBeVisible();
    await expect(page.locator('[data-testid="pickup-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="fare-amount"]')).toBeVisible();
  });

  test('shows action buttons', async ({ page }) => {
    // Check that action buttons are present
    await expect(page.locator('[data-testid="view-booking-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="book-another-button"]')).toBeVisible();
  });

  test('view booking button works', async ({ page }) => {
    await page.click('[data-testid="view-booking-button"]');
    
    // Should navigate to booking details or bookings page
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/\/(bookings|manage)/);
  });

  test('book another button works', async ({ page }) => {
    await page.click('[data-testid="book-another-button"]');
    
    // Should navigate to booking page
    await expect(page).toHaveURL('/book');
  });

  test('handles missing booking ID gracefully', async ({ page }) => {
    await page.goto('/success');
    await page.waitForLoadState('networkidle');

    // Should show error state
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-title"]')).toBeVisible();
  });

  test('handles invalid booking ID gracefully', async ({ page }) => {
    await page.goto('/success?bookingId=INVALID123');
    await page.waitForLoadState('networkidle');

    // Should show error state
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('displays email confirmation message', async ({ page }) => {
    // Check that email confirmation is mentioned
    await expect(page.locator('text=confirmation email')).toBeVisible();
    await expect(page.locator('text=check your email')).toBeVisible();
  });

  test('shows tracking information', async ({ page }) => {
    // Check that tracking information is displayed
    await expect(page.locator('[data-testid="tracking-info"]')).toBeVisible();
    await expect(page.locator('[data-testid="tracking-link"]')).toBeVisible();
  });

  test('CMS integration works correctly', async ({ page }) => {
    // Check that no malformed CMS strings are visible
    await expect(page.locator('text=[LABEL]')).toHaveCount(0);
    await expect(page.locator('text=form name label')).toHaveCount(0);
    await expect(page.locator('text=^[A-Z\\s]+\\*$')).toHaveCount(0);

    // Check that CMS content is being used
    const title = page.locator('[data-testid="success-title"]');
    await expect(title).toContainText('Booking Confirmed');
  });
});
