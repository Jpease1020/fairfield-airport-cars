## Business Logic Interface & Gregg-Friendly Docs — Implementation Plan

### Objectives
- Provide a plain-English, always-current view of pricing, booking flow, cancellations, and notifications for non-devs (Gregg).
- Keep docs in sync with code and CMS without manual effort or drift.
- Allow non-dev change proposals via a simple form; engineers implement against contracts.

### Architecture Overview
- Source of truth:
  - Zod contracts in `src/lib/contracts/**` (inputs/outputs/validation for pricing, booking, notifications).
  - Pricing/settings pulled from CMS via `cmsFlattenedService`.
  - Optional: XState machines in `src/lib/statecharts/**` for visual flows.
- Generation:
  - Node scripts produce Markdown docs in `docs/business/**` from contracts + CMS + diagrams (Mermaid).
- Delivery:
  - Public, password-protected docs pages (`/docs/*`) and an in-app admin page (`/admin/docs`) with live CMS snapshot.
- Feedback:
  - “Propose a change” API that emails or opens an issue (no repo access required for Gregg).

### Step-by-Step Implementation
1) Extract shared contracts (no duplication)
   - Create `src/lib/contracts/pricing.contract.ts` from existing settings and route schemas.
   - Create `src/lib/contracts/booking-flow.contract.ts` (trip/customer/payment shapes; reuse route schemas).
   - Create `src/lib/contracts/notifications.contract.ts` (event names, payloads, triggers).
   - Refactor API routes to import these contracts (remove in-file duplicates).

2) Docs generator scripts (code → docs)
   - `scripts/docs/build-business-docs.ts`:
     - Load Zod contracts and current CMS pricing.
     - Generate: `docs/business/pricing.md`, `booking-flow.md`, `cancellations.md`, `notifications.md`.
     - Embed Mermaid diagrams if present.
   - `scripts/docs/validate-docs-in-sync.ts`:
     - Compare generated output to committed files; exit non-zero on diff for CI.
   - Add npm scripts: `docs:build`, `docs:check`.

3) Visuals (diagrams)
   - Minimal: author `docs/business/diagrams/booking-flow.mmd` (Mermaid) capturing phases.
   - Optional: add `src/lib/statecharts/booking.machine.ts` and auto-export Mermaid/SVG.

4) In-app admin docs page
   - `src/app/admin/docs/page.tsx` with tabs: Pricing, Booking Flow, Cancellations, Notifications.
   - Left: render generated Markdown; Right: live CMS snapshot (read-only) values.
   - Add “Propose a change” button → modal → POST `/api/docs/propose-change`.
   - Gate via existing admin auth; dev/prod safe.

5) Public docs pages (Gregg-friendly)
   - Routes under `src/app/docs/(business)/[slug]/page.tsx` that render the same Markdown.
   - Protect with Vercel password or middleware auth; mobile-friendly layout.

6) Propose-a-change endpoint
   - `src/app/api/docs/propose-change/route.ts` accepts `{ section, title, description, suggested }`.
   - Sends email or opens a GitHub issue (token via platform env; no .env file edits in code).

7) Tests
   - Unit: generator outputs required sections given fixture contracts/CMS.
   - Integration: `/admin/docs` renders docs + live CMS; submit change proposal succeeds.
   - E2E: Gregg reads `/docs/pricing`, views examples, submits proposal.
   - Accessibility: headings, labels, keyboard nav.

### Deliverables
- `src/lib/contracts/**` (Zod contracts) and API routes updated to import them.
- `scripts/docs/build-business-docs.ts`, `scripts/docs/validate-docs-in-sync.ts` with npm scripts.
- `docs/business/*.md` plus `docs/business/diagrams/*.mmd` (generated/committed).
- `src/app/admin/docs/page.tsx` and `src/app/api/docs/propose-change/route.ts`.
- `src/app/docs/(business)/[slug]/page.tsx` with simple protection.

### Timeline (fast path)
- Day 1: Extract contracts; wire APIs to contracts; generate `pricing.md`, `booking-flow.md`.
- Day 2: Build `/admin/docs` with live CMS panel; add propose-change API.
- Day 3: Add cancellations & notifications docs; diagrams; CI drift check.

### Acceptance Criteria
- Docs reflect current contracts and CMS; CI fails on drift.
- Gregg can read plain-English pages with examples and current numbers.
- Proposals flow to the team without granting repo access.
- No duplicated schemas; APIs rely on `src/lib/contracts/**`.

### Notes & Constraints
- No .env file changes or writes in code.
- Keep components and services DRY; extend rather than duplicate.
- Dev-only pages/features must not leak to unauthenticated users.


