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

- Fee-based policy: 24h+ no fee; <24h 25%; <12h 50%; <6h 75%. Copy on Help, Terms, Home FAQ, Cancel page, and API messages. Single FAQ entry for cancellation.

## Save my info & SMS opt-in

- ContactInfoPhase: “Save my information for future bookings” and “Send me occasional deals and promotions via text message” (with TCPA disclaimer). Values in `CustomerInfo` (`saveInfoForFuture`, `smsOptIn`) and passed through PaymentPhase and SquarePaymentForm into booking payload and submit/process-payment.

## SMS storage (Twilio webhook)

- **Inbound:** Twilio POST → `/api/twilio/incoming-sms` → validate signature → `saveSmsMessage(..., direction: 'inbound')` → forward to Gregg → 200.
- **Outbound:** Every `sendSms()` call logs to `smsMessages` with `direction: 'outbound'`.
- **Collection:** `smsMessages` (from, to, body, direction, twilioMessageSid, createdAt).

## Admin alert notifications (booking problems and app issues)

- **Service:** `src/lib/services/notification-service.ts`. When a user has a problem during submit, payment, or cancel, or when the app hits a critical error, the service notifies Gregg.
- **Wired in:** Catch blocks of `POST /api/booking/submit`, `POST /api/payment/process-payment`, `POST /api/booking/cancel-booking` call `sendBookingProblem(stage, error, context)`.
- **Channels:** Enable at least one via env so alerts reach Gregg: set `NOTIFICATION_ALERT_PHONE` or `GREGG_SMS_FORWARD_NUMBER` for SMS; or `NOTIFICATION_ALERT_EMAIL_ENABLED=true` for email (recipients: rides@fairfieldairportcar.com). In production, `init()` applies this config.

## Auth & admin

- Firebase Auth; admin determined by Firestore `users/{uid}.role === 'admin'`. Admin layout and withAuth protect `/admin/*`.

## Other

- **Design system:** `src/design/` – tokens, layout, base components. See LAYOUT_SYSTEM_GUIDE.md and DESIGN_SYSTEM_PROTECTION.md.
- **Booking flow:** Trip details → Contact info → Payment; quote API, submit API, process-payment; booking stored in Firestore `bookings`.

---

## THIRD-PARTY SERVICES (Reference)

| Service | Purpose | Monthly Cost | Config Location |
|---------|---------|--------------|-----------------|
| **Square** | Payment processing | 2.6% + $0.10/txn (~$20-50) | `.env` SQUARE_* |
| **Twilio** | SMS notifications | ~$0.0075/SMS (~$5-20) | `.env` TWILIO_* |
| **SendGrid** | Email (SMTP) | Free-$10 | `.env` EMAIL_* |
| **Google Maps** | Address autocomplete | ~$5-50 | `.env` GOOGLE_MAPS_* |
| **Google Calendar** | Driver availability | Free | `.env` GOOGLE_* |
| **Firebase Firestore** | Database | Free-$50 | `.env` FIREBASE_* |
| **Firebase Auth** | User authentication | Free | `.env` FIREBASE_* |
| **Vercel** | Hosting | $0-20 | `vercel.json` |

---

## COST BREAKDOWN (Estimated)

| Service | Low | High | Notes |
|---------|-----|------|-------|
| Square | $20 | $50 | 2.6% + $0.10 per txn |
| Twilio | $5 | $20 | ~$0.0075/SMS |
| SendGrid | $0 | $10 | Free tier covers most |
| Google Maps | $5 | $50 | Pay per request |
| Firebase | $0 | $50 | Free tier usually enough |
| Vercel | $0 | $20 | Free tier or Pro |
| **Total** | **$30** | **$200** | |
