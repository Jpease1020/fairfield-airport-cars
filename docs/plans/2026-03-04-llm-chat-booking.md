# LLM Chat Booking Interface — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a conversational chat widget to the `/book` page that lets users book a ride with Gregg by talking naturally, while enforcing all existing business rules identically to the current React form.

**Architecture:** Stateless `/api/chat` route runs Claude Haiku with tool calling. Each tool wraps an existing API route — zero business logic is duplicated in the chat layer. Conversation history lives client-side. The React form stays live as a fallback until chat is validated in production.

**Tech Stack:** `@anthropic-ai/sdk`, Next.js API routes (existing), Claude Haiku (`claude-haiku-4-5-20251001`), Google Maps Places API (new server-side proxy route), existing `driverSchedulingService`, `classifyTrip`, `submitBookingOrchestration`.

---

## Critical Rule: The Chat Layer Is Dumb on Purpose

Every business rule lives in the existing API routes. The chat tools call those routes; they do not reimplement anything.

| Business rule | Enforced by |
|---|---|
| Address must be real & canonical | `/api/places/autocomplete` (new) → Google Places |
| One location must be an airport | `/api/booking/quote` → `classifyTrip()` |
| Service area check | `/api/booking/quote` → `classifyTrip()` |
| 60-min buffer / no double-booking | `/api/booking/check-availability` → `driverSchedulingService` |
| 24-hour advance booking | `/api/booking/validate-phase` → existing validator |
| Fare calculation | `/api/booking/quote` → Google Distance Matrix |
| Quote expiration | `/api/booking/submit` → `isQuoteValid()` |
| Contact info validation | `/api/booking/validate-phase` |
| Final booking creation | `/api/booking/submit` → `submitBookingOrchestration()` |

The LLM orchestrates the conversation; the APIs enforce correctness.

---

## Conversation Flow

```
USER: "JFK next Tuesday 6am from 44 Elm St Westport"

TOOL: resolve_address("44 Elm Street Westport CT")
  → { address: "44 Elm St, Westport, CT 06880", coords: { lat, lng } }

LLM: "Just to confirm — Tuesday March 10th at 6:00 AM, pickup from
      44 Elm St, Westport CT 06880, dropoff JFK?"
USER: "Yes"

TOOL: get_quote({ origin, destination, pickupCoords, dropoffCoords, pickupTime })
  → { quoteId, fare: 145, distanceMiles, durationMinutes, availabilityWarning? }

  If availabilityWarning: LLM tells user, offers suggestedTimes, asks them to pick
  If service area error: LLM gives Gregg's phone number, stops
  If normal: continue

LLM: "That'll be $145. What's your name, email, and phone number?"
     (skip if user is logged in)

USER: "Justin, justin@email.com, 203-555-0101"

[CONFIRMATION CARD — rendered by frontend code, not LLM text]
  Pickup:     44 Elm St, Westport CT 06880
  Dropoff:    JFK Airport
  Date/Time:  Tuesday March 10, 2026 at 6:00 AM
  Passengers: 1
  Name:       Justin
  Email:      justin@email.com
  Phone:      203-555-0101
  Price:      $145
  "Confirm booking?"

USER: "Yes"

TOOL: create_booking({ quoteId, fare, customer, trip })
  → { bookingId: "FAC-2847" }

LLM: "You're booked! Confirmation sent to justin@email.com. Booking ID: #FAC-2847."
```

**Hard rules for the LLM (in system prompt):**
- Never assume a date — always confirm: "Did you mean Tuesday March 10th?"
- Never call `create_booking` until user explicitly says yes to the confirmation card
- If `classifyTrip` returns soft_block/hard_block → give Gregg's number, do not book
- Valid airports only: JFK, LGA, EWR, BDL, HVN, HPN
- If slot is taken → show `suggestedTimes` from the quote response, let user pick
- Never guess fare, address, or availability — call the tools

---

## Files to Create / Modify

```
NEW:
  src/app/api/places/autocomplete/route.ts   ← server-side Google Places proxy
  src/lib/chat/chat-types.ts                 ← TypeScript types
  src/lib/chat/chat-tools.ts                 ← tool definitions (call existing APIs)
  src/lib/chat/chat-system-prompt.ts         ← system prompt + hard rules
  src/app/api/chat/route.ts                  ← conversation handler
  src/components/booking/BookingChat.tsx     ← chat UI component
  src/components/booking/ConfirmationCard.tsx ← structured summary (NOT LLM text)
  tests/unit/chat-tools.test.ts              ← unit tests for tool functions
  tests/integration/chat-api.test.ts         ← full conversation integration tests

MODIFY:
  src/app/(customer)/book/BookPageClient.tsx ← add <BookingChat /> alongside form
  package.json                               ← add @anthropic-ai/sdk
```

---

## Task 1: Install Anthropic SDK

**Files:**
- Modify: `package.json`

**Step 1: Install the SDK**

```bash
npm install @anthropic-ai/sdk
```

**Step 2: Verify it resolves**

```bash
node -e "require('@anthropic-ai/sdk'); console.log('ok')"
```
Expected: `ok`

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add @anthropic-ai/sdk"
```

---

## Task 2: Server-Side Google Places Autocomplete Route

The existing `LocationInput.tsx` uses browser-side `window.google.maps.places`. The chat backend runs server-side and cannot access browser APIs. We need a server-side proxy.

**Why not reuse LocationInput?** It's a React component that calls the browser Maps JS SDK loaded via `<script>` tag. The server has no DOM.

**What we use instead:** The Google Places New API (Text Search endpoint) via HTTP, authenticated with `GOOGLE_MAPS_SERVER_API_KEY`.

**Files:**
- Create: `src/app/api/places/autocomplete/route.ts`
- Test: `tests/unit/places-autocomplete.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/unit/places-autocomplete.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node-fetch'); // or global fetch

describe('POST /api/places/autocomplete', () => {
  it('returns 400 if query is missing', async () => {
    const { POST } = await import('@/app/api/places/autocomplete/route');
    const res = await POST(new Request('http://localhost/api/places/autocomplete', {
      method: 'POST',
      body: JSON.stringify({}),
    }));
    expect(res.status).toBe(400);
  });

  it('returns candidates with address and coordinates', async () => {
    // Mock global fetch to return a Places API response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{
          formatted_address: '44 Elm St, Westport, CT 06880, USA',
          geometry: { location: { lat: 41.141, lng: -73.357 } },
          place_id: 'ChIJabc123',
        }],
        status: 'OK',
      }),
    } as any);

    const { POST } = await import('@/app/api/places/autocomplete/route');
    const res = await POST(new Request('http://localhost/api/places/autocomplete', {
      method: 'POST',
      body: JSON.stringify({ query: '44 Elm Street Westport CT' }),
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.candidates[0].address).toBe('44 Elm St, Westport, CT 06880, USA');
    expect(body.candidates[0].coordinates.lat).toBeCloseTo(41.141);
    expect(body.candidates[0].placeId).toBe('ChIJabc123');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm run test:unit -- places-autocomplete
```
Expected: FAIL (module not found)

**Step 3: Implement the route**

```typescript
// src/app/api/places/autocomplete/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { enforceRateLimit } from '@/lib/security/rate-limit';

const requestSchema = z.object({
  query: z.string().min(3).max(256),
});

// Bias results toward Fairfield County + NYC metro area
const LOCATION_BIAS = 'rectangle:40.5,-74.5|42.0,-72.5';

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, {
    bucket: 'api:places:autocomplete',
    limit: 60,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const raw = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'query is required (3-256 chars)' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Maps API not configured' }, { status: 503 });
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
  url.searchParams.set('input', parsed.data.query);
  url.searchParams.set('inputtype', 'textquery');
  url.searchParams.set('fields', 'formatted_address,geometry,place_id');
  url.searchParams.set('locationbias', LOCATION_BIAS);
  url.searchParams.set('key', apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    return NextResponse.json({ error: 'Places API unavailable' }, { status: 503 });
  }

  const data = await response.json() as {
    candidates: Array<{
      formatted_address: string;
      geometry: { location: { lat: number; lng: number } };
      place_id: string;
    }>;
    status: string;
    error_message?: string;
  };

  if (data.status !== 'OK' || !data.candidates?.length) {
    return NextResponse.json({ candidates: [] });
  }

  const candidates = data.candidates.slice(0, 5).map(c => ({
    address: c.formatted_address,
    coordinates: { lat: c.geometry.location.lat, lng: c.geometry.location.lng },
    placeId: c.place_id,
  }));

  return NextResponse.json({ candidates });
}
```

**Step 4: Run tests**

```bash
npm run test:unit -- places-autocomplete
```
Expected: PASS

**Step 5: Commit**

```bash
git add src/app/api/places/autocomplete/route.ts tests/unit/places-autocomplete.test.ts
git commit -m "feat: add server-side Google Places autocomplete route for chat"
```

---

## Task 3: Chat Types

**Files:**
- Create: `src/lib/chat/chat-types.ts`

No test needed — pure TypeScript types.

**Step 1: Create the types file**

```typescript
// src/lib/chat/chat-types.ts

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

// Structured data the LLM collects. Populated progressively as tools return results.
// The frontend renders the ConfirmationCard from this — never from LLM text.
export interface BookingDraft {
  pickup?: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  dropoff?: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  pickupDateTime?: string; // ISO string, confirmed by user
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  quote?: {
    quoteId: string;
    fare: number;
    distanceMiles: number;
    durationMinutes: number;
    expiresAt: string;
  };
}

export interface ChatRequest {
  messages: ChatMessage[];
  draft: BookingDraft;
  userId?: string; // If logged in
}

export interface ChatResponse {
  message: string;            // LLM text to display
  draft: BookingDraft;        // Updated draft (passed back each turn)
  showConfirmation: boolean;  // True when all fields collected, prompt user to confirm
  bookingId?: string;         // Set after successful create_booking
}
```

**Step 2: Commit**

```bash
git add src/lib/chat/chat-types.ts
git commit -m "feat: add chat types"
```

---

## Task 4: Chat Tool Definitions

These are the functions the LLM calls. Each one calls an existing API route. **No business logic lives here.**

**Files:**
- Create: `src/lib/chat/chat-tools.ts`
- Test: `tests/unit/chat-tools.test.ts`

**Step 1: Write failing tests**

```typescript
// tests/unit/chat-tools.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// We test each tool function independently with mocked fetch
// so we verify the right endpoints are called with the right payloads

describe('resolveAddress', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('returns first candidate from places API', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{
          address: '44 Elm St, Westport, CT 06880',
          coordinates: { lat: 41.141, lng: -73.357 },
          placeId: 'ChIJtest',
        }],
      }),
    } as any);

    const { resolveAddress } = await import('@/lib/chat/chat-tools');
    const result = await resolveAddress('44 Elm Street Westport');

    expect(result.resolved).toBe(true);
    expect(result.address).toBe('44 Elm St, Westport, CT 06880');
    expect(result.coordinates.lat).toBeCloseTo(41.141);
  });

  it('returns resolved: false when no candidates', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [] }),
    } as any);

    const { resolveAddress } = await import('@/lib/chat/chat-tools');
    const result = await resolveAddress('asdfghjkl nowhere');
    expect(result.resolved).toBe(false);
  });
});

describe('checkAvailability', () => {
  it('calls check-availability and returns isAvailable + message', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        isAvailable: true,
        message: 'Time slot is available',
        suggestedTimeSlots: [],
      }),
    } as any);

    const { checkAvailability } = await import('@/lib/chat/chat-tools');
    const result = await checkAvailability('2026-03-10T06:00:00.000Z');

    expect(result.isAvailable).toBe(true);
    // Verify it called the right endpoint
    expect((global.fetch as any).mock.calls[0][0]).toContain('/api/booking/check-availability');
  });

  it('returns isAvailable: false with suggestedTimes when slot is taken', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        isAvailable: false,
        message: 'That time overlaps with an existing ride.',
        suggestedTimeSlots: ['08:00', '09:00'],
      }),
    } as any);

    const { checkAvailability } = await import('@/lib/chat/chat-tools');
    const result = await checkAvailability('2026-03-10T06:00:00.000Z');

    expect(result.isAvailable).toBe(false);
    expect(result.suggestedTimes).toEqual(['08:00', '09:00']);
  });
});

describe('getQuote', () => {
  it('returns fare and quoteId on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        quoteId: 'q_123',
        fare: 145,
        distanceMiles: 38.2,
        durationMinutes: 52,
        expiresAt: new Date(Date.now() + 15 * 60000).toISOString(),
        availabilityWarning: null,
      }),
    } as any);

    const { getQuote } = await import('@/lib/chat/chat-tools');
    const result = await getQuote({
      origin: '44 Elm St, Westport, CT 06880',
      destination: 'JFK Airport',
      pickupCoords: { lat: 41.141, lng: -73.357 },
      dropoffCoords: { lat: 40.641, lng: -73.778 },
      pickupTime: '2026-03-10T06:00:00.000Z',
    });

    expect(result.success).toBe(true);
    expect(result.fare).toBe(145);
    expect(result.quoteId).toBe('q_123');
  });

  it('returns success: false with error code when service area check fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: 'We only serve trips between Fairfield County and airports',
        code: 'MISSING_AIRPORT_ENDPOINT',
      }),
    } as any);

    const { getQuote } = await import('@/lib/chat/chat-tools');
    const result = await getQuote({
      origin: '44 Elm St, Westport, CT',
      destination: '100 Main St, Bridgeport, CT',
      pickupCoords: { lat: 41.141, lng: -73.357 },
      dropoffCoords: { lat: 41.167, lng: -73.200 },
      pickupTime: '2026-03-10T06:00:00.000Z',
    });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('MISSING_AIRPORT_ENDPOINT');
  });
});

describe('createBooking', () => {
  it('calls submit endpoint and returns bookingId', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, bookingId: 'FAC-2847', totalFare: 145, message: 'Booking confirmed' }),
    } as any);

    const { createBooking } = await import('@/lib/chat/chat-tools');
    const result = await createBooking({
      quoteId: 'q_123',
      fare: 145,
      customer: { name: 'Justin', email: 'j@test.com', phone: '2035550101' },
      trip: {
        pickup: { address: '44 Elm St, Westport, CT 06880', coordinates: { lat: 41.141, lng: -73.357 } },
        dropoff: { address: 'JFK Airport', coordinates: { lat: 40.641, lng: -73.778 } },
        pickupDateTime: '2026-03-10T06:00:00.000Z',
        fareType: 'personal',
      },
    });

    expect(result.success).toBe(true);
    expect(result.bookingId).toBe('FAC-2847');
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
npm run test:unit -- chat-tools
```
Expected: FAIL (module not found)

**Step 3: Implement chat-tools.ts**

```typescript
// src/lib/chat/chat-tools.ts
import Anthropic from '@anthropic-ai/sdk';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// ─── Tool: resolve_address ──────────────────────────────────────────────────

interface ResolveAddressResult {
  resolved: boolean;
  address?: string;
  coordinates?: { lat: number; lng: number };
  placeId?: string;
}

export async function resolveAddress(query: string): Promise<ResolveAddressResult> {
  const res = await fetch(`${BASE_URL}/api/places/autocomplete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  if (!data.candidates?.length) return { resolved: false };
  const top = data.candidates[0];
  return { resolved: true, address: top.address, coordinates: top.coordinates, placeId: top.placeId };
}

// ─── Tool: check_availability ───────────────────────────────────────────────

interface CheckAvailabilityResult {
  isAvailable: boolean;
  message: string;
  suggestedTimes: string[];
}

export async function checkAvailability(pickupDateTime: string): Promise<CheckAvailabilityResult> {
  const res = await fetch(`${BASE_URL}/api/booking/check-availability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pickupDateTime }),
  });
  const data = await res.json();
  return {
    isAvailable: data.isAvailable ?? false,
    message: data.message ?? '',
    suggestedTimes: data.suggestedTimeSlots ?? [],
  };
}

// ─── Tool: get_quote ────────────────────────────────────────────────────────

interface GetQuoteParams {
  origin: string;
  destination: string;
  pickupCoords: { lat: number; lng: number };
  dropoffCoords: { lat: number; lng: number };
  pickupTime: string; // ISO string
}

interface GetQuoteResult {
  success: boolean;
  quoteId?: string;
  fare?: number;
  distanceMiles?: number;
  durationMinutes?: number;
  expiresAt?: string;
  availabilityWarning?: string | null;
  suggestedTimes?: string[];
  errorCode?: string;
  errorMessage?: string;
}

export async function getQuote(params: GetQuoteParams): Promise<GetQuoteResult> {
  const res = await fetch(`${BASE_URL}/api/booking/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      origin: params.origin,
      destination: params.destination,
      pickupCoords: params.pickupCoords,
      dropoffCoords: params.dropoffCoords,
      pickupTime: params.pickupTime,
      fareType: 'personal',
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return { success: false, errorCode: data.code, errorMessage: data.error };
  }

  return {
    success: true,
    quoteId: data.quoteId,
    fare: data.fare,
    distanceMiles: data.distanceMiles,
    durationMinutes: data.durationMinutes,
    expiresAt: data.expiresAt,
    availabilityWarning: data.availabilityWarning ?? null,
    suggestedTimes: data.suggestedTimes ?? [],
  };
}

// ─── Tool: create_booking ───────────────────────────────────────────────────
// IMPORTANT: Only called after user explicitly confirms the ConfirmationCard.

interface CreateBookingParams {
  quoteId: string;
  fare: number;
  customer: { name: string; email: string; phone: string };
  trip: {
    pickup: { address: string; coordinates: { lat: number; lng: number } };
    dropoff: { address: string; coordinates: { lat: number; lng: number } };
    pickupDateTime: string;
    fareType: 'personal' | 'business';
  };
}

interface CreateBookingResult {
  success: boolean;
  bookingId?: string;
  totalFare?: number;
  errorMessage?: string;
}

export async function createBooking(params: CreateBookingParams): Promise<CreateBookingResult> {
  const res = await fetch(`${BASE_URL}/api/booking/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quoteId: params.quoteId,
      fare: params.fare,
      customer: { ...params.customer, smsOptIn: false },
      trip: params.trip,
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    return { success: false, errorMessage: data.error ?? 'Booking failed' };
  }

  return { success: true, bookingId: data.bookingId, totalFare: data.totalFare };
}

// ─── Anthropic Tool Definitions ─────────────────────────────────────────────
// These are passed to the Claude API. The descriptions tell the LLM when and
// how to call each tool. Be precise — the LLM reads these literally.

export const TOOL_DEFINITIONS: Anthropic.Tool[] = [
  {
    name: 'resolve_address',
    description:
      'Resolve a user-typed location string to a canonical address with coordinates. ' +
      'Call this whenever the user provides a pickup or dropoff location. ' +
      'Always confirm the returned canonical address with the user before proceeding.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The address or location the user typed, e.g. "44 Elm Street Westport" or "JFK"',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'check_availability',
    description:
      'Check if Gregg is available at a specific date and time. ' +
      'IMPORTANT: Always confirm the exact date and time with the user BEFORE calling this tool. ' +
      'For example, if user says "next Tuesday 6am", confirm "Did you mean Tuesday March 10th at 6:00 AM?" first.',
    input_schema: {
      type: 'object',
      properties: {
        pickupDateTime: {
          type: 'string',
          description: 'ISO 8601 datetime string, e.g. "2026-03-10T06:00:00.000Z"',
        },
      },
      required: ['pickupDateTime'],
    },
  },
  {
    name: 'get_quote',
    description:
      'Get a fare estimate and availability confirmation for a trip. ' +
      'Call this only after you have confirmed: (1) canonical pickup address with coordinates, ' +
      '(2) canonical dropoff address with coordinates, (3) exact pickup date/time confirmed by user. ' +
      'This also validates the service area — if it returns an error, relay the message to the user.',
    input_schema: {
      type: 'object',
      properties: {
        origin: { type: 'string', description: 'Canonical pickup address' },
        destination: { type: 'string', description: 'Canonical dropoff address' },
        pickupCoords: {
          type: 'object',
          properties: { lat: { type: 'number' }, lng: { type: 'number' } },
          required: ['lat', 'lng'],
        },
        dropoffCoords: {
          type: 'object',
          properties: { lat: { type: 'number' }, lng: { type: 'number' } },
          required: ['lat', 'lng'],
        },
        pickupTime: {
          type: 'string',
          description: 'ISO 8601 datetime string of confirmed pickup time',
        },
      },
      required: ['origin', 'destination', 'pickupCoords', 'dropoffCoords', 'pickupTime'],
    },
  },
  {
    name: 'create_booking',
    description:
      'Create the booking. ONLY call this after the user has explicitly confirmed the booking summary ' +
      '(said "yes", "confirm", "book it", etc. in response to the confirmation card). ' +
      'Never call this speculatively or before confirmation.',
    input_schema: {
      type: 'object',
      properties: {
        quoteId: { type: 'string' },
        fare: { type: 'number' },
        customer: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
          },
          required: ['name', 'email', 'phone'],
        },
        trip: {
          type: 'object',
          properties: {
            pickup: {
              type: 'object',
              properties: {
                address: { type: 'string' },
                coordinates: {
                  type: 'object',
                  properties: { lat: { type: 'number' }, lng: { type: 'number' } },
                  required: ['lat', 'lng'],
                },
              },
              required: ['address', 'coordinates'],
            },
            dropoff: {
              type: 'object',
              properties: {
                address: { type: 'string' },
                coordinates: {
                  type: 'object',
                  properties: { lat: { type: 'number' }, lng: { type: 'number' } },
                  required: ['lat', 'lng'],
                },
              },
              required: ['address', 'coordinates'],
            },
            pickupDateTime: { type: 'string', description: 'ISO 8601 datetime string' },
            fareType: { type: 'string', enum: ['personal', 'business'] },
          },
          required: ['pickup', 'dropoff', 'pickupDateTime', 'fareType'],
        },
      },
      required: ['quoteId', 'fare', 'customer', 'trip'],
    },
  },
];
```

**Step 4: Run tests**

```bash
npm run test:unit -- chat-tools
```
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/chat/chat-tools.ts tests/unit/chat-tools.test.ts
git commit -m "feat: add chat tool definitions wrapping existing booking APIs"
```

---

## Task 5: System Prompt

**Files:**
- Create: `src/lib/chat/chat-system-prompt.ts`

No separate test — verified through integration tests.

**Step 1: Create the system prompt**

```typescript
// src/lib/chat/chat-system-prompt.ts
import { BUSINESS_INFO } from '@/utils/constants';

export const CHAT_SYSTEM_PROMPT = `You are a friendly booking assistant for Fairfield Airport Cars,
a premium car service in Fairfield County, CT. Your only job is to help customers book rides.

## Your Capabilities
You can: book rides, answer questions about the booking.
You cannot: cancel bookings, check existing bookings, answer questions unrelated to booking.
For anything else, direct the user to ${BUSINESS_INFO.phone}.

## Service
- Driver: Gregg (one driver, single vehicle, personal service)
- Service area: Fairfield County, CT
- Valid airports: JFK, LGA, EWR, BDL (Bradley), HVN (Tweed), HPN (Westchester)
- Trips must be between a Fairfield County address AND an airport (no airport-to-airport, no local trips)
- Advance notice: at least 24 hours required
- Payment: Gregg collects payment after the ride

## Conversation Rules (follow exactly)

### Dates and Times
- NEVER assume or guess a date. If user says "next Tuesday", confirm: "Did you mean Tuesday, [full date]?"
- ALWAYS confirm the exact date and time before calling check_availability or get_quote
- Ask about AM/PM if ambiguous

### Addresses
- Call resolve_address for EVERY location the user provides
- Show the returned canonical address to the user and ask them to confirm
- If resolve_address returns resolved: false, ask the user to be more specific

### Availability
- Call check_availability before get_quote to give fast feedback
- If unavailable, show suggestedTimes and ask user to pick one
- If no suggestions, apologize and give Gregg's phone: ${BUSINESS_INFO.phone}

### Fare Quote
- Call get_quote only after confirmed: pickup address + coords, dropoff address + coords, exact datetime
- If get_quote returns an error code like MISSING_AIRPORT_ENDPOINT or OUT_OF_SERVICE_HARD:
  - Explain the limitation clearly
  - Give Gregg's phone: ${BUSINESS_INFO.phone}
  - Do not attempt to book

### Contact Information
- Ask for name, email, and phone
- If the user is logged in, their info may be pre-filled (check the draft object)

### Confirmation — CRITICAL
- Before calling create_booking, the frontend will show a ConfirmationCard with all details
- Ask the user to confirm: "Does everything look correct?"
- Only call create_booking when the user explicitly says yes (e.g. "yes", "confirm", "book it", "looks good")
- NEVER call create_booking based on implicit approval

### After Booking
- Tell the user their booking ID and that a confirmation email was sent
- That's it — the conversation is complete

## Tone
- Warm, efficient, professional
- Short responses — don't over-explain
- If you can say it in one sentence, use one sentence`;
```

**Step 2: Commit**

```bash
git add src/lib/chat/chat-system-prompt.ts
git commit -m "feat: add chat system prompt with business rules"
```

---

## Task 6: Chat API Route

**Files:**
- Create: `src/app/api/chat/route.ts`
- Test: `tests/integration/chat-api.test.ts`

**Step 1: Write failing integration tests**

```typescript
// tests/integration/chat-api.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// We mock the Anthropic SDK and tool functions to test the conversation handler
// without hitting real APIs

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn(),
    },
  })),
}));

vi.mock('@/lib/chat/chat-tools', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/chat/chat-tools')>();
  return {
    ...actual,
    resolveAddress: vi.fn(),
    checkAvailability: vi.fn(),
    getQuote: vi.fn(),
    createBooking: vi.fn(),
  };
});

describe('POST /api/chat', () => {
  it('returns 400 if messages array is missing', async () => {
    const { POST } = await import('@/app/api/chat/route');
    const res = await POST(new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({}),
    }));
    expect(res.status).toBe(400);
  });

  it('returns assistant message for simple greeting', async () => {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const mockClient = new (Anthropic as any)();
    mockClient.messages.create.mockResolvedValue({
      content: [{ type: 'text', text: "Hi! I'm here to help you book a ride. Where are you headed?" }],
      stop_reason: 'end_turn',
    });

    const { POST } = await import('@/app/api/chat/route');
    const res = await POST(new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        draft: {},
      }),
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toContain("book");
    expect(body.showConfirmation).toBe(false);
  });

  it('executes tool call loop: resolve_address called when LLM requests it', async () => {
    const { resolveAddress } = await import('@/lib/chat/chat-tools');
    (resolveAddress as any).mockResolvedValue({
      resolved: true,
      address: '44 Elm St, Westport, CT 06880',
      coordinates: { lat: 41.141, lng: -73.357 },
    });

    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const mockClient = new (Anthropic as any)();
    // First call: LLM requests tool use
    mockClient.messages.create
      .mockResolvedValueOnce({
        content: [{
          type: 'tool_use',
          id: 'tool_abc',
          name: 'resolve_address',
          input: { query: '44 Elm Street Westport' },
        }],
        stop_reason: 'tool_use',
      })
      // Second call: LLM responds with the tool result
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: 'I found: 44 Elm St, Westport, CT 06880. Is that correct?' }],
        stop_reason: 'end_turn',
      });

    const { POST } = await import('@/app/api/chat/route');
    const res = await POST(new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Pickup at 44 Elm Street Westport' }],
        draft: {},
      }),
    }));

    expect(res.status).toBe(200);
    expect(resolveAddress).toHaveBeenCalledWith('44 Elm Street Westport');
    const body = await res.json();
    expect(body.message).toContain('44 Elm St, Westport');
  });

  it('sets showConfirmation: true and populates draft when get_quote succeeds', async () => {
    // Test the full flow where all draft fields are populated after get_quote
    // This is the moment the frontend should show the ConfirmationCard
    const { getQuote } = await import('@/lib/chat/chat-tools');
    (getQuote as any).mockResolvedValue({
      success: true,
      quoteId: 'q_test',
      fare: 145,
      distanceMiles: 38.2,
      durationMinutes: 52,
      expiresAt: new Date(Date.now() + 15 * 60000).toISOString(),
      availabilityWarning: null,
    });

    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const mockClient = new (Anthropic as any)();
    mockClient.messages.create
      .mockResolvedValueOnce({
        content: [{ type: 'tool_use', id: 'tool_abc', name: 'get_quote', input: {
          origin: '44 Elm St, Westport, CT 06880',
          destination: 'JFK Airport',
          pickupCoords: { lat: 41.141, lng: -73.357 },
          dropoffCoords: { lat: 40.641, lng: -73.778 },
          pickupTime: '2026-03-10T06:00:00.000Z',
        }}],
        stop_reason: 'tool_use',
      })
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: 'The fare is $145. Does everything look correct?' }],
        stop_reason: 'end_turn',
      });

    const { POST } = await import('@/app/api/chat/route');
    const res = await POST(new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Yes' }],
        draft: {
          pickup: { address: '44 Elm St, Westport, CT 06880', coordinates: { lat: 41.141, lng: -73.357 } },
          dropoff: { address: 'JFK Airport', coordinates: { lat: 40.641, lng: -73.778 } },
          pickupDateTime: '2026-03-10T06:00:00.000Z',
          customer: { name: 'Justin', email: 'j@test.com', phone: '2035550101' },
        },
      }),
    }));

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.showConfirmation).toBe(true);
    expect(body.draft.quote?.quoteId).toBe('q_test');
    expect(body.draft.quote?.fare).toBe(145);
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
npm run test:integration -- chat-api
```
Expected: FAIL (module not found)

**Step 3: Implement /api/chat/route.ts**

```typescript
// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import { TOOL_DEFINITIONS, resolveAddress, checkAvailability, getQuote, createBooking } from '@/lib/chat/chat-tools';
import { CHAT_SYSTEM_PROMPT } from '@/lib/chat/chat-system-prompt';
import type { BookingDraft, ChatRequest, ChatResponse } from '@/lib/chat/chat-types';

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).min(1),
  draft: z.record(z.unknown()).default({}),
  userId: z.string().optional(),
});

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Execute a tool call and return the result as a string for the LLM
async function executeTool(
  name: string,
  input: Record<string, unknown>,
  draft: BookingDraft
): Promise<{ result: string; updatedDraft: BookingDraft }> {
  let result: unknown;
  const updatedDraft = { ...draft };

  switch (name) {
    case 'resolve_address': {
      result = await resolveAddress(input.query as string);
      break;
    }

    case 'check_availability': {
      result = await checkAvailability(input.pickupDateTime as string);
      break;
    }

    case 'get_quote': {
      const quoteResult = await getQuote(input as Parameters<typeof getQuote>[0]);
      result = quoteResult;
      // Update draft with quote data if successful
      if (quoteResult.success && quoteResult.quoteId) {
        updatedDraft.quote = {
          quoteId: quoteResult.quoteId,
          fare: quoteResult.fare!,
          distanceMiles: quoteResult.distanceMiles!,
          durationMinutes: quoteResult.durationMinutes!,
          expiresAt: quoteResult.expiresAt!,
        };
      }
      break;
    }

    case 'create_booking': {
      result = await createBooking(input as Parameters<typeof createBooking>[0]);
      break;
    }

    default:
      result = { error: `Unknown tool: ${name}` };
  }

  return { result: JSON.stringify(result), updatedDraft };
}

function draftIsComplete(draft: BookingDraft): boolean {
  return !!(
    draft.pickup?.address &&
    draft.pickup?.coordinates &&
    draft.dropoff?.address &&
    draft.dropoff?.coordinates &&
    draft.pickupDateTime &&
    draft.customer?.name &&
    draft.customer?.email &&
    draft.customer?.phone &&
    draft.quote?.quoteId
  );
}

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, {
    bucket: 'api:chat',
    limit: 30,
    windowMs: 60_000,
  });
  if (limited) return limited;

  const raw = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  let { messages, draft } = parsed.data as ChatRequest;
  let bookingId: string | undefined;

  // Convert our message format to Anthropic's format
  const anthropicMessages: Anthropic.MessageParam[] = messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  // Tool call loop (max 10 iterations to prevent runaway)
  let finalText = '';
  for (let i = 0; i < 10; i++) {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: CHAT_SYSTEM_PROMPT,
      tools: TOOL_DEFINITIONS,
      messages: anthropicMessages,
      temperature: 0.1,
    });

    if (response.stop_reason === 'end_turn') {
      // LLM returned a text response — we're done
      const textBlock = response.content.find(b => b.type === 'text');
      finalText = textBlock?.type === 'text' ? textBlock.text : '';
      break;
    }

    if (response.stop_reason === 'tool_use') {
      // Execute all tool calls, then feed results back to LLM
      const toolResultContent: Anthropic.ToolResultBlockParam[] = [];

      for (const block of response.content) {
        if (block.type !== 'tool_use') continue;
        const { result, updatedDraft } = await executeTool(
          block.name,
          block.input as Record<string, unknown>,
          draft
        );
        draft = updatedDraft;

        // Track booking creation
        if (block.name === 'create_booking') {
          const bookingResult = JSON.parse(result);
          if (bookingResult.success) bookingId = bookingResult.bookingId;
        }

        toolResultContent.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result,
        });
      }

      // Add LLM's tool call turn and our results to the message history
      anthropicMessages.push({ role: 'assistant', content: response.content });
      anthropicMessages.push({ role: 'user', content: toolResultContent });
    }
  }

  const responseBody: ChatResponse = {
    message: finalText,
    draft: draft as BookingDraft,
    showConfirmation: draftIsComplete(draft as BookingDraft) && !bookingId,
    bookingId,
  };

  return NextResponse.json(responseBody);
}
```

**Step 4: Run integration tests**

```bash
npm run test:integration -- chat-api
```
Expected: PASS

**Step 5: Run all tests to check for regressions**

```bash
npm run test:unit && npm run test:integration
```
Expected: all PASS

**Step 6: Commit**

```bash
git add src/app/api/chat/route.ts tests/integration/chat-api.test.ts
git commit -m "feat: add /api/chat route with Claude Haiku tool calling loop"
```

---

## Task 7: ConfirmationCard Component

This renders structured booking data collected from tool responses. It must never display data from LLM text.

**Files:**
- Create: `src/components/booking/ConfirmationCard.tsx`

**Step 1: Implement the component**

```typescript
// src/components/booking/ConfirmationCard.tsx
'use client';
import React from 'react';
import type { BookingDraft } from '@/lib/chat/chat-types';

interface ConfirmationCardProps {
  draft: BookingDraft;
  onConfirm: () => void;
  onEdit: () => void;
  isLoading?: boolean;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export function ConfirmationCard({ draft, onConfirm, onEdit, isLoading }: ConfirmationCardProps) {
  if (!draft.pickup || !draft.dropoff || !draft.pickupDateTime || !draft.customer || !draft.quote) {
    return null;
  }

  return (
    <div data-testid="confirmation-card" style={{
      border: '2px solid #2563eb', borderRadius: '12px',
      padding: '20px', margin: '16px 0', backgroundColor: '#eff6ff',
    }}>
      <h3 style={{ margin: '0 0 16px', color: '#1e40af' }}>Booking Summary</h3>
      <dl style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px 16px', margin: 0 }}>
        <dt style={{ fontWeight: 600, color: '#374151' }}>Pickup</dt>
        <dd style={{ margin: 0 }}>{draft.pickup.address}</dd>
        <dt style={{ fontWeight: 600, color: '#374151' }}>Dropoff</dt>
        <dd style={{ margin: 0 }}>{draft.dropoff.address}</dd>
        <dt style={{ fontWeight: 600, color: '#374151' }}>Date/Time</dt>
        <dd style={{ margin: 0 }}>{formatDateTime(draft.pickupDateTime)}</dd>
        <dt style={{ fontWeight: 600, color: '#374151' }}>Name</dt>
        <dd style={{ margin: 0 }}>{draft.customer.name}</dd>
        <dt style={{ fontWeight: 600, color: '#374151' }}>Email</dt>
        <dd style={{ margin: 0 }}>{draft.customer.email}</dd>
        <dt style={{ fontWeight: 600, color: '#374151' }}>Phone</dt>
        <dd style={{ margin: 0 }}>{draft.customer.phone}</dd>
        <dt style={{ fontWeight: 600, color: '#374151' }}>Price</dt>
        <dd style={{ margin: 0, fontWeight: 700, color: '#166534' }}>${draft.quote.fare}</dd>
      </dl>
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <button
          data-testid="confirm-booking-button"
          onClick={onConfirm}
          disabled={isLoading}
          style={{
            flex: 1, padding: '12px', backgroundColor: '#2563eb',
            color: 'white', border: 'none', borderRadius: '8px',
            fontSize: '16px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          {isLoading ? 'Booking...' : 'Confirm Booking'}
        </button>
        <button
          data-testid="edit-booking-button"
          onClick={onEdit}
          style={{
            padding: '12px 20px', backgroundColor: 'white',
            border: '2px solid #d1d5db', borderRadius: '8px',
            fontSize: '16px', cursor: 'pointer',
          }}
        >
          Edit
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/booking/ConfirmationCard.tsx
git commit -m "feat: add ConfirmationCard component (renders tool data, not LLM text)"
```

---

## Task 8: BookingChat Component

**Files:**
- Create: `src/components/booking/BookingChat.tsx`

**Step 1: Implement the component**

```typescript
// src/components/booking/BookingChat.tsx
'use client';
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, ChatResponse, BookingDraft } from '@/lib/chat/chat-types';
import { ConfirmationCard } from './ConfirmationCard';

const WELCOME_MESSAGE = "Hi! I'm here to help you book a ride with Gregg. Where are you headed?";

// Returning user detection
function getSavedContact(): { name?: string; email?: string; phone?: string } | null {
  try {
    const saved = localStorage.getItem('fac-chat-contact');
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

function saveContact(customer: { name: string; email: string; phone: string }) {
  try {
    localStorage.setItem('fac-chat-contact', JSON.stringify(customer));
  } catch { /* ignore */ }
}

export function BookingChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: WELCOME_MESSAGE },
  ]);
  const [draft, setDraft] = useState<BookingDraft>({});
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingId, setBookingId] = useState<string | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Offer to reuse saved contact on mount
  useEffect(() => {
    const saved = getSavedContact();
    if (saved?.name && saved?.email) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Welcome back, ${saved.name}! Should I use your saved contact info (${saved.email})?`,
      }]);
      setDraft(prev => ({ ...prev, customer: saved as BookingDraft['customer'] }));
    }
  }, []);

  const sendMessage = async (userText: string) => {
    const userMessage: ChatMessage = { role: 'user', content: userText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages, draft }),
      });

      if (!res.ok) throw new Error('Chat request failed');
      const data: ChatResponse = await res.json();

      setDraft(data.draft);
      setShowConfirmation(data.showConfirmation);

      if (data.bookingId) {
        setBookingId(data.bookingId);
        setShowConfirmation(false);
        // Save contact info for returning users
        if (data.draft.customer) saveContact(data.draft.customer);
      }

      if (data.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again or call Gregg directly.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    sendMessage('Yes, please confirm the booking.');
  };

  const handleEdit = () => {
    setShowConfirmation(false);
    setMessages(prev => [...prev, { role: 'assistant', content: 'Sure, what would you like to change?' }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
  };

  if (bookingId) {
    return (
      <div data-testid="booking-success" style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
        <h2>You&apos;re booked!</h2>
        <p>Booking ID: <strong>#{bookingId}</strong></p>
        <p>Check your email for confirmation details.</p>
      </div>
    );
  }

  return (
    <div data-testid="booking-chat" style={{ display: 'flex', flexDirection: 'column', height: '600px', maxWidth: '600px', margin: '0 auto', border: '1px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden' }}>
      {/* Message thread */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '80%',
            padding: '10px 14px',
            borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            backgroundColor: msg.role === 'user' ? '#2563eb' : '#f3f4f6',
            color: msg.role === 'user' ? 'white' : '#111827',
          }}>
            {msg.content}
          </div>
        ))}

        {/* Structured confirmation card — never from LLM text */}
        {showConfirmation && (
          <ConfirmationCard
            draft={draft}
            onConfirm={handleConfirm}
            onEdit={handleEdit}
            isLoading={isLoading}
          />
        )}

        {isLoading && (
          <div data-testid="loading-indicator" style={{ alignSelf: 'flex-start', color: '#6b7280', fontStyle: 'italic' }}>
            Gregg&apos;s assistant is thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', padding: '16px', borderTop: '1px solid #e5e7eb', gap: '8px' }}>
        <input
          data-testid="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          style={{ flex: 1, padding: '10px 14px', borderRadius: '24px', border: '1px solid #d1d5db', outline: 'none', fontSize: '15px' }}
        />
        <button
          data-testid="chat-send"
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '24px', cursor: 'pointer', fontWeight: 600 }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/booking/BookingChat.tsx
git commit -m "feat: add BookingChat component with localStorage returning-user detection"
```

---

## Task 9: Add Chat to the Book Page

Add `BookingChat` to the existing book page alongside the React form. Default it to visible; the form becomes a fallback link below it.

**Files:**
- Modify: `src/app/(customer)/book/BookPageClient.tsx`

**Step 1: Read current page first, then add the chat component**

Locate the area where `<BookingForm />` is rendered in `BookPageClient.tsx`. Add a tab or toggle above it:

```typescript
// Add at top of component, after existing imports:
import { BookingChat } from '@/components/booking/BookingChat';

// Add state:
const [useChat, setUseChat] = useState(true); // Chat is default

// In JSX, before the existing form:
<Stack spacing="md" align="center">
  <BookingChat />
  <button
    style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}
    onClick={() => setUseChat(false)}
  >
    Prefer a form instead?
  </button>
</Stack>
```

When `useChat` is false, render the existing `<BookingForm />`.

**Step 2: Run the dev server and verify manually**

```bash
npm run dev
```

Navigate to `http://localhost:3000/book`. You should see:
- The chat interface with the welcome message
- A "Prefer a form instead?" link below
- Clicking the link shows the original React form

**Step 3: Run all tests**

```bash
npm run test:unit && npm run test:integration
```
Expected: all PASS

**Step 4: Commit**

```bash
git add src/app/(customer)/book/BookPageClient.tsx
git commit -m "feat: add BookingChat to /book page alongside existing form"
```

---

## Task 10: Add ANTHROPIC_API_KEY to Environment

**Step 1: Verify the env var name is consistent**

```bash
grep -r "ANTHROPIC_API_KEY" src/
```
Expected: found in `src/app/api/chat/route.ts`

**Step 2: Add to .env.local (dev) and document it**

```bash
# In .env.local (never commit this file):
ANTHROPIC_API_KEY=sk-ant-...
```

**Step 3: Add to health check endpoint so it's visible in `/api/health`**

Find `src/app/api/health/booking-flow/route.ts` (or similar health route) and add:

```typescript
anthropicApiKey: !!process.env.ANTHROPIC_API_KEY,
```

**Step 4: Commit the health check update only** (never commit .env.local)

```bash
git add src/app/api/health/
git commit -m "feat: add ANTHROPIC_API_KEY to health check"
```

---

## Task 11: E2E Test — Full Chat Booking Flow

**Files:**
- Create: `tests/e2e/booking-chat.spec.ts`

**Step 1: Write the E2E test**

```typescript
// tests/e2e/booking-chat.spec.ts
// Requires: dev server running, emulators, ANTHROPIC_API_KEY set
// Run with: NEXT_PUBLIC_USE_EMULATORS=true npm run test:e2e:local -- booking-chat

import { test, expect } from '@playwright/test';

test.describe('BookingChat E2E', () => {
  test('completes a booking via chat from greeting to confirmation', async ({ page }) => {
    await page.goto('/book');

    // Chat should be visible by default
    await expect(page.getByTestId('booking-chat')).toBeVisible();

    // Initial greeting from assistant
    await expect(page.locator('[data-testid="booking-chat"]')).toContainText('Where are you headed');

    // User types a message
    await page.getByTestId('chat-input').fill('JFK from 44 Elm Street Westport next Monday at 6am');
    await page.getByTestId('chat-send').click();

    // Loading indicator appears
    await expect(page.getByTestId('loading-indicator')).toBeVisible();

    // Wait for assistant response (date confirmation)
    await expect(page.locator('[data-testid="booking-chat"]')).toContainText('Monday', { timeout: 30000 });

    // ... continue with date confirmation, address confirmation, contact info, confirmation card
    // Full flow depends on LLM responses — spot-check the confirmation card appears
  });

  test('shows form fallback when user clicks "Prefer a form"', async ({ page }) => {
    await page.goto('/book');
    await expect(page.getByTestId('booking-chat')).toBeVisible();

    await page.getByText('Prefer a form instead?').click();
    await expect(page.getByTestId('book-form-section')).toBeVisible();
  });
});
```

**Step 2: Run E2E with dev server**

```bash
npm run dev &
sleep 5
npm run test:e2e:critical -- booking-chat
```

**Step 3: Commit**

```bash
git add tests/e2e/booking-chat.spec.ts
git commit -m "test: add E2E test for BookingChat flow"
```

---

## Manual Verification Checklist

Before marking this feature ready for production traffic:

- [ ] Ambiguous date ("next Tuesday") → LLM asks for confirmation before calling check_availability
- [ ] Unavailable slot → LLM shows suggestedTimes, user picks one
- [ ] Address outside service area → LLM gives Gregg's phone, does not book
- [ ] Both endpoints are home addresses (no airport) → LLM explains, does not book
- [ ] Both endpoints are airports → LLM explains, does not book
- [ ] Returning user → localStorage pre-fill offered at chat open
- [ ] Confirmation card shows structured data (check network tab — it comes from get_quote, not LLM text)
- [ ] Clicking "Edit" on confirmation card lets user change something
- [ ] Clicking "Confirm Booking" calls create_booking and shows success state
- [ ] Gregg receives SMS + email on booking
- [ ] Customer receives confirmation email with booking ID
- [ ] Booking appears in admin dashboard
- [ ] React form still works (click "Prefer a form instead?")
- [ ] Chat handles network errors gracefully (friendly message, no stack trace)
- [ ] Rate limiter on /api/chat fires correctly after 30 req/min

---

## Environment Variables Required

| Variable | Where | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | `.env.local` + Vercel | Get from console.anthropic.com |
| `GOOGLE_MAPS_SERVER_API_KEY` | Already set | Used by new `/api/places/autocomplete` route |
| `NEXT_PUBLIC_BASE_URL` | `.env.local` | Needed for tool fetch calls in dev: `http://localhost:3000` |

---

**Plan complete and saved to `docs/plans/2026-03-04-llm-chat-booking.md`.**

**Two execution options:**

**1. Subagent-Driven (this session)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** — Open a new session in a worktree, use `superpowers:executing-plans`, batch execution with checkpoints

**Which approach?**
