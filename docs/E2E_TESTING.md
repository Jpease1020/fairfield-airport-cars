# E2E Testing Strategy

This project now uses three explicit E2E lanes so we can test UI safely without relying on production writes.

## Lanes

1. `ui-mocked` (frontend regression lane)
- Directory: `tests/e2e/ui-mocked`
- Config: `config/playwright.ui-mocked.config.ts`
- Goal: verify UI shell/flows and visual behavior independent of backend mutations.
- Safe for prod/preview targets.

2. `preview-safe` (real deployment, non-mutating lane)
- Directory: `tests/e2e/preview-safe`
- Config: `config/playwright.preview-safe.config.ts`
- Goal: verify critical behavior against deployed app without creating bookings/payments.
- Intended for Vercel preview or production read-only checks.

3. `full-flow` (local emulator/staging lane)
- Directory: `tests/e2e/full-flow`
- Config: `config/playwright.full-flow.config.ts` (also `config/playwright.config.ts`)
- Goal: real end-to-end flows that may create data.
- Run locally with emulators (or staging), never against production.

## Scripts

- `npm run test:e2e`
  - Runs `ui-mocked` + `preview-safe`
- `npm run test:e2e:ui-mocked`
- `npm run test:e2e:preview-safe`
- `npm run test:e2e:ci`
  - Alias for preview-safe lane in CI
- `npm run test:e2e:full-flow`
- `npm run test:e2e:local`
  - Alias for full-flow lane

## Recommended Usage

### PR checks
Run:
```bash
npm run test:e2e:ui-mocked
```

### Preview smoke (safe)
Run:
```bash
E2E_BASE_URL="https://<vercel-preview-url>" npm run test:e2e:preview-safe
```

### Production-safe smoke (no booking creation)
Run:
```bash
E2E_BASE_URL="https://www.fairfieldairportcar.com" npm run test:e2e:preview-safe
```

### Full booking validation
Run with emulators:
```bash
NEXT_PUBLIC_USE_EMULATORS=true npm run firebase:emulators
NEXT_PUBLIC_USE_EMULATORS=true SMOKE_TEST_MODE=true npm run test:e2e:full-flow
```

**Always set `SMOKE_TEST_MODE=true` for any local run that submits, pays for, or cancels a
booking** — including ad hoc manual testing (curl, a local dev server, a one-off script), not
just the `full-flow` suite. `NEXT_PUBLIC_USE_EMULATORS=true` only sandboxes Firestore/Auth; it
does **not** sandbox email or SMS. Without `SMOKE_TEST_MODE=true`, a "local" test booking will
still send a real verification email, real driver notification, and real admin SMS/email through
whatever `EMAIL_*`/`TWILIO_*` credentials are in your `.env` — this happened for real on
2026-07-16 (a local validation test emailed a real inbox and would have texted the admin, using
production-shaped notification content, for a booking that only ever existed in the local
emulator). `SMOKE_TEST_MODE=true` makes booking creation, cancellation, and calendar/payment code
paths skip all of those real external sends and log what would have happened instead.

**Also seed or expect defaults for `config/pricing`.** An unseeded local Firestore (a fresh
emulator, or a database missing that doc) falls back to `DEFAULT_PRICING_CONFIG` in
`pricing-config.ts` — generic rates, not whatever the business has actually configured in
production. `getPricingConfig()` now logs a loud warning when this happens, but don't be
surprised by a quote that doesn't match a real customer's rate for the "same" route; it isn't
using the same pricing config.

## Rule of thumb

- Use `ui-mocked` to catch UI breakages.
- Use `preview-safe` to confirm deployed behavior safely.
- Use `full-flow` only where writes are acceptable (emulator/staging), and always with
  `SMOKE_TEST_MODE=true`.
