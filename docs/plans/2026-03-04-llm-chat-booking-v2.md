# LLM Chat Booking Interface — Merged Plan v2 (Safe Execution)

Date: 2026-03-04  
Status: Draft v2 (Merged from Claude + Codex)

## Why this v2 exists
This version keeps the strong parts of the previous plan (tool-driven chat, concrete task breakdown) and closes critical safety gaps before implementation.

## Source of truth (authoritative)
When docs disagree, code wins:

- `src/app/api/booking/validate-phase/route.ts`
- `src/app/api/booking/quote/route.ts`
- `src/app/api/booking/check-availability/route.ts`
- `src/app/api/booking/submit/route.ts`
- `src/lib/services/booking-orchestrator.ts`
- `src/lib/services/booking-service.ts` (`createBookingAtomic`)
- `src/lib/services/driver-scheduling-service.ts`
- `src/lib/services/service-area-validation.ts`
- `src/lib/contracts/booking-api.ts`

Known stale docs to treat as historical only:

- `docs/ROADMAP.md` (cancellation policy and AI scope statements are outdated relative to code)

---

## Non-negotiable guardrails (must be true)
1. No business logic duplication in chat layer.
2. Chat must use existing validation path (`/api/booking/validate-phase`) for trip + contact checks.
3. Chat must not call `submit` unless an explicit server-validated confirmation step passed.
4. Chat must not rely on `NEXT_PUBLIC_BASE_URL` for server-side tool routing.
5. Chat must be behind feature flags on both server and client.
6. CI tests must be deterministic (mock model provider; no live LLM in unit/integration).

---

## MVP scope
1. Conversational booking on `/book`.
2. Address resolution, availability, quote, contact capture, confirmation, submit.
3. Existing form remains fallback.
4. Human handoff response when out-of-policy or uncertain.

## Explicit non-goals (MVP)
1. In-chat cancellation/reschedule/refunds.
2. Admin operations.
3. Autonomous exception booking.
4. Replacing existing booking APIs.

---

## Architecture

### 1) API route
Create `POST /api/chat/booking-assistant`.

Responsibilities:
- Validate request payload.
- Run model/tool loop.
- Execute allowlisted tools only.
- Maintain server-canonical draft state for the turn.
- Return structured UI response.

### 2) Provider abstraction (testability)
Create `src/lib/chat/llm-provider.ts` with a narrow interface:
- `generate({ systemPrompt, messages, tools }): Promise<ModelResponse>`

Implementation:
- `src/lib/chat/providers/anthropic-provider.ts` for real runtime.
- Tests mock `llm-provider` interface, not SDK internals.

### 3) Tool layer
Create `src/lib/chat/chat-tools.ts` with wrappers that call existing booking APIs.

Important:
- Server-side tool calls must derive origin from request context, not `NEXT_PUBLIC_BASE_URL`.
- Preferred: pass `origin` into tool executor and use `new URL('/api/...', origin)`.

### 4) UI
Create:
- `src/components/booking/BookingChat.tsx`
- `src/components/booking/ConfirmationCard.tsx`

Keep existing form live behind a UI toggle/fallback.

---

## Tool contract (LLM-callable)
Allowlist only:

1. `resolve_address`
- Uses new `POST /api/places/autocomplete`.

2. `check_availability`
- Uses existing `POST /api/booking/check-availability`.

3. `get_quote`
- Uses existing `POST /api/booking/quote`.

4. `validate_trip_details`
- Uses existing `POST /api/booking/validate-phase` with `phase: 'trip-details'`.

5. `validate_contact_info`
- Uses existing `POST /api/booking/validate-phase` with `phase: 'contact-info'`.

6. `prepare_confirmation`
- Server computes canonical summary hash + short-lived `confirmationToken`.
- No booking write.

7. `create_booking`
- Allowed only if `confirmationToken` is valid and unexpired.
- Internally calls `POST /api/booking/submit`.

8. `handoff_to_human`
- Returns support instructions and logs structured event.

---

## Confirmation safety design (server-enforced)
Prompt rules are not sufficient alone.

Required flow:
1. Chat reaches complete draft and calls `prepare_confirmation`.
2. Server returns:
   - canonical summary
   - `confirmationToken` (signed, short TTL, bound to summary hash)
3. UI renders `ConfirmationCard` from canonical summary.
4. User clicks Confirm -> client sends explicit `confirm: true` with token.
5. Server verifies token + summary hash before allowing `create_booking`.

If verification fails, booking is blocked and user is prompted to reconfirm.

---

## Feature flags
Add both:
- Server flag: `CHAT_BOOKING_ENABLED`
- Client flag: `NEXT_PUBLIC_CHAT_BOOKING_ENABLED`

Rules:
- `/api/chat/booking-assistant` returns `404` or `403` when disabled.
- `/book` shows chat only when client flag true; form remains default fallback.

---

## File plan

### New
- `src/app/api/chat/booking-assistant/route.ts`
- `src/app/api/places/autocomplete/route.ts`
- `src/lib/chat/chat-types.ts`
- `src/lib/chat/chat-tools.ts`
- `src/lib/chat/chat-system-prompt.ts`
- `src/lib/chat/llm-provider.ts`
- `src/lib/chat/providers/anthropic-provider.ts`
- `src/components/booking/BookingChat.tsx`
- `src/components/booking/ConfirmationCard.tsx`
- `tests/unit/chat-tools.test.ts`
- `tests/unit/chat-confirmation-gate.test.ts`
- `tests/integration/chat-booking-assistant-api.test.ts`

### Modify
- `src/app/(customer)/book/BookPageClient.tsx`
- `src/app/api/health/booking-flow/route.ts` (report chat env readiness)
- `package.json` (add `@anthropic-ai/sdk`)

---

## Phased implementation tasks

### Task A — Foundation
1. Add SDK dependency.
2. Add provider abstraction + Anthropic implementation.
3. Add feature flags and health check wiring.

Acceptance:
- Build passes.
- Chat route disabled by default.

### Task B — Places + tools
1. Add `/api/places/autocomplete` with rate limiting.
2. Add tool wrappers for resolve/availability/quote/validate.
3. Add unit tests for tool payloads and error mapping.

Acceptance:
- `tests/unit/chat-tools.test.ts` passes.

### Task C — Chat API loop
1. Implement `/api/chat/booking-assistant`.
2. Add strict allowlist tool execution.
3. Add malformed-tool rejection behavior.

Acceptance:
- Integration tests validate greeting, tool loop, and stable response format.

### Task D — Confirmation gate
1. Add `prepare_confirmation` token flow.
2. Block `create_booking` without valid token.
3. Add negative tests for stale/mismatched token.

Acceptance:
- `tests/unit/chat-confirmation-gate.test.ts` passes.
- Cannot create booking via prompt-only "yes" without server token validation.

### Task E — UI integration
1. Add `BookingChat` + `ConfirmationCard`.
2. Mount on `/book` behind flag with form fallback.
3. Ensure confirmation card uses structured payload only.

Acceptance:
- Chat disabled by default in production configs.
- Existing form remains fully usable.

### Task F — End-to-end integration tests (deterministic)
1. Add mocked-provider integration tests for:
   - happy path
   - unavailable slot with suggestions
   - service-area block -> handoff
   - validation failure -> correction
   - token-gate enforcement
2. Keep real LLM network calls out of CI integration tests.

Acceptance:
- `npx vitest run tests/unit && npx vitest run tests/integration` passes consistently.

---

## Test strategy

### Unit
- Tool wrapper request/response mapping.
- Confirmation token sign/verify logic.
- Tool allowlist enforcement.

### Integration
- Route-level chat flow with mocked model provider.
- Server-side validation path usage (`validate-phase`) verified by assertions on tool calls.

### Optional manual smoke (non-blocking CI)
- Real model check in dev with feature flag enabled.

---

## Rollout plan
1. Stage 0: code shipped, flags off.
2. Stage 1: internal testing, submit disabled (shadow mode).
3. Stage 2: limited traffic, submit enabled, monitor errors.
4. Stage 3: wider rollout if metrics stable.

Rollback:
- Disable `CHAT_BOOKING_ENABLED` immediately.
- Form flow remains primary fallback.

---

## Definition of done
1. Chat flow enforces same validation/business rules as form path.
2. Server-enforced confirmation gate is in place.
3. No dependency on `NEXT_PUBLIC_BASE_URL` for server tool routing.
4. Feature flags and health checks wired.
5. Unit + integration + build all green.
6. Existing `/book` form flow remains operational.

---

## Open decisions
1. Model choice and latency/cost targets.
2. Transcript retention/redaction policy.
3. Whether to keep chat state purely per-session or persist server-side short term.
4. Whether to expose OTP/magic-link from chat in MVP or phase 2.
