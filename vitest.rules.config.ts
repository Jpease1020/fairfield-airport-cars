import { defineConfig } from 'vitest/config';

// Separate from vitest.config.ts deliberately: that config's tests/setup.ts installs a global MSW
// server with onUnhandledRequest: 'error', which blocks every real network call by design (the
// rest of the suite mocks all external services). This suite's whole point is making a REAL HTTP
// call to a local Firestore emulator to verify firestore.rules actually behaves as written —
// reasoning about the rules file by eye already missed a real bug once (see firestore.rules.test.ts).
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/rules/**/*.test.ts'],
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
