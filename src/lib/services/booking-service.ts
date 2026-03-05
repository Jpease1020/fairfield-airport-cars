// Server-only module - uses Firebase Admin SDK
// Note: This module should only be imported in API routes or server components

import { getAdminDb } from '@/lib/utils/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { BookingCreateData } from '@/types/booking';
import { getDriver } from './driver-service';
import { driverSchedulingService } from './driver-scheduling-service';
import { generateShortBookingId } from '@/utils/booking-id-generator';
import type { Booking } from './booking-types';
export type { Booking, Driver } from './booking-types';
export { isTimeSlotAvailable, getAvailableDrivers } from './booking-availability';
export { cancelBooking } from './booking-cancellation';
export type { CancelBookingOptions } from './booking-cancellation';


// Helper function to safely convert Firestore dates to JavaScript Date objects
const safeToDate = (dateField: any): Date => {
  if (!dateField) return new Date();
  
  // If it's already a Date
  if (dateField instanceof Date) return dateField;
  
  // If it's a Firestore Timestamp
  if (dateField && typeof dateField.toDate === 'function') {
    return dateField.toDate();
  }
  
  // If it's a string or number, try to parse it
  if (typeof dateField === 'string' || typeof dateField === 'number') {
    const parsed = new Date(dateField);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }
  
  // Fallback to current date
  return new Date();
};

const safeToOptionalDate = (dateField: any): Date | undefined => {
  if (!dateField) return undefined;

  if (dateField instanceof Date) {
    return Number.isNaN(dateField.getTime()) ? undefined : dateField;
  }

  if (dateField && typeof dateField.toDate === 'function') {
    const parsed = dateField.toDate();
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  if (typeof dateField === 'string' || typeof dateField === 'number') {
    const parsed = new Date(dateField);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  return undefined;
};


const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const slotOverlapsRange = (slotStart: number, slotEnd: number, rangeStart: number, rangeEnd: number): boolean => {
  if (slotStart <= slotEnd) {
    return rangeStart < slotEnd && rangeEnd > slotStart;
  }
  const overlapsFirst = rangeStart < slotEnd && rangeEnd > 0;
  const overlapsSecond = rangeStart < 24 * 60 && rangeEnd > slotStart;
  return overlapsFirst || overlapsSecond;
};

const subtractOneHour = (time: string): string => {
  const [hoursStr, minutesStr] = time.split(':');
  const totalMinutes = Number(hoursStr) * 60 + Number(minutesStr) - 60;
  const wrapped = totalMinutes < 0 ? totalMinutes + 24 * 60 : totalMinutes;
  const hours = Math.floor(wrapped / 60);
  const minutes = wrapped % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// Note: Dynamic pricing moved to /api/booking/quote for centralized fare calculation

// Real-time booking status management
export const updateBookingStatus = async (bookingId: string, status: Booking['status']): Promise<void> => {
  try {
    const db = getAdminDb();
    await db.collection('bookings').doc(bookingId).update({
      status,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw new Error('Failed to update booking status');
  }
};

// Driver assignment with real driver system
export const assignDriverToBooking = async (bookingId: string, driverId: string): Promise<void> => {
  try {
    const db = getAdminDb();
    const driver = await getDriver(driverId);
    if (!driver) {
      throw new Error('Driver not found');
    }

    await db.collection('bookings').doc(bookingId).update({
      driverId: driver.id,
      driverName: driver.name,
      updatedAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error assigning driver to booking:', error);
    throw new Error('Failed to assign driver to booking');
  }
};

// ATOMIC BOOKING: Single implementation for submit and process-payment.
// Final slot reservation and booking creation happen in one Firestore transaction.
/** Single entry point for creating bookings (used by submit + process-payment). Admin uses this via booking-service-admin. Legacy createBooking() below is for backward compatibility only. */
export const createBookingAtomic = async (bookingData: BookingCreateData): Promise<{ bookingId: string }> => {
  const db = getAdminDb();
  const pickupDate = bookingData.trip.pickupDateTime as unknown as Date;
  const dateStr = pickupDate.toISOString().split('T')[0]; // YYYY-MM-DD
  const startTime = pickupDate.toTimeString().slice(0, 5); // HH:MM
  const endTime = new Date(pickupDate.getTime() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5); // +2 hours
  const prepStartTime = subtractOneHour(startTime);

  // 1. Check for conflicts and get drivers OUTSIDE transaction (recommended for Firestore)
  const conflictCheck = await driverSchedulingService.checkBookingConflicts(
    dateStr,
    startTime,
    endTime
  );
  if (conflictCheck.hasConflict) {
    throw new Error(`Time slot conflicts with existing bookings. Suggested times: ${conflictCheck.suggestedTimeSlots.join(', ')}`);
  }

  const availableDrivers = await driverSchedulingService.getAvailableDriversForTimeSlot(
    dateStr,
    startTime,
    endTime
  );
  const selectedDriver = availableDrivers.length > 0 ? availableDrivers[0] : null;
  const depositAmount = bookingData.payment.depositAmount ?? 0;
  const balanceDue = bookingData.trip.fare! - depositAmount;
  const status = (bookingData as { status?: string }).status ?? 'pending';
  const scheduleDocId = selectedDriver
    ? driverSchedulingService.getScheduleDocId(selectedDriver.driverId, dateStr)
    : null;

  const { bookingId } = await db.runTransaction(async (transaction: any) => {
    let bookingId = generateShortBookingId();
    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts) {
      const existingDocRef = db.collection('bookings').doc(bookingId);
      const existingDoc = await transaction.get(existingDocRef);
      if (!existingDoc.exists) break;
      bookingId = generateShortBookingId();
      attempts++;
    }
    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique booking ID. Please try again.');
    }
    const bookingDoc = {
      ...bookingData,
      driverId: selectedDriver?.driverId ?? null,
      driverName: selectedDriver?.driverName ?? 'To be assigned',
      depositAmount,
      balanceDue,
      status,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (selectedDriver && scheduleDocId) {
      const scheduleRef = db.collection('driverSchedules').doc(scheduleDocId);
      const deterministicScheduleDoc = await transaction.get(scheduleRef);
      let scheduleData: any = null;

      if (deterministicScheduleDoc.exists) {
        scheduleData = deterministicScheduleDoc.data();
      } else {
        const legacyScheduleQuery = db
          .collection('driverSchedules')
          .where('driverId', '==', selectedDriver.driverId)
          .where('date', '==', dateStr)
          .limit(1);
        const legacyScheduleSnapshot = await transaction.get(legacyScheduleQuery);
        if (!legacyScheduleSnapshot.empty) {
          scheduleData = legacyScheduleSnapshot.docs[0]?.data();
        }
      }

      const timeSlots = Array.isArray(scheduleData?.timeSlots)
        ? [...scheduleData.timeSlots]
        : driverSchedulingService.generateTimeSlots();

      const requestedStart = timeToMinutes(startTime);
      const requestedEnd = timeToMinutes(endTime);
      const prepStart = timeToMinutes(prepStartTime);
      const prepEnd = requestedStart;
      const prepSpansMidnight = prepStart > prepEnd;
      const prepOverlaps = (slotStart: number, slotEnd: number): boolean => {
        if (!prepSpansMidnight) return prepStart < slotEnd && prepEnd > slotStart;
        const overlapsFirst = slotStart < prepEnd && slotEnd > 0;
        const overlapsSecond = slotStart < 24 * 60 && slotEnd > prepStart;
        return overlapsFirst || overlapsSecond;
      };

      for (const slot of timeSlots) {
        if (slot?.status === 'booked' || slot?.status === 'prep' || slot?.status === 'blocked') {
          const slotStart = timeToMinutes(slot.startTime);
          const slotEnd = timeToMinutes(slot.endTime);
          if (
            slotOverlapsRange(slotStart, slotEnd, requestedStart, requestedEnd) ||
            prepOverlaps(slotStart, slotEnd)
          ) {
            throw new Error('Time slot conflicts with existing bookings.');
          }
        }
      }

      const customerName = bookingData.customer.name;
      const pickupLocation = bookingData.trip.pickup.address;
      const dropoffLocation = bookingData.trip.dropoff.address;
      const upsertSlot = (
        slotId: string,
        slotStart: string,
        slotEnd: string,
        slotStatus: 'prep' | 'booked',
        notes?: string
      ) => {
        const index = timeSlots.findIndex((slot) => slot.id === slotId);
        const nextSlot = {
          id: slotId,
          startTime: slotStart,
          endTime: slotEnd,
          isAvailable: false,
          status: slotStatus,
          bookingId,
          customerName,
          pickupLocation,
          dropoffLocation,
          ...(notes ? { notes } : {}),
        };

        if (index === -1) {
          timeSlots.push(nextSlot);
        } else {
          timeSlots[index] = {
            ...timeSlots[index],
            ...nextSlot,
          };
        }
      };

      upsertSlot(`${prepStartTime}-${startTime}`, prepStartTime, startTime, 'prep', 'Driver prep time');
      upsertSlot(`${startTime}-${endTime}`, startTime, endTime, 'booked');

      transaction.set(
        scheduleRef,
        {
          id: scheduleDocId,
          driverId: selectedDriver.driverId,
          driverName: selectedDriver.driverName,
          date: dateStr,
          timeSlots,
          createdAt: scheduleData?.createdAt ?? FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    transaction.set(db.collection('bookings').doc(bookingId), bookingDoc);
    return { bookingId };
  });

  if (selectedDriver) {
    console.log(`✅ ATOMIC BOOKING SUCCESS: ${bookingId} with driver: ${selectedDriver.driverName}`);
  } else {
    console.log(`✅ BOOKING PENDING: ${bookingId} - driver will be assigned later`);
  }

  return { bookingId };
};

// Get booking with real-time status
export const getBooking = async (bookingId: string): Promise<Booking | null> => {
  const db = getAdminDb();
  const bookingDoc = await db.collection('bookings').doc(bookingId).get();
  
  if (!bookingDoc.exists) {
    return null;
  }
  
  const data = bookingDoc.data();
  
  const pickupDateTimeRaw = data?.trip?.pickupDateTime ?? data?.pickupDateTime;

  return {
    id: bookingDoc.id,
    ...data,
    pickupDateTime: safeToOptionalDate(pickupDateTimeRaw),
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
  } as Booking;
};

// Get all bookings with filtering and sorting
export const getBookings = async (
  status?: Booking['status'],
  limit?: number
): Promise<Booking[]> => {
  const db = getAdminDb();
  let query = db.collection('bookings').orderBy('createdAt', 'desc');
  
  if (status) {
    query = query.where('status', '==', status);
  }
  
  if (limit) {
    query = query.limit(limit);
  }
  
  const snapshot = await query.get();
  
  return snapshot.docs.map((doc: any) => {
    const data = doc.data();
    const pickupDateTimeRaw = data?.trip?.pickupDateTime ?? data?.pickupDateTime;
    
    return {
      id: doc.id,
      ...data,
      pickupDateTime: safeToOptionalDate(pickupDateTimeRaw),
      createdAt: safeToDate(data?.createdAt),
      updatedAt: safeToDate(data?.updatedAt),
    };
  }) as Booking[];
};

// Legacy exports for backward compatibility
export const listBookings = getBookings;
export const updateBooking = async (id: string, updates: Partial<Booking>): Promise<void> => {
  const db = getAdminDb();
  await db.collection('bookings').doc(id).update({ 
    ...updates, 
    updatedAt: FieldValue.serverTimestamp() 
  });
};

export const deleteBooking = async (id: string): Promise<void> => {
  const db = getAdminDb();
  await db.collection('bookings').doc(id).update({ 
    status: 'cancelled', 
    updatedAt: FieldValue.serverTimestamp() 
  });
};

// Update driver location for real-time tracking
export const updateDriverLocation = async (driverId: string, location: { lat: number; lng: number }): Promise<void> => {
  const db = getAdminDb();
  await db.collection('drivers').doc(driverId).update({
    currentLocation: location,
    lastUpdated: FieldValue.serverTimestamp(),
  });
};

// Get estimated arrival time based on driver location and traffic
export const getEstimatedArrival = async (bookingId: string): Promise<Date | null> => {
  const db = getAdminDb();
  const booking = await getBooking(bookingId);
  if (!booking || !booking.driverId) return null;
  
  const driverDoc = await db.collection('drivers').doc(booking.driverId).get();
  if (!driverDoc.exists) return null;
  
  // const driverData = driverDoc.data() as Driver; // Unused for now
  
  // TODO: Implement Google Maps Directions API for accurate ETA
  // For now, return a simple estimate
  const estimatedMinutes = 15; // Placeholder
  const estimatedArrival = new Date();
  estimatedArrival.setMinutes(estimatedArrival.getMinutes() + estimatedMinutes);
  
  return estimatedArrival;
};
