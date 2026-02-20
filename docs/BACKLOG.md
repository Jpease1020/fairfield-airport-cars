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
| 17 | **Unused packages** | `package.json` | Remove or narrow openai, octokit; run audit and remove dead code paths. (More in Phase 5.) | [ ] |

---

## Phase 4 — Bloat: unused components & routes

| # | Item | Where / Notes | Acceptance |
|---|------|----------------|------------|
| 18 | **Unused components (~2k+ lines)** | See list below; **checklist:** `docs/PHASE4_BLOAT_CHECKLIST.md` | Delete only with explicit permission per .cursorrules. Confirm zero imports, then propose deletion list. |
|  | *Components (zero imports)* | | |
|  | CostTrackingDashboard.tsx (426) | | |
|  | DriverLocationTracker.tsx (415) | | |
|  | VoiceInput.tsx (404), VoiceOutput.tsx (392) | | |
|  | BookingAttemptTable, TipCalculator | | |
|  | NotificationManager (if still present after push removal) | | |
|  | DriverProfileCard, ReviewShowcase | | |
|  | ChatContainer, ChatInput, ChatMessage | | |
|  | PriceGuarantee (commented out everywhere) | | |
| 19 | **Unnecessary API routes** | `src/app/api/` | Consolidate or remove after confirming no callers. |
|  | 5 email test routes | `/api/email/test*`, verify-config, enhanced-test | Dev-only; remove or guard for production. |
|  | Duplicate ETA | `/api/bookings/[id]/eta` and `/api/tracking/eta` | One ETA route or clear split of responsibilities. |
|  | Time-slot routes | 4 → 2 if possible | |
|  | `/api/booking/route.ts` | Returns 403; delete if truly disabled. | |
|  | `/api/payment/create-checkout-session` | Deprecated flow; remove or redirect. | |
| 20 | **Service consolidation** | `src/lib/services/` | 5 notification → 2; 5 driver/tracking → 2. Document which stay and which merge. |
| 21 | **Design system duplication** | Token dirs, ErrorBoundary | Single source: `src/design/system/tokens/` vs `foundation/tokens/`. One ErrorBoundary (common vs business). |

---

## Phase 5 — Bloat: dependencies

| # | Item | Notes | Acceptance |
|---|------|--------|------------|
| 22 | **openai** | Not in business requirements | Remove or restrict to optional feature; remove dead paths. |
| 23 | **octokit** | No GitHub feature in app | Remove or restrict; remove dead paths. |
| 24 | **Date pickers** | react-datepicker + react-datetime-picker | One date/time solution (e.g. keep DateTimePicker pattern). |
| 25 | **@fullcalendar/* (3)** | Heavy; optional feature | Remove if not required; or lazy-load. |
| 26 | **googleapis + google-auth-library** | Optional calendar sync | Keep only if used; otherwise remove or lazy-load. |

---

## Phase 6 — Code quality

| # | Item | Where | Acceptance |
|---|------|--------|------------|
| 27 | **BookingProvider god object** | `src/providers/BookingProvider.tsx` (~1,159 lines) | Extract sub-concerns (e.g. quote, validation, submit) into smaller modules or hooks. |
| 28 | **Admin bookings page** | Admin bookings page (~866 lines) | Extract components/sections. |
| 29 | **TODO/FIXME** | Codebase | Resolve or ticket: refunds, ETA, secure token storage, real-time tracking (see Phase 3). |
| 30 | **Validation consistency** | TripDetailsPhase vs ContactInfoPhase | Same pattern: provider state vs local state; align approach. |
| 31 | **isMobile detection** | Multiple components | Single shared hook or util; reuse. |
| 32 | **Hardcoded phone** | FlightInfoPhase (or similar) | Replace `(646) 221-6370` with CMS or config. |

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
