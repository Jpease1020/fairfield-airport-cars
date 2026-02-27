## Fairfield Airport Cars – Admin Operations Plan

This document defines how Gregg should operate the business day to day using the admin UI. It is intentionally focused on a few high‑value, typed pages rather than a generic CMS.

---

## Admin Navigation Overview

- **Bookings**: View and manage all bookings.
- **Settings**: Configure business rules, pricing, service area, notifications, and feature flags.
- **Costs**: Track monthly operating costs by provider and compute cost per booking.
- **Messages**: Inspect SMS/email activity and resend key notifications.
- **Payments**: Review payments, refunds, deposits, and reconciliation notes.
- **Health**: See system status and environment/config checks.
- **Copy** (later): Edit key marketing/UX copy via simple typed forms (no generic CMS).

Each page should:
- Use **typed Firestore docs** (via services + Zod).
- Have **clear, constrained forms** (no inline WYSIWYG).
- Support **audit‑friendly** logging where changes affect pricing, refunds, or notifications.

---

## 1. Bookings Page

### Purpose

Give Gregg a control center for all rides: past, present, and upcoming. This is the primary operational dashboard.

### Core Views

- **Bookings list**
  - Columns: `bookingId`, `createdAt`, `pickupDateTime`, `pickup`, `dropoff`, `airport`, `status`, `paymentStatus`, `confirmationStatus`, `exception`, `trackingStatus`.
  - Filters:
    - Date range (`pickupDateTime` / `createdAt`)
    - Status (pending, confirmed, cancelled, completed, no‑show)
    - Airport (JFK, LGA, EWR, BDL, HVN, HPN)
    - Customer (name, email, phone)
    - Payment status (unpaid / deposit / paid in full / refund pending)
  - Sort default: upcoming pickups first.

- **Booking detail**
  - Trip details: pickup/dropoff addresses, times, airport, passengers, luggage, notes.
  - Customer: name, phone, email, preferences.
  - Pricing: fare breakdown, deposit, balance due, discounts, fees.
  - Status: booking + payment + confirmation + tracking.
  - History: created/updated timestamps, important actions (status changes, refunds, notifications).

### Actions

- **Confirm booking**
  - Set status `confirmed`, trigger confirmation SMS/email if not already sent.
  - Optionally resend confirmation if details changed.

- **Cancel booking**
  - Show computed refund and fee based on business rules.
  - On confirm:
    - Call existing cancel API.
    - Display outcome: refund amount, fee amount, notifications sent.

- **Refund / adjust**
  - Show all payments tied to the booking.
  - Provide safe controls for:
    - Partial refunds.
    - Full refunds.
    - Manual adjustment notes (e.g. “waived late fee”).

- **Resend notifications**
  - Resend:
    - Booking confirmation.
    - Payment receipt.
    - Feedback request.
  - Log each resend in notification history.

- **Tracking token / link**
  - View current tracking state:
    - Token present/absent.
    - Last tracking update time.
  - Regenerate link (if needed) and send to customer.

### Firestore Usage (read‑only + derived)

Uses existing `bookings/*` documents. Do **not** mutate pricing logic directly from the UI; always go through services.

Key fields (not exhaustive, for UI mapping):
- `trip.pickupDateTime`, `trip.pickup.address`, `trip.dropoff.address`.
- `airportCode` (derived from pickup/dropoff if needed).
- `status` (enum).
- `payment.depositAmount`, `payment.squarePaymentId`, `payment.squareOrderId`, `payment.balanceDue`.
- `confirmation.status`, `confirmation.sentAt`, `confirmation.confirmedAt`, `confirmation.token` (for redaction rules).
- `trackingToken`, last tracking update timestamps (from tracking collection if applicable).

### MVP vs Later

- **MVP**
  - Read‑only list + detail.
  - Cancel booking via existing API with computed refund.
  - Resend confirmation.
  - Show payment and confirmation status.

- **Later**
  - Inline tracking tools (start/stop tracking, override ETA).
  - Bulk actions (e.g. confirm multiple bookings).
  - Export to CSV.

### Test & Security Checklist

- **Access control**
  - Only authenticated admin users can access `/admin/bookings`.
  - Detail and actions enforce `requireAdmin`/`requireOwnerOrAdmin` on all APIs.

- **Correctness**
  - Unit tests for:
    - Refund calculation and cancellation flows (already present; keep them passing).
  - Integration tests for:
    - Cancelling bookings from admin and confirming refund outputs.
    - Resending confirmations.

- **Safety**
  - Confirm dialogs for destructive actions (cancel, refund).
  - Logging of who performed which action (when auth roles expand beyond single owner).

---

## 2. Settings Page (Business Rules + Pricing + Service Area + Notifications)

### Purpose

This is Gregg’s **control panel**. Everything that changes how the system behaves or charges money should live here, not buried in CMS content.

### Sections (Tabs or Cards)

- **Business profile**
  - `businessName`
  - `primaryPhone`
  - `primaryEmail`
  - `websiteUrl`

- **Pricing**
  - Base fare.
  - Per‑mile rate.
  - Per‑minute rate.
  - Airport return multiplier.
  - Optional surcharges (early morning, late night, holiday).

- **Deposits & cancellations**
  - Deposit percentage or fixed amount rules.
  - Cancellation fee tiers:
    - `over24hFeePercent`
    - `under24hFeePercent`
    - `under12hFeePercent`
    - `under6hFeePercent`
  - Booking buffer minutes (minimum time before pickup for new bookings).

- **Service area**
  - Core service radius (miles).
  - Extended service radius (miles).
  - Zip/postal code include/exclude lists (later).
  - Edge‑case flags (e.g. NYC pickup exclusion).

- **Notifications**
  - Admin alert phone(s) and email(s) for:
    - Booking failures.
    - Payment failures.
    - Calendar/driver scheduling issues.
  - Toggles:
    - Send SMS confirmations.
    - Send email confirmations.
    - Send tracking links.
    - Send feedback requests.

- **Feature flags**
  - Enable real‑time tracking.
  - Enable reviews.
  - Enable magic‑link login.

### Firestore Schema (Config Docs)

Recommended config documents (typed + zod validated):

- `config/businessRules`  
  - `pricing: { baseFare, perMile, perMinute, airportReturnMultiplier }`
  - `deposits: { type: 'percent' | 'fixed', depositPercent?, depositAmount? }`
  - `cancellationFeeTiers: { over24hFeePercent, under24hFeePercent, under12hFeePercent, under6hFeePercent }`
  - `bookingBufferMinutes: number`
  - `featureFlags: { trackingEnabled, reviewsEnabled, magicLinkEnabled }`

- `config/serviceArea`  
  - `coreRadiusMiles: number`
  - `extendedRadiusMiles: number`
  - `extendedRequiresCall: boolean`
  - `excludedZones?: string[]` (e.g. neighborhoods/zip codes)

- `config/businessProfile`  
  - `businessName: string`
  - `primaryPhone: string`
  - `primaryEmail: string`
  - `websiteUrl?: string`

- `config/notifications`  
  - `adminPhones: string[]`
  - `adminEmails: string[]`
  - `channels: { sms: boolean; email: boolean; tracking: boolean; feedback: boolean }`

All writes should:
- Go through a **Settings service** (e.g. `business-rules-service`) with Zod schemas.
- Maintain backward compatibility when adding new fields (sensible defaults).

### MVP vs Later

- **MVP**
  - Editable forms for business rules, deposits, cancellation tiers, and admin contact info.
  - Save buttons with optimistic UI and clear success/error messages.

- **Later**
  - Audit history per setting (who changed what, when).
  - Preview of how changes affect a sample quote.

### Test & Security Checklist

- **Validation**
  - Zod schemas enforce ranges:
    - Percent fields 0–100.
    - Radius fields >0 but reasonable (e.g. ≤100).
  - Server rejects invalid writes; UI shows validation hints.

- **Access control**
  - Only admin.
  - All update routes behind `requireAdmin`.

- **Regression tests**
  - Integration tests that:
    - Read config and verify booking/cancellation logic uses these values.
    - Ensure missing config falls back to sensible defaults (but logs errors).

---

## 3. Costs Page

### Purpose

Give Gregg visibility into **where money goes** every month, with a low‑friction, manual‑first workflow that can be automated later.

### Data Model

Prefer a flat collection:

- Collection: `costEntries`
  - `id: string` (auto)
  - `month: string` (format: `YYYY-MM`)
  - `provider: 'twilio' | 'square' | 'firebase' | 'vercel' | 'google-cloud' | 'sendgrid' | 'other'`
  - `category: 'sms' | 'email' | 'hosting' | 'database' | 'maps' | 'processing-fee' | 'other'`
  - `amount: number` (USD)
  - `notes?: string`
  - `invoiceUrl?: string`
  - `createdAt: Timestamp`
  - `createdBy?: string` (future multi‑user)

### Views

- **Monthly summary**
  - Select month (`YYYY-MM`).
  - Show:
    - Total cost.
    - Cost per provider.
    - Cost per category.
    - **Cost per booking** (total cost / number of bookings that month).

- **Trend view**
  - Line/bar chart of total monthly costs over time.
  - Optional breakdown by provider.

- **Detail table**
  - Individual entries with provider, category, amount, notes, invoice link.
  - Simple add/edit/delete (soft delete or reversible at first).

### MVP vs Later

- **MVP**
  - Manual entry form.
  - Monthly summary and cost per booking (using bookings count for the month).

- **Later**
  - CSV import.
  - Import from Twilio, Square, Firebase exports.
  - Alerts when costs exceed a threshold (e.g. cost per booking too high).

### Test & Security Checklist

- **Validation**
  - `amount > 0`.
  - `month` matches `YYYY-MM`.
  - Provider and category enums enforced.

- **Integrity**
  - Deletion is soft (mark `deleted: true`) or requires confirmation.
  - Changes logged with timestamps.

- **Access control**
  - Admin‑only routes.

---

## 4. Messages Page

### Purpose

Provide visibility into SMS/email activity and failures, so Gregg can understand what was sent, what failed, and resend when appropriate.

### Data Sources

- **SMS**
  - Collection: `smsMessages`
    - `id`
    - `bookingId?`
    - `direction: 'inbound' | 'outbound'`
    - `to`, `from`
    - `body`
    - `status: 'queued' | 'sent' | 'delivered' | 'failed'`
    - `errorCode?`, `errorMessage?`
    - `createdAt`

- **Email**
  - Use existing email logs (or introduce `emailMessages` collection with similar shape).

### UI

- **Messages list**
  - Filter by:
    - Direction (inbound/outbound).
    - Channel (SMS/email).
    - Status (failed/sent).
    - Booking ID.
    - Date range.

- **Message detail**
  - Raw payload.
  - Any Twilio/SendGrid metadata (error codes, etc.).

- **Actions**
  - Resend for specific templates:
    - Booking confirmation.
    - Payment receipt.
    - Feedback request.
  - For inbound messages, show booking link (if matched) or mark “unmatched”.

### MVP vs Later

- **MVP**
  - Read‑only view with filters, basic resend actions.

- **Later**
  - Threaded conversation view per booking.
  - Simple tagging (e.g. “issue”, “question”).

### Test & Security Checklist

- Ensure resend actions:
  - Hit the correct API endpoints.
  - Do not duplicate billing‑sensitive flows (e.g. double charge).

- Validate that failed messages appear clearly with error reason where available.

---

## 5. Payments Page

### Purpose

Centralize visibility into Square payments, refunds, and deposits.

### Views

- **Payments list**
  - Columns: `bookingId`, `createdAt`, `type (charge/refund)`, `amount`, `status`, `method`, `squarePaymentId`, `squareOrderId?`.
  - Filters: date, type, status, booking, amount range.

- **Booking payment history**
  - For a given booking, show:
    - Initial charge (deposit or full).
    - Subsequent charges (balance payments).
    - Refunds (full or partial).

### Actions

- Safely initiate refunds via existing Square integration where appropriate.
- Record manual adjustments with notes (without hitting Square).

### MVP vs Later

- **MVP**
  - Read‑only view assembled from bookings + Square metadata.
  - Manual notes for reconciliation.

- **Later**
  - Direct Square refund operations from admin UI (with strong confirmation).
  - Reconciliation helpers (sum of payments vs expected revenue).

### Test & Security Checklist

- Ensure no admin operation triggers a second charge by accident.
- Verify refund flows mirror current route tests and business rules.

---

## 6. Health Page

### Purpose

Give Gregg (and you) a private, admin‑only page showing whether key services are configured and healthy.

### Contents

- **Service checks**
  - Twilio configured?
  - Square configured?
  - Firebase/Firestore connectivity?
  - Google Maps API keys present?
  - Booking form critical path check (mock call).

- **Recent errors**
  - Surface last N critical errors from logs (or integrate with an error service later).

### Constraints

- Must **not** be public; only admin.
- Should be informational first; avoid destructive actions.

---

## 7. Copy Page (Later)

### Purpose

If Gregg wants to tweak marketing/UX copy without code changes, expose a **very small** set of fields here rather than a generic CMS.

### Approach

- Define typed documents such as:
  - `config/copy.homepageHero`
  - `config/copy.bookingFormHelp`
  - `config/copy.faq`
- Simple textareas or rich‑text fields with length limits.
- No layout editing, no arbitrary HTML injection.

---

## Implementation Guidelines

- **One page per domain**
  - Keep each admin page focused and independent.

- **One service per domain**
  - `businessRulesService`, `costsService`, `notificationsService`, etc.
  - All Firestore reads/writes go through these services with Zod validation.

- **Strict validation**
  - All admin writes must be validated server‑side.
  - Frontend mirrors validation for better UX but server remains source of truth.

- **No generic CMS**
  - Prefer explicit, typed forms over flexible but fragile CMS components.

- **Testing priority**
  - Unit tests for services (business rules, cost calculations, notification routing).
  - Integration tests for critical flows wired through admin pages:
    - Booking cancellation and refunds.
    - Changing cancellation tiers and verifying downstream behavior.
    - Cost per booking calculations.

