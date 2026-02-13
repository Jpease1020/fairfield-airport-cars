# Fairfield Airport Cars - Claude Code Instructions

## Session Startup (Claude does this automatically)

**On first interaction of a session, Claude should:**
1. Run `whoami` to detect the current user
2. Look up their profile in "Developer Profiles" section below
3. Apply their tool routing preferences silently
4. If no profile found, ask about their tools

---

## Developer Profiles (Auto-Detection)

### @justinpease
- **Tools:** Claude, Gemini CLI, Cursor, ChatGPT
- **IDE:** VS Code / Cursor
- **Skills:** Available

### @template (copy for new devs)
- **Tools:** [Claude, Gemini CLI?, Cursor?, Copilot?, ChatGPT?]
- **IDE:** [VS Code / Cursor / etc.]
- **Skills:** [Available / Not available]

---

## Token Efficiency & Tool Routing

| Task Type | Best Tool | Why |
|-----------|-----------|-----|
| Repo-wide search/scan | Gemini CLI | Cheaper for large scans |
| Batch refactors | Gemini CLI + Cursor | Gemini plans, Cursor applies |
| Architecture decisions | Claude | Best at tradeoff reasoning |
| Single file edits | Cursor | Fast, in-context |
| Marketing copy/docs | ChatGPT | Good at narrative |

**Claude will redirect you** when a task is better suited for another tool.

---

## Session Length Management

**Warning signs (Claude monitors):**
- 15-20+ exchanges in one thread
- Context getting repetitive
- Switching between unrelated topics

**When to restart:**
- After completing a feature
- Before starting unrelated work
- When Claude suggests it

**Quick restart:** Use `/compact` command

---

## Project Overview
Airport car service website for Gregg's single-driver operation in Fairfield County, CT.
Customers book rides to/from airports (JFK, LGA, EWR, BDL, HVN, HPN).

## Tech Stack
- **Frontend**: Next.js 16 (App Router), React, styled-components
- **Backend**: Next.js API routes, Firebase/Firestore
- **Payments**: Square SDK v43
- **Notifications**: Twilio (SMS), custom email service
- **Maps**: Google Maps/Places API

## Key Business Rules
- One location must be an airport, one must be a home address
- Service area: Fairfield County, CT (25mi normal, 40mi extended requires call)
- Refund policy: 100% (>24h), 50% (3-24h), 0% (<3h before pickup)
- 60-minute buffer between bookings (single driver)

---

## Pre-Flight Checklist

### Before Pushing Changes That Touch:

**Google Maps/Places API calls:**
- [ ] Verify the API request parameters are valid (Google rejects invalid type combinations)
- [ ] Test that autocomplete dropdown actually appears
- [ ] Confirm coordinates are populated after address selection
- [ ] Run: `npm run test:e2e:critical` (requires dev server running)

**Payment flows (Square):**
- [ ] Test in Square sandbox before production
- [ ] Verify refund calculations match the policy (100%/50%/0%)
- [ ] Check webhook URL matches the actual route path

**Booking form:**
- [ ] Can a user complete a booking end-to-end?
- [ ] Does validation show clear error messages?
- [ ] Are both pickup AND coordinates set (not just text)?

**SMS/Email notifications:**
- [ ] Twilio messaging service SID is configured (not hardcoded)
- [ ] Email domain matches production (fairfieldairportcars.com)
- [ ] Test that messages actually send in dev

**Environment variables:**
- [ ] No hardcoded API keys, secrets, or test values
- [ ] All required env vars documented in health check endpoint
- [ ] Fallbacks don't silently fail (throw errors instead)

---

## Testing Strategy

| Test Type | Command | What It Catches |
|-----------|---------|-----------------|
| Unit | `npm run test:unit` | Business logic, calculations |
| Integration | `npm run test:integration` | API routes with mocked services |
| E2E Critical | `npm run test:e2e:critical` | Autocomplete, booking form (needs dev server) |
| Full E2E | `npm run test:e2e` | All browser flows |

**Pre-push hook runs:** Unit → Integration → Build → E2E (if dev server running)

---

## Common Gotchas

1. **Google Places API**: Cannot mix `types: ['address', 'airport']` - causes INVALID_REQUEST
2. **Square refunds**: Use `squarePaymentId`, not `squareOrderId`
3. **Next.js API routes**: Use `NextRequest` not `Request` for routes that need it
4. **Firebase timestamps**: Convert to ISO strings before returning in JSON responses
5. **Booking validation**: Both `address` AND `coordinates` must be set for form to proceed

---

## File Structure (Key Areas)

```
src/
├── app/api/                    # API routes
│   ├── booking/               # Booking CRUD, quotes, cancellation
│   ├── payment/               # Square payment processing
│   └── health/                # Health check endpoints
├── components/booking/         # Booking form components
├── design/components/          # Design system (LocationInput, etc.)
├── lib/services/              # Business logic services
│   ├── booking-service.ts
│   ├── square-service.ts
│   ├── twilio-service.ts
│   └── service-area-validation.ts
└── providers/                  # React context providers
    └── BookingProvider.tsx

tests/
├── unit/                       # Vitest unit tests
├── integration/               # Vitest integration tests
│   └── flows/                 # Critical user flow tests
└── e2e/                       # Playwright E2E tests
    └── location-input-autocomplete.spec.ts  # CRITICAL
```

---

## When In Doubt

Ask yourself:
1. "What API calls does this change make? Can they fail?"
2. "Can a customer still book a ride after this change?"
3. "Did I run the E2E tests with the dev server running?"

If touching critical paths (booking, payment, notifications), always run:
```bash
npm run dev &
npm run test:e2e:critical
```
