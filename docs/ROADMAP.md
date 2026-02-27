# Fairfield Airport Cars — Roadmap

*Last updated: 2026-02-24*

Honest status of the app: what's done, what's in progress, and what's next.

---

## What's shipped and working

These features are in production at `www.fairfieldairportcar.com`.

| Feature | Status | Notes |
|---------|--------|-------|
| **Booking flow** | Done | Trip details → Contact info → Payment. Google Maps autocomplete, fare calculation, date/time picker. |
| **Square payments** | Done | Deposits, full payment, balance payments. Sandbox tested. |
| **Refund/cancellation** | Done | 100% (>24h), 50% (3-24h), 0% (<3h before pickup). Square refund integration. |
| **Service area validation** | Done | Fairfield County, CT. 25mi normal, 40mi extended (requires call). Airport-to-airport blocked. |
| **SMS notifications** | Done | Twilio: booking confirmation, driver notification, admin alerts. |
| **Email notifications** | Done | Booking confirmation, driver notification emails. |
| **Inbound SMS + forwarding** | Done | Twilio webhook stores messages, forwards to Gregg. |
| **Admin dashboard** | Done | Booking list (card layout), booking details. |
| **Admin settings** | Done | Business rules (buffer, service area, cancellation tiers, deposit). Firestore-backed, Zod-validated. |
| **Admin messages** | Done | View SMS message history. |
| **SMS opt-in** | Done | TCPA-compliant consent checkbox on booking form. Stored per customer. |
| **Auth** | Done | Firebase Auth. Admin role via Firestore `users/{uid}.role`. |
| **Driver scheduling** | Done | 60-minute buffer between bookings. Midnight-spanning conflict detection. |
| **Flight info** | Done | Optional departure time field with DateTimePicker. |
| **Customer info persistence** | Done | "Save my information for future bookings" option. |

---

## What's partially built or on hold

| Feature | Status | What exists | What's missing |
|---------|--------|-------------|----------------|
| **Tracking page** | Partial | `TrackingPageClient`, Firebase tracking service, real-time tracking service, ETA API | Polling-only refactor not done. Multiple overlapping services (4 driver/tracking services). |
| **A2P 10DLC campaign** | Pending | SMS sending works; opt-in UI in prod | Campaign registration rejected; resubmission needed with corrected content. |
| **CI pipeline** | Partial | Unit + integration + E2E tests all pass locally. E2E CI config exists. | No GitHub Actions workflow. No coverage thresholds. No auto-run on PR. |

---

## Tech debt (from BACKLOG.md Phases 4-6)

Active cleanup effort. Phases 1-3 are done. Remaining:

### Phase 4 — Bloat removal
- **Batch A:** Done. 15 unused components removed.
- **Batch B:** Open. ~6 unused/dev-only API routes to remove or guard (email test routes, deprecated checkout session, duplicate ETA, time-slot routes, disabled booking route).
- **Batch C:** Documented. 4 notification services → 2 (remove `booking-notification-service` and `notification-service`). 4 driver/tracking services → keep all for now, document ownership.
- **Batch D:** Open. Design system token duplication (`system/tokens/` vs `foundation/tokens/`), duplicate ErrorBoundary.

### Phase 5 — Dependency cleanup
- Remove `openai` (not used in business logic)
- Remove `octokit` (no GitHub feature)
- Consolidate date pickers (react-datepicker + react-datetime-picker → one)
- Evaluate `@fullcalendar/*` (heavy, optional)
- Evaluate `googleapis` + `google-auth-library` (optional calendar sync)

### Phase 6 — Code quality
- `BookingProvider.tsx` (~1,159 lines) — extract sub-concerns
- Hardcoded phone number → CMS/config
- Validation pattern consistency (provider state vs local state)
- Shared `isMobile` hook
- Resolve remaining TODO/FIXME comments

### Codebase size targets
| Metric | Current (est.) | Target |
|--------|----------------|--------|
| Total files | ~300 | ~120 |
| Lines of code | ~48,000 | ~20,000 |
| API routes | ~40 | ~20 |
| Services | ~25 | ~12 |

---

## What's next (prioritized)

### 1. Get CI working (Phase 3, item #16)
- GitHub Actions: run unit + integration + build on every PR
- E2E against Vercel preview URL (no DB writes)
- Coverage reporting

### 2. A2P SMS campaign approval
- Resubmit with corrected content (transactional framing, real URLs, proper opt-in description)
- Required before sending promotional SMS

### 3. Phase 4 Batch B — API route cleanup
- Remove or guard unused routes
- Quick win, reduces surface area

### 4. Phase 5 — Dependency cleanup
- Remove unused packages
- Reduces bundle size and attack surface

### 5. Tracking page refactor (Phase 3, item #13)
- Simplify to polling-only (single driver, time-limited links)
- Consolidate 4 overlapping tracking services

### 6. Phase 6 — Code quality
- Break up BookingProvider
- Consistency fixes

---

## What we're NOT building

Per the project philosophy (single-driver operation for Gregg):

- Multi-driver management
- Complex analytics dashboards
- Advanced role/permission systems
- AI assistant / chatbot
- Push notifications (removed)
- Real-time WebSocket tracking (polling is sufficient)
- Mobile native app
- Multi-tenant / franchise support

---

## Docs status

| Doc | Status | Action needed |
|-----|--------|---------------|
| `APP_INVENTORY.md` | Current | None |
| `BACKLOG.md` | Current | Update as items complete |
| `E2E_TESTING.md` | Outdated | References deleted test files; update |
| `README.md` (docs/) | Outdated | Wrong framework version (says 14, it's 16), references fictional team, stale roadmap. Rewrite or delete. |
| `PHASE4_BLOAT_CHECKLIST.md` | Current | Batch A done, B-D open |
| `PHASE4_SERVICE_CONSOLIDATION.md` | Current | None |
| `DESIGN_SYSTEM_PROTECTION.md` | Stale | From Aug 2025; review |
| `LAYOUT_SYSTEM_GUIDE.md` | Stale | From Aug 2025; review |
| This file (`ROADMAP.md`) | Current | Single source of truth for roadmap |

