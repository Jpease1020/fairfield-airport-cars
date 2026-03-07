import { getAdminDb } from '@/lib/utils/firebase-admin';

interface ThreadCandidate {
  threadId: string;
  status: 'open' | 'closed';
  updatedAt: number;
}

interface ThreadBackfillUpdate {
  messageId: string;
  threadId: string;
}

export interface SmsThreadBackfillResult {
  threadsLoaded: number;
  phonesWithThreads: number;
  unthreadedMessagesScanned: number;
  matchedMessages: number;
  unmatchedMessages: number;
  updatedMessages: number;
  duplicatePhones: Array<{ phone: string; count: number }>;
}

const THREADS_COLLECTION = 'smsThreads';
const MESSAGES_COLLECTION = 'smsMessages';

function normalizePhone(raw: unknown): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const digits = raw.replace(/[^\d+]/g, '');
  if (!digits) return null;
  if (digits.startsWith('+')) return digits;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return digits;
}

function toMillis(value: unknown): number {
  if (!value) return 0;
  if (value && typeof value === 'object' && 'toMillis' in value && typeof value.toMillis === 'function') {
    return value.toMillis();
  }
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().getTime();
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

async function commitUpdates(updates: ThreadBackfillUpdate[]): Promise<void> {
  const db = getAdminDb();
  const chunkSize = 400;

  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    const batch = db.batch();

    for (const update of chunk) {
      batch.update(db.collection(MESSAGES_COLLECTION).doc(update.messageId), {
        threadId: update.threadId,
      });
    }

    await batch.commit();
  }
}

export async function backfillSmsThreadIds(options?: {
  apply?: boolean;
  verbose?: boolean;
}): Promise<SmsThreadBackfillResult> {
  const apply = options?.apply === true;
  const verbose = options?.verbose === true;
  const db = getAdminDb();

  const [threadsSnapshot, unthreadedMessagesSnapshot] = await Promise.all([
    db.collection(THREADS_COLLECTION).get(),
    db.collection(MESSAGES_COLLECTION).where('threadId', '==', null).get(),
  ]);

  const threadsByPhone = new Map<string, ThreadCandidate>();
  const duplicatePhoneCounts = new Map<string, number>();

  for (const threadDoc of threadsSnapshot.docs) {
    const data = threadDoc.data();
    const phone = normalizePhone(data.customerPhone);
    if (!phone) continue;

    const candidate: ThreadCandidate = {
      threadId: threadDoc.id,
      status: data.status === 'closed' ? 'closed' : 'open',
      updatedAt: toMillis(data.updatedAt) || toMillis(data.lastMessageAt) || toMillis(data.createdAt),
    };

    const existing = threadsByPhone.get(phone);
    if (!existing) {
      threadsByPhone.set(phone, candidate);
      continue;
    }

    duplicatePhoneCounts.set(phone, (duplicatePhoneCounts.get(phone) || 1) + 1);

    const shouldReplace =
      (existing.status === 'closed' && candidate.status === 'open') ||
      (existing.status === candidate.status && candidate.updatedAt > existing.updatedAt);

    if (shouldReplace) {
      threadsByPhone.set(phone, candidate);
    }
  }

  const updates: ThreadBackfillUpdate[] = [];
  let unmatchedMessages = 0;

  for (const messageDoc of unthreadedMessagesSnapshot.docs) {
    const data = messageDoc.data();
    const from = normalizePhone(data.from);
    const to = normalizePhone(data.to);

    const matchedThread = (from && threadsByPhone.get(from)) || (to && threadsByPhone.get(to)) || null;

    if (!matchedThread) {
      unmatchedMessages += 1;
      if (verbose) {
        console.log(`No smsThread match for smsMessage ${messageDoc.id}: from=${data.from || ''} to=${data.to || ''}`);
      }
      continue;
    }

    updates.push({
      messageId: messageDoc.id,
      threadId: matchedThread.threadId,
    });
  }

  if (apply && updates.length > 0) {
    await commitUpdates(updates);
  }

  return {
    threadsLoaded: threadsSnapshot.size,
    phonesWithThreads: threadsByPhone.size,
    unthreadedMessagesScanned: unthreadedMessagesSnapshot.size,
    matchedMessages: updates.length,
    unmatchedMessages,
    updatedMessages: apply ? updates.length : 0,
    duplicatePhones: Array.from(duplicatePhoneCounts.entries()).map(([phone, count]) => ({
      phone,
      count,
    })),
  };
}
