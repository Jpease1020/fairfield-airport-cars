# Fairfield Airport Car Service — TODO

_This document tracks upcoming work. Feel free to check items off or add new ones as we go._

## Features to Add
- [ ] Real Square checkout integration **with webhook** (replace placeholder link)
- [ ] Self-serve booking management page (view / reschedule / cancel / resend confirmation)
- [ ] Confirmation email + downloadable calendar invite (.ics)
- [ ] Enhanced feedback funnel (1-click stars → Google review if ≥4★)
- [ ] Spanish language translation (i18n)
- [ ] Return-trip booking flow
- [ ] Multi-passenger support
- [ ] Loyalty / coupon codes
- [ ] Real-time driver location sharing for riders
- [ ] Admin analytics dashboard (bookings, revenue, feedback)

## Bugs / Fixes Needed
- [ ] Address autocomplete not working in production (pending `GOOGLE_MAPS_API_KEY` in Vercel env)
- [ ] Mobile layout issues on the booking form (small screens)
- [ ] Fare calculation rounding edge cases

## Technical Debt / Improvements
- [ ] Replace deprecated Twilio API calls with latest library versions
- [ ] Add end-to-end tests (Playwright)
- [ ] Enable TypeScript `strict` mode and fix resulting errors

## DevOps / Deployment
- [ ] Add unrestricted `GOOGLE_MAPS_API_KEY` to Vercel project env vars
- [ ] Set up a dedicated staging environment
- [ ] Integrate error monitoring (e.g., Sentry or LogRocket) 