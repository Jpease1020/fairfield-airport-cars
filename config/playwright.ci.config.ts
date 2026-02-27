/**
 * Playwright config for CI e2e: runs against a live deployment (e.g. Vercel preview)
 * without writing to the database.
 *
 * - baseURL: E2E_BASE_URL or BASE_URL (e.g. https://fairfield-airport-cars-xxx.vercel.app)
 * - No local webServer (uses the deployed app)
 * - Skips specs that create bookings (booking-submit-api)
 * - Tests that create bookings are skipped via E2E_CI in-spec
 *
 * Usage:
 *   E2E_BASE_URL=https://your-preview.vercel.app npm run test:e2e:ci
 */

import { defineConfig, devices } from '@playwright/test';

const baseURL =
  process.env.E2E_BASE_URL ||
  process.env.BASE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://fairfield-airport-cars.vercel.app';

export default defineConfig({
  testDir: '../tests/e2e/preview-safe',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // No webServer: we hit the deployed preview URL
  webServer: undefined,
});
