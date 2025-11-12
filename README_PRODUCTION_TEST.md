# Production Booking Health Check

## Quick Test

Run this test against your production environment to verify booking functionality:

```bash
BASE_URL=https://your-production-domain.com npm run test:e2e -- tests/e2e/production-booking-health.spec.ts
```

Or set `BASE_URL` in your environment:

```bash
export BASE_URL=https://fairfield-airport-cars.vercel.app
npm run test:e2e -- tests/e2e/production-booking-health.spec.ts
```

## What It Tests

1. ✅ Basic health check endpoint (`/api/health`)
2. ✅ Booking flow health check (`/api/health/booking-flow`)
3. ✅ Quote API functionality
4. ✅ Booking submit endpoint accessibility
5. ✅ Firebase Admin initialization

## Expected Results

All tests should pass. If any fail, check:
- Firebase Admin environment variables in Vercel
- Database connectivity
- API endpoint responses

## Troubleshooting

If you see "Firebase Admin not initialized":
1. Check Vercel environment variables:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY` (must include `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)
   - `FIREBASE_CLIENT_EMAIL`
2. Ensure private key has proper newlines (`\n` characters)
3. Check Vercel deployment logs for initialization errors
