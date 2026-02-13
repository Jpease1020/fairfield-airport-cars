# Fairfield Airport Cars - Architecture Decisions

Log of significant technical decisions. Reference these instead of re-debating.

---

## Decision Template

```markdown
### [DECISION-XXX] Title
**Date:** YYYY-MM-DD
**Status:** Accepted | Superseded | Deprecated

**Context:** What situation led to this decision?

**Decision:** What did we decide?

**Rationale:** Why this over alternatives?

**Consequences:** What are the tradeoffs?
```

---

## Active Decisions

### [DECISION-001] Single-Driver Architecture
**Date:** 2024-01-01
**Status:** Accepted

**Context:** Gregg operates alone - no employees, no fleet management.

**Decision:** Design all features for single-driver operation. No multi-driver scheduling, no fleet tracking, no driver assignment logic.

**Rationale:** Simpler code, faster development, matches business reality.

**Consequences:**
- Cannot scale to multiple drivers without significant refactor
- 60-minute buffer between bookings is hardcoded assumption
- Admin panel assumes single user

---

### [DECISION-002] Square for Payments
**Date:** 2024-01-01
**Status:** Accepted

**Context:** Need payment processing with refund support.

**Decision:** Use Square SDK v43 for all payments.

**Rationale:**
- Gregg already has Square account
- Good refund API
- No Stripe migration needed

**Consequences:**
- Square-specific code patterns
- Must use `squarePaymentId` for refunds (not `squareOrderId`)

---

### [DECISION-003] Google Places for Autocomplete
**Date:** 2024-01-01
**Status:** Accepted

**Context:** Need address autocomplete with airport support.

**Decision:** Use Google Places API with separate queries for addresses and airports.

**Rationale:**
- Cannot mix `types: ['address', 'airport']` in single query (causes INVALID_REQUEST)
- Need both coordinates and formatted address

**Consequences:**
- Two API calls for full autocomplete
- Must validate both `address` AND `coordinates` before proceeding

---

### [DECISION-004] Minimal Admin Features
**Date:** 2025-02-13
**Status:** Accepted

**Context:** Admin panel had many unused features (CMS, marketing, tracking, driver location, setup wizards).

**Decision:** Strip admin to 4 core pages: Dashboard, Bookings, Payments, Schedule.

**Rationale:**
- Gregg only uses booking management
- Unused code is maintenance burden
- Removed ~6,000 lines of dead code

**Consequences:**
- No built-in marketing tools (use external services)
- No real-time driver tracking
- No CMS for content editing (edit code directly)

---

### [DECISION-005] styled-components for Styling
**Date:** 2024-01-01
**Status:** Accepted

**Context:** Need component styling solution.

**Decision:** Use styled-components with design tokens.

**Rationale:**
- Co-located styles with components
- Type-safe theme
- No CSS file management

**Consequences:**
- Bundle size includes styled-components runtime
- SSR requires additional setup (already configured)

---

### [DECISION-006] Firebase/Firestore for Data
**Date:** 2024-01-01
**Status:** Accepted

**Context:** Need database with real-time capabilities.

**Decision:** Use Firebase/Firestore.

**Rationale:**
- Simple setup
- Real-time listeners if needed
- No server management

**Consequences:**
- Firebase-specific query patterns
- Timestamp conversion required for API responses
- NoSQL data modeling

---

## Superseded Decisions

(None yet)
