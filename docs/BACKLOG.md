# Fairfield Airport Cars — Single Backlog

One ordered list merging the **Unified Plan** remainder and the **full audit** from the Claude message. Tackle in order unless a dependency forces a different sequence.

**Legend:** [ ] Not started · [~] In progress · [x] Done

---

## Ready to push (Phase 1 + 2 + test fixes)

- **Phase 1 (critical):** Flight label, payment cents validation, two-airport (verified), midnight scheduling, refund JSDoc.
- **Phase 2 (high priority):** Booking creation doc, quote pickupDateTime required, payment note conditional, success title, Places fallback.
- **Test/config:** Cancellation integration test asserts options passed to `cancelBooking`; vitest excludes `.claude/**` so worktree tests don’t run.
- **Build:** `npm run build` passes. **Unit + integration:** 254 passed, 5 skipped (run with `npm run test:unit`; excludes worktree).
- **Suggested commit message:** `fix: Phase 1 critical bugs + Phase 2 high-priority (backlog)`

---

## Phase 1 — Critical bugs (fix now)

| # | Item | Where | Acceptance | Status |
|---|------|--------|------------|--------|
| 1 | **Flight info label wrong** | `src/components/booking/trip-details/FlightInfoSection.tsx` | Label says "Arrival Time" but code uses as departure. Fix label (and any copy) so customers enter departure time; or rename field to match actual use. | [x] Done: CMS key `flightDepartureTimeLabel`, fallback "Departure Time", aria-label added. |
| 2 | **Payment amount ambiguity** | `src/app/api/payment/process-payment/route.ts` | Clarify whether `amount` and `tipAmount` are cents or dollars; ensure `amount + tipAmount` is correct and document. Prevent over/undercharging. | [x] Done: Comment + validation that amount/tipAmount are non-negative integers (cents). |
| 3 | **Two-airport bookings not blocked** | `src/lib/services/service-area-validation.ts` | Business rule: one end must be home address. Reject airport-to-airport; return clear validation error. | [x] Done: Already implemented; unit test in place. |
| 4 | **Midnight scheduling bug** | `src/lib/services/driver-scheduling-service.ts` | Prep-time calculation can span midnight incorrectly. Fix so conflicts across midnight are detected. | [x] Done: `checkDriverAvailability` now considers prep slots and uses `slotOverlapsRange` for midnight-spanning slots. |
| 5 | **Refund logic not implemented** | `src/lib/services/booking-service.ts` (TODO) + cancel flow | Cancellations mark booking cancelled; ensure Square refund (or fee charge) is actually called and matches policy. Align with `cancel-booking/route.ts` fee tiers. | [x] Done: Refund processed in `cancelBooking` when API provides `refundAmount` + `squarePaymentId`; JSDoc clarified. |
| 6 | **Firestore rules are still `allow read, write: if true` for every collection except `config` and `users.role`** | `firestore.rules` | Migrate the handful of routes that currently hit Firestore via the client SDK with no Firebase Auth session (`review-service.ts`'s reviews-submit route, `driver-service.ts`'s tracking-lookup route, plus the Admin-SDK-unavailable fallback paths in `quote-service.ts`/`driver-scheduling-service.ts`) to `firebase-admin/firestore`, then write real per-collection least-privilege rules for `bookings`, `driverSchedules`, `smsThreads`/`smsMessages`, etc. Blocked on that migration today — tightening rules first would 403 those routes. The public live-tracking page's direct `bookings/{id}` listener also needs a plan (a tracking-safe field subset, most likely) before `bookings` can be locked to admin-only. | [ ] Not started — role-escalation vector closed (`users/{uid}.role`/`permissions` now write-protected), everything else still open. |

---

## Phase 2 — High-priority issues

| # | Item | Where | Acceptance | Status |
|---|------|--------|------------|--------|
| 6 | **Duplicate booking creation** | `booking-service.ts` vs `booking-service-admin.ts` | Unify or clearly separate responsibilities; single source of truth for "create booking" to reduce maintenance risk. | [x] Done: JSDoc on createBookingAtomic; admin re-exports it (single source). |
| 7 | **Quote reusable with different time** | Quote/validation flow | Include `pickupDateTime` (or equivalent) in quote hash/validation so old quote cannot be submitted with a changed time. | [x] Done: createQuote requires pickupDateTime; submit already validates hash with time. |
| 8 | **Payment phase greyed-out form** | Payment phase component(s) | When no payment required, hide the form entirely instead of showing 50% opacity + "No Payment Required." | [x] Done: "No Payment Required" note only when noPaymentRequired (fare 0/missing); PaymentForm not in phase. |
| 9 | **Booking success title wrong** | Booking success / confirmation component | Title should reflect "confirmed" or "pending," not "Confirm Your Booking." | [x] Done: BookPageClient shows "Booking confirmed" + subtitle when success. |
| 10 | **No Google Maps fallback** | Location/Places input(s) | If Places API fails to load, show a clear error message (and optional fallback) instead of empty input. | [x] Done: placesUnavailable on timeout + when user types and Places missing; message + "enter manually." |

---

## Phase 3 — Unified Plan remainder

| # | Item | Where | Acceptance | Status |
|---|------|--------|------------|--------|
| 11 | **ContactInfoPhase RTL tests** | e.g. `tests/unit/ContactInfoPhase.integration.test.tsx` or `tests/integration/` | Toggle "Save my information" and "Send me deals" repeatedly; assert state and submit payload. | [x] Done: `ContactInfoPhase.integration.test.tsx`. |
| 12 | **FlightInfoSection datetime** | `FlightInfoSection.tsx` | Optional: replace `datetime-local` with date + time pattern (or DateTimePicker) for consistency with main flow. | [x] Done: Replaced with DateTimePicker (date + time, 15-min slots); minDate=now for flight departure. |
| 13 | **Driver tracking → polling only** | `TrackingPageClient.tsx`, tracking API, services | Single-driver, time-limited link; GET polling (e.g. 15–30s) only. Remove/repurpose Firebase real-time and WebSockets for customer-facing tracking. | [~] On hold (uncertain). |
| 14 | **Unit tests: business rules & cancellation** | `tests/unit/` | Business rules (getBusinessRules, defaults, cache), service-area, driver-scheduling buffer, cancellation fee boundaries (24h, 12h, 6h). | [x] Done: getBusinessRules + invalidateCache; getCancellationFeePercent + schema in business-rules.test.ts. |
| 15 | **E2E: booking + admin settings** | `tests/e2e/` | Booking happy path (mock payments); admin settings change (e.g. bookingBufferMinutes) and confirm used after TTL. | [x] Done: complete-booking-flow = canonical happy path (mocked); admin-settings.spec.ts redirect-to-login; integration business-rules-save-get (save then get returns new value). |
| 16 | **CI: Vitest + Playwright + coverage** | CI config | Run on PR; coverage reporting; fail below threshold. | [ ] |
| 17 | **Unused packages** | `package.json` | Remove or narrow openai, octokit; run audit and remove dead code paths. (More in Phase 5.) | [x] Done: neither openai nor octokit is in package.json (verified 2026-07-16, already removed prior to this check). |

---

## Phase 4 — Bloat: unused components & routes

| # | Item | Where / Notes | Acceptance |
|---|------|----------------|------------|
| 18 | **Unused components (~2k+ lines)** | See `docs/PHASE4_BLOAT_CHECKLIST.md` | [x] Done — all 15 removed (see checklist doc for current status). |
| 19 | **Unnecessary API routes** | `src/app/api/` | [x] Done — see `docs/PHASE4_BLOAT_CHECKLIST.md` Batch B. Two routes were intentionally kept as tested 410-deprecation shims rather than deleted (`/api/booking`, `/api/bookings/[id]/eta`); everything else in the batch is removed. |
| 20 | **Service consolidation** | `src/lib/services/` | [x] Done — see `docs/PHASE4_SERVICE_CONSOLIDATION.md` (note: its original recommendation to remove `notification-service` was wrong and was corrected 2026-07-16 — that service is live and must stay). |
| 21 | **Design system duplication** | Token dirs, ErrorBoundary | [ ] Still open — not yet audited. |

---

## Phase 5 — Bloat: dependencies

| # | Item | Notes | Acceptance |
|---|------|--------|------------|
| 22 | **openai** | Not in business requirements | [x] Done — not in package.json. |
| 23 | **octokit** | No GitHub feature in app | [x] Done — not in package.json. |
| 24 | **Date pickers** | react-datepicker + react-datetime-picker | [x] Done 2026-07-16 — both removed (react-datetime-picker wasn't even installed; react-datepicker had zero component usage, only a dead CSS import). |
| 25 | **@fullcalendar/* (3)** | Heavy; optional feature | [x] Done 2026-07-16 — removed, zero usage found anywhere in src/. |
| 26 | **googleapis + google-auth-library** | Optional calendar sync | [x] Verified 2026-07-16 — actively used by `google-calendar.ts` (9+ call sites). Keep. |

---

## Phase 6 — Code quality

| # | Item | Where | Acceptance |
|---|------|--------|------------|
| 27 | **BookingProvider god object** | `src/providers/BookingProvider.tsx` | [x] Done (verified 2026-07-16): now 293 lines, delegates to `src/providers/booking/*` (use-booking-crud, use-booking-form-state, use-phase-validation, provider-actions-factory, submission, form-selectors). File itself is composition/wiring only. |
| 28 | **Admin bookings page** | `src/app/(admin)/admin/bookings/` | [x] Done (verified 2026-07-16): `page.tsx` is now 51 lines (composition only), split into `useBookings.ts`, `BookingsTable.tsx`, `BookingFilters.tsx`, `bookings-utils.ts`, `bookings-styles.ts`. |
| 29 | **TODO/FIXME** | Codebase | Resolve or ticket: refunds, ETA, secure token storage, real-time tracking (see Phase 3). |
| 30 | **Validation consistency** | TripDetailsPhase vs ContactInfoPhase | Same pattern: provider state vs local state; align approach. |
| 31 | **isMobile detection** | Multiple components | Single shared hook or util; reuse. |
| 32 | **Hardcoded phone** | FlightInfoPhase (or similar) | Replace `(646) 221-6370` with CMS or config. |
| 33 | **Fare formula duplicated** | `src/app/api/booking/quote/route.ts` vs `src/app/api/admin/pricing/test-quote/route.ts` | The base+mileage+time / discount / airport-multiplier / single-ceil-at-end calculation is hand-duplicated in both files with no shared helper. This is the exact bug class fixed 2026-07 (the admin preview had drifted from the real quote's rounding) — extract a shared `computeFare()` so a future rate/rounding change can't silently re-diverge between the two routes. |

---

## By the numbers (audit targets)

| Metric | Current | Target (guidance) |
|--------|---------|-------------------|
| Total files | ~375 | ~120 |
| Lines of code | ~55,872 | ~20,000 |
| API routes | 47 | ~20 |
| Services | 27 | ~12 |
| Components | 67 | ~40 |
| Design system files | 92 | ~35 |

---

## Quick reference: file paths

- **Booking flow:** `src/app/(customer)/book/`, `src/components/booking/`, `src/providers/BookingProvider.tsx`, `src/contexts/BookingFormProvider.tsx`
- **Payment:** `src/app/api/payment/process-payment/route.ts`, `src/components/booking/PaymentPhase.tsx`, `src/components/business/SquarePaymentForm.tsx`
- **Validation:** `src/lib/services/service-area-validation.ts`, trip-details and contact-info phases
- **Scheduling:** `src/lib/services/driver-scheduling-service.ts`, `src/lib/services/booking-service.ts`
- **Cancel/refund:** `src/app/api/booking/cancel-booking/route.ts`, `src/lib/services/booking-service.ts`
- **Tracking:** `src/app/(public)/tracking/[bookingId]/TrackingPageClient.tsx`, `src/lib/services/firebase-tracking-service.ts`, `src/lib/services/real-time-tracking-service.ts`
- **Business rules:** `src/lib/business/business-rules.ts`, `config/businessRules` (Firestore)
- **Tests:** `tests/unit/`, `tests/integration/`, `tests/e2e/`, `config/playwright.ci.config.ts`

---

*Last updated from Unified Plan + full audit. Mark items [x] in the tables as they’re completed.*
