import { test, expect } from '@playwright/test';

/**
 * Production-safe form smoke tests.
 *
 * Important:
 * - These tests intentionally do NOT confirm bookings.
 * - These tests intentionally do NOT click payment confirmation.
 * - Goal is to verify form rendering + validation safety rails only.
 */

test.describe('Prod Smoke - Forms (No Submit)', () => {
  test('home quick-book shows validation error when required fields are missing', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const cta = page.getByTestId('quick-book-secure-rate-button');
    await expect(cta).toBeVisible({ timeout: 10000 });
    await cta.click();

    await expect(page.getByTestId('quick-book-validation-error')).toBeVisible({
      timeout: 10000,
    });

    // Must remain on landing page (no submit flow completion).
    await expect(page).toHaveURL(/\/$/);
  });

  test('/book trip details blocks continue when empty and surfaces errors', async ({ page }) => {
    await page.goto('/book');
    await page.waitForLoadState('networkidle');

    const nextButton = page.getByTestId('trip-details-next-button');
    await expect(nextButton).toBeVisible({ timeout: 10000 });
    await nextButton.click();

    await expect(page.getByTestId('trip-details-error-message')).toBeVisible({
      timeout: 10000,
    });

    // Still on trip details; no booking creation attempted.
    await expect(page).toHaveURL(/\/book$/);
  });

  test('/book requires suggestion-selected locations (coords) before phase advance', async ({
    page,
  }) => {
    await page.goto('/book');
    await page.waitForLoadState('networkidle');

    const pickup = page.getByTestId('pickup-location-input');
    const dropoff = page.getByTestId('dropoff-location-input');
    const nextButton = page.getByTestId('trip-details-next-button');

    await expect(pickup).toBeVisible({ timeout: 10000 });
    await expect(dropoff).toBeVisible({ timeout: 10000 });

    await pickup.fill('Fairfield Station, Fairfield, CT');
    await dropoff.fill('JFK Airport');
    await nextButton.click();

    await expect(page.getByTestId('trip-details-error-message')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByTestId('trip-details-error-message')).toContainText(
      /select .* from suggestions/i
    );

    // Still on trip details; no transition to contact/payment.
    await expect(page.getByTestId('contact-info-continue-button')).toHaveCount(0);
    await expect(page.getByTestId('payment-process-button')).toHaveCount(0);
  });
});
