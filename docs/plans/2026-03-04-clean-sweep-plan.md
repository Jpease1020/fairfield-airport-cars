# Clean Sweep Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove dead code, refactor God objects, simplify auth, harden double-booking prevention, and clean up the test suite so the codebase matches the approved journeys exactly.

**Architecture:** Journey-first — every file that exists must serve either the customer journey (book → confirm → day-of → post-ride → portal) or Gregg's admin panel (6 pages). Anything outside those journeys gets deleted. God objects get split into single-responsibility files. Tests cover journeys, not implementation details.

**Tech Stack:** Next.js 16 App Router, Firebase/Firestore, Twilio, Square, Google Maps, Vitest, Playwright

**Design doc:** `docs/plans/2026-03-04-clean-sweep-design.md`

---

## Phase 1: Delete Dead Code

> Run `npm run test:unit && npm run test:integration` before starting. All must pass.

---

### Task 1: Delete admin dead pages

**Files:**
- Delete: `src/app/(admin)/calendar/page.tsx`
- Delete: `src/app/(admin)/test-email/page.tsx`
- Delete: `src/app/(admin)/test-email/TestEmailPageClient.tsx`
- Delete: `src/app/(admin)/admin/drivers/page.tsx`
- Delete: `src/app/(admin)/admin/drivers/DriversClient.tsx`
- Delete: `src/app/(admin)/admin/setup/page.tsx`

**Step 1: Confirm tests green before touching anything**
```bash
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"
npm run test:unit && npm run test:integration
```
Expected: all pass.

**Step 2: Delete the files**
```bash
rm src/app/\(admin\)/calendar/page.tsx
rm src/app/\(admin\)/test-email/page.tsx
rm src/app/\(admin\)/test-email/TestEmailPageClient.tsx
rm src/app/\(admin\)/admin/drivers/DriversClient.tsx
rm src/app/\(admin\)/admin/drivers/page.tsx
rm src/app/\(admin\)/admin/setup/page.tsx
```

**Step 3: Remove empty directories**
```bash
rmdir src/app/\(admin\)/calendar 2>/dev/null || true
rmdir src/app/\(admin\)/test-email 2>/dev/null || true
rmdir src/app/\(admin\)/admin/drivers 2>/dev/null || true
rmdir src/app/\(admin\)/admin/setup 2>/dev/null || true
```

**Step 4: Check for broken imports referencing deleted files**
```bash
grep -r "test-email\|DriversClient\|setup/page\|admin/calendar" src --include="*.ts" --include="*.tsx" | grep -v "node_modules"
```
Expected: no output. Fix any imports found.

**Step 5: Delete the test-email guard test (covers deleted page)**
```bash
rm tests/unit/test-email-page.guard.test.ts
```

**Step 6: Run tests**
```bash
npm run test:unit && npm run test:integration
```
Expected: all pass (fewer tests than before — that's correct).

**Step 7: Commit**
```bash
git add -A
git commit -m "remove dead admin pages: calendar, test-email, drivers, setup"
```

---

### Task 2: Delete auth pages (register + forgot-password)

**Files:**
- Delete: `src/app/(public)/auth/register/page.tsx`
- Delete: `src/app/(public)/auth/register/RegisterPageClient.tsx`
- Delete: `src/app/(public)/auth/forgot-password/page.tsx`
- Delete: `src/app/(public)/auth/forgot-password/ForgotPasswordClient.tsx`

**Step 1: Delete the files**
```bash
rm src/app/\(public\)/auth/register/page.tsx
rm src/app/\(public\)/auth/register/RegisterPageClient.tsx
rm src/app/\(public\)/auth/forgot-password/page.tsx
rm src/app/\(public\)/auth/forgot-password/ForgotPasswordClient.tsx
rmdir src/app/\(public\)/auth/register 2>/dev/null || true
rmdir src/app/\(public\)/auth/forgot-password 2>/dev/null || true
```

**Step 2: Check for broken imports or links**
```bash
grep -r "register\|forgot-password" src --include="*.ts" --include="*.tsx" | grep -v "node_modules\|//\|#"
```
Remove any nav links pointing to these pages.

**Step 3: Run tests**
```bash
npm run test:unit && npm run test:integration
```
Expected: all pass.

**Step 4: Commit**
```bash
git add -A
git commit -m "remove register and forgot-password pages (magic link auth only)"
```

---

### Task 3: Delete dead API routes — slot locking + WebSocket + drivers

**Files:**
- Delete: `src/app/api/booking/attempts/route.ts`
- Delete: `src/app/api/booking/lock-time-slot/route.ts`
- Delete: `src/app/api/booking/release-time-slot/route.ts`
- Delete: `src/app/api/ws/bookings/[id]/route.ts`
- Delete: `src/app/api/drivers/start-tracking/route.ts`
- Delete: `src/app/api/drivers/availability/route.ts`

**Step 1: Delete the files**
```bash
rm src/app/api/booking/attempts/route.ts
rm src/app/api/booking/lock-time-slot/route.ts
rm src/app/api/booking/release-time-slot/route.ts
rm src/app/api/ws/bookings/\[id\]/route.ts
rm src/app/api/drivers/start-tracking/route.ts
rm src/app/api/drivers/availability/route.ts
```

**Step 2: Remove empty directories**
```bash
rmdir src/app/api/booking/attempts 2>/dev/null || true
rmdir src/app/api/booking/lock-time-slot 2>/dev/null || true
rmdir src/app/api/booking/release-time-slot 2>/dev/null || true
rmdir src/app/api/ws/bookings/\[id\] 2>/dev/null || true
rmdir src/app/api/ws/bookings 2>/dev/null || true
rmdir src/app/api/ws 2>/dev/null || true
rmdir src/app/api/drivers/start-tracking 2>/dev/null || true
rmdir src/app/api/drivers/availability 2>/dev/null || true
rmdir src/app/api/drivers 2>/dev/null || true
```

**Step 3: Update deprecated-endpoints test to remove slot locking tests**

Open `tests/unit/deprecated-endpoints.test.ts`. Remove any test blocks referencing `lock-time-slot`, `release-time-slot`, or `booking/attempts`. Keep anything else.

**Step 4: Run tests**
```bash
npm run test:unit && npm run test:integration
```
Expected: all pass.

**Step 5: Commit**
```bash
git add -A
git commit -m "remove slot locking, websocket, and driver API routes"
```

---

### Task 4: Delete dead API routes — payment + email dev tools

**Files:**
- Delete: `src/app/api/payment/create-checkout-session/route.ts`
- Delete: `src/app/api/payment/complete-payment/route.ts`
- Delete: `src/app/api/payment/digital-wallet/route.ts`
- Delete: `src/app/api/payment/process-in-app/route.ts`
- Delete: `src/app/api/email/test/route.ts`
- Delete: `src/app/api/email/enhanced-test/route.ts`
- Delete: `src/app/api/email/test-confirmation/route.ts`
- Delete: `src/app/api/email/test-booking-verification/route.ts`

**Step 1: Delete payment routes**
```bash
rm src/app/api/payment/create-checkout-session/route.ts
rm src/app/api/payment/complete-payment/route.ts
rm src/app/api/payment/digital-wallet/route.ts
rm src/app/api/payment/process-in-app/route.ts
```

**Step 2: Delete email dev tool routes**
```bash
rm src/app/api/email/test/route.ts
rm src/app/api/email/enhanced-test/route.ts
rm src/app/api/email/test-confirmation/route.ts
rm src/app/api/email/test-booking-verification/route.ts
```

**Step 3: Remove empty directories**
```bash
rmdir src/app/api/payment/create-checkout-session 2>/dev/null || true
rmdir src/app/api/payment/complete-payment 2>/dev/null || true
rmdir src/app/api/payment/digital-wallet 2>/dev/null || true
rmdir src/app/api/payment/process-in-app 2>/dev/null || true
rmdir src/app/api/email/test 2>/dev/null || true
rmdir src/app/api/email/enhanced-test 2>/dev/null || true
rmdir src/app/api/email/test-confirmation 2>/dev/null || true
rmdir src/app/api/email/test-booking-verification 2>/dev/null || true
rmdir src/app/api/email 2>/dev/null || true
```

**Step 4: Delete email guard tests (cover deleted routes)**
```bash
rm tests/unit/email-route-guards.test.ts
```

**Step 5: Update mocks/handlers.ts — remove handlers for deleted routes**

Open `tests/mocks/handlers.ts`. Remove any handlers matching deleted paths: `email/test`, `email/enhanced-test`, `email/test-confirmation`, `email/test-booking-verification`, `payment/create-checkout-session`, `payment/complete-payment`, `payment/digital-wallet`, `payment/process-in-app`.

**Step 6: Run tests**
```bash
npm run test:unit && npm run test:integration
```
Expected: all pass.

**Step 7: Commit**
```bash
git add -A
git commit -m "remove dead payment routes and email dev tool routes"
```

---

### Task 5: Delete customer payment management pages

**Files:**
- Delete: `src/app/(customer)/payments/add-method/` (if exists)
- Delete: `src/app/(customer)/payments/pay-balance/` (if exists)

**Step 1: Check what exists**
```bash
find src/app/\(customer\)/payments -type f | sort
```

**Step 2: Delete sub-pages only (keep the payments list page)**
```bash
rm -rf src/app/\(customer\)/payments/add-method
rm -rf src/app/\(customer\)/payments/pay-balance
```

**Step 3: Check for nav links to these pages**
```bash
grep -r "add-method\|pay-balance" src --include="*.ts" --include="*.tsx"
```
Remove any found.

**Step 4: Run tests**
```bash
npm run test:unit && npm run test:integration
```
Expected: all pass.

**Step 5: Commit**
```bash
git add -A
git commit -m "remove customer payment sub-pages (deposits not yet built)"
```

---

### Task 6: Delete dev-only functions from email-service.ts

**Files:**
- Modify: `src/lib/services/email-service.ts`

**Step 1: Remove `sendTestEmail` and `sendEnhancedTestEmail` functions**

Open `src/lib/services/email-service.ts`. Delete:
- `sendTestEmail` function (around line 247)
- `sendEnhancedTestEmail` function (around line 574)

Keep `sendBookingVerificationEmail` — check if it's used:
```bash
grep -r "sendBookingVerificationEmail" src --include="*.ts" --include="*.tsx"
```
If used, keep. If not, delete it too.

**Step 2: Check for imports of deleted functions**
```bash
grep -r "sendTestEmail\|sendEnhancedTestEmail" src --include="*.ts" --include="*.tsx"
```
Fix any imports found.

**Step 3: Run tests**
```bash
npm run test:unit && npm run test:integration
```
Expected: all pass.

**Step 4: Commit**
```bash
git add -A
git commit -m "remove dev-only email functions (sendTestEmail, sendEnhancedTestEmail)"
```

---

## Phase 2: Refactor God Objects

> All behavior must be identical before and after. No feature changes in this phase.

---

### Task 7: Split booking-service.ts — extract types

**Files:**
- Create: `src/lib/services/booking-types.ts`
- Modify: `src/lib/services/booking-service.ts`

**Step 1: Write the test (it already passes — we're verifying imports work)**
```bash
npm run test:unit
```
Note the count. It must be the same after refactor.

**Step 2: Create `booking-types.ts`**

Move the `Booking`, `Driver`, `BookingCreateData`, and all other interfaces/types from `booking-service.ts` (lines 36–155 approximately) into `src/lib/services/booking-types.ts`:

```typescript
// src/lib/services/booking-types.ts
export interface Booking {
  // ... move exact definition from booking-service.ts
}

export interface Driver {
  // ... move exact definition from booking-service.ts
}

export interface BookingCreateData {
  // ... move exact definition from booking-service.ts
}

// ... all other types
```

**Step 3: Update booking-service.ts to import from booking-types**

At the top of `booking-service.ts`, replace the inline type definitions with:
```typescript
export type { Booking, Driver, BookingCreateData } from './booking-types';
import type { Booking, Driver, BookingCreateData } from './booking-types';
```

**Step 4: Check all imports still resolve**
```bash
grep -r "from '@/lib/services/booking-service'" src --include="*.ts" --include="*.tsx" | head -20
```
All existing imports of `Booking`, `Driver` etc from `booking-service` still work via re-export.

**Step 5: Run tests**
```bash
npm run test:unit && npm run test:integration
```
Expected: same count, all pass.

**Step 6: Commit**
```bash
git add -A
git commit -m "extract booking types into booking-types.ts"
```

---

### Task 8: Split booking-service.ts — extract availability

**Files:**
- Create: `src/lib/services/booking-availability.ts`
- Modify: `src/lib/services/booking-service.ts`

**Step 1: Write a focused test for the availability module**

In `tests/unit/booking-availability.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/utils/firebase-admin', () => ({
  getAdminDb: vi.fn(() => ({
    collection: vi.fn(() => ({
      where: vi.fn().mockReturnThis(),
      get: vi.fn().mockResolvedValue({ docs: [] }),
    })),
  })),
}));

describe('isTimeSlotAvailable', () => {
  it('returns true when no bookings exist in the window', async () => {
    const { isTimeSlotAvailable } = await import('@/lib/services/booking-availability');
    const result = await isTimeSlotAvailable(new Date('2026-06-01T10:00:00'), 60);
    expect(result).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails (module doesn't exist yet)**
```bash
npx vitest run tests/unit/booking-availability.test.ts
```
Expected: FAIL — cannot find module.

**Step 3: Create `booking-availability.ts`**

Move `isTimeSlotAvailable` and `getAvailableDrivers` from `booking-service.ts` into `src/lib/services/booking-availability.ts`. Keep re-exports in `booking-service.ts`.

**Step 4: Run test to verify it passes**
```bash
npx vitest run tests/unit/booking-availability.test.ts
```
Expected: PASS.

**Step 5: Run full suite**
```bash
npm run test:unit && npm run test:integration
```
Expected: all pass.

**Step 6: Commit**
```bash
git add -A
git commit -m "extract booking availability into booking-availability.ts"
```

---

### Task 9: Split booking-service.ts — extract cancellation

**Files:**
- Create: `src/lib/services/booking-cancellation.ts`
- Modify: `src/lib/services/booking-service.ts`

**Step 1: Write a focused test**

In `tests/unit/booking-cancellation.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';

describe('calculateRefundAmount', () => {
  it('gives 100% refund more than 24h before pickup', () => {
    // import and test calculateRefundAmount from booking-cancellation
  });

  it('gives 50% refund between 3-24h before pickup', () => {
    // ...
  });

  it('gives 0% refund less than 3h before pickup', () => {
    // ...
  });
});
```

**Step 2: Run test to verify it fails**
```bash
npx vitest run tests/unit/booking-cancellation.test.ts
```
Expected: FAIL.

**Step 3: Create `booking-cancellation.ts`**

Move `cancelBooking`, `CancelBookingOptions`, and the refund calculation logic from `booking-service.ts` into `src/lib/services/booking-cancellation.ts`. Re-export from `booking-service.ts`.

**Step 4: Run test to verify it passes**
```bash
npx vitest run tests/unit/booking-cancellation.test.ts
```
Expected: PASS.

**Step 5: Remove duplicate `createBooking` from booking-service.ts**

`createBookingAtomic` (line 192) is the correct implementation. `createBooking` (line 362) is the old non-atomic version. Delete `createBooking`. Update any callers:
```bash
grep -r "createBooking\b" src --include="*.ts" --include="*.tsx" | grep -v "createBookingAtomic"
```
Update each caller to use `createBookingAtomic`.

**Step 6: Run full suite**
```bash
npm run test:unit && npm run test:integration
```
Expected: all pass.

**Step 7: Commit**
```bash
git add -A
git commit -m "extract booking cancellation, remove duplicate createBooking"
```

---

### Task 10: Split email-service.ts — extract templates

**Files:**
- Create: `src/lib/email-templates/confirmation.ts`
- Create: `src/lib/email-templates/driver-notification.ts`
- Create: `src/lib/email-templates/magic-link.ts`
- Modify: `src/lib/services/email-service.ts`

**Step 1: Create the templates directory**
```bash
mkdir -p src/lib/email-templates
```

**Step 2: For each email type, extract the HTML template into its own file**

Pattern for each template file:
```typescript
// src/lib/email-templates/confirmation.ts
import type { Booking } from '@/lib/services/booking-types';

export function buildConfirmationEmailHtml(booking: Booking): string {
  return `... html ...`;
}

export function buildConfirmationEmailText(booking: Booking): string {
  return `... plain text ...`;
}
```

Extract from `email-service.ts`:
- `sendConfirmationEmail` HTML → `src/lib/email-templates/confirmation.ts`
- `sendDriverNotificationEmail` HTML → `src/lib/email-templates/driver-notification.ts`
- `sendMagicLinkEmail` HTML → `src/lib/email-templates/magic-link.ts`

**Step 3: Update email-service.ts to import templates**

Each `send*` function becomes thin — just calls the template builder and sends:
```typescript
import { buildConfirmationEmailHtml, buildConfirmationEmailText } from '@/lib/email-templates/confirmation';

export async function sendConfirmationEmail(booking: Booking) {
  const html = buildConfirmationEmailHtml(booking);
  const text = buildConfirmationEmailText(booking);
  // ... send via nodemailer/sendgrid
}
```

**Step 4: Run tests**
```bash
npm run test:unit && npm run test:integration
```
Expected: all pass.

**Step 5: Verify email-service.ts is under 300 lines**
```bash
wc -l src/lib/services/email-service.ts
```
Expected: < 300.

**Step 6: Commit**
```bash
git add -A
git commit -m "extract email templates into dedicated template files"
```

---

### Task 11: Split admin bookings page

**Files:**
- Create: `src/app/(admin)/admin/bookings/useBookings.ts`
- Create: `src/app/(admin)/admin/bookings/BookingsTable.tsx`
- Create: `src/app/(admin)/admin/bookings/BookingFilters.tsx`
- Modify: `src/app/(admin)/admin/bookings/page.tsx`

**Step 1: Extract `useBookings` hook**

Create `src/app/(admin)/admin/bookings/useBookings.ts` with all state, data fetching, and action handlers:
```typescript
'use client';
import { useState, useCallback, useEffect } from 'react';
import type { Booking } from '@/lib/services/booking-types';

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => { /* ... */ }, []);
  const handleStatusUpdate = async (booking: Booking, status: Booking['status']) => { /* ... */ };
  const handleCancelBooking = async (booking: Booking) => { /* ... */ };
  const handleResendConfirmation = async (booking: Booking) => { /* ... */ };

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  return { bookings, loading, error, handleStatusUpdate, handleCancelBooking, handleResendConfirmation };
}
```

**Step 2: Extract `BookingFilters` component**

Create `src/app/(admin)/admin/bookings/BookingFilters.tsx` — renders filter controls (status, airport, date range, search). Accepts filter state and onChange callbacks as props.

**Step 3: Extract `BookingsTable` component**

Create `src/app/(admin)/admin/bookings/BookingsTable.tsx` — renders the table. Accepts `bookings: Booking[]` and action callbacks as props. Pure display.

**Step 4: Slim down page.tsx**

`page.tsx` should now be < 50 lines:
```typescript
'use client';
import { useBookings } from './useBookings';
import { BookingFilters } from './BookingFilters';
import { BookingsTable } from './BookingsTable';

export default function AdminBookingsPage() {
  const { bookings, loading, error, ...actions } = useBookings();
  return (
    <Container>
      <BookingFilters ... />
      <BookingsTable bookings={bookings} {...actions} />
    </Container>
  );
}
```

**Step 5: Verify line counts**
```bash
wc -l src/app/\(admin\)/admin/bookings/page.tsx \
       src/app/\(admin\)/admin/bookings/useBookings.ts \
       src/app/\(admin\)/admin/bookings/BookingsTable.tsx \
       src/app/\(admin\)/admin/bookings/BookingFilters.tsx
```
Expected: no single file over 300 lines.

**Step 6: Run tests and build**
```bash
npm run test:unit && npm run test:integration && npm run build
```
Expected: all pass, build succeeds.

**Step 7: Commit**
```bash
git add -A
git commit -m "split admin bookings page into hook + table + filters"
```

---

## Phase 3: Auth Simplification

---

### Task 12: Verify magic link + OTP flows work end-to-end

**Step 1: Check magic link route exists and is wired**
```bash
cat src/app/api/auth/request-link/route.ts
cat src/app/api/auth/verify-link/route.ts
cat src/app/\(public\)/auth/magic/page.tsx
```
Confirm: request-link accepts email, sends link, verify-link validates token.

**Step 2: Check OTP route exists and is wired**
```bash
cat src/app/api/auth/request-otp/route.ts
cat src/app/api/auth/verify-otp/route.ts
```
Confirm: request-otp accepts phone, sends SMS OTP, verify-otp validates code.

**Step 3: Write integration test for magic link flow**

In `tests/integration/auth-magic-link.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest';

describe('magic link auth', () => {
  it('request-link returns 200 and sends email', async () => {
    // POST /api/auth/request-link with { email }
    // expect 200 and that sendMagicLinkEmail was called
  });

  it('verify-link with valid token returns booking access', async () => {
    // POST /api/auth/verify-link with valid token
    // expect 200 and booking data
  });

  it('verify-link with expired token returns 401', async () => {
    // POST /api/auth/verify-link with expired token
    // expect 401
  });
});
```

**Step 4: Run tests**
```bash
npx vitest run tests/integration/auth-magic-link.test.ts
```
Fix any failures found.

**Step 5: Verify no links to register/forgot-password remain in the UI**
```bash
grep -r "register\|forgot-password" src --include="*.tsx" | grep -v "node_modules\|//"
```

**Step 6: Commit**
```bash
git add -A
git commit -m "verify magic link auth flows and remove all links to deleted auth pages"
```

---

## Phase 4: Double-Booking Hardening

---

### Task 13: Replace slot locking with atomic Firestore transaction

**Files:**
- Modify: `src/app/api/booking/submit/route.ts`
- Modify: `src/lib/services/booking-availability.ts`

**Step 1: Write the test first**

In `tests/unit/double-booking-prevention.test.ts`:
```typescript
import { describe, it, expect, vi } from 'vitest';

describe('double booking prevention', () => {
  it('rejects a booking that conflicts with an existing booking', async () => {
    // Mock Firestore to return an existing booking at the same time
    // Attempt to create a new booking at the same time
    // Expect the submission to fail with a conflict error
  });

  it('accepts a booking with 61-minute gap after existing booking', async () => {
    // Mock an existing booking at 10:00
    // Create new booking at 11:01
    // Expect success
  });

  it('rejects a booking with only 59-minute gap', async () => {
    // Mock an existing booking at 10:00
    // Attempt booking at 10:59
    // Expect conflict error
  });
});
```

**Step 2: Run to verify tests fail**
```bash
npx vitest run tests/unit/double-booking-prevention.test.ts
```
Expected: FAIL.

**Step 3: Implement atomic check in `booking-availability.ts`**

Update `isTimeSlotAvailable` to run inside a Firestore transaction that reads existing bookings and checks for 60-minute buffer conflicts atomically:
```typescript
export async function checkAndReserveTimeSlot(
  db: FirebaseFirestore.Firestore,
  pickupDate: Date,
  bufferMinutes = 60
): Promise<{ available: boolean; conflictingBookingId?: string }> {
  // Inside Firestore transaction:
  // 1. Query bookings within [pickupDate - bufferMinutes, pickupDate + bufferMinutes]
  // 2. If any exist → return { available: false, conflictingBookingId }
  // 3. If none → return { available: true }
  // Note: the write happens in booking submit AFTER this check, within the same transaction
}
```

**Step 4: Update `booking/submit/route.ts`**

Replace any calls to `lock-time-slot` with a call to `checkAndReserveTimeSlot` wrapped in the same Firestore transaction as the booking write.

**Step 5: Run tests**
```bash
npx vitest run tests/unit/double-booking-prevention.test.ts
npm run test:unit && npm run test:integration
```
Expected: all pass.

**Step 6: Commit**
```bash
git add -A
git commit -m "replace slot locking with atomic Firestore transaction for double-booking prevention"
```

---

## Phase 5: Live Tracking Audit

---

### Task 14: Real-device tracking test

This is a manual audit task. Not code changes.

**Step 1: Start production-like dev server with real env**
```bash
npm run dev
```

**Step 2: Create a real booking via the booking form**

Note the `bookingId`.

**Step 3: Open the tracking page**
```
http://localhost:3000/tracking/<bookingId>
```

**Step 4: On a real mobile device (not emulator), test GPS tracking**

The driver app (or test device) should call `POST /api/drivers/start-tracking` — but wait, we just deleted this route. If tracking depends on it, tracking is already broken.

Check `src/lib/services/tracking-service.ts`:
```bash
cat src/lib/services/tracking-service.ts
```

Check `src/lib/services/driver-location-service.ts`:
```bash
cat src/lib/services/driver-location-service.ts
```

**Step 5: Decision**

- If tracking works with a real GPS device → keep it, write a test, commit
- If tracking is broken or depends on deleted routes → proceed to Task 15

---

### Task 15: Replace tracking with SMS ETA updates (if Task 14 shows tracking is broken)

**Files:**
- Delete: `src/lib/services/driver-location-service.ts`
- Delete: `src/lib/services/tracking-service.ts`
- Modify: `src/app/(public)/tracking/[bookingId]/TrackingPageClient.tsx`
- Delete: `src/app/api/tracking/[bookingId]/route.ts` (real-time portion)
- Keep: `src/app/api/tracking/eta/route.ts` (repurpose for status polling)

**Replacement behavior:**
- Tracking page shows booking status (confirmed / en route / arrived / completed)
- Gregg updates status via admin bookings page
- Customer gets SMS when Gregg marks "en route" (triggered by status update)
- No real-time GPS needed

```bash
git add -A
git commit -m "replace real-time tracking with status-based updates and SMS notifications"
```

---

## Phase 6: Test Suite Cleanup

---

### Task 16: Audit and delete stale tests

**Step 1: Run full suite and note any tests that pass for deleted code**
```bash
npm run test:unit 2>&1 | grep -E "PASS|FAIL|skip"
npm run test:integration 2>&1 | grep -E "PASS|FAIL|skip"
```

**Step 2: Check for tests covering deleted features**
```bash
grep -rl "lock-time-slot\|release-time-slot\|create-checkout-session\|digital-wallet\|process-in-app\|complete-payment\|start-tracking\|drivers/availability" tests --include="*.ts"
```
Delete or update each file found.

**Step 3: Check for duplicate coverage**

Look for two tests that test identical behavior:
```bash
grep -r "describe\|it(" tests/unit --include="*.ts" | sort | uniq -d
```
For any true duplicates, keep the more descriptive one and delete the other.

**Step 4: Run tests**
```bash
npm run test:unit && npm run test:integration
```
Expected: all pass.

**Step 5: Commit**
```bash
git add -A
git commit -m "remove stale tests for deleted features and duplicate coverage"
```

---

### Task 17: Add missing journey tests

**Files:**
- Create: `tests/integration/flows/customer-journey.test.ts`
- Create: `tests/integration/flows/admin-journey.test.ts`

**Step 1: Write customer journey integration test**

`tests/integration/flows/customer-journey.test.ts`:
```typescript
describe('Customer journey', () => {
  it('guest books a ride without account', async () => { /* POST /api/booking/submit */ });
  it('receives magic link via confirmation', async () => { /* verify email sent */ });
  it('magic link authenticates and shows only their booking', async () => { /* GET /api/booking/:id with token */ });
  it('cannot access another customer booking with their token', async () => { /* 403 */ });
  it('can submit a tip after ride completion', async () => { /* POST tip endpoint */ });
  it('can submit feedback after ride completion', async () => { /* POST /api/reviews/submit */ });
});
```

**Step 2: Write admin journey integration test**

`tests/integration/flows/admin-journey.test.ts`:
```typescript
describe('Admin journey', () => {
  it('Gregg can list all bookings', async () => { /* GET /api/booking with admin auth */ });
  it('Gregg can update booking status', async () => { /* PATCH /api/booking/:id */ });
  it('Gregg can cancel a booking with correct refund', async () => { /* POST /api/booking/cancel-booking */ });
  it('Gregg can view all SMS messages', async () => { /* GET /api/admin/sms-messages */ });
  it('Gregg can send a campaign SMS', async () => { /* POST /api/admin/sms-campaign */ });
});
```

**Step 3: Run tests**
```bash
npm run test:unit && npm run test:integration
```
Fix any failures.

**Step 4: Commit**
```bash
git add -A
git commit -m "add customer and admin journey integration tests"
```

---

## Phase 7: Admin Panel Solidification

---

### Task 18: Audit all six admin pages for completeness

For each page, answer: does it render real data? Are the actions wired?

```bash
# Check each admin page for placeholder content or TODOs
grep -n "TODO\|FIXME\|placeholder\|coming soon\|not implemented" \
  src/app/\(admin\)/admin/page.tsx \
  src/app/\(admin\)/admin/bookings/page.tsx \
  src/app/\(admin\)/admin/schedules/page.tsx \
  src/app/\(admin\)/admin/messages/page.tsx \
  src/app/\(admin\)/admin/costs/page.tsx \
  src/app/\(admin\)/admin/settings/page.tsx
```

For each TODO found, fix it or create a follow-up task.

**Specific checks:**
- **Dashboard**: shows today's bookings from `/api/booking` filtered to today
- **Schedule**: renders bookings on a calendar from `/api/calendar/events`
- **Messages**: reads from `/api/admin/sms-messages`
- **Costs**: reads from `/api/admin/costs`
- **Settings**: reads from `/api/admin/settings/profile` and `/api/admin/settings/notifications`

**Step 2: Fix any pages that show hardcoded/placeholder data**

Follow pattern: page calls its API route → API route calls its service → service reads from Firestore.

**Step 3: Run E2E tests against dev server**
```bash
npm run dev &
sleep 8
NEXT_PUBLIC_USE_EMULATORS=true npm run test:e2e:local
```
Expected: all pass.

**Step 4: Final build check**
```bash
npm run build
```
Expected: builds with no errors.

**Step 5: Final commit**
```bash
git add -A
git commit -m "solidify all six admin pages with real data connections"
```

---

## Final Verification

```bash
# Full test suite
npm run test:unit && npm run test:integration

# Build
npm run build

# Line count check (no file over 300 lines in src/lib/services)
find src/lib/services -name "*.ts" -exec wc -l {} \; | sort -rn | head -10

# API surface check (should match design doc)
find src/app/api -name "route.ts" | sed 's|src/app/api||' | sed 's|/route.ts||' | sort

# Push
git push origin main
```

---

## Rollback Notes

Each phase is fully committed before starting the next. If any phase causes a regression:
```bash
git log --oneline -20   # find the last good commit
git revert HEAD         # revert last commit cleanly
```
Never use `git reset --hard` — always revert.
