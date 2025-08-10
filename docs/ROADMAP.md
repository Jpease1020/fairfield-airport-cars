# 🚀 Fairfield Airport Cars - Development Roadmap

## 📊 Current snapshot

- Shipped (MVP core): booking, Square payments with balance management, admin dashboard, baseline notifications, design system, auth
- In progress: real-time tracking/availability, analytics/monitoring visibility
- Principles: keep it simple, mobile-first, no duplication, all public copy is CMS-editable

---

## 🎯 Next 4 weeks (MVP hardening)

1) Payments to production-ready
- Live-keys configuration, refund/cancellation consistency, receipts/invoices
- Decline/timeout retries, clear failure states, idempotency on server routes

2) Booking flow hardening + tests
- Expand critical-path e2e tests (quote → book → pay → confirm → cancel/refund)
- Robust empty/error/loading states and recovery paths

3) Real-time availability and status
- Promote driver availability and booking status to live with fallback (SSE/poll)
- Customer status page polish: ETA confidence, arrived/complete transitions

4) Notifications (SMS/Email)
- Confirmation, driver assigned, arriving soon, payment receipt
- Queue + retry + observability; admin resend from dashboard

5) Mobile-first UX and accessibility
- WCAG 2.1 AA, 44px targets, skeletons/progressive loading, performance budget on critical pages

6) Admin ops essentials
- Simple scheduling view and basic earnings; today/queue health on dashboard

7) Analytics and monitoring
- Funnel metrics, error tracking, performance dashboards; set success thresholds

8) Security and platform guardrails
- Rate limiting, input validation, Firestore rules review, secret hygiene, feature flags

9) Content/CMS coverage
- Ensure all user-facing copy is CMS-managed and mapped consistently

---

## 📌 Milestones and success criteria

- Week 1–2
  - Payments prod-ready, booking flow hardening, confirmations/receipts, base funnel metrics
- Week 3–4
  - Real-time availability/status polish, notifications set, a11y pass, admin ops dashboard, monitoring in place

Success criteria
- Payment success > 95%, refund/cancel reliability > 99%
- Booking funnel conversion +10% absolute vs current
- P90 page load < 2s on mobile for booking/tracking pages
- A11y: no critical WCAG violations on critical paths

---

## 📚 Backlog (post-MVP growth)

Phase 2 – Growth
- Apple Pay and Google Pay (mobile payment optimization)
- PWA/offline booking basics (manifest, service worker, offline queue + sync)
- Dynamic pricing (peak airport times) and fare transparency
- Customer feedback and ratings (lightweight, post-ride)

Phase 3 – Differentiators
- Flight status integration (validate with users first), proactive pickup adjustments
- Referral/share program (start simple: link-based with basic tracking)
- Advanced analytics and BI (beyond current dashboards)

Phase 4 – Scale & internationalization
- Multi-language + currency support
- Advanced notifications (preferences, templates, A/B)
- Advanced booking/payment features (recurring, split payments, corporate)

---


---

## 🔎 Related detailed docs

- Architecture: docs/architecture/MASTER_ARCHITECTURE.md
- Implementation summaries: docs/analysis/COMPREHENSIVE_SUMMARY.md
- Feature analysis: docs/features/FEATURE_ANALYSIS.md
- Flight status outline: docs/features/flight-status-updates.md
- Next.js optimizations: docs/implementation/NEXTJS_OPTIMIZATION_GUIDE.md
