# CMS Cutover Runbook (Firestore -> Static)

## Objective

Switch copy/content reads from Firestore CMS documents to a deterministic, checked-in static snapshot with zero fallback ambiguity.

## Current Behavior

- `CMS_SOURCE` controls read source:
  - `static` (default): uses `src/content/static-cms.generated.json`
  - `firestore`: explicit opt-in source
- In production, Firestore source is ignored unless `CMS_ALLOW_FIRESTORE_IN_PROD=true`.
- Inline CMS editing UI is disabled by default unless `NEXT_PUBLIC_ENABLE_INLINE_CMS=true`.

## Safety Rules

1. Do not cut over without parity check pass.
2. Do not cut over without staging smoke pass.
3. Keep rollback ready with an explicit Firestore opt-in env pair.

## Pre-Cutover Steps

1. Freeze CMS edits (announce content freeze window).
2. Export fresh production snapshot:
   - `npm run cms:export-snapshot`
3. Refresh static snapshot (copy `data/cms-data-backup.json` to `src/content/static-cms.generated.json`).
4. Verify parity:
   - `npm run cms:verify-parity`
5. Run type-check + targeted tests.

## Staging Cutover

1. Set `CMS_SOURCE=static` in staging.
2. Run full smoke:
   - Public pages: home/about/help/contact/privacy/terms/offline/not-found
   - Booking flow: quote -> validate -> submit -> process-payment
   - Cancellation/refund flow
   - Admin key pages: dashboard/bookings/payments/drivers/health
3. Validate notifications copy (SMS/email confirmation text).

## Production Cutover

1. Set `CMS_SOURCE=static` in production.
2. Verify health endpoint and critical journey checks immediately.
3. Monitor logs and support channels for 48-72 hours.

## Rollback

If any regression is detected:

1. Set:
   - `CMS_SOURCE=firestore`
   - `CMS_ALLOW_FIRESTORE_IN_PROD=true`
2. Redeploy/restart as needed.
3. Re-run health + booking smoke checks.

## Post-Stabilization Cleanup (Next Phase)

1. Remove inline CMS editor and interaction mode plumbing entirely.
2. Remove CMS write/update paths and dead admin CMS links/routes.
3. Reduce `cms-service` to read-only static adapter or replace with plain content module.
