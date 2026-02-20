# Phase 4 — Service consolidation (Batch C)

Callers and merge plan. **No deletions in this doc** — approve before removing.

---

## Notification-related services

| Service | Callers | Notes |
|--------|---------|------|
| **admin-notification-service** | `booking/submit`, `cancel-booking`, `booking/[bookingId]` | `sendAdminSms` — **keep**. |
| **driver-notification-service** | `booking/submit` | `notifyDriverOfNewBooking` — **keep**. |
| **booking-notification-service** | *None* | All methods are no-ops (push removed). Exported but never imported. **Candidate to remove** (or keep as stub for API compatibility). |
| **notification-service** | Only re-exported from `lib/services/index.ts` | Generic admin alerts (email/SMS/webhook/Slack). No direct imports found. **Candidate to remove or guard** if you don’t use it. |

**Merge plan:** Keep **admin-notification-service** and **driver-notification-service**. Remove or slim **booking-notification-service** (no callers). Audit **notification-service**; remove from index or delete file if unused.

---

## Driver / tracking services

| Service | Callers | Notes |
|--------|---------|------|
| **driver-service** | `booking-service`, `api/tracking/[bookingId]` | `getDriver` — **keep**. |
| **driver-location-service** | `DriverLocationTracker`, `api/drivers/start-tracking` | **keep** (custom map tracker). |
| **firebase-tracking-service** | `TrackingPageClient`, `TrafficETA` | **keep** (current tracking page). |
| **real-time-tracking-service** | `api/tracking/eta/route`, `LiveTrackingMap` | **keep** (ETA API + custom map components). |

**Merge plan:** No merge for now. All four are used; driver/tracking is split by concern (driver CRUD, location updates, Firebase tracking, real-time ETA). Optional later: document which is “source of truth” for driver location if you consolidate tracking (e.g. polling-only).

---

## Summary

| Action | Service | When |
|--------|---------|------|
| **Remove or slim** | booking-notification-service | After approval (no callers, no-ops). |
| **Audit / remove** | notification-service | After confirming no use of generic admin alerts. |
| **Keep as-is** | admin-notification-service, driver-notification-service | — |
| **Keep as-is** | driver-service, driver-location-service, firebase-tracking-service, real-time-tracking-service | — |

Say **"Approve remove booking-notification-service"** to delete that file and drop its export from `lib/services/index.ts` (if it’s there). Say **"Audit notification-service"** to trace any usage and then propose delete or keep.
