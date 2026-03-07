import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/utils/auth-server', () => ({
  requireAdmin: vi.fn().mockResolvedValue({ ok: true, auth: { uid: 'admin-1', role: 'admin' } }),
}));

vi.mock('@/lib/services/sms-thread-backfill-service', () => ({
  backfillSmsThreadIds: vi.fn().mockResolvedValue({
    threadsLoaded: 3,
    phonesWithThreads: 2,
    unthreadedMessagesScanned: 5,
    matchedMessages: 4,
    unmatchedMessages: 1,
    updatedMessages: 4,
    duplicatePhones: [],
  }),
}));

import { backfillSmsThreadIds } from '@/lib/services/sms-thread-backfill-service';

const mockBackfillSmsThreadIds = backfillSmsThreadIds as unknown as ReturnType<typeof vi.fn>;

let postRoute: typeof import('@/app/api/admin/messages/backfill/route').POST;

beforeAll(async () => {
  ({ POST: postRoute } = await import('@/app/api/admin/messages/backfill/route'));
});

describe('admin SMS backfill route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('runs a dry run by default', async () => {
    const response = await postRoute(
      new Request('http://localhost/api/admin/messages/backfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }) as any
    );

    expect(response!.status).toBe(200);
    expect(mockBackfillSmsThreadIds).toHaveBeenCalledWith({ apply: false });
  });

  it('runs apply mode when requested', async () => {
    const response = await postRoute(
      new Request('http://localhost/api/admin/messages/backfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apply: true }),
      }) as any
    );

    expect(response!.status).toBe(200);
    expect(mockBackfillSmsThreadIds).toHaveBeenCalledWith({ apply: true });
  });
});
