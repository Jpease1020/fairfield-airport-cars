# Fairfield Airport Car Service – Core Flows Documentation

This document describes the essential user and admin flows for the Fairfield Airport Car Service platform.

---

## 1. Customer Booking Flow

1. **Customer visits the homepage** (`/`):
   - Sees business info, features, and a prominent "Book Now" CTA.
2. **Navigates to the booking form** (`/book`):
   - Enters pickup/dropoff locations (Google Maps autocomplete).
   - Selects date/time, number of passengers, and contact info.
   - Optionally adds flight number and notes.
3. **Fare Estimate:**
   - Fare is calculated in real-time using Google Maps Distance Matrix and business pricing settings.
4. **Payment:**
   - Customer pays a deposit (via Square payment link).
   - Payment is processed securely; confirmation is shown on the success page.
5. **Confirmation:**
   - Customer receives SMS and email confirmation with booking details.
   - Booking is stored in Firestore and visible to admin.

---

## 2. Automated Notifications

- **Booking Confirmation:**
  - Sent via SMS (Twilio) and email (SMTP) immediately after booking.
- **24-Hour Reminder:**
  - Sent via SMS the day before the ride (triggered by scheduled job or webhook).
- **On My Way Notification:**
  - Sent via SMS when driver is en route (optional, can be triggered by admin).
- **Feedback Request:**
  - Sent via SMS after ride completion, with a link to the feedback form.

---

## 3. Payment Flow (Square)

1. **Deposit Payment:**
   - Customer pays deposit via Square checkout link.
   - Payment status is tracked in Firestore.
2. **Webhook Processing:**
   - Square sends payment events to `/api/square-webhook`.
   - App verifies webhook signature and updates booking/payment status accordingly.
3. **Refunds:**
   - If booking is cancelled, refund is processed via Square and status updated.

---

## 4. Admin Management Flow

1. **Admin Login:**
   - Admin logs in via Firebase Authentication (Google/email).
   - Only authorized emails (e.g., justin@, gregg@) have admin privileges.
2. **Dashboard:**
   - View all bookings, filter by status, see customer details.
   - Update booking status (pending, confirmed, completed, cancelled).
   - Send custom messages to customers.
3. **Content Management (CMS):**
   - Edit all customer-facing content via the CMS (business info, pricing, page content, communication templates).
   - Changes are reflected instantly on the site.
4. **Calendar View:**
   - View all upcoming rides in a calendar format.

---

## 5. Webhook Processing Flow

1. **Square Webhook:**
   - Receives payment/refund events at `/api/square-webhook`.
   - Verifies authenticity using `SQUARE_WEBHOOK_SIGNATURE_KEY`.
   - Updates booking/payment status in Firestore.
2. **Twilio Webhook (if used):**
   - Can receive delivery status or inbound SMS (optional, not core to booking flow).

---

## 6. Feedback Flow

1. **After ride completion:**
   - Customer receives SMS with feedback link.
2. **Feedback Form:**
   - Customer rates the service and leaves comments.
   - Feedback is stored in Firestore and visible to admin.

---

## 7. Error Handling & Edge Cases

- **Failed Payment:**
  - Customer is notified and can retry.
- **Booking Conflict:**
  - If requested time conflicts with another booking, customer is prompted to choose a different time.
- **Admin Alerts:**
  - Admin is notified of failed payments, cancellations, or other critical events via dashboard or email (optional).

---

## 8. Optional: AI Assistant Flow

- **Admin can access AI assistant in dashboard.**
- **Ask business, technical, or customer questions.**
- **AI provides context-aware answers and suggestions.**

---

**For more details on each flow, see the README, ARCHITECTURE.md, and BUSINESS_GUIDE.md.** 