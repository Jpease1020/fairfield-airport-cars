import { collection, doc, getDocs, query, where, addDoc, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/utils/firebase-server';

export interface DriverSchedule {
  id?: string;
  driverId: string;
  driverName: string;
  date: string; // YYYY-MM-DD format
  timeSlots: TimeSlot[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  id: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
  bookingId?: string;
  customerName?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  status: 'available' | 'booked' | 'blocked' | 'break';
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
      if (!db) throw new Error('Database not initialized');

      // Get driver's schedule for the date
      const scheduleQuery = query(
        collection(db, 'driverSchedules'),
        where('driverId', '==', driverId),
        where('date', '==', date)
      );
      
      const scheduleSnapshot = await getDocs(scheduleQuery);
      
      if (scheduleSnapshot.empty) {
        // No schedule exists, driver is available
        return true;
      }

      const schedule = scheduleSnapshot.docs[0].data() as DriverSchedule;
      
      // Check if the requested time slot conflicts with existing bookings
      const requestedStart = this.timeToMinutes(startTime);
      const requestedEnd = this.timeToMinutes(endTime);
      
      for (const slot of schedule.timeSlots) {
        if (slot.status === 'booked' || slot.status === 'blocked') {
          const slotStart = this.timeToMinutes(slot.startTime);
          const slotEnd = this.timeToMinutes(slot.endTime);
          
          // Check for overlap
          if (requestedStart < slotEnd && requestedEnd > slotStart) {
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
   * Check for booking conflicts across all drivers
   */
  async checkBookingConflicts(
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): Promise<BookingConflict> {
    try {
      if (!db) throw new Error('Database not initialized');

      const conflicts: Array<{
        bookingId: string;
        customerName: string;
        timeSlot: string;
        driverName: string;
      }> = [];

      // Get all driver schedules for the date
      const scheduleQuery = query(
        collection(db, 'driverSchedules'),
        where('date', '==', date)
      );
      
      const scheduleSnapshot = await getDocs(scheduleQuery);
      
      const requestedStart = this.timeToMinutes(startTime);
      const requestedEnd = this.timeToMinutes(endTime);
      
      for (const scheduleDoc of scheduleSnapshot.docs) {
        const schedule = scheduleDoc.data() as DriverSchedule;
        
        for (const slot of schedule.timeSlots) {
          if (slot.status === 'booked' && slot.bookingId !== excludeBookingId) {
            const slotStart = this.timeToMinutes(slot.startTime);
            const slotEnd = this.timeToMinutes(slot.endTime);
            
            // Check for overlap
            if (requestedStart < slotEnd && requestedEnd > slotStart) {
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
   * Book a time slot for a driver
   */
  async bookTimeSlot(
    driverId: string,
    driverName: string,
    date: string,
    startTime: string,
    endTime: string,
    bookingId: string,
    customerName: string,
    pickupLocation: string,
    dropoffLocation: string
  ): Promise<void> {
    try {
      if (!db) throw new Error('Database not initialized');

      // Get or create driver schedule for the date
      let schedule = await this.getDriverSchedule(driverId, date);
      
      if (!schedule) {
        // Create new schedule
        schedule = {
          driverId,
          driverName,
          date,
          timeSlots: this.generateTimeSlots(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      // Update the specific time slot
      const slotId = `${startTime}-${endTime}`;
      const slotIndex = schedule.timeSlots.findIndex(slot => slot.id === slotId);
      
      if (slotIndex === -1) {
        schedule.timeSlots.push({
          id: slotId,
          startTime,
          endTime,
          isAvailable: false,
          status: 'booked',
          bookingId,
          customerName,
          pickupLocation,
          dropoffLocation
        });
      } else {
        schedule.timeSlots[slotIndex] = {
          ...schedule.timeSlots[slotIndex],
          isAvailable: false,
          status: 'booked',
          bookingId,
          customerName,
          pickupLocation,
          dropoffLocation
        };
      }

      schedule.updatedAt = new Date();

      // Save to database
      if (schedule.id) {
        await updateDoc(doc(db, 'driverSchedules', schedule.id), {
          timeSlots: schedule.timeSlots,
          updatedAt: serverTimestamp()
        });
      } else {
        const docRef = await addDoc(collection(db, 'driverSchedules'), {
          ...schedule,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        schedule.id = docRef.id;
      }
    } catch (error) {
      console.error('Error booking time slot:', error);
      throw error;
    }
  }

  /**
   * Cancel a booking and free up the time slot
   */
  async cancelBooking(bookingId: string): Promise<void> {
    try {
      if (!db) throw new Error('Database not initialized');

      // Find the booking in all driver schedules
      const scheduleQuery = query(collection(db, 'driverSchedules'));
      const scheduleSnapshot = await getDocs(scheduleQuery);
      
      for (const scheduleDoc of scheduleSnapshot.docs) {
        const schedule = scheduleDoc.data() as DriverSchedule;
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
          await updateDoc(doc(db, 'driverSchedules', scheduleDoc.id), {
            timeSlots: updatedSlots,
            updatedAt: serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
      throw error;
    }
  }

  /**
   * Get driver schedule for a specific date
   */
  async getDriverSchedule(driverId: string, date: string): Promise<DriverSchedule | null> {
    try {
      if (!db) throw new Error('Database not initialized');

      const scheduleQuery = query(
        collection(db, 'driverSchedules'),
        where('driverId', '==', driverId),
        where('date', '==', date)
      );
      
      const scheduleSnapshot = await getDocs(scheduleQuery);
      
      if (scheduleSnapshot.empty) {
        return null;
      }

      const doc = scheduleSnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as DriverSchedule;
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
      if (!db) throw new Error('Database not initialized');

      const scheduleQuery = query(
        collection(db, 'driverSchedules'),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date'),
        orderBy('driverName')
      );
      
      const scheduleSnapshot = await getDocs(scheduleQuery);
      
      return scheduleSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DriverSchedule[];
    } catch (error) {
      console.error('Error getting driver schedules:', error);
      return [];
    }
  }

  /**
   * Get available drivers for a specific time slot
   * Simplified for single driver (Gregg) setup
   */
  async getAvailableDriversForTimeSlot(
    date: string,
    startTime: string,
    endTime: string
  ): Promise<Array<{ driverId: string; driverName: string }>> {
    try {
      if (!db) throw new Error('Database not initialized');

      // For single driver setup, always return Gregg if available
      const greggId = 'gregg-driver-001';
      const greggName = 'Gregg';
      
      const isAvailable = await this.checkDriverAvailability(
        greggId, 
        date, 
        startTime, 
        endTime
      );
      
      if (isAvailable) {
        return [{
          driverId: greggId,
          driverName: greggName
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
