# Fairfield Airport Cars — Site Audit & Roadmap

_Last updated: 2026-06-13_

A prioritized plan to (1) verify the site actually works end-to-end and (2) clean
up the UI. Written after a large dependency upgrade (all majors → latest, Node 22),
so regression risk is elevated. Work top-down: **P0 → P1 → P2**.

## Current state (verified 2026-06-13)
- **Prod health: green** — `database: operational`, `payments/maps/sms: configured`,
  `calendar: not_configured` (`/api/health`).
- **Runtime: Node 22.x**, `firebase-admin` pinned to **13.x** (14 pulls jwks-rsa@4 → jose@6
  ESM, which crashes all API routes in Vercel's CJS bundle — do **not** bump to 14
  until that chain is require-safe).
- Surface area: **56 API routes, 39 pages**.
- ⚠️ **CI E2E suite is RED** — the automated "does it work" net is not running green.

---

## Phase 0 — Restore the safety net (P0, do first)

You cannot trust manual checks alone across 56 routes. Get automated tests green.

- [ ] **Fix the red CI E2E step.** `.github/workflows/test.yml` runs `npm run test:e2e`
      (= `test:e2e:ui-mocked && test:e2e:preview-safe`). The `preview-safe` config expects
      `E2E_BASE_URL` (a deployed preview URL) per `docs/E2E_TESTING.md`, and CI sets neither
      a base URL nor a running server → fails. Likely fix: CI should run **`npm run test:e2e:ci`**
      with `E2E_BASE_URL=<vercel preview url>` (wire the Vercel preview deployment URL into the
      job), and run `ui-mocked` against its own Playwright `webServer`. Confirm each E2E config's
      assumptions before changing.
- [ ] Confirm **unit + integration** stay green in CI (they pass locally: 339 passed).
- [ ] Decide whether the **full-flow** booking E2E (`full-flow/service-area-validation.spec.ts`,
      needs emulators + seed) runs in CI nightly or stays local-only.

**Done when:** CI Test Suite is green on `main` and re-runs on every PR.

---

## Phase 1 — Functional verification (P1, by revenue + risk)

For each path: verify in **Square sandbox** / a preview with test data, not live cards.

### 1. Booking → payment → notification (the revenue path) — HIGHEST PRIORITY
- [ ] Quote: address **autocomplete** shows suggestions and sets **coordinates** (not just text).
- [ ] Validation: 24h-advance rule; **60-min buffer** between bookings (single driver);
      service area **25mi normal / 40mi soft-block** (`service-area-validation.ts`).
- [ ] Payment (`square-service.ts`): deposit + balance; webhook URL matches the route path.
- [ ] **Refunds match policy: 100% (>24h) / 50% (3–24h) / 0% (<3h)** (`booking-cancellation.ts`).
      Use `squarePaymentId`, not `squareOrderId`.
- [ ] Confirmation page renders; **email** sends from `fairfieldairportcar.com`
      (`email-service.ts`); **SMS** sends (`twilio-service.ts`, `sms-message-service.ts`) —
      messaging service SID from env, not hardcoded.
- [ ] Admin gets the new-booking SMS (`admin-notification-service.ts`).

### 2. Accounts & tracking
- [ ] Customer login: magic-link / OTP (`/api/auth/request-link`, `request-otp`, `auth-service.ts`).
- [ ] Admin login + role gate (`requireAdmin`, Firestore `users/{uid}.role === 'admin'`).
- [ ] My Bookings list → booking detail → manage/edit → cancel (refund calc).
- [ ] Tracking `/tracking/:id`: loads once (loop fixed), authed owner/admin sees it (401 fixed),
      `?token=` email link works.

### 3. Admin tools
- [ ] Bookings (view/manage/exceptions), Pricing (test-quote ✓), Messages (SMS threads
      `sms-thread-service.ts`), Schedules/Calendar, Costs, Health.
- [ ] Decide on **Google Calendar** (`calendar: not_configured`): wire env
      (`ENABLE_GOOGLE_CALENDAR`, `GOOGLE_CALENDAR_*`) or formally drop the feature + its admin UI.

### 4. PWA / service worker
- [ ] Verify the **SW update flow** end-to-end (we hit stale-SW caching repeatedly). Confirm v3
      `skipWaiting` + `clients.claim` reliably updates returning users; consider a version/"new
      version available" prompt.

---

## Phase 2 — Tech debt surfaced this session (P1/P2)

- [ ] **12 residual `npm audit` vulns** (need `npm audit fix --force` / breaking transitive bumps) — review.
- [ ] Two ESLint rules set to `warn` for CI stability (`preserve-caught-error`,
      `no-useless-assignment`) — promote to `error` and fix the ~30 sites in a dedicated pass.
- [ ] **Vercel auto-promote risk:** every `main` deploy auto-promotes to prod. Given how often
      prod broke, consider enabling a **preview → manual-promote** gate, or a staging branch.
- [ ] `firebase-admin` upgrade to 14 blocked on jwks-rsa/jose ESM — track upstream.
- [ ] Remove/replace remaining dead links as found (e.g. `/admin/campaigns` page never built).
- [ ] `docs/SUPABASE_MIGRATION.md` is untracked — decide if it's real/planned work.

---

## Phase 3 — UI/UX overhaul (P2, after function is locked)

The site has a **strictly-enforced design system** (no hardcoded colors / inline styles;
all via `@/design` primitives + CMS-driven copy). That's the right lever: improve **tokens +
core components** to lift the whole site, rather than per-page hacks.

- [ ] **Audit** the top customer-facing pages first: Home, Booking flow, Confirmation, Tracking.
      (Use the `frontend-design` skill + a Chrome DevTools a11y/visual pass.)
- [ ] Define a refreshed **visual direction**: typography scale, spacing rhythm, color/contrast,
      replace ad-hoc emoji icons with a consistent icon set (lucide is already a dep), button/card polish.
- [ ] Apply via design tokens + shared components; verify against the design-system ESLint rules.
- [ ] Then admin pages (lower priority — internal-facing).

**Principle:** function correctness before polish. A pretty site that drops bookings is worse
than a plain one that works.

---

## Appendix — env vars to confirm in Vercel (prod)
`NEXT_PUBLIC_GOOGLE_MAPS_CLIENT_API_KEY` (client autocomplete), `GOOGLE_MAPS_SERVER_API_KEY`
(server quotes), Square keys + webhook, Twilio SID/messaging-service, email/SMTP,
Firebase admin creds, `GOOGLE_CALENDAR_*` (if enabling calendar). Node pinned to `22.x` via
`engines`. **Never** edit `.env*` from tooling — set vars in the Vercel dashboard.
