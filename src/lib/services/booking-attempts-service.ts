'use server';

import { getAdminDb } from '@/lib/utils/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export type BookingAttemptStatus = 'success' | 'failed' | 'warning';

export interface BookingAttemptEntry {
  stage: 'submit' | 'payment';
  status: BookingAttemptStatus;
  reason?: string;
  bookingId?: string | null;
  payload?: Record<string, unknown>;
}

const ATTEMPTS_COLLECTION = 'booking_attempts';

export const recordBookingAttempt = async (entry: BookingAttemptEntry): Promise<void> => {
  try {
    // Use Admin SDK for server-side operations
    const db = getAdminDb();
    await db.collection(ATTEMPTS_COLLECTION).add({
      ...entry,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to record booking attempt:', error);
    // Don't throw - this is non-critical logging
  }
};


