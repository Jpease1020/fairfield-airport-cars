import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/utils/firebase-admin';

const THREADS_COLLECTION = 'smsThreads';
const MESSAGES_COLLECTION = 'smsMessages';

export interface SmsThread {
  id: string;
  customerPhone: string;
  customerName?: string | null;
  status: 'open' | 'closed';
  lastMessageAt: string | null;
  lastMessagePreview: string;
  unreadCount: number;
  lastInboundAt?: string | null;
  lastOutboundAt?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface SmsThreadMessage {
  id: string;
  threadId: string | null;
  direction: 'inbound' | 'outbound';
  senderType: 'customer' | 'admin' | 'system';
  from: string;
  to: string;
  body: string;
  createdAt: string | null;
  twilioMessageSid?: string | null;
}

const toIso = (value: unknown): string | null => {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  return typeof value === 'string' ? value : null;
};

const toPreview = (messageBody: string, maxLength = 80): string => messageBody.trim().slice(0, maxLength);

const mapThread = (id: string, raw: Record<string, unknown>): SmsThread => ({
  id,
  customerPhone: typeof raw.customerPhone === 'string' ? raw.customerPhone : '',
  customerName: typeof raw.customerName === 'string' ? raw.customerName : null,
  status: raw.status === 'closed' ? 'closed' : 'open',
  lastMessageAt: toIso(raw.lastMessageAt),
  lastMessagePreview: typeof raw.lastMessagePreview === 'string' ? raw.lastMessagePreview : '',
  unreadCount: typeof raw.unreadCount === 'number' ? raw.unreadCount : 0,
  lastInboundAt: toIso(raw.lastInboundAt),
  lastOutboundAt: toIso(raw.lastOutboundAt),
  createdAt: toIso(raw.createdAt),
  updatedAt: toIso(raw.updatedAt),
});

const mapMessage = (id: string, raw: Record<string, unknown>): SmsThreadMessage => ({
  id,
  threadId: typeof raw.threadId === 'string' ? raw.threadId : null,
  direction: raw.direction === 'outbound' ? 'outbound' : 'inbound',
  senderType:
    raw.senderType === 'admin' || raw.senderType === 'system' || raw.senderType === 'customer'
      ? raw.senderType
      : raw.direction === 'outbound'
        ? 'system'
        : 'customer',
  from: typeof raw.from === 'string' ? raw.from : '',
  to: typeof raw.to === 'string' ? raw.to : '',
  body: typeof raw.body === 'string' ? raw.body : '',
  createdAt: toIso(raw.createdAt),
  twilioMessageSid: typeof raw.twilioMessageSid === 'string' ? raw.twilioMessageSid : null,
});

export async function findOrCreateThread(
  customerPhone: string,
  customerName: string | null = null
): Promise<{ threadId: string; created: boolean }> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(THREADS_COLLECTION)
    .where('customerPhone', '==', customerPhone)
    .get();

  const existing = snapshot.docs.find(
    (doc: { data: () => Record<string, unknown> }) => doc.data()?.status !== 'closed'
  );
  if (existing) {
    return { threadId: existing.id, created: false };
  }

  const ref = await db.collection(THREADS_COLLECTION).add({
    customerPhone,
    customerName,
    status: 'open',
    lastMessageAt: FieldValue.serverTimestamp(),
    lastMessagePreview: '',
    unreadCount: 0,
    lastInboundAt: null,
    lastOutboundAt: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { threadId: ref.id, created: true };
}

export async function updateThreadOnInbound(threadId: string, messageBody: string): Promise<boolean> {
  const db = getAdminDb();
  const threadDoc = await db.collection(THREADS_COLLECTION).doc(threadId).get();
  const currentUnreadCount = Number(threadDoc.data()?.unreadCount ?? 0);

  await db.collection(THREADS_COLLECTION).doc(threadId).update({
    lastMessageAt: FieldValue.serverTimestamp(),
    lastMessagePreview: toPreview(messageBody),
    lastInboundAt: FieldValue.serverTimestamp(),
    unreadCount: FieldValue.increment(1),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return currentUnreadCount === 0;
}

export async function updateThreadOnOutbound(threadId: string, messageBody: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(THREADS_COLLECTION).doc(threadId).update({
    lastMessageAt: FieldValue.serverTimestamp(),
    lastMessagePreview: `You: ${toPreview(messageBody, 74)}`,
    lastOutboundAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function markThreadRead(threadId: string): Promise<void> {
  const db = getAdminDb();
  await db.collection(THREADS_COLLECTION).doc(threadId).update({
    unreadCount: 0,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function getThreads(limit = 100): Promise<SmsThread[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(THREADS_COLLECTION)
    .orderBy('lastMessageAt', 'desc')
    .limit(Math.min(limit, 200))
    .get();

  return snapshot.docs.map((doc: { id: string; data: () => Record<string, unknown> }) =>
    mapThread(doc.id, doc.data() as Record<string, unknown>)
  );
}

export async function getThread(threadId: string): Promise<SmsThread | null> {
  const db = getAdminDb();
  const doc = await db.collection(THREADS_COLLECTION).doc(threadId).get();
  if (!doc.exists) return null;
  return mapThread(doc.id, doc.data() as Record<string, unknown>);
}

export async function getThreadMessages(threadId: string): Promise<SmsThreadMessage[]> {
  const db = getAdminDb();
  const snapshot = await db
    .collection(MESSAGES_COLLECTION)
    .where('threadId', '==', threadId)
    .get();

  return snapshot.docs
    .map((doc: { id: string; data: () => Record<string, unknown> }) =>
      mapMessage(doc.id, doc.data() as Record<string, unknown>)
    )
    .sort((a: SmsThreadMessage, b: SmsThreadMessage) => {
      if (!a.createdAt && !b.createdAt) return 0;
      if (!a.createdAt) return -1;
      if (!b.createdAt) return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
}
