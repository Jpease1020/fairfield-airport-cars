import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildConfirmationSummary,
  hashConfirmationSummary,
  issueConfirmationToken,
} from '@/lib/chat/confirmation-token';

const providerGenerate = vi.fn();
const getLlmProvider = vi.fn(() => ({ generate: providerGenerate }));

const resolveAddress = vi.fn();
const checkAvailability = vi.fn();
const getQuote = vi.fn();
const validateTripDetails = vi.fn();
const validateContactInfo = vi.fn();
const createBooking = vi.fn();
const handoffToHuman = vi.fn();
const nonceCreate = vi.fn();
const getAdminDb = vi.fn();

vi.mock('@/lib/chat/llm-provider', () => ({
  getLlmProvider,
}));

vi.mock('@/lib/chat/chat-tools', () => ({
  CHAT_TOOL_DEFINITIONS: [
    {
      name: 'validate_contact_info',
      description: 'Validate contact information',
      inputSchema: {
        type: 'object',
        properties: {
          customer: { type: 'object' },
        },
        required: ['customer'],
      },
    },
  ],
  resolveAddress,
  checkAvailability,
  getQuote,
  validateTripDetails,
  validateContactInfo,
  createBooking,
  handoffToHuman,
}));

vi.mock('@/lib/utils/firebase-admin', () => ({
  getAdminDb,
}));

function buildRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/chat/booking-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/chat/booking-assistant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CHAT_BOOKING_ENABLED = 'true';
    process.env.CHAT_BOOKING_PREVIEW_ENABLED = 'false';
    process.env.CHAT_BOOKING_PROD_ENABLED = 'false';
    process.env.AUTH_SESSION_SECRET = 'test-secret';
    process.env.VERCEL_ENV = 'development';

    nonceCreate.mockResolvedValue(undefined);
    getAdminDb.mockReturnValue({
      collection: vi.fn((name: string) => {
        if (name === 'chatConfirmationNonces') {
          return {
            doc: vi.fn(() => ({
              create: nonceCreate,
            })),
          };
        }
        return {
          doc: vi.fn(() => ({
            create: vi.fn().mockResolvedValue(undefined),
          })),
        };
      }),
    });

    validateTripDetails.mockResolvedValue({ valid: true, errors: [], fieldErrors: {} });
    validateContactInfo.mockResolvedValue({ valid: true, errors: [], fieldErrors: {} });
    createBooking.mockResolvedValue({ success: true, bookingId: 'FAC-9001', totalFare: 145 });
    handoffToHuman.mockResolvedValue({ handoff: true, reason: 'manual', phone: '(646) 221-6370' });
  });

  it('returns 404 when chat feature flag is disabled', async () => {
    process.env.CHAT_BOOKING_ENABLED = 'false';

    const { POST } = await import('@/app/api/chat/booking-assistant/route');
    const response = await POST(
      buildRequest({
        messages: [{ role: 'user', content: 'hello' }],
        draft: {},
      })
    );

    expect(response.status).toBe(404);
  });

  it('returns 404 in production unless CHAT_BOOKING_PROD_ENABLED is true', async () => {
    process.env.VERCEL_ENV = 'production';
    process.env.CHAT_BOOKING_ENABLED = 'true';
    process.env.CHAT_BOOKING_PROD_ENABLED = 'false';

    const { POST } = await import('@/app/api/chat/booking-assistant/route');
    const response = await POST(
      buildRequest({
        messages: [{ role: 'user', content: 'hello' }],
        draft: {},
      })
    );

    expect(response.status).toBe(404);
  });

  it('allows chat in production only when CHAT_BOOKING_PROD_ENABLED is true', async () => {
    process.env.VERCEL_ENV = 'production';
    process.env.CHAT_BOOKING_PROD_ENABLED = 'true';

    providerGenerate.mockResolvedValueOnce({
      stopReason: 'end_turn',
      content: [{ type: 'text', text: 'How can I help with your booking?' }],
    });

    const { POST } = await import('@/app/api/chat/booking-assistant/route');
    const response = await POST(
      buildRequest({
        messages: [{ role: 'user', content: 'hello' }],
        draft: {},
      })
    );

    expect(response.status).toBe(200);
  });

  it('returns 400 for invalid payload', async () => {
    const { POST } = await import('@/app/api/chat/booking-assistant/route');
    const response = await POST(
      buildRequest({
        messages: [],
      })
    );

    expect(response.status).toBe(400);
  });

  it('executes tool loop and returns assistant message', async () => {
    providerGenerate
      .mockResolvedValueOnce({
        stopReason: 'tool_use',
        content: [
          {
            type: 'tool_use',
            id: 'tool_1',
            name: 'validate_contact_info',
            input: {
              customer: {
                name: 'Justin',
                email: 'justin@example.com',
                phone: '2035550101',
              },
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        stopReason: 'end_turn',
        content: [{ type: 'text', text: 'Thanks, what is your pickup address?' }],
      });

    const { POST } = await import('@/app/api/chat/booking-assistant/route');
    const response = await POST(
      buildRequest({
        messages: [{ role: 'user', content: 'My name is Justin, email justin@example.com' }],
        draft: {},
      })
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(validateContactInfo).toHaveBeenCalledTimes(1);
    expect(payload.message).toContain('pickup address');
    expect(payload.draft.customer.name).toBe('Justin');
  });

  it('books successfully when confirmation token is valid', async () => {
    const readyDraft = {
      pickup: { address: '44 Elm St, Westport, CT', coordinates: { lat: 41.1, lng: -73.2 } },
      dropoff: { address: 'JFK Airport', coordinates: { lat: 40.6, lng: -73.7 } },
      pickupDateTime: '2026-03-12T12:00:00.000Z',
      fareType: 'personal' as const,
      customer: { name: 'Justin', email: 'justin@example.com', phone: '2035550101' },
      quote: {
        quoteId: 'q1',
        fare: 145,
        distanceMiles: 32,
        durationMinutes: 55,
        expiresAt: '2026-03-12T11:00:00.000Z',
      },
    };

    const summary = buildConfirmationSummary(readyDraft);
    const hash = hashConfirmationSummary(summary!);
    const token = issueConfirmationToken({ summaryHash: hash, now: new Date(), ttlSeconds: 600 });

    const { POST } = await import('@/app/api/chat/booking-assistant/route');
    const response = await POST(
      buildRequest({
        messages: [{ role: 'user', content: 'confirm' }],
        draft: readyDraft,
        confirm: {
          accepted: true,
          token: token.token,
          summaryHash: hash,
        },
      })
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(createBooking).toHaveBeenCalledTimes(1);
    expect(payload.bookingId).toBe('FAC-9001');
  });

  it('blocks booking when confirmation token is invalid', async () => {
    const readyDraft = {
      pickup: { address: '44 Elm St, Westport, CT', coordinates: { lat: 41.1, lng: -73.2 } },
      dropoff: { address: 'JFK Airport', coordinates: { lat: 40.6, lng: -73.7 } },
      pickupDateTime: '2026-03-12T12:00:00.000Z',
      fareType: 'personal' as const,
      customer: { name: 'Justin', email: 'justin@example.com', phone: '2035550101' },
      quote: {
        quoteId: 'q1',
        fare: 145,
        distanceMiles: 32,
        durationMinutes: 55,
        expiresAt: '2026-03-12T11:00:00.000Z',
      },
    };

    const summary = buildConfirmationSummary(readyDraft);
    const hash = hashConfirmationSummary(summary!);

    const { POST } = await import('@/app/api/chat/booking-assistant/route');
    const response = await POST(
      buildRequest({
        messages: [{ role: 'user', content: 'confirm' }],
        draft: readyDraft,
        confirm: {
          accepted: true,
          token: 'invalid-token',
          summaryHash: hash,
        },
      })
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(createBooking).not.toHaveBeenCalled();
    expect(payload.showConfirmation).toBe(true);
  });

  it('blocks booking when confirmation token nonce was already consumed', async () => {
    const readyDraft = {
      pickup: { address: '44 Elm St, Westport, CT', coordinates: { lat: 41.1, lng: -73.2 } },
      dropoff: { address: 'JFK Airport', coordinates: { lat: 40.6, lng: -73.7 } },
      pickupDateTime: '2026-03-12T12:00:00.000Z',
      fareType: 'personal' as const,
      customer: { name: 'Justin', email: 'justin@example.com', phone: '2035550101' },
      quote: {
        quoteId: 'q1',
        fare: 145,
        distanceMiles: 32,
        durationMinutes: 55,
        expiresAt: '2026-03-12T11:00:00.000Z',
      },
    };

    const summary = buildConfirmationSummary(readyDraft);
    const hash = hashConfirmationSummary(summary!);
    const token = issueConfirmationToken({ summaryHash: hash, now: new Date(), ttlSeconds: 600 });

    nonceCreate.mockRejectedValueOnce(new Error('ALREADY EXISTS'));

    const { POST } = await import('@/app/api/chat/booking-assistant/route');
    const response = await POST(
      buildRequest({
        messages: [{ role: 'user', content: 'confirm' }],
        draft: readyDraft,
        confirm: {
          accepted: true,
          token: token.token,
          summaryHash: hash,
        },
      })
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(createBooking).not.toHaveBeenCalled();
    expect(payload.showConfirmation).toBe(true);
    expect(payload.message).toContain('already used');
  });
});
