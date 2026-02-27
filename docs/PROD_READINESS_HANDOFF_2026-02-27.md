# Prod Readiness Handoff (2026-02-27)

## What is verified green in this branch

- `npm run type-check`
- `npm run build`
- Focused API + provider suites:
  - `tests/unit/booking-submit.route.test.ts`
  - `tests/unit/validate-phase.route.test.ts`
  - `tests/integration/booking-server-flow.test.ts`
  - `tests/unit/email-route-guards.test.ts`
  - `tests/unit/test-email-page.guard.test.ts`
  - `tests/unit/admin-firebase-data.guard.test.ts`
- Previously failing flow suites are now passing:
  - `tests/integration/flows/cancellation-refund-flow.test.ts`
  - `tests/integration/flows/ride-experience.test.ts`
  - `tests/integration/flows/time-slot-locking.test.ts`

## Important fixes completed in this pass

- Fixed client/server boundary bug that broke production build:
  - Client tracking pages now import `firebase-tracking-service` directly (instead of server-only `tracking-service`).
- Updated integration flow tests to account for auth guards:
  - Mocked `requireAdmin` / `requireOwnerOrAdmin` where route behavior (not auth) is under test.
- Updated ride tracking request test helper to include `nextUrl.searchParams`.

## Why full E2E was not completed here

This sandbox cannot reliably run Playwright:
- Cannot bind required ports (`EPERM`).
- Cannot launch Chromium process under current restrictions.
- DNS resolution to external preview target fails in this environment.

So the remaining E2E verification must be run on your machine.

## Run this locally (recommended path: emulators)

### Terminal 1
```bash
cd /Users/justinpease/workspace/fairfield-airport-cars
NEXT_PUBLIC_USE_EMULATORS=true npm run firebase:emulators
```

### Terminal 2
```bash
cd /Users/justinpease/workspace/fairfield-airport-cars
npm run firebase:emulators:seed
```

### Terminal 3
```bash
cd /Users/justinpease/workspace/fairfield-airport-cars
NEXT_PUBLIC_USE_EMULATORS=true npm run test
```

If you only want browser E2E while unit/integration already passed:
```bash
cd /Users/justinpease/workspace/fairfield-airport-cars
NEXT_PUBLIC_USE_EMULATORS=true npm run test:e2e:local
```

## Run this against preview/prod safely (no DB writes expected)

Use CI config only:
```bash
cd /Users/justinpease/workspace/fairfield-airport-cars
E2E_BASE_URL="https://<your-preview-url>" npm run test:e2e:ci
```

Per `docs/E2E_TESTING.md`, mutating booking specs are skipped in this mode.

## Final release gate checklist

- [ ] `npm run type-check`
- [ ] `npm run build`
- [ ] `npm run test:unit`
- [ ] `npm run test:integration`
- [ ] `npm run test:e2e:local` (emulators) or `npm run test:e2e:ci` (preview URL)
- [ ] Manual smoke:
  - [ ] Booking form submit
  - [ ] Admin booking cancel + refund outcome
  - [ ] Tracking page loads with valid token
  - [ ] Settings update persists and affects quote behavior
