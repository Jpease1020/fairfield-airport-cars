# Stability Scoreboard

Last updated: 2026-03-02

## Scope
This document tracks production-readiness gates. No new features should be started until all P1 and gate items are green.

## P1 Incident Class: Booking Time Drift
- Status: `CLOSED` (code + regression tests in place)
- Fixed:
  - `/api/booking/submit` admin SMS uses business timezone formatter.
  - `/api/booking/cancel-booking` customer/admin SMS uses business timezone formatter.
  - Email booking timestamps use shared business timezone formatter.
  - ICS event generation uses business timezone date-time parts.
  - `/api/payment/process-payment` customer verification SMS now uses business timezone formatter.
  - `/api/notifications/send-confirmation` SMS now uses business timezone formatter.
  - `driver-notification-service` push message time now uses business timezone formatter.
- Regressions covered by tests:
  - Form serialization (`datetime-local` -> ISO) in submission flow.
  - Submit/cancel/payment/send-confirmation message formatting.
  - Server flow persistence + outbound formatting.
  - DST transition behavior (spring-forward/fall-back).
  - Guard test preventing direct `toLocale*` usage in booking communication paths.

## Release Gates
- Type safety (`npm run type-check`): `PASS`
- Targeted unit/integration for time safety: `PASS`
- Preview-safe Playwright suite: `PENDING` (run in CI/preview)
- Production-safe smoke checks (read-only): `PENDING` (run before release)
- Security route guard checks (admin/test endpoints): `PASS` in existing tests

## Remaining Work Before Feature Development
1. Run full CI lane for unit + integration + preview-safe E2E.
2. Run production-safe smoke checks and capture output artifact.
3. Confirm no runtime logs show timestamp mismatches in booking lifecycle for 24h after deploy.

## Operational Rule (Non-Negotiable)
All customer/admin/driver booking communications must format pickup time through:
- `formatBusinessDateTime` from `src/lib/utils/booking-date-time.ts`
