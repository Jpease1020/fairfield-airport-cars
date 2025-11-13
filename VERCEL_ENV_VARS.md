# Required Vercel Environment Variables

## 🔴 CRITICAL - Firebase Admin SDK (Required for Booking)

These are **REQUIRED** for booking functionality to work:

```
FIREBASE_PROJECT_ID=fairfield-airport-car-service
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\n... (full key with \n for newlines) ...\n-----END PRIVATE KEY-----
FIREBASE_CLIENT_EMAIL=demo@demo-project.iam.gserviceaccount.com
```

**Important Notes:**
- `FIREBASE_PRIVATE_KEY` must include the full key with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Newlines must be `\n` (not actual line breaks)
- Copy the entire private key from Firebase Console → Project Settings → Service Accounts

## 🟡 IMPORTANT - Payment Processing

**Server-side (for API routes):**
```
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_APPLICATION_ID=your_square_app_id
SQUARE_LOCATION_ID=your_square_location_id
```

**Client-side (for payment forms - REQUIRED for payments to work):**
```
NEXT_PUBLIC_SQUARE_APP_ID=your_square_app_id (same as SQUARE_APPLICATION_ID)
NEXT_PUBLIC_SQUARE_LOCATION_ID=your_square_location_id (same as SQUARE_LOCATION_ID)
```

**Note:** The `NEXT_PUBLIC_` prefix makes these accessible in the browser. Use the same values as the server-side variables.

## 🟡 IMPORTANT - Notifications

```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## 🟢 OPTIONAL - Email Service

```
SENDGRID_API_KEY=your_sendgrid_api_key
```

## 🟢 OPTIONAL - Google Calendar Integration

```
GOOGLE_CALENDAR_TOKENS={"access_token":"...","refresh_token":"...","expiry_date":...}
ENABLE_GOOGLE_CALENDAR=true
```

## 🟢 OPTIONAL - Google Maps

```
GOOGLE_MAPS_SERVER_API_KEY=your_google_maps_server_api_key
NEXT_PUBLIC_GOOGLE_MAPS_CLIENT_API_KEY=your_google_maps_client_api_key
```

## 🔵 Public Variables (Already Set)

These should already be set:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fairfield-airport-car-service
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

## ✅ Quick Checklist

**Minimum Required for Booking:**
- [ ] `FIREBASE_PROJECT_ID`
- [ ] `FIREBASE_PRIVATE_KEY` (full key with newlines)
- [ ] `FIREBASE_CLIENT_EMAIL`

**For Full Functionality:**
- [ ] `SQUARE_ACCESS_TOKEN` (for payments)
- [ ] `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` (for SMS)
- [ ] `SENDGRID_API_KEY` (for emails)

## 🧪 Testing Production

After setting env vars, test with:
```bash
BASE_URL=https://fairfield-airport-cars.vercel.app npx playwright test tests/e2e/production-booking-health.spec.ts --config=config/playwright.config.ts --project=chromium
```

Or use curl:
```bash
curl https://fairfield-airport-cars.vercel.app/api/health/booking-flow
```

