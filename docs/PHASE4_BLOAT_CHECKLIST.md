# Phase 4 Bloat — Status

Historical cleanup checklist. Re-verified 2026-07-16 — most of it is done; kept here as a record rather than a live TODO. **Per .cursorrules: ask before each file delete; no bulk delete without permission.**

---

## Batch A — Components (zero external use)

**Done.** All 15 files were removed (commit `88c9fe5a`, ~5 months before this note) and `src/components/business/index.ts` no longer exports any of them: `CostTrackingDashboard`, `VoiceInput`, `VoiceOutput`, `BookingAttemptTable`, `TipCalculator`, `DriverProfileCard`, `ReviewShowcase`, `ChatContainer`, `ChatInput`, `ChatMessage`, `PriceGuarantee`, `DriverTrackingInterface`, `EditModeToggle`, `DigitalWalletPayment`, `BookingCard`.

`DriverLocationTracker`, `LiveTrackingMap`, `TrackingETADisplay` were correctly kept (reserved for the custom map tracker).

---

## Batch B — API routes (unused or dev-only)

| Route / path | Status |
|--------------|--------|
| `POST /api/booking/route.ts` | **Keep.** Zero internal callers, but it's an intentional, documented deprecation shim (see `docs/STABILITY_SCOREBOARD.md`'s "Deprecated (returns 410)" list) — returns 410 with a redirect message for any stale/external caller still hitting the old path, and has direct test coverage (`tests/unit/deprecated-endpoints.test.ts`). Deleting it would turn a helpful 410 into a bare 404. Do not remove. |
| `POST /api/payment/create-checkout-session/route.ts` | Already removed. |
| `GET/POST /api/booking/lock-time-slot` | Already removed. |
| `GET/POST /api/booking/release-time-slot` | Already removed. |
| `GET /api/bookings/[id]/eta/route.ts` | **Keep** — same reasoning as `/api/booking/route.ts` above; also a tested 410 deprecation shim, not dead code. |
| `GET /api/email/verify-config/route.ts` | Removed 2026-07-16 (dev-only diagnostic route, already 404s in production, zero callers, no test coverage). |
| Other email dev/test routes (`test`, `test-confirmation`, `test-booking-verification`, `enhanced-test`, `simple-test`) | Already removed — none of these files exist anymore. |

Batch B is now fully closed out — the two 410 stubs are intentionally kept, everything else is gone.

---

## Batch C — Service consolidation

See `docs/PHASE4_SERVICE_CONSOLIDATION.md` — **its "remove notification-service" recommendation was wrong and must not be acted on.** Re-verified 2026-07-16: `notification-service.ts`'s `sendBookingProblem` is directly imported by `cancel-booking/route.ts`, `process-payment/route.ts`, and `booking-orchestrator.ts` — it's live, load-bearing error-alerting code, not dead.

`booking-notification-service.ts` (the other candidate) was already removed.

---

## Batch D — Design system duplication

Not yet audited. Still open if anyone wants to pick it up: `src/design/system/tokens/` vs `foundation/tokens/`, and confirming there's only one canonical `ErrorBoundary`.

---

## Dependency cleanup (found in the same pass, 2026-07-16)

- Removed `@fullcalendar/core`, `@fullcalendar/daygrid`, `@fullcalendar/react` — installed but never imported anywhere.
- Removed `react-datepicker` + `@types/react-datepicker` — only its CSS was imported globally in `layout.tsx`, no component ever used the library itself. (`react-datetime-picker`, mentioned in an earlier version of this doc, was already removed prior to this pass — it wasn't even in `package.json`.)
