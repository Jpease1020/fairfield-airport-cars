/**
 * Booking service using Firebase Admin SDK (classic API)
 * This file contains the Admin SDK version of booking operations
 */

import { getAdminDb } from '@/lib/utils/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Helper to safely convert Firestore dates
const safeToDate = (dateField: any): Date => {
  if (!dateField) return new Date();
  if (dateField instanceof Date) return dateField;
  if (dateField && typeof dateField.toDate === 'function') {
    return dateField.toDate();
  }
  if (typeof dateField === 'string' || typeof dateField === 'number') {
    const parsed = new Date(dateField);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }
  return new Date();
};

// Re-export from single source of truth (booking-service) to avoid duplicate logic
export { createBookingAtomic } from './booking-service';

// Get booking with real-time status
export const getBooking = async (bookingId: string): Promise<any | null> => {
  const db = getAdminDb();
  const bookingDoc = await db.collection('bookings').doc(bookingId).get();
  
  if (!bookingDoc.exists) {
    return null;
  }
  
  const data = bookingDoc.data();
  
  return {
    id: bookingDoc.id,
    ...data,
    pickupDateTime: safeToDate(data?.pickupDateTime),
    createdAt: safeToDate(data?.createdAt),
    updatedAt: safeToDate(data?.updatedAt),
    confirmation: data?.confirmation
      ? {
          status: data.confirmation.status ?? 'pending',
          token: data.confirmation.token,
          sentAt: data.confirmation.sentAt
            ? safeToDate(data.confirmation.sentAt).toISOString()
            : undefined,
          confirmedAt: data.confirmation.confirmedAt
            ? safeToDate(data.confirmation.confirmedAt).toISOString()
            : undefined,
        }
      : undefined,
  };
};

// Update booking
export const updateBooking = async (id: string, updates: any): Promise<void> => {
  const db = getAdminDb();
  await db.collection('bookings').doc(id).update({
    ...updates,
    updatedAt: FieldValue.serverTimestamp()
  });
};

// Update booking status
export const updateBookingStatus = async (bookingId: string, status: string): Promise<void> => {
  const db = getAdminDb();
  await db.collection('bookings').doc(bookingId).update({
    status,
    updatedAt: FieldValue.serverTimestamp(),
  });
};

