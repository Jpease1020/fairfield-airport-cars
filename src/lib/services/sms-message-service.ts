import { getAdminDb } from '@/lib/utils/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export type SmsDirection = 'inbound' | 'outbound';

const COLLECTION = 'smsMessages';

/**
 * Persist an SMS message to Firestore for audit and history.
 * Server-only (uses Admin SDK).
 */
export async function saveSmsMessage(params: {
  from: string;
  to: string;
  body: string;
  direction: SmsDirection;
  twilioMessageSid?: string;
  bookingId?: string;
  customerId?: string;
}): Promise<string | null> {
  try {
    const db = getAdminDb();
    const ref = await db.collection(COLLECTION).add({
      from: params.from,
      to: params.to,
      body: params.body,
      direction: params.direction,
      twilioMessageSid: params.twilioMessageSid ?? null,
      bookingId: params.bookingId ?? null,
      customerId: params.customerId ?? null,
      createdAt: FieldValue.serverTimestamp(),
    });
    return ref.id;
  } catch (error) {
    console.error('Failed to save SMS message:', error);
    return null;
  }
}
