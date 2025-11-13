/**
 * Booking service using Firebase Admin SDK (classic API)
 * This file contains the Admin SDK version of booking operations
 */

import { getAdminDb } from '@/lib/utils/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { BookingCreateData } from '@/types/booking';
import { generateShortBookingId } from '@/utils/booking-id-generator';
import { driverSchedulingService } from './driver-scheduling-service';

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

// ATOMIC BOOKING: Prevents double booking with Firestore transactions
export const createBookingAtomic = async (bookingData: BookingCreateData): Promise<{ bookingId: string }> => {
  const db = getAdminDb();
  const pickupDate = bookingData.trip.pickupDateTime as unknown as Date;
  const dateStr = pickupDate.toISOString().split('T')[0];
  const startTime = pickupDate.toTimeString().slice(0, 5);
  const endTime = new Date(pickupDate.getTime() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5);

  // Check for conflicts BEFORE transaction (can't use client SDK inside transaction)
  const conflictCheck = await driverSchedulingService.checkBookingConflicts(
    dateStr,
    startTime,
    endTime
  );

  if (conflictCheck.hasConflict) {
    throw new Error(`Time slot conflicts with existing bookings. Suggested times: ${conflictCheck.suggestedTimeSlots.join(', ')}`);
  }

  // Get available drivers BEFORE transaction
  const availableDrivers = await driverSchedulingService.getAvailableDriversForTimeSlot(
    dateStr,
    startTime,
    endTime
  );

  let selectedDriver = null;
  if (availableDrivers.length > 0) {
    selectedDriver = availableDrivers[0];
  }

  // Calculate deposit
  const depositAmount = bookingData.payment.depositAmount || 0;
  const balanceDue = bookingData.trip.fare! - depositAmount;

  // Transaction only handles booking creation and ID collision check
  return await db.runTransaction(async (transaction: any) => {
    // Generate short booking ID and check for collisions (inside transaction)
    let bookingId = generateShortBookingId();
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const existingDocRef = db.collection('bookings').doc(bookingId);
      const existingDoc = await transaction.get(existingDocRef);
      if (!existingDoc.exists) {
        break;
      }
      bookingId = generateShortBookingId();
      attempts++;
    }
    
    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique booking ID. Please try again.');
    }

    // Create booking document atomically with custom ID
    const bookingDoc = {
      ...bookingData,
      driverId: selectedDriver?.driverId || null,
      driverName: selectedDriver?.driverName || 'To be assigned',
      depositAmount,
      balanceDue,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = db.collection('bookings').doc(bookingId);
    transaction.set(docRef, bookingDoc);

    return { bookingId };
  }).then(async ({ bookingId }: { bookingId: string }) => {
    // Book the time slot AFTER transaction completes (outside transaction)
    if (selectedDriver) {
      try {
        await driverSchedulingService.bookTimeSlot(
          selectedDriver.driverId,
          selectedDriver.driverName,
          dateStr,
          startTime,
          endTime,
          bookingId,
          bookingData.customer.name,
          bookingData.trip.pickup.address,
          bookingData.trip.dropoff.address
        );
        console.log(`✅ ATOMIC BOOKING SUCCESS: ${bookingId} with driver: ${selectedDriver.driverName}`);
      } catch (slotError) {
        console.error(`⚠️ Booking ${bookingId} created but time slot booking failed:`, slotError);
        // Don't fail the booking - it's created, just log the error
      }
    } else {
      console.log(`✅ BOOKING PENDING: ${bookingId} - driver will be assigned later`);
    }

    return { bookingId };
  });
};

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

