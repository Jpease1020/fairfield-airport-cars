# Booking Time Consistency Checklist (Staging)

## Goal
Verify that pickup and flight times are clearly labeled and consistent across booking form, SMS, email, and Gregg-facing notifications.

## Canonical Time Terms
- `Pickup Time`: The scheduled ride pickup timestamp.
- `Flight Time (as provided)`: The flight time entered by the customer (not used as pickup time).
- `ETA`: Dynamic live-tracking estimate.

## CMS Keys To Set
Set these values in CMS so runtime labels match the new copy:

- `paymentPhase-datetime` -> `Pickup Time:`
- `booking-detail-datetime` -> `Pickup Time:`
- `dateTimeLabel` -> `Pickup Time:`
- `booking-pickup_datetime-label` -> `Pickup Time:`
- `tracking-pickupTime` -> `Pickup Time`
- `tripDetailsPhase-datetimeLabel` -> `Pickup Date & Time`

## One-Shot Static Gate
Run this first:

```bash
./scripts/verify-booking-time-consistency.sh
```

If this fails, fix source/CMS issues before staging verification.

## One-Shot Staging Verification
Use one test booking where pickup and flight times are intentionally different:

- Example pickup time: `4:10 PM ET`
- Example flight time: `8:05 PM` (as provided)

Then verify all channels below from that same booking ID.

### 1) Booking Form + Success/Manage/Detail Screens
- Booking form labels pickup field as pickup date/time (not flight).
- Payment summary shows `Pickup Time`.
- Success page summary shows `Pickup Time`.
- Manage booking page shows `Pickup Time`.
- Booking detail page shows `Pickup Time`.

### 2) Customer Verification Email
- Contains `Pickup Time`.
- Does not use generic `Date & Time`.
- No flight time is misrepresented as pickup time.

### 3) Customer Confirmation Email (after clicking confirmation link)
- Contains `Pickup Time`.
- Contains `Flight Time (as provided)` only when flight info exists.
- Pickup time equals the booking pickup timestamp.
- Flight time equals the submitted flight time value.

### 4) Customer Confirmation SMS
- Uses `Pickup time:` label.
- Includes route line.
- Pickup value matches booking pickup timestamp.

### 5) Gregg Admin SMS (new booking + cancellation)
- Uses `Pickup time:` label.
- Includes timezone suffix (EST/EDT).
- Pickup value matches booking pickup timestamp.

### 6) Driver Email + Push Notification
- Pickup shows `Pickup Time`.
- Flight section shows `Flight Time (as provided)`.
- No ambiguous `Arrival:` wording.

### 7) Cancellation SMS (if cancellation tested)
- Uses `Pickup time:` label.
- Pickup value matches original booking pickup timestamp.

## Hard Fail Conditions
- Any message uses flight time where pickup time should be shown.
- Any message uses ambiguous `Date & Time` in booking confirmations.
- Any channel shows pickup without clear `Pickup Time` labeling.
- Pickup time differs between channels for the same booking.

## Suggested Evidence Capture
For the single test booking, capture:
- Booking ID
- Form screenshot (pickup + flight fields)
- Verification email screenshot
- Confirmation email screenshot
- Customer SMS screenshot
- Gregg SMS screenshot
- Driver email screenshot
- Optional cancellation SMS screenshot

This evidence should be stored together with the booking ID for regression tracking.
