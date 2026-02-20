# E2E Testing: CI vs Local

Two modes keep CI safe (no production DB writes) while allowing full booking validation locally.

## Confidence: no DB writes when running against prod

- **booking-submit-api.spec.ts** – entire file excluded in CI config (always creates bookings).
- **production-smoke.test.ts** – excluded in CI config and skipped in-spec when target is not localhost (full create → cancel flow).
- **production-booking-health.spec.ts** – “Full booking API test” skips when `!isLocalTarget(BASE_URL)` (create + cancel).
- **booking-api-contracts.spec.ts** – “Valid quote allows booking submission” skips when `!isLocalTarget(getEffectiveBaseUrl())`.
- **service-area-validation.spec.ts** – “Booking submit validates service area” sends *invalid* payload (no airport); expects 400. API should validate before any write; no booking is created on success path.
- **complete-booking-flow.spec.ts** and **customer-booking-flow.spec.ts** – mock `/api/booking/submit` via `page.route(…).fulfill()`; no real submit.
- **core-user-flows-validation.test.ts** and **core-business-validation.test.ts** – whole describe is `test.describe.skip`; not run.
- **booking-flows.test.ts** and **admin-booking-management.spec.ts** – skipped or describe skipped; not run.

## CI E2E (no database writes)

Runs against a **deployed URL** (e.g. Vercel preview). **We never run tests that create anything in the database when the target is prod/preview.** No bookings are created; no data is written to the deployment’s database.

- Any test that creates or mutates DB records is skipped when the target URL is not localhost (see `tests/e2e/helpers.ts`: `isLocalTarget()`).
- The CI config also excludes the entire `booking-submit-api.spec.ts` suite.

- **Command:** `npm run test:e2e:ci`
- **Config:** `config/playwright.ci.config.ts`
- **Base URL:** `E2E_BASE_URL` or `BASE_URL` (default: `https://fairfield-airport-cars.vercel.app`)
- **What runs:** Health checks, quote API, validation (e.g. service area), UI flows that mock submit (e.g. complete-booking-flow), location autocomplete (against preview).
- **What’s skipped:** Any test that creates or cancels real bookings (e.g. “Full booking API test”, “Valid quote allows booking submission”). The entire `booking-submit-api.spec.ts` suite is excluded.

**Example (CI or manual against a preview):**

```bash
E2E_BASE_URL=https://fairfield-airport-cars-3y7uw0icg-justin-peases-projects.vercel.app npm run test:e2e:ci
```

Use the same `E2E_BASE_URL` in your CI (e.g. Vercel’s preview URL) so tests hit the deployment you care about.

## Local E2E (full booking flows)

Runs against **localhost** with the **Firebase emulators**. Use this to validate full booking creation, payment, and cancellation against emulated Firestore (and optional CMS seed).

- **Command:** `npm run test:e2e:local` or `npm run test:e2e`
- **Config:** `config/playwright.config.ts`
- **Base URL:** `http://localhost:3000`
- **Server:** Playwright starts the dev server via `webServer` (or use an already-running `npm run dev`).
- **What runs:** All e2e specs, including tests that create and cancel bookings and `booking-submit-api.spec.ts`.

**Recommended setup:**

1. Start emulators: `npm run firebase:emulators`
2. (Optional) Seed CMS: `npm run firebase:emulators:seed` (in another terminal, after emulators are up)
3. Run local e2e: `npm run test:e2e:local` (dev server is started by Playwright if not already running)

Ensure the app is pointed at emulators (e.g. `NEXT_PUBLIC_USE_EMULATORS=true` or your project’s equivalent) when running local e2e.

## Summary

| Goal                         | Command                 | Base URL        | DB writes |
|-----------------------------|-------------------------|-----------------|-----------|
| CI / preview smoke          | `npm run test:e2e:ci`    | E2E_BASE_URL    | None      |
| Full booking validation     | `npm run test:e2e:local` | localhost:3000  | Emulators |
