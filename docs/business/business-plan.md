# Fairfield Airport Car Service Platform – Business Plan

_Last updated: <!--DATE_AUTOGENERATED-->_

> This plan captures the current product vision, target market, MVP scope, operations model, and technology approach.  Update this file whenever strategy shifts or new decisions are locked in.

---

## 1. Vision & Value Proposition

Build a **white-label, driver-owned ride-booking platform** that lets individual chauffeurs replace Uber/Lyft, keep a larger share of earnings, and offer a premium, dependable experience.  Each driver deploys their **own instance** of the app (tied to a single vehicle).  When ready, multiple drivers can later be networked together under a parent marketplace.

## 2. Target Market (Phase 1)

| Segment | Details |
| ------- | ------- |
| Fairfield County professionals | Frequent flyers who value punctuality & a luxury sedan experience |
| Airport transfers | JFK, LGA, BDL, EWR, HPN focus |
| Special-event clients | Weddings, corporate off-sites (case-by-case) |

*Channel:* word-of-mouth, QR-coded business cards left with existing customers.

## 3. MVP Goals (Single-Driver Instance)

1. **Accept bookings** (date/time, pickup & drop-off, contact info).
2. **Collect a 50 % deposit** up-front via Square or Stripe Checkout link.
3. **Prevent overlapping rides** and enforce a configurable buffer.
4. **Manual approval** flow: driver reviews request, confirms or declines.
5. **Automated communications**
   - Booking confirmation (SMS + email)
   - Reminder 24 h before pickup & "on my way" text
6. **Admin dashboard** for the driver: upcoming rides, past history.
7. **Basic ratings / feedback** after the ride (1–5 stars + comment).

> _Ride-option variants (vehicle selection, multi-driver routing) are **out-of-scope** for Phase 1._

## 4. Pricing & Payments

| Item | Decision |
| ---- | -------- |
| Fare calculation | Compare to UberX fare for same route/time & add premium margin |
| Deposit | 50 % at booking; remainder collected offline or post-ride |
| Tipping | Enable in Square checkout |
| Cancellation | • > 24 h: full refund<br/>• 3–24 h: 50 % fee<br/>• < 3 h/no-show: 100 % fee |

## 5. Scheduling & Dispatch Logic

- **Availability calendar** auto-blocks overlapping rides.
- **Buffer** (configurable, default = 60 min) between drop-off and next pickup.
- **Manual approval** until trust is built; auto-approval can be toggled later.
- Optional Calendly + Zapier flow can replace custom scheduling for ultra-lean pilots.

## 6. Communication Workflow

| Trigger | Channel(s) | Contents |
| ------- | ---------- | -------- |
| Booking request received | Email to driver | Ride details + _Approve / Decline_ links |
| Approval sent | SMS + email to rider | Confirmation, deposit link |
| 24 h reminder | SMS + email | "See you tomorrow at HH:MM" |
| Driver en route | SMS | Live map link (optional Phase 2) |
| Post-ride | SMS | Feedback form (star rating) |

## 7. Technology Stack (Chosen)

| Layer | Tool | Notes |
| ----- | ---- | ----- |
| Front-end | Next.js (App Router) + Tailwind CSS | Mobile-first web UX |
| Hosting | Vercel | Custom domain per driver |
| Backend | **Firebase** (Firestore + Auth + Functions) | Real-time ready |
| Payments | Square Checkout links (Stripe fallback) | Collect deposit & tips |
| Scheduling | Custom logic (or Calendly + Zapier bootstrap) | Auto-reject overlaps |
| Messaging | Twilio | SMS & email (via SendGrid or nodemailer) |

_Native app via Expo can be added later if push notifications / live location become essential._

## 8. Compliance & Legal

- Commercial livery insurance (Phase 1 optional, mandatory Phase 2)
- CT business incorporation completed.
- Terms of Service + liability waiver template to be drafted.

## 9. Branding & Marketing Assets

- Branded booking website reachable via QR code on business cards.
- Text receipts and reminders include company name & support phone.
- Initial business cards ordered; QR code to production URL.

## 10. Roadmap & Timeline (original draft)

| Date (2025) | Milestone |
| ----------- | --------- |
| Jul 1 | Lock tech stack |
| Jul 2 | Finalise MVP features with Gregg |
| Jul 3 | Build booking + payment + scheduling components |
| Jul 9 | Soft launch with select clients |
| Jul 12 | Collect feedback & iterate |

## 11. Post-MVP Opportunities

| Feature | Priority | Rationale |
| ------- | -------- | --------- |
| Live driver tracking | Medium | Builds trust, justifies premium |
| Push notifications | Medium | Better UX than SMS-only |
| Customer login & repeat bookings | Medium | Convenience & retention |
| Promo / referral codes | Medium | Growth lever |
| In-app chat | Low | Only if multi-driver network requires |

## 12. Open Decisions

- **Firebase vs Supabase**: leaning Firebase for push notifications; revisit if SQL-style reports needed.
- **Invite-only access** vs public site? Decision pending branding strategy.
- **Real-time location** – include at launch or Phase 2?

---

### How to Keep This Plan Updated
1. Re-stamp the `<!--DATE_AUTOGENERATED-->` placeholder or run the Husky pre-commit hook.
2. Document every major product or business decision in the relevant section.
3. Use GitHub Issues + PR templates to reference section numbers when implementing features (e.g., _“Implements Section 3.5 – Automated reminders”_).

_Questions or revisions? Open an issue tagged `business-plan` so team discussion is tracked in one place._ 