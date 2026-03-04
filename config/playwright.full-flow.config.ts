import { defineConfig, devices } from '@playwright/test';
import { isLocalTarget, isProdLikeTarget } from '../tests/e2e/helpers';

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const isExternal = baseURL !== 'http://localhost:3000';
const allowDestructive = process.env.ALLOW_DESTRUCTIVE_E2E === 'true';
const allowProdDestructive = process.env.ALLOW_DESTRUCTIVE_E2E_PROD === 'true';

if (!isLocalTarget(baseURL) && !allowDestructive) {
  throw new Error(
    `Refusing to run full-flow destructive e2e against non-local target: ${baseURL}. ` +
    'Set ALLOW_DESTRUCTIVE_E2E=true only for isolated staging environments.'
  );
}

if (isProdLikeTarget(baseURL) && !allowProdDestructive) {
  throw new Error(
    `Refusing to run full-flow destructive e2e against production-like target: ${baseURL}. ` +
    'Set ALLOW_DESTRUCTIVE_E2E_PROD=true only for explicit emergency validation.'
  );
}

export default defineConfig({
  testDir: '../tests/e2e/full-flow',
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
  ...(isExternal
    ? { webServer: undefined }
    : {
        webServer: {
          command: 'npm run dev',
          url: 'http://localhost:3000',
          reuseExistingServer: !process.env.CI,
        },
      }),
});
