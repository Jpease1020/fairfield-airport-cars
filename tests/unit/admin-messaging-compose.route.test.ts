import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextResponse } from 'next/server';

vi.mock('@/lib/utils/auth-server', () => ({
  requireAdmin: vi.fn().mockResolvedValue({ ok: true, auth: { uid: 'admin-1', role: 'admin' } }),
}));

vi.mock('@/lib/services/sms-thread-service', () => ({
  findOrCreateThread: vi.fn().mockResolvedValue({ threadId: 'thread_1', created: true }),
}));

vi.mock('@/lib/services/sms-campaign-service', () => ({
  getContactDirectory: vi.fn().mockResolvedValue({
    scannedBookings: 2,
    contacts: [
      { name: 'Opted In', phone: '+12035551234', optedIn: true, lastBookingDate: '2026-03-03T12:00:00.000Z' },
      { name: 'Not Opted In', phone: '+12035550000', optedIn: false, lastBookingDate: null },
    ],
  }),
  sendSmsToList: vi.fn().mockResolvedValue({ total: 2, successful: 2, failed: 0, results: [] }),
}));

import { findOrCreateThread } from '@/lib/services/sms-thread-service';
import { getContactDirectory, sendSmsToList } from '@/lib/services/sms-campaign-service';

const mockFindOrCreateThread = findOrCreateThread as unknown as ReturnType<typeof vi.fn>;
const mockGetContactDirectory = getContactDirectory as unknown as ReturnType<typeof vi.fn>;
const mockSendSmsToList = sendSmsToList as unknown as ReturnType<typeof vi.fn>;

let findOrCreateRoute: typeof import('@/app/api/admin/messages/threads/find-or-create/route').POST;
let contactsRoute: typeof import('@/app/api/admin/sms-campaign/contacts/route').GET;
let sendToListRoute: typeof import('@/app/api/admin/sms-campaign/send-to-list/route').POST;

beforeAll(async () => {
  ({ POST: findOrCreateRoute } = await import('@/app/api/admin/messages/threads/find-or-create/route'));
  ({ GET: contactsRoute } = await import('@/app/api/admin/sms-campaign/contacts/route'));
  ({ POST: sendToListRoute } = await import('@/app/api/admin/sms-campaign/send-to-list/route'));
});

// Route handlers always return a NextResponse at runtime; the dynamic import type is loose.
const asResponse = (value: NextResponse | undefined): NextResponse => value as NextResponse;

describe('admin messaging compose routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalizes the phone number and finds or creates a thread', async () => {
    const response = asResponse(
      await findOrCreateRoute(
        new Request('http://localhost/api/admin/messages/threads/find-or-create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: '(203) 555-1234', name: 'Jane Doe' }),
        }) as any
      )
    );

    expect(response.status).toBe(200);
    expect(mockFindOrCreateThread).toHaveBeenCalledWith('+12035551234', 'Jane Doe');
    const payload = await response.json();
    expect(payload).toEqual({ threadId: 'thread_1', created: true });
  });

  it('rejects an invalid phone number on find-or-create', async () => {
    const response = asResponse(
      await findOrCreateRoute(
        new Request('http://localhost/api/admin/messages/threads/find-or-create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: 'not-a-phone' }),
        }) as any
      )
    );

    expect(response.status).toBe(400);
    expect(mockFindOrCreateThread).not.toHaveBeenCalled();
  });

  it('returns the full contact directory including non-opted-in contacts', async () => {
    const response = asResponse(
      await contactsRoute(new Request('http://localhost/api/admin/sms-campaign/contacts') as any)
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.contacts).toHaveLength(2);
    expect(payload.contacts.some((c: { optedIn: boolean }) => c.optedIn === false)).toBe(true);
    expect(mockGetContactDirectory).toHaveBeenCalled();
  });

  it('sends to an explicit recipient list regardless of opt-in status', async () => {
    const response = asResponse(
      await sendToListRoute(
        new Request('http://localhost/api/admin/sms-campaign/send-to-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipients: [
              { phone: '+12035551234', name: 'Opted In' },
              { phone: '+12035550000', name: 'Not Opted In' },
            ],
            messageTemplate: 'Hey {{name}}, quick update from Fairfield Airport Cars.',
          }),
        }) as any
      )
    );

    expect(response.status).toBe(200);
    expect(mockSendSmsToList).toHaveBeenCalledWith(
      [
        { phone: '+12035551234', name: 'Opted In' },
        { phone: '+12035550000', name: 'Not Opted In' },
      ],
      'Hey {{name}}, quick update from Fairfield Airport Cars.'
    );
  });

  it('does not send when dryRun is true', async () => {
    const response = asResponse(
      await sendToListRoute(
        new Request('http://localhost/api/admin/sms-campaign/send-to-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipients: [{ phone: '+12035551234', name: 'Opted In' }],
            messageTemplate: 'Test',
            dryRun: true,
          }),
        }) as any
      )
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual({ dryRun: true, recipientCount: 1 });
    expect(mockSendSmsToList).not.toHaveBeenCalled();
  });
});
