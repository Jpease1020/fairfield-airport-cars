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
  webServer: undefined,
});
