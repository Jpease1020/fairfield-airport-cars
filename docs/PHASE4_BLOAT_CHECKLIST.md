# Phase 4 Bloat — Proposed Deletions Checklist

Use this to approve removals in batches. **Per .cursorrules: ask before each file delete; no bulk delete without permission.**

---

## Batch A — Components (zero external use)

These are **never imported** outside `src/components/business/` (only exported from the barrel). Safe to remove once you approve; we will also remove their exports from `src/components/business/index.ts`.

| File | Lines (approx) | Notes |
|------|----------------|--------|
| `CostTrackingDashboard.tsx` | ~426 | Uses real-cost-tracking; no pages use it. |
| `VoiceInput.tsx` | ~404 | No callers. |
| `VoiceOutput.tsx` | ~392 | No callers. |
| `BookingAttemptTable.tsx` | — | No callers. |
| `TipCalculator.tsx` | — | No callers. |
| `DriverProfileCard.tsx` | — | No callers. |
| `ReviewShowcase.tsx` | — | No callers. |
| `ChatContainer.tsx` | — | No callers (only imports ChatMessage). |
| `ChatInput.tsx` | — | No callers. |
| `ChatMessage.tsx` | — | No callers. |
| `PriceGuarantee.tsx` | — | Only referenced in commented-out code (HeroSection, FareDisplaySection). |
| `DriverTrackingInterface.tsx` | — | No callers in app. |
| `EditModeToggle.tsx` | — | No callers (ModeToggleMenu uses its own handler, not this component). |
| `DigitalWalletPayment.tsx` | — | No callers. |
| `BookingCard.tsx` | — | Admin bookings page uses a local `styled.div` named BookingCard, not this. |

**Kept (not in Batch A):** `DriverLocationTracker`, `LiveTrackingMap`, `TrackingETADisplay` — reserved for custom map tracker; tracking page currently uses `TrackingMap` + `TrafficETA` only. Do not delete until you move to shared location or confirm removal.

**Approval:** Say "Approve Batch A" to remove these 15 component files + update `business/index.ts`.  
**Done:** Batch A executed; 15 files removed, index updated.  
If you prefer to do a subset first, say e.g. "Approve Batch A: only Chat* and Voice*." (DriverLocationTracker, LiveTrackingMap, TrackingETADisplay are not in the list.)

---

## Batch B — API routes (unused or dev-only)

| Route / path | Callers | Proposal |
|--------------|---------|----------|
| `POST /api/booking/route.ts` | BookingProvider, PaymentSuccessClient | Returns **403** always. Either remove and fix callers to use submit/process-payment, or keep as explicit block. |
| `POST /api/payment/create-checkout-session/route.ts` | None found | Deprecated; redirects to pay-balance. **Remove** or keep as redirect. |
| `GET/POST /api/booking/lock-time-slot` | None | **Remove** if confirmed unused. |
| `GET/POST /api/booking/release-time-slot` | None | **Remove** if confirmed unused. |
| `GET /api/bookings/[id]/eta/route.ts` | None (only `/api/tracking/eta` is used) | Consolidate to one ETA route or **remove** this one. |
| Email dev routes | test-email page calls `/api/email/simple-test`; routes exist: `test`, `verify-config`, `test-confirmation`, `test-booking-verification`, `enhanced-test` | **Guard for production** (e.g. NODE_ENV or ALLOW_EMAIL_TEST) or remove; align test-email page with actual route (e.g. `test` vs `simple-test`). |

**Approval:** Say "Approve Batch B" (or which items) to remove or guard as above.

---

## Batch C — Service consolidation (document first, then merge)

No deletions here until we document and then merge:

- **Notification-related:** `notification-service`, `booking-notification-service`, `admin-notification-service`, `driver-notification-service` → document which stay, which merge.
- **Driver/tracking:** `real-time-tracking-service`, `firebase-tracking-service`, `driver-location-service`, `driver-service` → document which stay, which merge.

**Done:** Batch C doc created: `docs/PHASE4_SERVICE_CONSOLIDATION.md` (callers + merge plan).  
**Approval:** Say "Approve remove booking-notification-service" to delete that file; "Audit notification-service" to trace and propose.

---

## Batch D — Design system duplication

- **Tokens:** `src/design/system/tokens/` vs `foundation/tokens/` — single source (audit and consolidate).
- **ErrorBoundary:** `src/components/business/ErrorBoundary` is used by `app/layout.tsx`; check for duplicate in design — one canonical place.

**Approval:** Say "Approve Batch D" to audit and propose a single-source plan (no deletes until you approve the plan).

---

## Summary

| Batch | Action | When |
|-------|--------|------|
| A | Remove 15 unused components + index exports (tracking components kept) | After you say "Approve Batch A" (or subset). |
| B | Remove or guard 5+ API routes | After you say "Approve Batch B" (or items). |
| C | Document notification + driver services, then propose merge | Done: see `docs/PHASE4_SERVICE_CONSOLIDATION.md`. |
| D | Audit tokens + ErrorBoundary, propose single source | After you say "Approve Batch D". |

After Batch A (and optionally B), re-run coverage to get a cleaner baseline before setting thresholds (backlog #16).
