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

## 🟡 IMPORTANT - Email Service (SendGrid)

**For SendGrid SMTP (Recommended):**
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key_here
```

**How to get your SendGrid API key:**
1. Go to [SendGrid Dashboard](https://app.sendgrid.com/settings/api_keys)
2. Click "Create API Key"
3. Name it "Production Email Service"
4. Give it "Full Access" or "Mail Send" permissions
5. Copy the API key (you'll only see it once!)
6. Paste it as `EMAIL_PASS` in Vercel

**Note:** `EMAIL_USER` must be exactly `apikey` (lowercase, no quotes) for SendGrid SMTP to work.

**Alternative - Gmail SMTP:**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your_app_password_here
```
(Requires Gmail App Password - see Google Account Security settings)

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

## 🟡 IMPORTANT - VIP Exception Bookings

**Server-side only (NEVER use NEXT_PUBLIC_ prefix):**
```
BOOKING_EXCEPTION_SECRET=your_secret_code_here
```

**Purpose:** Allows creating exception bookings that bypass service area restrictions. These bookings require manual approval.

**Security Notes:**
- This is a **server-side only** variable - never expose it in the client
- Use a strong, random secret (e.g., generate with: `openssl rand -hex 32`)
- Only admins can use this via the admin exception booking form
- Store this securely in Vercel environment variables

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

