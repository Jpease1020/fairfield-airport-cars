import { test, expect } from '@playwright/test';

test.describe('Booking Form Shell (Mocked/API-Independent)', () => {
  test('home quick-book surfaces validation errors when required fields are missing', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const cta = page.getByTestId('quick-book-secure-rate-button');
    await expect(cta).toBeVisible({ timeout: 10000 });
    await cta.click();

    await expect(page.getByTestId('quick-book-validation-error')).toBeVisible({
      timeout: 10000,
    });
  });

  test('/book trip details blocks continue when required fields are empty', async ({ page }) => {
    await page.goto('/book');
    await page.waitForLoadState('networkidle');

    const nextButton = page.getByTestId('trip-details-next-button');
    await expect(nextButton).toBeVisible({ timeout: 10000 });
    await nextButton.click();

    await expect(page.getByTestId('trip-details-error-message')).toBeVisible({
      timeout: 10000,
    });
  });
});
