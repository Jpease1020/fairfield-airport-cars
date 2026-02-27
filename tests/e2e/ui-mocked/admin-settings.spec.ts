/**
 * Admin Settings E2E (BACKLOG #15)
 *
 * - Unauthenticated access to /admin/settings redirects to login.
 * - Full "change bookingBufferMinutes and save, confirm used after TTL" requires
 *   admin login; run locally with real auth or use integration test for API behavior.
 */

import { test, expect } from '@playwright/test';

test.describe('Admin Settings', () => {
  test('unauthenticated user is redirected to login when visiting settings', async ({ page }) => {
    await page.goto('/admin/settings');
    // withAuth redirects to /auth/login when not logged in (may be after load)
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
  });
});
