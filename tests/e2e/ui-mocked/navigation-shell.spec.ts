import { test, expect } from '@playwright/test';

test.describe('UI Shell (Mocked/API-Independent)', () => {
  test('home renders navigation and footer, and header is not sticky', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const nav = page.getByTestId('layout-navigation');
    const footer = page.getByTestId('layout-footer');

    await expect(nav).toBeVisible();
    await expect(footer).toBeVisible();

    const position = await nav.evaluate((el) => window.getComputedStyle(el).position);
    expect(position).not.toBe('sticky');
    expect(position).not.toBe('fixed');
  });
});
