# Fairfield Airport Cars - Repo Map

## Architecture Summary (15 lines)

Next.js 16 App Router monolith. Public booking flow → API routes → Firebase/Firestore. Payments via Square SDK. Notifications via Twilio (SMS) and custom email service. Google Maps/Places for address autocomplete and distance calculation.

Route groups: `(public)` for marketing pages, `(customer)` for authenticated customer pages, `(admin)` for Gregg's management panel.

State management: React Context via BookingProvider for booking flow. No Redux.

Styling: styled-components with design tokens. Component library in `design/components/`.

Testing: Vitest (unit/integration), Playwright (E2E). Critical path tests for autocomplete and booking form.

## Folder Map

```
src/
├── app/                           # Next.js App Router
│   ├── (admin)/admin/             # Admin panel (4 pages)
│   │   ├── bookings/              # Booking management
│   │   ├── payments/              # Payment history
│   │   ├── schedules/             # Schedule management
│   │   └── page.tsx               # Dashboard
│   ├── (customer)/                # Customer-facing (authenticated)
│   │   ├── book/                  # Booking flow
│   │   ├── bookings/              # Booking history
│   │   └── manage/                # Manage booking
│   ├── (public)/                  # Marketing pages
│   │   ├── about/                 # About page
│   │   ├── contact/               # Contact form
│   │   └── auth/                  # Login/signup
│   └── api/                       # API routes
│       ├── booking/               # Booking CRUD
│       ├── payment/               # Square integration
│       └── health/                # Health checks
├── components/                    # React components
│   ├── app/                       # App-specific (AdminNavigation)
│   └── booking/                   # Booking form components
├── design/                        # Design system
│   ├── components/                # Base UI components
│   └── providers/                 # Context providers
├── lib/                           # Shared utilities
│   └── services/                  # Business logic services
└── providers/                     # React context
    └── BookingProvider.tsx        # Booking state management
```

## Hot Files (by risk/centrality)

| File | Risk | Why |
|------|------|-----|
| `src/providers/BookingProvider.tsx` | HIGH | Central booking state |
| `src/lib/services/booking-service.ts` | HIGH | Booking business logic |
| `src/lib/services/square-service.ts` | HIGH | Payment processing |
| `src/app/api/booking/route.ts` | HIGH | Booking API endpoint |
| `src/app/api/payment/route.ts` | HIGH | Payment API endpoint |
| `src/design/components/base-components/LocationInput.tsx` | HIGH | Address autocomplete |
| `src/lib/services/twilio-service.ts` | MEDIUM | SMS notifications |
| `src/lib/services/service-area-validation.ts` | MEDIUM | Service area rules |
| `src/components/app/AdminNavigation.tsx` | LOW | Admin nav structure |
| `src/app/(admin)/admin/bookings/page.tsx` | MEDIUM | Main admin page |

## Module Dependencies

```
[Customer UI] → [BookingProvider] → [API Routes] → [Services] → [Firebase/Square/Twilio]
     ↓                                    ↓
[LocationInput] ← ← ← ← ← ← ← [Google Maps API]
```

## Key Conventions

1. **API routes**: Use `NextRequest`/`NextResponse`, return JSON
2. **Services**: Pure functions, no React dependencies
3. **Components**: `data-testid` on interactive elements
4. **Styling**: styled-components, design tokens from `design/tokens`
5. **Testing**: Unit tests co-located, E2E in `tests/e2e/`
6. **Error handling**: Services throw, API routes catch and format

## Cleanup Completed

- Removed 15 unused hooks (-2,010 lines)
- Removed unused API routes (-1,130 lines)
- Removed Marketing/Tracking admin pages (-1,217 lines)
- Removed CMS/Help/Setup admin pages (-1,926 lines)
- **Total removed: ~6,283 lines**
- **Current: 363 files, 53,752 lines**
