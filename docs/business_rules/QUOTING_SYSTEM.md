# Quoting System - Business Rules and Implementation

## Purpose
- Provide fast, trustworthy fare quotes using live Google Distance Matrix + CMS pricing.
- Prevent tampering by validating quotes server-side.
- Keep UX simple: show price, countdown, refresh when needed.

## Goals
- Single source of truth for pricing (server).
- Quotes valid for a short window (default 15 minutes).
- Support both Quick Book (home) and Full Booking page.
- Work for anonymous and logged-in users without persisting quotes beyond the session.

## High-level Flow
1) User enters pickup, dropoff, date/time, fareType → request quote
2) Backend computes fare, creates a quote with expiresAt, returns `{ quoteId, fare, expiresAt }`
3) Frontend stores only `quoteId` (sessionStorage), displays price + countdown
4) On confirm, frontend submits booking with `quoteId`
5) Backend validates quote (exists, not expired, route unchanged, price tolerance) → creates booking

## Storage Strategy
- Frontend: sessionStorage only (ephemeral per tab). Store only `quoteId`.
- Backend: Firestore `quotes` collection (short-lived docs):
  - For anonymous users: tag with `sessionId` (random ID sent by client)
  - For logged-in users: tag with `userId`
- No long-term persistence; expired quotes are cleaned automatically.

## Data Model (Quote)
```json
{
  "id": "q_abc123",
  "sessionId": "anon_xyz",
  "userId": "uid_123",
  "pickupAddress": "...",
  "dropoffAddress": "...",
  "pickupCoords": { "lat": 0, "lng": 0 },
  "dropoffCoords": { "lat": 0, "lng": 0 },
  "estimatedMiles": 42.3,
  "estimatedMinutes": 58,
  "price": 128,
  "fareType": "personal|business",
  "expiresAt": "2025-10-06T14:31:00Z",
  "createdAt": "...",
  "updatedAt": "..."
}
```

## Pricing Inputs and Logic (Server)
- Inputs: origin, destination, optional coords, fareType, pickupTime
- Live data: Google Distance Matrix (distance, duration, duration_in_traffic)
- CMS pricing: `baseFare`, `perMile`, `perMinute` (via `getSettings()`)
- Formula: `ceil(baseFare + miles*perMile + trafficMinutes*perMinute)`
- Modifier: `personal` applies 10% discount
- No fallbacks: if Maps fails → 503 (UI shows retry)

## APIs
### POST `/api/booking/quote`
- Request body:
```json
{
  "origin": "string",
  "destination": "string",
  "pickupCoords": {"lat": 0, "lng": 0} | null,
  "dropoffCoords": {"lat": 0, "lng": 0} | null,
  "fareType": "personal" | "business",
  "pickupTime": "ISO string" | null,
  "sessionId": "string"
}
```
- Response (200):
```json
{
  "quoteId": "q_abc123",
  "fare": 128,
  "distanceMiles": 42.3,
  "durationMinutes": 58,
  "fareType": "personal",
  "expiresAt": "2025-10-06T14:31:00Z",
  "expiresInMinutes": 15
}
```
- Errors: 400 invalid input; 503 Maps unavailable

### POST `/api/booking/submit`
- Request body:
```json
{
  "quoteId": "q_abc123",
  "fare": 128,
  "customer": { "name": "...", "email": "...", "phone": "...", "notes": "..." },
  "trip": {
    "pickup": {"address": "...", "coordinates": {"lat": 0, "lng": 0}},
    "dropoff": {"address": "...", "coordinates": {"lat": 0, "lng": 0}},
    "pickupDateTime": "Date",
    "fareType": "personal" | "business"
  }
}
```
- Server validation:
  - If `quoteId` provided:
    - Load quote; 404 if not found
    - Check `expiresAt > now`; 410 if expired
    - Recompute/rehash route inputs; if mismatch → 409 (changed itinerary)
    - Compare `fare` vs `quote.price` with ≤5% tolerance; else 409 (price changed)
  - If no `quoteId`, server may recompute and proceed (configurable)
- Response (200): `{ "success": true, "bookingId": "...", "totalFare": 128 }`
- Errors: 404 QUOTE_NOT_FOUND; 410 QUOTE_EXPIRED; 409 FARE_MISMATCH; 400/500

## Frontend Behavior
- Trigger quoting when fields complete or on explicit click.
- Show spinner while quoting.
- After success: show price + countdown; store only `quoteId` in sessionStorage.
- Invalidate quote on any trip edit; show "Refresh price".
- Confirm disabled without a valid (non-expired) `quoteId`.

## Countdown & Invalidation
- Default validity: 15m; warn < 1m; expire at 0.
- On 409/410 at submit: show modal with updated price and "Accept new price" CTA.

## Security & Anti-Tamper
- Client stores only opaque `quoteId` (never fare).
- Server is source of truth; all validations happen server-side.
- Optional binding via `sessionId` for anonymous visitors.

## UX Copy
- Price: "Your price: $128. Valid for 14:32."
- Changed: "Trip details changed—refresh price."
- Expired: "This quote expired. Please refresh price."
- API fail: "We couldn’t fetch a live price. Please try again soon."

## Testing Checklist
- Quote creation happy path; Maps error handling.
- Edit invalidation; refresh re-quote.
- Submit with valid/expired/mismatched quotes.
- Anonymous vs logged-in flows.
- Accessibility announcements and focus management.

## Analytics & Observability
- Log quote creation, expiry, 409/410 occurrences.
- Track abandoned quotes (counts only).

## Service Area Rules

### Geographic Constraints
- **Service Area**: Fairfield County, CT and surrounding areas
  - **Normal radius**: 25 miles from service centers (standard self-service bookings)
  - **Extended radius**: 40 miles from service centers (soft-block area, requires call/text)
  - **Service centers**: Newtown, Stamford, Fairfield, Westport (CT)

### Airport Requirements
- **Every trip must include at least one airport endpoint** (pickup or dropoff must be a recognized airport)
- **Supported airports**:
  - Major NYC: JFK, LGA, EWR
  - CT regional: BDL (Hartford), HVN (New Haven)
  - Nearby NY: HPN (Westchester County Airport)
  - Other: BDR (Sikorsky), ISP (Long Island MacArthur)

### Trip Classification
1. **Normal**: At least one end in normal service area AND at least one end is an airport
2. **Missing Airport**: Both ends in service area but neither is an airport → `MISSING_AIRPORT_ENDPOINT`
3. **Soft Block**: At least one end in extended area or is an airport, but outside normal area → `OUT_OF_SERVICE_SOFT`
4. **Hard Block**: Neither end in extended area and neither is an airport → `OUT_OF_SERVICE_HARD`

### Error Codes
- `MISSING_AIRPORT_ENDPOINT`: "We currently only offer trips between Fairfield County, CT and airports. Please make sure either your pickup or dropoff is an airport (e.g. JFK, LGA, EWR, BDL, HVN, HPN)."
- `OUT_OF_SERVICE_SOFT`: "This trip is slightly outside our normal self-service area. Please call or text us to see if we can accommodate it."
- `OUT_OF_SERVICE_HARD`: "We focus on Fairfield County, CT and nearby airports, and we're not able to serve this route."

### VIP Exception Bookings
- VIP customers can request out-of-policy trips via call/text
- Exception bookings are created with `status: 'requires_approval'` and require manual approval from Gregg
- Exception code (stored in `BOOKING_EXCEPTION_SECRET` env var) bypasses service area validation
- All exception bookings are logged for audit purposes

## Configuration
- `expiresInMinutes`: default 15.
- Tolerance: default 5%.
- Service area centers and radii: defined in `src/lib/services/service-area-validation.ts`
- Exception secret: `BOOKING_EXCEPTION_SECRET` environment variable

## Notes
- No quotes persist beyond session on the client; Firestore handles expiry.
- Service area validation happens BEFORE Google Maps API call to save costs on invalid requests.
- This document is the business contract for quoting.
