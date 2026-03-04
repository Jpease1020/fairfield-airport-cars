# Clean Sweep Design — Fairfield Airport Cars
**Date:** 2026-03-04
**Approach:** Journey-first redesign (Option B)
**Status:** Approved

---

## Overview

A full audit and cleanup of the codebase. The goal is three things:
1. The right set of features for customers and Gregg — nothing more, nothing less
2. A clean, well-architected codebase with clear responsibilities
3. A test suite that covers the actual journeys, not implementation details

---

## Customer Journey

### 1. Book (guest, no account required)
Landing page → booking form → fare quote → confirm. Captures name, phone, email, pickup/dropoff locations, date/time, and optional flight info. No login required.

### 2. Confirmation
Success page shown immediately. Confirmation sent via both email and SMS. Both contain a **secure magic link** — a signed token tied to the specific booking ID. This link is the customer's identity for everything that follows.

### 3. Day-of (via magic link)
Customer clicks their link → lands on their ride status page. Shows: pickup time, Gregg's current status (confirmed / en route / arrived / completed), and either live tracking or SMS ETA updates depending on tracking audit outcome. Customers can only ever see their own ride.

### 4. Post-ride (same magic link)
After ride completion, the status page surfaces a tip prompt and a short feedback form. One interaction, no new screen required.

### 5. Past rides (optional portal)
Customer enters email → receives a new magic link → sees all past bookings. No password. No registration. The register page and forgot-password page are deleted.

### Auth model
- **Magic link via email** — primary method for customers
- **SMS OTP** — fallback for customers without email access
- **Email/password** — Gregg's admin access only
- No passwords for customers, ever

---

## Admin Panel (Gregg's Command Center)

Six pages. Nothing else.

| Page | Purpose |
|---|---|
| **Dashboard** | Today's rides at a glance. Next pickup, unread messages, recent activity |
| **Bookings** | Full ride history. Filterable by date, status, customer. Click any booking for full detail |
| **Schedule** | Calendar view (month/week/day). Shows all rides, conflicts, and 60-min buffers visually |
| **Messages** | Customer SMS threads (Twilio Conversations). Campaigns in a separate tab |
| **Costs** | Business expense log. Fuel, maintenance, fees. Profitability view per ride and per month |
| **Settings** | Phone number, notification preferences, business rules (service area, pricing, refund policy) |

Pages deleted from admin: `/admin/cms/*`, `/admin/setup`, `/admin/drivers`, standalone `/calendar`, `/test-email`

---

## Double-Booking Prevention

Slot locking (lock-time-slot / release-time-slot / booking-attempts) is removed. Replaced with:

- **Firestore transaction at submission time** — checks Google Calendar + existing bookings atomically before writing
- If a conflict exists, the write fails and the customer gets a clear error message
- Single driver means no optimistic locking is needed — submission is the only lock point

---

## What Gets Deleted

### Pages
- `/admin/cms/*` (business, colors, pricing editors)
- `/admin/setup`
- `/admin/drivers`
- `/calendar` (standalone)
- `/(admin)/test-email`
- `/auth/register`
- `/auth/forgot-password`
- `/customer/payments/add-method` (until deposits are built)
- `/customer/payments/pay-balance` (until deposits are built)

### API Routes
- `/api/admin/cms/*` + `/api/admin/deploy-cms`
- `/api/booking/attempts`, `/api/booking/lock-time-slot`, `/api/booking/release-time-slot`
- `/api/payment/create-checkout-session`, `/api/payment/complete-payment`, `/api/payment/digital-wallet`, `/api/payment/process-in-app` — consolidate to one payment route when deposits are built
- `/api/ws/bookings/[id]` — WebSocket endpoint, replaced with polling if tracking stays
- `/api/drivers/start-tracking`, `/api/drivers/availability`
- `/api/email/test`, `/api/email/enhanced-test`, `/api/email/test-confirmation`, `/api/email/test-booking-verification`

### Code
- All `cms-integrated-*.ts` token files
- `useCMSField` hook
- `cms-service.ts` (replaced by direct `cms-source.ts` usage)
- CMS admin pages and their API routes
- `driver-location-service.ts` (if tracking is replaced by SMS updates after audit)
- Duplicate `createBooking` function in `booking-service.ts`
- `notification-service.ts` — merged into specific services, overlap removed

---

## God Object Refactors

### `booking-service.ts` (717 lines → 4 focused files)
| New File | Responsibility |
|---|---|
| `booking-repository.ts` | Firestore CRUD only |
| `booking-availability.ts` | Time slot checking, conflict detection, buffer enforcement |
| `booking-cancellation.ts` | Cancellation logic, refund calculation |
| `booking-types.ts` | All booking-related TypeScript interfaces |

### `email-service.ts` (719 lines → thin service + template files)
| New Structure | Responsibility |
|---|---|
| `email-service.ts` | Thin sending logic only — no inline HTML |
| `src/lib/email-templates/*.ts` | One file per email template |
| Delete | All test send functions (`sendTestEmail`, `sendEnhancedTestEmail`) |

### `admin/bookings/page.tsx` (644 lines → 3 focused files)
| New File | Responsibility |
|---|---|
| `useBookings.ts` | Data fetching + all action handlers |
| `BookingsTable.tsx` | Display only |
| `BookingFilters.tsx` | Filter state and UI |

---

## Code Quality Rules (Enforced Going Forward)

- No file over 300 lines
- No component with more than 3 `useState` calls — extract a hook
- No service file mixing repository (DB) concerns with business logic
- No inline HTML in TypeScript files — templates are their own files
- One responsibility per file, named to reflect it
- All business logic in `src/lib/services/` — zero logic in API routes or components
- API routes are thin: validate input → call service → return response
- No Firestore reads in components — everything goes through API routes

---

## Live Tracking Decision

**Current state:** Built and tested with mock data. Untested in production.

**Process:** Audit against a real device before deciding. Two outcomes:
- **Keep:** Verify real GPS accuracy, fix any prod issues, replace WebSocket with polling
- **Replace:** Remove tracking entirely, replace with Gregg sharing his location via SMS (Google Maps / Apple Maps share link) + automated SMS ETA updates

Decision made during implementation phase after real-device test.

---

## Testing Strategy

### Unit Tests — business logic only
- Pricing calculations
- Service area validation (Fairfield County 25mi / 40mi rules)
- Refund policy (100% / 50% / 0%)
- Availability checks and buffer enforcement
- Booking time formatting and timezone handling

### Integration Tests — full flows, mocked external services
- Complete booking submission (guest → confirmation → Firestore write)
- Cancellation with correct refund calculation
- Magic link auth flow (request → verify → access booking)
- Post-ride tip submission
- Post-ride feedback submission
- Admin booking status update

### E2E Tests — real browser against Firebase emulators
- Complete booking form (locations → quote → confirm)
- Magic link → status page (customer sees only their ride)
- Admin login → bookings view → status update

### Deleted Tests
- All tests covering deleted features
- All dev-tool email route tests
- Duplicate coverage (two tests for the same behavior)

---

## Implementation Phases

### Phase 1 — Delete dead code
Remove all deleted pages, API routes, and code listed above. Tests still pass after each deletion. No new code written.

### Phase 2 — Refactor God objects
Split `booking-service.ts`, `email-service.ts`, and `admin/bookings/page.tsx` into focused files. No behavior changes.

### Phase 3 — Auth simplification
Remove register and forgot-password pages. Verify magic link + OTP flows work end-to-end. Customer identity tied to booking token.

### Phase 4 — Double-booking hardening
Remove slot locking. Implement Firestore transaction at submission. Test conflict scenario.

### Phase 5 — Tracking audit
Real-device test. Keep or replace based on results.

### Phase 6 — Test suite cleanup
Delete tests for deleted features. Add missing tests for the six admin pages and customer journey flows. Ensure every journey step has integration coverage.

### Phase 7 — Admin panel solidification
Ensure all six admin pages are complete, useful, and connected to real data. Nothing half-baked ships.
