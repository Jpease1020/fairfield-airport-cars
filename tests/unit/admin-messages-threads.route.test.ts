import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/utils/auth-server', () => ({
  requireAdmin: vi.fn().mockResolvedValue({ ok: true, auth: { uid: 'admin-1', role: 'admin' } }),
}));

vi.mock('@/lib/services/sms-thread-service', () => ({
  getThreads: vi.fn().mockResolvedValue([
    {
      id: 'thread_1',
      customerPhone: '+12035550123',
      customerName: 'Gregg Test',
      status: 'open',
      lastMessageAt: '2026-03-06T12:00:00.000Z',
      lastMessagePreview: 'Need pickup',
      unreadCount: 1,
      createdAt: '2026-03-06T11:00:00.000Z',
      updatedAt: '2026-03-06T12:00:00.000Z',
    },
  ]),
  getThread: vi.fn().mockResolvedValue({
    id: 'thread_1',
    customerPhone: '+12035550123',
    customerName: 'Gregg Test',
    status: 'open',
    lastMessageAt: '2026-03-06T12:00:00.000Z',
    lastMessagePreview: 'Need pickup',
    unreadCount: 1,
    createdAt: '2026-03-06T11:00:00.000Z',
    updatedAt: '2026-03-06T12:00:00.000Z',
  }),
  getThreadMessages: vi.fn().mockResolvedValue([
    {
      id: 'msg_1',
      threadId: 'thread_1',
      direction: 'inbound',
      senderType: 'customer',
      from: '+12035550123',
      to: '+16462216370',
      body: 'Need pickup',
      createdAt: '2026-03-06T12:00:00.000Z',
    },
  ]),
  markThreadRead: vi.fn().mockResolvedValue(undefined),
  updateThreadOnOutbound: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/services/twilio-service', () => ({
  sendSms: vi.fn().mockResolvedValue({ sid: 'SM_REPLY_123' }),
}));

import {
  getThreads,
  getThread,
  getThreadMessages,
  markThreadRead,
  updateThreadOnOutbound,
} from '@/lib/services/sms-thread-service';
import { sendSms } from '@/lib/services/twilio-service';

const mockGetThreads = getThreads as unknown as ReturnType<typeof vi.fn>;
const mockGetThread = getThread as unknown as ReturnType<typeof vi.fn>;
const mockGetThreadMessages = getThreadMessages as unknown as ReturnType<typeof vi.fn>;
const mockMarkThreadRead = markThreadRead as unknown as ReturnType<typeof vi.fn>;
const mockUpdateThreadOnOutbound = updateThreadOnOutbound as unknown as ReturnType<typeof vi.fn>;
const mockSendSms = sendSms as unknown as ReturnType<typeof vi.fn>;

let getThreadsRoute: typeof import('@/app/api/admin/messages/threads/route').GET;
let getThreadRoute: typeof import('@/app/api/admin/messages/threads/[threadId]/route').GET;
let readThreadRoute: typeof import('@/app/api/admin/messages/threads/[threadId]/read/route').POST;
let sendRoute: typeof import('@/app/api/admin/messages/send/route').POST;

beforeAll(async () => {
  ({ GET: getThreadsRoute } = await import('@/app/api/admin/messages/threads/route'));
  ({ GET: getThreadRoute } = await import('@/app/api/admin/messages/threads/[threadId]/route'));
  ({ POST: readThreadRoute } = await import('@/app/api/admin/messages/threads/[threadId]/read/route'));
  ({ POST: sendRoute } = await import('@/app/api/admin/messages/send/route'));
});

describe('admin SMS thread routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.VERCEL_ENV;
    process.env.SMS_INBOX_ENABLED = 'true';
    delete process.env.SMS_INBOX_PREVIEW_ENABLED;
    delete process.env.SMS_INBOX_PROD_ENABLED;
  });

  it('lists SMS threads', async () => {
    const response = await getThreadsRoute(
      new Request('http://localhost/api/admin/messages/threads?limit=10') as any
    );

    expect(response?.status).toBe(200);
    expect(mockGetThreads).toHaveBeenCalledWith(10);
  });

  it('returns thread detail and messages', async () => {
    const response = await getThreadRoute(
      new Request('http://localhost/api/admin/messages/threads/thread_1') as any,
      { params: Promise.resolve({ threadId: 'thread_1' }) }
    );

    expect(response?.status).toBe(200);
    expect(mockGetThread).toHaveBeenCalledWith('thread_1');
    expect(mockGetThreadMessages).toHaveBeenCalledWith('thread_1');
  });

  it('marks a thread as read', async () => {
    const response = await readThreadRoute(
      new Request('http://localhost/api/admin/messages/threads/thread_1/read', { method: 'POST' }) as any,
      { params: Promise.resolve({ threadId: 'thread_1' }) }
    );

    expect(response?.status).toBe(200);
    expect(mockMarkThreadRead).toHaveBeenCalledWith('thread_1');
  });

  it('sends a reply and updates thread metadata', async () => {
    const response = await sendRoute(
      new Request('http://localhost/api/admin/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId: 'thread_1', body: 'Yes, I can do that.' }),
      }) as any
    );

    expect(response?.status).toBe(200);
    expect(mockSendSms).toHaveBeenCalledWith({
      to: '+12035550123',
      body: 'Yes, I can do that.',
      threadId: 'thread_1',
      senderType: 'admin',
    });
    expect(mockUpdateThreadOnOutbound).toHaveBeenCalledWith('thread_1', 'Yes, I can do that.');
  });

  it('returns 404 when SMS inbox is disabled', async () => {
    process.env.SMS_INBOX_ENABLED = 'false';

    const response = await getThreadsRoute(
      new Request('http://localhost/api/admin/messages/threads?limit=10') as any
    );

    expect(response?.status).toBe(404);
    expect(mockGetThreads).not.toHaveBeenCalled();
  });
});
