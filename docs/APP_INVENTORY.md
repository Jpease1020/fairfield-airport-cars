# App Inventory

High-level overview of major features and where they live.

## Notifications

- **Push notifications:** Removed. No Firebase Cloud Messaging; no push tokens or broadcast.
- **SMS:** All outbound SMS sent via `src/lib/services/twilio-service.ts` (Twilio). Inbound SMS received at `POST /api/twilio/incoming-sms` (Twilio webhook): validated, stored in Firestore `smsMessages`, then forwarded to Gregg (env: `GREGG_SMS_FORWARD_NUMBER` or `ADMIN_FORWARD_SMS_TO`). Outbound messages are logged to `smsMessages` in the same collection. Admin list: `/admin/messages`.
- **Email:** Confirmation and driver notifications via `src/lib/services/email-service.ts`.

## Business rules (no redeploy)

- **Config:** Firestore document `config/businessRules` (Zod-validated). Fields: `serviceArea` (normal/extended radius miles), `bookingBufferMinutes`, `cancellationFeeTiers` (0/25/50/75% by 24h/12h/6h), `deposit` (required, mode, value), `features` (trackingEnabled, reviewsEnabled), `updatedAt`, `updatedBy`, `version`.
- **Usage:** Server-only helper `getBusinessRules()` in `src/lib/business/business-rules.ts` reads the doc, validates, and returns defaults when missing/invalid. In-memory cache TTL 2 minutes; call `invalidateBusinessRulesCache()` after admin updates.
- **Admin UI:** `/admin/settings` – edit all business rules, save to Firestore, “Restore defaults.” Nav: Settings.
- **Wired to:** Cancel-booking (fee tiers), check-time-slot and calendar availability (buffer), booking-service createBooking (deposit from rules).
- **Security:** Firestore rules restrict `config/*` to users with `users/{uid}.role == 'admin'`.

## Cancellation

- Fee-based policy: 24h+ no fee; &lt;24h 25%; &lt;12h 50%; &lt;6h 75%. Copy on Help, Terms, Home FAQ, Cancel page, and API messages. Single FAQ entry for cancellation.

## Save my info & SMS opt-in

- ContactInfoPhase: “Save my information for future bookings” and “Send me occasional deals and promotions via text message” (with TCPA disclaimer). Values in `CustomerInfo` (`saveInfoForFuture`, `smsOptIn`) and passed through PaymentPhase and SquarePaymentForm into booking payload and submit/process-payment.

## SMS storage (Twilio webhook)

- **Inbound:** Twilio POST → `/api/twilio/incoming-sms` → validate signature → `saveSmsMessage(..., direction: 'inbound')` → forward to Gregg → 200.
- **Outbound:** Every `sendSms()` call logs to `smsMessages` with `direction: 'outbound'`.
- **Collection:** `smsMessages` (from, to, body, direction, twilioMessageSid, createdAt).

## Auth & admin

- Firebase Auth; admin determined by Firestore `users/{uid}.role === 'admin'`. Admin layout and withAuth protect `/admin/*`.

## Other

- **Design system:** `src/design/` – tokens, layout, base components. See LAYOUT_SYSTEM_GUIDE.md and DESIGN_SYSTEM_PROTECTION.md.
- **Booking flow:** Trip details → Contact info → Payment; quote API, submit API, process-payment; booking stored in Firestore `bookings`.
