import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAdminDb } from '@/lib/utils/firebase-admin';

const threadQueryGet = vi.fn();
const threadAdd = vi.fn();
const threadDocGet = vi.fn();
const threadDocUpdate = vi.fn();
const threadListGet = vi.fn();
const messageQueryGet = vi.fn();

vi.mock('@/lib/utils/firebase-admin', () => ({
  getAdminDb: vi.fn(() => ({
    collection: vi.fn((name: string) => {
      if (name === 'smsThreads') {
        return {
          where: vi.fn(() => ({
            get: threadQueryGet,
          })),
          add: threadAdd,
          doc: vi.fn(() => ({
            get: threadDocGet,
            update: threadDocUpdate,
          })),
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => ({
              get: threadListGet,
            })),
          })),
        };
      }

      if (name === 'smsMessages') {
        return {
          where: vi.fn(() => ({
            get: messageQueryGet,
          })),
        };
      }

      throw new Error(`Unexpected collection: ${name}`);
    }),
  })),
}));

vi.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    serverTimestamp: () => ({ __type: 'serverTimestamp' }),
    increment: (amount: number) => ({ __type: 'increment', amount }),
  },
}));

describe('sms-thread-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const mockGetAdminDb = getAdminDb as unknown as ReturnType<typeof vi.fn>;
    mockGetAdminDb.mockReturnValue({
      collection: vi.fn((name: string) => {
        if (name === 'smsThreads') {
          return {
            where: vi.fn(() => ({
              get: threadQueryGet,
            })),
            add: threadAdd,
            doc: vi.fn(() => ({
              get: threadDocGet,
              update: threadDocUpdate,
            })),
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => ({
                get: threadListGet,
              })),
            })),
          };
        }

        if (name === 'smsMessages') {
          return {
            where: vi.fn(() => ({
              get: messageQueryGet,
            })),
          };
        }

        throw new Error(`Unexpected collection: ${name}`);
      }),
    });
  });

  it('returns an existing open thread for the phone number', async () => {
    threadQueryGet.mockResolvedValue({
      docs: [
        {
          id: 'thread_existing',
          data: () => ({ customerPhone: '+12035550123', status: 'open' }),
        },
      ],
    });

    const { findOrCreateThread } = await import('@/lib/services/sms-thread-service');
    const result = await findOrCreateThread('+12035550123');

    expect(result).toEqual({ threadId: 'thread_existing', created: false });
    expect(threadAdd).not.toHaveBeenCalled();
  });

  it('creates a new thread when none exists', async () => {
    threadQueryGet.mockResolvedValue({ docs: [] });
    threadAdd.mockResolvedValue({ id: 'thread_new' });

    const { findOrCreateThread } = await import('@/lib/services/sms-thread-service');
    const result = await findOrCreateThread('+12035550123', 'Gregg Test');

    expect(result).toEqual({ threadId: 'thread_new', created: true });
    expect(threadAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        customerPhone: '+12035550123',
        customerName: 'Gregg Test',
        status: 'open',
        unreadCount: 0,
      })
    );
  });

  it('updates inbound thread metadata, increments unread count, and returns true for first unread message', async () => {
    threadDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ unreadCount: 0 }),
    });

    const { updateThreadOnInbound } = await import('@/lib/services/sms-thread-service');
    const shouldNotifyAdmin = await updateThreadOnInbound('thread_123', 'Can you pick me up at JFK tomorrow?');

    expect(threadDocUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        lastMessagePreview: 'Can you pick me up at JFK tomorrow?',
        unreadCount: { __type: 'increment', amount: 1 },
      })
    );
    expect(shouldNotifyAdmin).toBe(true);
  });

  it('suppresses repeated admin notifications when thread already has unread messages', async () => {
    threadDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ unreadCount: 2 }),
    });

    const { updateThreadOnInbound } = await import('@/lib/services/sms-thread-service');
    const shouldNotifyAdmin = await updateThreadOnInbound('thread_123', 'Following up on my last message');

    expect(shouldNotifyAdmin).toBe(false);
  });

  it('marks a thread read by resetting unread count', async () => {
    const { markThreadRead } = await import('@/lib/services/sms-thread-service');
    await markThreadRead('thread_123');

    expect(threadDocUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        unreadCount: 0,
      })
    );
  });

  it('maps thread detail and messages into serializable payloads', async () => {
    threadDocGet.mockResolvedValue({
      exists: true,
      id: 'thread_123',
      data: () => ({
        customerPhone: '+12035550123',
        customerName: 'Gregg Test',
        status: 'open',
        lastMessageAt: { toDate: () => new Date('2026-03-06T12:00:00.000Z') },
        lastMessagePreview: 'Latest message',
        unreadCount: 2,
        createdAt: { toDate: () => new Date('2026-03-06T11:00:00.000Z') },
        updatedAt: { toDate: () => new Date('2026-03-06T12:00:00.000Z') },
      }),
    });
    messageQueryGet.mockResolvedValue({
      docs: [
        {
          id: 'msg_1',
          data: () => ({
            threadId: 'thread_123',
            direction: 'inbound',
            senderType: 'customer',
            from: '+12035550123',
            to: '+16462216370',
            body: 'Hello',
            createdAt: { toDate: () => new Date('2026-03-06T11:59:00.000Z') },
          }),
        },
      ],
    });

    const { getThread, getThreadMessages } = await import('@/lib/services/sms-thread-service');
    const thread = await getThread('thread_123');
    const messages = await getThreadMessages('thread_123');

    expect(thread?.customerPhone).toBe('+12035550123');
    expect(thread?.lastMessageAt).toBe('2026-03-06T12:00:00.000Z');
    expect(messages[0]).toEqual(
      expect.objectContaining({
        id: 'msg_1',
        threadId: 'thread_123',
        senderType: 'customer',
        createdAt: '2026-03-06T11:59:00.000Z',
      })
    );
  });
});
