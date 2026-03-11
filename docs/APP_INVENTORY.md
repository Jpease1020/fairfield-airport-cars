# Fairfield Airport Cars - Application Inventory

> **Last Updated:** 2025-02-13
> **Purpose:** Living documentation of all features, services, and costs. Update this when adding/removing features.

---

## QUICK REFERENCE

| Metric | Value |
|--------|-------|
| **Codebase** | ~54,000 lines / 363 files |
| **Monthly Cost** | $50-150 (scales with volume) |
| **Tech Stack** | Next.js 16 + React 19 + Firebase + Vercel |
| **Business** | Single-driver airport car service, Fairfield County CT |
| **Airports Served** | JFK, LGA, EWR, BDL, HVN, HPN |

---

## THIRD-PARTY SERVICES

### Active Services

| Service | Purpose | Monthly Cost | Config Location |
|---------|---------|--------------|-----------------|
| **Square** | Payment processing | 2.6% + $0.10/txn (~$20-50) | `.env` SQUARE_* |
| **Twilio** | SMS notifications | ~$0.0075/SMS (~$5-20) | `.env` TWILIO_* |
| **SendGrid** | Email (SMTP) | Free-$10 | `.env` EMAIL_* |
| **Google Maps** | Address autocomplete | ~$5-50 | `.env` GOOGLE_MAPS_* |
| **Google Calendar** | Driver availability | Free | `.env` GOOGLE_* |
| **Firebase Firestore** | Database | Free-$50 | `.env` FIREBASE_* |
| **Firebase Auth** | User authentication | Free | `.env` FIREBASE_* |
| **Firebase Messaging** | Push notifications | Free | `.env` FIREBASE_* |
| **Vercel** | Hosting | $0-20 | `vercel.json` |

### Installed But Unused

| Package | Purpose | Status |
|---------|---------|--------|
| `openai` | AI features | Installed, not integrated |
| `octokit` | GitHub API | Installed, not integrated |

---

## CUSTOMER FEATURES

### Booking Flow
| Feature | Status | Files |
|---------|--------|-------|
| Address autocomplete | ✅ Active | `src/design/components/base-components/LocationInput.tsx` |
| Real-time fare quotes | ✅ Active | `src/lib/services/quote-service.ts` |
| Date/time selection | ✅ Active | `src/components/booking/` |
| Flight info capture | ✅ Active | `src/components/booking/` |
| Service area validation | ✅ Active | `src/lib/services/service-area-validation.ts` |
| Deposit payment | ✅ Active | `src/lib/services/square-service.ts` |
| Email confirmation | ✅ Active | `src/lib/services/email-service.ts` |
| SMS confirmation | ✅ Active | `src/lib/services/twilio-service.ts` |
| Calendar invite (.ics) | ✅ Active | Uses `ics` package |

### Account & Profile
| Feature | Status | Files |
|---------|--------|-------|
| Email/password login | ✅ Active | `src/lib/services/auth-service.ts` |
| Google Sign-In | ✅ Active | `src/lib/services/auth-service.ts` |
| Booking history | ✅ Active | `src/app/(customer)/bookings/` |
| Profile management | ✅ Active | `src/app/(customer)/profile/` |
| SMS opt-in/out | ✅ Active | TCPA compliant |

### Notifications
| Feature | Status | Files |
|---------|--------|-------|
| Booking confirmation | ✅ Active | Email + SMS |
| Pickup reminders | ✅ Active | 24h before |
| Driver notifications | ✅ Active | Assignment, arrival |
| Web push | ✅ Active | `src/lib/services/push-notification-service.ts` |

### Other
| Feature | Status | Files |
|---------|--------|-------|
| Driver tracking page | ✅ Active | `src/app/(public)/tracking/` |
| Balance payment | ✅ Active | `src/app/(customer)/payments/` |
| Tips | ✅ Active | Via Square |
| Apple/Google Pay | ✅ Active | Via Square |
| Post-ride reviews | ✅ Active | `src/lib/services/review-service.ts` |

---

## ADMIN FEATURES

### Booking Management
| Feature | Status | Files |
|---------|--------|-------|
| View all bookings | ✅ Active | `src/app/(admin)/admin/bookings/` |
| Filter by status | ✅ Active | Pending, confirmed, completed, etc. |
| Confirm/cancel | ✅ Active | |
| Exception approval | ✅ Active | Out-of-area bookings |
| Statistics dashboard | ✅ Active | `src/app/(admin)/admin/page.tsx` |

### Schedule Management
| Feature | Status | Files |
|---------|--------|-------|
| Calendar view | ✅ Active | `src/app/(admin)/admin/schedules/calendar/` |
| Availability management | ✅ Active | `src/lib/services/driver-scheduling-service.ts` |
| Google Calendar sync | ✅ Active | `src/lib/services/google-calendar.ts` |
| Conflict detection | ✅ Active | 60-min buffer |

### Payments
| Feature | Status | Files |
|---------|--------|-------|
| View payments | ✅ Active | `src/app/(admin)/admin/payments/` |
| Refunds | ✅ Active | Via Square |

### Removed Features (2025-02-13)
| Feature | Reason | Lines Removed |
|---------|--------|---------------|
| CMS pages | Unused | -500 |
| Marketing SMS page | Unused | -500 |
| Driver tracking page | Unused | -400 |
| Help pages | Unused | -300 |
| Setup wizard | One-time use | -200 |

---

## DATABASE COLLECTIONS

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `bookings` | Ride bookings | status, pickupDateTime, fare, customer info |
| `users` | Auth users | uid, email, role (admin/customer/driver) |
| `customers` | Customer CRM | phone, name, address, notes, bookingCount |
| `payments` | Payment records | amount, status, squarePaymentId |
| `drivers` | Driver profiles | status, availability, vehicleInfo |
| `feedback` | Reviews | rating, comment, bookingId |

---

## BUSINESS RULES (Hardcoded)

| Rule | Value | Location |
|------|-------|----------|
| Service area | Fairfield County, 25mi normal, 40mi extended | `service-area-validation.ts` |
| Booking buffer | 60 minutes between rides | `driver-scheduling-service.ts` |
| Refund >24h | 100% | `square-service.ts` |
| Refund 3-24h | 50% | `square-service.ts` |
| Refund <3h | 0% | `square-service.ts` |
| Deposit | Required at booking | Booking flow |

---

## INFRASTRUCTURE

### Hosting
- **Platform:** Vercel
- **Region:** iad1 (Northern Virginia)
- **Build:** `npm run build`
- **Deploy:** `npm run deploy` (auto from GitHub)

### CI/CD
- **GitHub Actions:** Test on PR/push
- **Tests:** Unit (Vitest), E2E (Playwright)
- **Coverage target:** 80%

### Environments
| Env | URL | Purpose |
|-----|-----|---------|
| Production | fairfieldairportcars.com | Live |
| Local | localhost:3000 | Development |
| Emulators | localhost:8081 | Firebase testing |

---

## COST BREAKDOWN

### Monthly Estimates (100-150 bookings/month)

| Service | Low | High | Notes |
|---------|-----|------|-------|
| Square | $20 | $50 | 2.6% + $0.10 per txn |
| Twilio | $5 | $20 | ~$0.0075/SMS |
| SendGrid | $0 | $10 | Free tier covers most |
| Google Maps | $5 | $50 | Pay per request |
| Firebase | $0 | $50 | Free tier usually enough |
| Vercel | $0 | $20 | Free tier or Pro |
| **Total** | **$30** | **$200** | |

---

## ALTERNATIVES CONSIDERED

| Platform | Monthly Cost | Why Not |
|----------|--------------|---------|
| Limo Anywhere | $99-299 | Overkill for single driver |
| Ground Alliance | ~$150 | Less customizable |
| Book.limo | Commission | Takes % of bookings |
| Square Appointments | $0-29 | No car service features |

---

## CHANGELOG

| Date | Change | Impact |
|------|--------|--------|
| 2025-02-13 | Removed unused admin pages | -1,926 lines |
| 2025-02-13 | Added customer import | +846 lines, 79 customers |
| 2025-02-13 | Added token efficiency docs | +367 lines |
| 2025-02-13 | Removed unused hooks | -2,010 lines |
| 2025-02-13 | Removed unused API routes | -1,130 lines |

---

## HOW TO UPDATE THIS DOC

When adding a feature:
1. Add to appropriate section above
2. Include file paths
3. Note any new services/costs

When removing a feature:
1. Move to "Removed Features" section
2. Note lines removed and reason
3. Update cost estimates if applicable

When changing services:
1. Update Services table
2. Update Cost Breakdown
3. Note in Changelog
