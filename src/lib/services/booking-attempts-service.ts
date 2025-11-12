'use server';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/utils/firebase-server';

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
    await addDoc(collection(db, ATTEMPTS_COLLECTION), {
      ...entry,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to record booking attempt:', error);
  }
};


