# Phase 4 — Service consolidation (Batch C)

Callers and merge plan. **No deletions in this doc** — approve before removing.

---

## Notification-related services

| Service | Callers | Notes |
|--------|---------|------|
| **admin-notification-service** | `booking/submit`, `cancel-booking`, `booking/[bookingId]` | `sendAdminSms` — **keep**. |
| **driver-notification-service** | `booking/submit` | `notifyDriverOfNewBooking` — **keep**. |
| **booking-notification-service** | *None* | Already removed (confirmed gone as of 2026-07-16). |
| **notification-service** | `cancel-booking/route.ts`, `process-payment/route.ts`, `booking-orchestrator.ts` (all import `sendBookingProblem` directly) | **UPDATE 2026-07-16: this row's original claim was wrong.** Re-audited and found live, direct imports — this is load-bearing error-alerting code. **Do not remove.** |

**Merge plan (superseded):** `booking-notification-service` is gone. `notification-service` stays — it's actively used, not a removal candidate.

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

| Action | Service | Status |
|--------|---------|--------|
| Removed | booking-notification-service | Done. |
| Keep as-is | notification-service | Live — used by 3 call sites (see above). |
| Keep as-is | admin-notification-service, driver-notification-service | — |
| Keep as-is | driver-service, driver-location-service, firebase-tracking-service, real-time-tracking-service | — |
