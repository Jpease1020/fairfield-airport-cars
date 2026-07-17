import { collection, doc, getDoc, getDocs, query, where, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db as clientDb } from '@/lib/utils/firebase-server';
import { getAdminDb } from '@/lib/utils/firebase-admin';
import { timeRangesOverlap } from '@/lib/utils/time-range-overlap';

// Use Admin SDK for server-side operations (API routes), client SDK for client-side
const getDb = () => {
  // If we're in a server context (API route), use Admin SDK
  if (typeof window === 'undefined') {
    try {
      return getAdminDb();
    } catch {
      // Fallback to client SDK if Admin not initialized
      return clientDb;
    }
  }
  // Client-side: use client SDK
  return clientDb;
};

export interface DriverSchedule {
  id?: string;
  driverId: string;
  driverName: string;
  date: string; // YYYY-MM-DD format
  timeSlots: TimeSlot[];
  createdAt: Date;
  updatedAt: Date;
}

// Firestore returns createdAt/updatedAt as raw Timestamps, not Date instances — this type
// claims Date, so normalize at the read boundary rather than let a future caller do
// `schedule.updatedAt.getTime()` on what's actually a Timestamp object.
const normalizeScheduleDates = (raw: any): DriverSchedule => ({
  ...raw,
  createdAt: raw?.createdAt?.toDate ? raw.createdAt.toDate() : (raw?.createdAt instanceof Date ? raw.createdAt : new Date(raw?.createdAt ?? Date.now())),
  updatedAt: raw?.updatedAt?.toDate ? raw.updatedAt.toDate() : (raw?.updatedAt instanceof Date ? raw.updatedAt : new Date(raw?.updatedAt ?? Date.now())),
});

export interface TimeSlot {
  id: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
  bookingId?: string;
  customerName?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  notes?: string;
  status: 'available' | 'booked' | 'blocked' | 'break' | 'prep';
}

export interface BookingConflict {
  hasConflict: boolean;
  conflictingBookings: Array<{
    bookingId: string;
    customerName: string;
    timeSlot: string;
    driverName: string;
  }>;
  suggestedTimeSlots: string[];
}

export class DriverSchedulingService {
  private static instance: DriverSchedulingService;
  
  public static getInstance(): DriverSchedulingService {
    if (!DriverSchedulingService.instance) {
      DriverSchedulingService.instance = new DriverSchedulingService();
    }
    return DriverSchedulingService.instance;
  }

  /**
   * Stable schedule document ID so concurrent writes contend on the same doc.
   */
  getScheduleDocId(driverId: string, date: string): string {
    return `${driverId}_${date}`;
  }

  /**
   * Generate time slots for a driver on a specific date
   */
  generateTimeSlots(startHour: number = 0, endHour: number = 24, slotDurationMinutes: number = 30): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const totalSlots = ((endHour - startHour) * 60) / slotDurationMinutes;
    
    for (let i = 0; i < totalSlots; i++) {
      const startMinutes = startHour * 60 + (i * slotDurationMinutes);
      const endMinutes = startMinutes + slotDurationMinutes;
      
      const startTime = this.formatTime(startMinutes);
      const endTime = this.formatTime(endMinutes);
      
      slots.push({
        id: `${startTime}-${endTime}`,
        startTime,
        endTime,
        isAvailable: true,
        status: 'available'
      });
    }
    
    return slots;
  }

  /**
   * Check if a driver is available for a specific time slot
   */
  async checkDriverAvailability(
    driverId: string, 
    date: string, 
    startTime: string, 
    endTime: string
  ): Promise<boolean> {
    try {
      const db = getDb();
      if (!db) {
        console.warn('Database not initialized in checkDriverAvailability - assuming available');
        return true; // Fail open - assume driver is available
      }

      // Use Admin SDK if available (server-side), otherwise client SDK
      let scheduleSnapshot;
      try {
        if (typeof window === 'undefined' && db.collection) {
          // Admin SDK (server-side)
          scheduleSnapshot = await db.collection('driverSchedules')
            .where('driverId', '==', driverId)
            .where('date', '==', date)
            .get();
        } else {
          // Client SDK
          const scheduleQuery = query(
            collection(db, 'driverSchedules'),
            where('driverId', '==', driverId),
            where('date', '==', date)
          );
          scheduleSnapshot = await getDocs(scheduleQuery);
        }
      } catch (dbError: any) {
        // If database query fails, assume driver is available (fail open)
        console.error('Error checking driver availability:', dbError);
        return true;
      }
      
      if (!scheduleSnapshot.docs || scheduleSnapshot.docs.length === 0) {
        // No schedule exists, driver is available
        return true;
      }

      const scheduleDoc = scheduleSnapshot.docs[0];
      const schedule = (scheduleDoc.data ? scheduleDoc.data() : scheduleDoc) as DriverSchedule;
      
      // Check if the requested time slot conflicts with existing bookings or prep
      const requestedStart = this.timeToMinutes(startTime);
      const requestedEnd = this.timeToMinutes(endTime);
      const MINUTES_PER_DAY = 24 * 60;

      for (const slot of schedule.timeSlots) {
        if (slot.status === 'booked' || slot.status === 'blocked' || slot.status === 'prep') {
          const slotStart = this.timeToMinutes(slot.startTime);
          const slotEnd = this.timeToMinutes(slot.endTime);
          const overlaps = this.slotOverlapsRange(slotStart, slotEnd, requestedStart, requestedEnd, MINUTES_PER_DAY);
          if (overlaps) {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking driver availability:', error);
      return false;
    }
  }

  /**
   * Check for booking conflicts across all drivers.
   * Deliberately not scoped by driverId: correct today because the business is single-driver
   * only (one schedule doc ever exists per date), but would need a driverId filter added if a
   * second driver is ever introduced, since two drivers' schedules could otherwise be checked
   * against each other's slots.
   */
  async checkBookingConflicts(
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): Promise<BookingConflict> {
    try {
      const db = getDb();
      if (!db) {
        console.warn('Database not initialized in checkBookingConflicts - returning no conflicts');
        return {
          hasConflict: false,
          conflictingBookings: [],
          suggestedTimeSlots: []
        };
      }

      const conflicts: Array<{
        bookingId: string;
        customerName: string;
        timeSlot: string;
        driverName: string;
      }> = [];

      // Use Admin SDK if available (server-side), otherwise client SDK
      let scheduleSnapshot;
      try {
        if (typeof window === 'undefined' && db.collection) {
          // Admin SDK (server-side)
          scheduleSnapshot = await db.collection('driverSchedules')
            .where('date', '==', date)
            .get();
        } else {
          // Client SDK
          const scheduleQuery = query(
            collection(db, 'driverSchedules'),
            where('date', '==', date)
          );
          scheduleSnapshot = await getDocs(scheduleQuery);
        }
      } catch (dbError: any) {
        // If database query fails (e.g., permission denied, credential error), fail gracefully
        console.error('Error querying driver schedules:', dbError);
        // Return no conflicts - allow booking to proceed
        // Better to allow a booking than block all bookings due to scheduling system issues
        return {
          hasConflict: false,
          conflictingBookings: [],
          suggestedTimeSlots: []
        };
      }
      
      const requestedStart = this.timeToMinutes(startTime);
      const requestedEnd = this.timeToMinutes(endTime);
      const MINUTES_PER_DAY = 24 * 60;

      // Also check prep time (1 hour before pickup) for conflicts
      const prepStartTime = this.subtractHours(startTime, 1);
      const prepStart = this.timeToMinutes(prepStartTime);
      const prepEnd = requestedStart;

      // Handle both Admin SDK (docs array) and Client SDK (docs array) formats
      const docs = scheduleSnapshot.docs || [];
      for (const scheduleDoc of docs) {
        const scheduleData = scheduleDoc.data ? scheduleDoc.data() : scheduleDoc;
        const schedule = scheduleData as DriverSchedule;

        for (const slot of schedule.timeSlots) {
          // Check both booked and prep slots for conflicts
          if ((slot.status === 'booked' || slot.status === 'prep') && slot.bookingId !== excludeBookingId) {
            const slotStart = this.timeToMinutes(slot.startTime);
            const slotEnd = this.timeToMinutes(slot.endTime);

            // Check for overlap with actual ride time. Both sides may span midnight (a slot
            // ending after midnight, or — since ride duration now reflects the real quoted trip
            // length, not a flat 2 hours — the requested range itself for a late-evening pickup).
            if (timeRangesOverlap(requestedStart, requestedEnd, slotStart, slotEnd, MINUTES_PER_DAY)) {
              conflicts.push({
                bookingId: slot.bookingId!,
                customerName: slot.customerName!,
                timeSlot: `${slot.startTime}-${slot.endTime}`,
                driverName: schedule.driverName
              });
            }

            // Check for overlap with prep time (handles prep, slot, or both spanning midnight)
            if (timeRangesOverlap(prepStart, prepEnd, slotStart, slotEnd, MINUTES_PER_DAY)) {
              conflicts.push({
                bookingId: slot.bookingId!,
                customerName: slot.customerName!,
                timeSlot: `${slot.startTime}-${slot.endTime}`,
                driverName: schedule.driverName
              });
            }
          }
        }
      }

      // Generate suggested time slots if there are conflicts
      const suggestedTimeSlots = conflicts.length > 0 
        ? this.generateSuggestedTimeSlots(date, startTime, endTime)
        : [];

      return {
        hasConflict: conflicts.length > 0,
        conflictingBookings: conflicts,
        suggestedTimeSlots
      };
    } catch (error) {
      console.error('Error checking booking conflicts:', error);
      return {
        hasConflict: false,
        conflictingBookings: [],
        suggestedTimeSlots: []
      };
    }
  }

  /**
   * Helper function to subtract hours from a time string (HH:MM format)
   */
  private subtractHours(timeStr: string, hours: number): string {
    const [hoursStr, minutesStr] = timeStr.split(':');
    const totalMinutes = parseInt(hoursStr) * 60 + parseInt(minutesStr) - (hours * 60);
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    // Handle negative hours (previous day)
    const finalHours = newHours < 0 ? 24 + newHours : newHours;
    return `${String(finalHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
  }

  /**
   * Cancel a booking and free up the time slot
   */
  async cancelBooking(bookingId: string): Promise<void> {
    try {
      const db = getDb();
      if (!db) throw new Error('Database not initialized');

      // Find the booking in all driver schedules - use Admin SDK if available
      let scheduleSnapshot;
      if (typeof window === 'undefined' && db.collection) {
        // Admin SDK (server-side)
        scheduleSnapshot = await db.collection('driverSchedules').get();
      } else {
        // Client SDK
        const scheduleQuery = query(collection(db, 'driverSchedules'));
        scheduleSnapshot = await getDocs(scheduleQuery);
      }
      
      const docs = scheduleSnapshot.docs || [];
      for (const scheduleDoc of docs) {
        const scheduleData = scheduleDoc.data ? scheduleDoc.data() : scheduleDoc;
        const schedule = scheduleData as DriverSchedule;
        const updatedSlots = schedule.timeSlots.map(slot => {
          if (slot.bookingId === bookingId) {
            return {
              ...slot,
              isAvailable: true,
              status: 'available' as const,
              bookingId: undefined,
              customerName: undefined,
              pickupLocation: undefined,
              dropoffLocation: undefined
            };
          }
          return slot;
        });

        // Check if any slots were updated
        const hasChanges = updatedSlots.some((slot, index) => 
          slot.bookingId !== schedule.timeSlots[index].bookingId
        );

        if (hasChanges) {
          const docId = scheduleDoc.id || schedule.id;
          if (typeof window === 'undefined' && db.collection) {
            // Admin SDK
            const FieldValue = (await import('firebase-admin/firestore')).FieldValue;
            await db.collection('driverSchedules').doc(docId).update({
              timeSlots: updatedSlots,
              updatedAt: FieldValue.serverTimestamp()
            });
          } else {
            // Client SDK
            await updateDoc(doc(db, 'driverSchedules', docId), {
              timeSlots: updatedSlots,
              updatedAt: serverTimestamp()
            });
          }
        }
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
      throw error;
    }
  }

  /**
   * Atomically move a booking from its old time slot to a new one: reads the affected
   * driver-schedule document(s), re-checks for conflicts against the freshest data, and writes
   * the change — all inside one Firestore transaction. This replaces a check-then-cancel-then-
   * book sequence of three separate reads/writes, which let two concurrent reschedules (or a
   * reschedule racing a new booking) both pass the conflict check before either had written,
   * silently double-booking the slot. Always uses the Admin SDK: this only runs from a server
   * API route (see /api/booking/[bookingId]), never client-side.
   */
  async rescheduleBookingAtomic(params: {
    driverId: string;
    driverName: string;
    oldDate: string;
    newDate: string;
    startTime: string;
    endTime: string;
    bookingId: string;
    customerName: string;
    pickupLocation: string;
    dropoffLocation: string;
  }): Promise<{ success: true } | { success: false; conflict: BookingConflict }> {
    const db = getAdminDb();
    const oldDocId = this.getScheduleDocId(params.driverId, params.oldDate);
    const newDocId = this.getScheduleDocId(params.driverId, params.newDate);
    const sameDoc = oldDocId === newDocId;

    return db.runTransaction(async (transaction: any) => {
      const oldRef = db.collection('driverSchedules').doc(oldDocId);
      const oldSnap = await transaction.get(oldRef);
      const newRef = sameDoc ? oldRef : db.collection('driverSchedules').doc(newDocId);
      const newSnap = sameDoc ? oldSnap : await transaction.get(newRef);

      const oldTimeSlots: any[] = Array.isArray(oldSnap.data()?.timeSlots) ? [...oldSnap.data().timeSlots] : [];
      const clearedOldSlots = oldTimeSlots.map((slot) =>
        slot.bookingId === params.bookingId
          ? {
              ...slot,
              isAvailable: true,
              status: 'available' as const,
              bookingId: undefined,
              customerName: undefined,
              pickupLocation: undefined,
              dropoffLocation: undefined,
            }
          : slot
      );

      // The working set for the new slot: if it's the same day, start from the old-slot-cleared
      // array (which already reflects this booking's removal), falling back to a fresh day if no
      // schedule doc existed at all yet; otherwise start from the new day's own existing slots.
      const newDaySlots: any[] = sameDoc
        ? (oldSnap.exists ? clearedOldSlots : this.generateTimeSlots())
        : Array.isArray(newSnap.data()?.timeSlots)
          ? [...newSnap.data()!.timeSlots]
          : this.generateTimeSlots();

      const requestedStart = this.timeToMinutes(params.startTime);
      const requestedEnd = this.timeToMinutes(params.endTime);
      const prepStartTime = this.subtractHours(params.startTime, 1);
      const prepStart = this.timeToMinutes(prepStartTime);
      const prepEnd = requestedStart;
      const MINUTES_PER_DAY = 24 * 60;

      for (const slot of newDaySlots) {
        if ((slot.status === 'booked' || slot.status === 'prep' || slot.status === 'blocked') && slot.bookingId !== params.bookingId) {
          const slotStart = this.timeToMinutes(slot.startTime);
          const slotEnd = this.timeToMinutes(slot.endTime);
          const overlapsRide = timeRangesOverlap(requestedStart, requestedEnd, slotStart, slotEnd, MINUTES_PER_DAY);
          const overlapsPrep = timeRangesOverlap(prepStart, prepEnd, slotStart, slotEnd, MINUTES_PER_DAY);
          if (overlapsRide || overlapsPrep) {
            return {
              success: false as const,
              conflict: {
                hasConflict: true,
                conflictingBookings: [{
                  bookingId: slot.bookingId!,
                  customerName: slot.customerName!,
                  timeSlot: `${slot.startTime}-${slot.endTime}`,
                  driverName: params.driverName,
                }],
                suggestedTimeSlots: this.generateSuggestedTimeSlots(params.newDate, params.startTime, params.endTime),
              },
            };
          }
        }
      }

      const upsertSlot = (slotId: string, slotStart: string, slotEnd: string, status: 'prep' | 'booked', notes?: string) => {
        const index = newDaySlots.findIndex((slot) => slot.id === slotId);
        const nextSlot = {
          id: slotId,
          startTime: slotStart,
          endTime: slotEnd,
          isAvailable: false,
          status,
          bookingId: params.bookingId,
          customerName: params.customerName,
          pickupLocation: params.pickupLocation,
          dropoffLocation: params.dropoffLocation,
          ...(notes ? { notes } : {}),
        };
        if (index === -1) newDaySlots.push(nextSlot);
        else newDaySlots[index] = { ...newDaySlots[index], ...nextSlot };
      };

      upsertSlot(`${prepStartTime}-${params.startTime}`, prepStartTime, params.startTime, 'prep', 'Driver prep time');
      upsertSlot(`${params.startTime}-${params.endTime}`, params.startTime, params.endTime, 'booked');

      const FieldValue = (await import('firebase-admin/firestore')).FieldValue;

      if (sameDoc) {
        if (oldSnap.exists) {
          transaction.update(oldRef, { timeSlots: newDaySlots, updatedAt: FieldValue.serverTimestamp() });
        } else {
          transaction.set(oldRef, {
            id: oldDocId,
            driverId: params.driverId,
            driverName: params.driverName,
            date: params.oldDate,
            timeSlots: newDaySlots,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      } else {
        if (oldSnap.exists) {
          transaction.update(oldRef, { timeSlots: clearedOldSlots, updatedAt: FieldValue.serverTimestamp() });
        }
        if (newSnap.exists) {
          transaction.update(newRef, { timeSlots: newDaySlots, updatedAt: FieldValue.serverTimestamp() });
        } else {
          transaction.set(newRef, {
            id: newDocId,
            driverId: params.driverId,
            driverName: params.driverName,
            date: params.newDate,
            timeSlots: newDaySlots,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }

      return { success: true as const };
    });
  }

  /**
   * Get driver schedule for a specific date
   */
  async getDriverSchedule(driverId: string, date: string): Promise<DriverSchedule | null> {
    try {
      const db = getDb();
      if (!db) throw new Error('Database not initialized');
      const scheduleDocId = this.getScheduleDocId(driverId, date);

      // First try deterministic doc ID path.
      if (typeof window === 'undefined' && db.collection) {
        const deterministic = await db.collection('driverSchedules').doc(scheduleDocId).get();
        if (deterministic.exists) {
          const deterministicData = deterministic.data() ?? {};
          return normalizeScheduleDates({
            id: deterministic.id,
            ...deterministicData
          });
        }
      } else {
        const deterministic = await getDoc(doc(db, 'driverSchedules', scheduleDocId));
        if (deterministic.exists()) {
          const deterministicData = deterministic.data() ?? {};
          return normalizeScheduleDates({
            id: deterministic.id,
            ...deterministicData
          });
        }
      }

      // Use Admin SDK if available (server-side), otherwise client SDK
      let scheduleSnapshot;
      if (typeof window === 'undefined' && db.collection) {
        // Admin SDK (server-side)
        scheduleSnapshot = await db.collection('driverSchedules')
          .where('driverId', '==', driverId)
          .where('date', '==', date)
          .get();
      } else {
        // Client SDK
        const scheduleQuery = query(
          collection(db, 'driverSchedules'),
          where('driverId', '==', driverId),
          where('date', '==', date)
        );
        scheduleSnapshot = await getDocs(scheduleQuery);
      }
      
      if (!scheduleSnapshot.docs || scheduleSnapshot.docs.length === 0) {
        return null;
      }

      const scheduleDoc = scheduleSnapshot.docs[0];
      return normalizeScheduleDates({
        id: scheduleDoc.id,
        ...(scheduleDoc.data ? scheduleDoc.data() : scheduleDoc)
      });
    } catch (error) {
      console.error('Error getting driver schedule:', error);
      return null;
    }
  }

  /**
   * Get all driver schedules for a date range
   */
  async getDriverSchedulesForDateRange(
    startDate: string, 
    endDate: string
  ): Promise<DriverSchedule[]> {
    try {
      const db = getDb();
      if (!db) throw new Error('Database not initialized');

      // Use Admin SDK if available (server-side), otherwise client SDK
      let scheduleSnapshot;
      if (typeof window === 'undefined' && db.collection) {
        // Admin SDK (server-side) - note: Admin SDK doesn't support multiple orderBy easily
        scheduleSnapshot = await db.collection('driverSchedules')
          .where('date', '>=', startDate)
          .where('date', '<=', endDate)
          .orderBy('date')
          .get();
      } else {
        // Client SDK
        const scheduleQuery = query(
          collection(db, 'driverSchedules'),
          where('date', '>=', startDate),
          where('date', '<=', endDate),
          orderBy('date'),
          orderBy('driverName')
        );
        scheduleSnapshot = await getDocs(scheduleQuery);
      }
      
      const docs = scheduleSnapshot.docs || [];
      return docs.map((doc: any) => normalizeScheduleDates({
        id: doc.id,
        ...(doc.data ? doc.data() : doc)
      }));
    } catch (error) {
      console.error('Error getting driver schedules:', error);
      return [];
    }
  }

  /**
   * Get available drivers for a specific time slot
   * Simplified for single driver setup
   */
  async getAvailableDriversForTimeSlot(
    date: string,
    startTime: string,
    endTime: string
  ): Promise<Array<{ driverId: string; driverName: string }>> {
    try {
      // This method calls checkDriverAvailability which already uses getDb()
      // No need to check db here

      // For single driver setup, always return driver if available
      // Keep driver ID as gregg-driver-001 for database consistency
      const driverId = 'gregg-driver-001';
      const driverName = 'Your Driver'; // User-facing name is generic
      
      const isAvailable = await this.checkDriverAvailability(
        driverId, 
        date, 
        startTime, 
        endTime
      );
      
      if (isAvailable) {
        return [{
          driverId: driverId,
          driverName: driverName
        }];
      }
      
      return [];
    } catch (error) {
      console.error('Error getting available drivers:', error);
      return [];
    }
  }

  /**
   * Generate suggested time slots when there are conflicts
   */
  private generateSuggestedTimeSlots(
    date: string, 
    originalStartTime: string, 
    originalEndTime: string
  ): string[] {
    const suggestions: string[] = [];
    const originalStart = this.timeToMinutes(originalStartTime);
    const originalEnd = this.timeToMinutes(originalEndTime);
    const duration = originalEnd - originalStart;
    
    // Suggest slots 30 minutes before and after
    const beforeStart = originalStart - 30;
    const afterEnd = originalEnd + 30;
    
    if (beforeStart >= 360) { // 6 AM minimum
      suggestions.push(`${this.formatTime(beforeStart)}-${this.formatTime(beforeStart + duration)}`);
    }
    
    if (afterEnd <= 1320) { // 10 PM maximum
      suggestions.push(`${this.formatTime(afterEnd - duration)}-${this.formatTime(afterEnd)}`);
    }
    
    return suggestions;
  }

  /**
   * Check if a slot [slotStart, slotEnd] overlaps with [rangeStart, rangeEnd]. All values in
   * minutes since midnight; either interval may span midnight (start > end).
   */
  private slotOverlapsRange(
    slotStart: number,
    slotEnd: number,
    rangeStart: number,
    rangeEnd: number,
    minutesPerDay: number = 24 * 60
  ): boolean {
    return timeRangesOverlap(slotStart, slotEnd, rangeStart, rangeEnd, minutesPerDay);
  }

  /**
   * Convert time string (HH:MM) to minutes since midnight
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convert minutes since midnight to time string (HH:MM)
   */
  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}

export const driverSchedulingService = DriverSchedulingService.getInstance();
