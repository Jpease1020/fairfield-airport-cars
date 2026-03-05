# LLM Booking Chat Plan (Code-Truth Draft)

Date: 2026-03-04  
Status: Draft v1

## 1) Purpose
Build a customer-facing chat window that can guide users from trip intent to completed booking, without bypassing existing business rules or weakening system reliability.

This plan is intentionally code-first: if docs conflict, code wins.

## 2) Source of Truth (Authoritative)
Use these files as canonical behavior for MVP:

- `src/lib/contracts/booking-api.ts`
- `src/app/api/booking/submit/route.ts`
- `src/lib/services/booking-orchestrator.ts`
- `src/lib/services/booking-service.ts` (`createBookingAtomic`)
- `src/lib/services/driver-scheduling-service.ts`
- `src/lib/services/service-area-validation.ts`
- `src/lib/business/business-rules.ts`
- `src/app/api/booking/cancel-booking/route.ts`
- `src/app/api/booking/check-availability/route.ts`
- `src/app/api/auth/request-link/route.ts`
- `src/app/api/auth/verify-link/route.ts`
- `src/app/api/auth/request-otp/route.ts`
- `src/app/api/auth/verify-otp/route.ts`

## 3) Known Stale/Conflicting Docs
Treat these as historical context only until reconciled:

- `docs/ROADMAP.md`
  - Says cancellation is `100/50/0` by `24h/3h`.
  - Says AI/chatbot is out of scope.
- Live code currently implements cancellation fee tiers from `business-rules.ts` defaults: `0/25/50/75` by `24h/12h/6h`.

## 4) Readiness Snapshot (for starting chat work)
The base product is in strong shape for an LLM chat layer:

- Booking submission already has strict schema validation and orchestration.
- Quote freshness and route-hash matching are already enforced server-side.
- Availability and double-booking prevention already run in scheduling + atomic booking flow.
- Service area and airport endpoint rules are centralized.
- Magic-link and OTP auth routes already exist.

Main gap: no dedicated chat orchestration boundary yet.

## 5) LLM Chat MVP Scope
The chat assistant should support:

1. Collect trip details (pickup, dropoff, time, fare type).
2. Run quote and availability checks.
3. Collect customer details (name, email, phone, sms opt-in).
4. Confirm final booking summary with clear price/time caveats.
5. Submit booking through existing submit/booking orchestration path.
6. Trigger magic-link auth flow when user wants to view/manage booking later.
7. Escalate to human handoff when outside policy or uncertain.

## 6) Explicit Non-Goals (MVP)
Do not include in v1:

- Changing cancellation policy logic.
- Bypassing quote validation or service area checks.
- Direct Firestore writes from chat code.
- Voice calling, autonomous rescheduling, or payment dispute automation.
- Any admin action from customer chat.

## 7) Hard Business Rules Chat Must Enforce
Chat must respect these invariant rules:

1. Quote required for normal submission (`booking-orchestrator`), except valid exception-secret flow.
2. Trip route hash and fare drift tolerance checks remain server-authoritative.
3. Trip must pass `classifyTrip` service area + airport endpoint rules.
4. Time slot conflict checks use `driverSchedulingService.checkBookingConflicts`.
5. Final write path must remain `createBookingAtomic`.
6. Cancellation fee messaging must come from `getBusinessRules` + `getCancellationFeePercent`.
7. Auth flows must use existing request/verify magic-link and OTP routes.
8. Chat must never expose secrets, tokens, or internal error stack traces.
9. Chat must rate-limit requests and degrade gracefully.
10. Chat must give explicit uncertainty fallback: "I can hand this to Gregg."

## 8) Proposed Architecture
### 8.1 API Boundary
Create one new server route:

- `POST /api/chat/booking-assistant`

Responsibilities:

- Session/context handling for chat turns.
- LLM invocation with strict tool-calling mode.
- Tool execution via server-only wrappers.
- Output normalization to safe UI message objects.

### 8.2 Service Layer
Add dedicated chat services (thin, typed):

- `src/lib/services/chat/chat-orchestrator.ts`
- `src/lib/services/chat/chat-policy.ts`
- `src/lib/services/chat/chat-tools.ts`
- `src/lib/services/chat/chat-types.ts`

Rule: tools call existing APIs/services; they do not reimplement business logic.

### 8.3 UI Layer
Add customer widget components:

- `src/components/chat/BookingChatWidget.tsx`
- `src/components/chat/ChatComposer.tsx`
- `src/components/chat/ChatMessageList.tsx`

Keep UI stateless where possible; server remains source of truth for actions.

## 9) MVP Tool Contract (LLM callable)
Expose a minimal tool set first:

1. `collect_trip_details`
- Validate required fields and normalize format.
- No external side effects.

2. `check_availability`
- Calls existing availability path.
- Returns `isAvailable`, conflicts, suggested times.

3. `get_quote`
- Calls quote path.
- Returns fare, expiry, and any availability warning.

4. `submit_booking`
- Calls existing submit/orchestration path.
- Returns booking id, confirmation status, and safe user message.

5. `request_magic_link`
- Calls auth request-link route.

6. `request_otp`
- Calls auth request-otp route.

7. `handoff_to_human`
- Logs transcript snapshot and returns next contact instructions.

## 10) Guardrails and Safety
- Enforce JSON schema for each tool input/output.
- Reject unknown tool names and malformed args.
- Add allowlist for all callable tools.
- Add server-side timeout/retry strategy per tool.
- Add PII-safe structured logs (mask phone/email in logs).
- Add clear user-safe error classes: validation, policy, temporary outage.

## 11) Testing Plan (Real Value Coverage)
### Unit
- `chat-policy` validation and safety checks.
- Tool arg validation and normalization.
- Prompt-injection resistance for tool calls.

### Integration
- Full happy path: chat -> quote -> availability -> submit.
- Conflict path: suggested alternate times returned and accepted.
- Out-of-service path: soft/hard block behavior and handoff.
- Auth path: request-link/request-otp actions from chat.
- Failure path: provider timeout -> graceful fallback.

### Contract/Eval Fixtures
- Add fixed conversation fixtures (5-10) with expected tool traces.
- Gate merges on deterministic fixture pass.

## 12) Rollout Strategy
1. Phase A: internal-only feature flag (`chatBookingEnabled=false` default).
2. Phase B: shadow mode (assistant suggests actions; no submit tool).
3. Phase C: limited production cohort with submit enabled.
4. Phase D: full rollout after error/booking-quality thresholds hold.

## 13) Success Metrics
- Booking conversion from chat sessions.
- Time-to-booking vs existing form flow.
- Tool-call error rate.
- Human handoff rate.
- False-confirmation incidents (must be zero).

## 14) Definition of Done (MVP)
Ship only when all are true:

1. Chat submits bookings only through existing orchestrator + atomic booking path.
2. All key business-rule integration tests pass.
3. Build, unit, and integration suites stay green.
4. Feature flag + observability + handoff path are in place.
5. No direct DB writes from chat-specific code.

## 15) Recommended Build Order
1. Create chat types + policy + tool wrappers.
2. Implement `/api/chat/booking-assistant` with mocked model provider.
3. Add widget UI and transcript rendering.
4. Wire real LLM provider behind env flag.
5. Add integration + fixture tests.
6. Enable shadow mode and evaluate transcripts.

## 16) Open Decisions (Need Final Product Call)
1. LLM provider and model tier (cost vs latency target).
2. Transcript retention policy (duration + redaction strategy).
3. Whether to include payments in-chat in MVP or redirect to existing payment step.
4. Handoff UX: immediate SMS handoff vs callback request form.
5. Branding/tone constraints for assistant voice.
