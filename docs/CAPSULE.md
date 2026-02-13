# Fairfield Airport Cars - Project Capsule

**When to use this file:**
- New team member's first session
- Returning after days/weeks away
- Working on a different machine
- `/compact` isn't enough context

**For quick restarts:** Just use `/compact` instead - no paste needed.

---

## North Star

Single-driver airport car service for Gregg in Fairfield County, CT. Customers book rides to/from 6 airports (JFK, LGA, EWR, BDL, HVN, HPN). Simple, reliable, no-frills booking experience.

## Current Priorities

1. **Reliability** - Booking flow must work 100% of the time
2. **Admin efficiency** - Gregg manages everything himself
3. **Code cleanup** - Remove unused features, reduce complexity

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 (App Router), React, styled-components |
| Backend | Next.js API routes |
| Database | Firebase/Firestore |
| Payments | Square SDK v43 |
| Notifications | Twilio (SMS), custom email |
| Maps | Google Maps/Places API |

## Key Business Rules

- One location must be airport, one must be home address
- Service area: Fairfield County (25mi normal, 40mi extended requires call)
- Refund policy: 100% (>24h), 50% (3-24h), 0% (<3h)
- 60-minute buffer between bookings (single driver)

## Testing Commands

```bash
npm run test:unit          # Business logic
npm run test:integration   # API routes
npm run test:e2e:critical  # Autocomplete, booking (needs dev server)
npm run build              # Type check + build
```

## Environments

| Env | URL | Purpose |
|-----|-----|---------|
| Local | localhost:3000 | Development |
| Production | fairfieldairportcars.com | Live site |

## Known Landmines

1. **Google Places API** - Cannot mix `types: ['address', 'airport']`
2. **Square refunds** - Use `squarePaymentId`, not `squareOrderId`
3. **Firebase timestamps** - Convert to ISO strings in API responses
4. **Booking validation** - Both `address` AND `coordinates` required

## No-Go Zones

- Don't add multi-driver features (single driver business)
- Don't add complex pricing tiers (flat rate + distance works)
- Don't add real-time tracking (overkill for this scale)

## File Structure (Key Areas)

```
src/
├── app/api/booking/        # Booking CRUD, quotes, cancellation
├── app/api/payment/        # Square payment processing
├── components/booking/     # Booking form components
├── design/components/      # Design system
├── lib/services/           # Business logic
│   ├── booking-service.ts
│   ├── square-service.ts
│   └── twilio-service.ts
└── providers/BookingProvider.tsx
```
