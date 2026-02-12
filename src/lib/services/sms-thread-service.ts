/**
 * SMS Thread Service
 *
 * Manages SMS conversation threads between customers and Gregg.
 * Used for the SMS proxy system where:
 * 1. Customer texts the business Twilio number
 * 2. Gregg receives it and can reply via a web UI
 * 3. Customer sees the reply from the business number
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/utils/firebase';

// ===== TYPES =====

export interface SmsMessage {
  id: string;
  direction: 'inbound' | 'outbound'; // inbound = customer -> business, outbound = business -> customer
  body: string;
  timestamp: Date;
  twilioSid?: string;
}

export interface SmsThread {
  id: string; // Firestore document ID
  customerPhone: string; // E.164 format
  customerName?: string; // Optional, filled from booking data if available
  lastMessagePreview: string;
  lastMessageAt: Date;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SmsThreadWithMessages extends SmsThread {
  messages: SmsMessage[];
}

// ===== CONSTANTS =====

const THREADS_COLLECTION = 'smsThreads';
const MESSAGES_SUBCOLLECTION = 'messages';

// ===== HELPER FUNCTIONS =====

/**
 * Normalize phone number to E.164 format
 */
export function normalizePhoneE164(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`;
  }

  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return `+${digitsOnly}`;
  }

  // Already has country code or non-US
  if (phone.startsWith('+')) {
    return phone;
  }

  return `+${digitsOnly}`;
}

/**
 * Generate a thread ID from customer phone number
 * Uses a hash of the E.164 number for consistency
 */
export function generateThreadId(customerPhone: string): string {
  const normalized = normalizePhoneE164(customerPhone);
  // Use last 10 digits as thread ID (simple, readable)
  return normalized.replace(/\D/g, '').slice(-10);
}

// ===== THREAD OPERATIONS =====

/**
 * Get or create a thread for a customer phone number
 */
export async function getOrCreateThread(
  customerPhone: string,
  customerName?: string
): Promise<SmsThread> {
  const threadId = generateThreadId(customerPhone);
  const normalizedPhone = normalizePhoneE164(customerPhone);

  const threadRef = doc(db, THREADS_COLLECTION, threadId);
  const threadSnap = await getDoc(threadRef);

  if (threadSnap.exists()) {
    const data = threadSnap.data();

    // Update customer name if provided and not already set
    if (customerName && !data.customerName) {
      await updateDoc(threadRef, {
        customerName,
        updatedAt: serverTimestamp()
      });
    }

    return {
      id: threadSnap.id,
      customerPhone: data.customerPhone,
      customerName: customerName || data.customerName,
      lastMessagePreview: data.lastMessagePreview || '',
      lastMessageAt: data.lastMessageAt?.toDate() || new Date(),
      messageCount: data.messageCount || 0,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }

  // Create new thread
  const now = new Date();
  const newThread: Omit<SmsThread, 'id'> = {
    customerPhone: normalizedPhone,
    customerName,
    lastMessagePreview: '',
    lastMessageAt: now,
    messageCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(threadRef, {
    ...newThread,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessageAt: serverTimestamp(),
  });

  return {
    id: threadId,
    ...newThread,
  };
}

/**
 * Get a thread by ID
 */
export async function getThread(threadId: string): Promise<SmsThread | null> {
  const threadRef = doc(db, THREADS_COLLECTION, threadId);
  const threadSnap = await getDoc(threadRef);

  if (!threadSnap.exists()) {
    return null;
  }

  const data = threadSnap.data();
  return {
    id: threadSnap.id,
    customerPhone: data.customerPhone,
    customerName: data.customerName,
    lastMessagePreview: data.lastMessagePreview || '',
    lastMessageAt: data.lastMessageAt?.toDate() || new Date(),
    messageCount: data.messageCount || 0,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

/**
 * Get recent threads (for admin UI if needed later)
 */
export async function getRecentThreads(maxResults: number = 20): Promise<SmsThread[]> {
  const threadsRef = collection(db, THREADS_COLLECTION);
  const q = query(
    threadsRef,
    orderBy('lastMessageAt', 'desc'),
    limit(maxResults)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      customerPhone: data.customerPhone,
      customerName: data.customerName,
      lastMessagePreview: data.lastMessagePreview || '',
      lastMessageAt: data.lastMessageAt?.toDate() || new Date(),
      messageCount: data.messageCount || 0,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  });
}

// ===== MESSAGE OPERATIONS =====

/**
 * Add a message to a thread
 */
export async function addMessageToThread(
  threadId: string,
  message: Omit<SmsMessage, 'id' | 'timestamp'>
): Promise<SmsMessage> {
  const threadRef = doc(db, THREADS_COLLECTION, threadId);
  const messagesRef = collection(threadRef, MESSAGES_SUBCOLLECTION);

  // Generate message ID
  const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const messageRef = doc(messagesRef, messageId);

  const now = new Date();
  const newMessage: SmsMessage = {
    id: messageId,
    ...message,
    timestamp: now,
  };

  await setDoc(messageRef, {
    ...message,
    timestamp: serverTimestamp(),
  });

  // Update thread metadata
  const preview = message.body.length > 50
    ? message.body.substring(0, 50) + '...'
    : message.body;

  await updateDoc(threadRef, {
    lastMessagePreview: preview,
    lastMessageAt: serverTimestamp(),
    messageCount: (await getDoc(threadRef)).data()?.messageCount + 1 || 1,
    updatedAt: serverTimestamp(),
  });

  return newMessage;
}

/**
 * Get messages for a thread
 */
export async function getThreadMessages(
  threadId: string,
  maxResults: number = 50
): Promise<SmsMessage[]> {
  const threadRef = doc(db, THREADS_COLLECTION, threadId);
  const messagesRef = collection(threadRef, MESSAGES_SUBCOLLECTION);
  const q = query(
    messagesRef,
    orderBy('timestamp', 'desc'),
    limit(maxResults)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      direction: data.direction,
      body: data.body,
      timestamp: data.timestamp?.toDate() || new Date(),
      twilioSid: data.twilioSid,
    };
  }).reverse(); // Return in chronological order
}

/**
 * Get thread with messages
 */
export async function getThreadWithMessages(
  threadId: string
): Promise<SmsThreadWithMessages | null> {
  const thread = await getThread(threadId);

  if (!thread) {
    return null;
  }

  const messages = await getThreadMessages(threadId);

  return {
    ...thread,
    messages,
  };
}
