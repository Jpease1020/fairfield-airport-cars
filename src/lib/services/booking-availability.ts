import { getAdminDb } from '@/lib/utils/firebase-admin';
import type { Booking, Driver } from './booking-types';

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

export const isTimeSlotAvailable = async (pickupDate: Date, bufferMinutes = 60): Promise<boolean> => {
  try {
    const startOfDay = new Date(pickupDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(pickupDate);
    endOfDay.setHours(23, 59, 59, 999);

    const db = getAdminDb();
    const snapshot = await db.collection('bookings').get();
    const bookings = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Booking[];

    const dayBookings = bookings.filter((booking) => {
      const bookingDate = safeToDate(booking.pickupDateTime);
      return bookingDate >= startOfDay && bookingDate <= endOfDay;
    });

    const requestedStart = new Date(pickupDate.getTime() - bufferMinutes * 60 * 1000);
    const requestedEnd = new Date(pickupDate.getTime() + bufferMinutes * 60 * 1000);

    for (const booking of dayBookings) {
      const bookingStart = new Date(safeToDate(booking.pickupDateTime).getTime() - bufferMinutes * 60 * 1000);
      const bookingEnd = new Date(safeToDate(booking.pickupDateTime).getTime() + bufferMinutes * 60 * 1000);

      if (requestedStart < bookingEnd && requestedEnd > bookingStart) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error checking time slot availability:', error);
    return false;
  }
};

export const getAvailableDrivers = async (pickupTime?: Date): Promise<Driver[]> => {
  try {
    const db = getAdminDb();
    const driversSnapshot = await db.collection('drivers').where('status', '==', 'available').get();

    if (driversSnapshot.empty) {
      return [];
    }

    const availableDrivers = driversSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }) as Driver);

    if (pickupTime) {
      const isAvailable = await isTimeSlotAvailable(pickupTime);
      if (!isAvailable) {
        return [];
      }
    }

    return availableDrivers;
  } catch (error) {
    console.error('Error getting available drivers:', error);
    return [];
  }
};
