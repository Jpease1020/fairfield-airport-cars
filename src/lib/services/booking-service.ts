// Server-only module - uses Firebase Admin SDK
// Note: This module should only be imported in API routes or server components

import { getAdminDb } from '@/lib/utils/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { BookingCreateData } from '@/types/booking';
import { getDriver } from './driver-service';
import { driverSchedulingService } from './driver-scheduling-service';
import { generateShortBookingId } from '@/utils/booking-id-generator';


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

export interface Booking {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupDateTime?: Date;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'requires_approval';
  fare?: number;
  dynamicFare?: number;
  depositPaid?: boolean;
  balanceDue?: number;
  flightNumber?: string;
  notes?: string;
  driverId?: string;
  driverName?: string;
  estimatedArrival?: Date;
  actualArrival?: Date;
  tipAmount?: number;
  cancellationFee?: number;
  squareOrderId?: string;
  squarePaymentId?: string;
  depositAmount?: number;
  reminderSent?: boolean;
  onMyWaySent?: boolean;
  createdAt: Date;
  updatedAt: Date;
  confirmation?: {
    status: 'pending' | 'confirmed';
    token?: string;
    sentAt?: Date;
    confirmedAt?: Date;
  };
  calendarEventId?: string; // Google Calendar event ID
  
  // Nested structure (new format)
  trip?: {
    pickup: { address: string; coordinates?: { lat: number; lng: number } | null };
    dropoff: { address: string; coordinates?: { lat: number; lng: number } | null };
    pickupDateTime: Date | string;
    fare?: number;
    fareType?: 'personal' | 'business';
    flightInfo?: {
      hasFlight: boolean;
      airline: string;
      flightNumber: string;
      arrivalTime: string;
      terminal: string;
    };
  };
  customer?: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
    saveInfoForFuture?: boolean;
    smsOptIn?: boolean;
  };
  payment?: {
    depositAmount: number | null;
    balanceDue: number;
    depositPaid: boolean;
    squareOrderId?: string;
    squarePaymentId?: string;
    tipAmount: number;
    tipPercent: number;
    totalAmount: number;
  };
  
  // Real-time tracking fields
  driverLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
    heading?: number;
    speed?: number;
  };
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  licensePlate: string;
  status: 'available' | 'busy' | 'offline';
  currentLocation?: {
    lat: number;
    lng: number;
  };
  lastUpdated: Date;
}

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

// ATOMIC BOOKING: Prevents double booking with Firestore transactions
export const createBookingAtomic = async (bookingData: BookingCreateData): Promise<{ bookingId: string }> => {
  const db = getAdminDb();
  const pickupDate = bookingData.trip.pickupDateTime as unknown as Date;
  const dateStr = pickupDate.toISOString().split('T')[0]; // YYYY-MM-DD
  const startTime = pickupDate.toTimeString().slice(0, 5); // HH:MM
  const endTime = new Date(pickupDate.getTime() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5); // +2 hours

  return await db.runTransaction(async (transaction: any) => {
    // 1. Check for conflicts atomically
    const conflictCheck = await driverSchedulingService.checkBookingConflicts(
      dateStr,
      startTime,
      endTime
    );

    if (conflictCheck.hasConflict) {
      throw new Error(`Time slot conflicts with existing bookings. Suggested times: ${conflictCheck.suggestedTimeSlots.join(', ')}`);
    }

    // 2. Get available drivers atomically
    const availableDrivers = await driverSchedulingService.getAvailableDriversForTimeSlot(
      dateStr,
      startTime,
      endTime
    );

    // For promotional no-payment bookings, allow booking without immediate driver assignment
    let selectedDriver = null;
    if (availableDrivers.length > 0) {
      // 3. Select driver if available (single driver setup)
      selectedDriver = availableDrivers[0];
    }
    // If no driver available, booking status will be 'pending' and driver assigned later

    // 4. Calculate deposit (30% of total fare) - currently $0 for promotion
    const depositAmount = bookingData.payment.depositAmount || 0;
    const balanceDue = bookingData.trip.fare! - depositAmount;

    // 5. Generate short booking ID and check for collisions (inside transaction)
    let bookingId = generateShortBookingId();
    let attempts = 0;
    const maxAttempts = 10;
    
    // Check if ID already exists (very unlikely but handle it)
    while (attempts < maxAttempts) {
      const existingDocRef = db.collection('bookings').doc(bookingId);
      const existingDoc = await transaction.get(existingDocRef);
      if (!existingDoc.exists) {
        break; // ID is available
      }
      bookingId = generateShortBookingId();
      attempts++;
    }
    
    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique booking ID. Please try again.');
    }

    // 6. Create booking document atomically with custom ID
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

    // 7. Book the time slot atomically (only if driver available)
    if (selectedDriver) {
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
    } else {
      console.log(`✅ BOOKING PENDING: ${bookingId} - driver will be assigned later`);
    }

    return { bookingId };
  });
};

// Create booking with payment integration and driver scheduling (LEGACY - use createBookingAtomic)
export const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ bookingId: string }> => {
  try {
    // Check for booking conflicts before creating
    const pickupDateRaw = bookingData.pickupDateTime || bookingData.trip?.pickupDateTime;
    if (!pickupDateRaw) {
      throw new Error('Pickup date/time is required');
    }
    const pickupDate = pickupDateRaw instanceof Date ? pickupDateRaw : new Date(pickupDateRaw);
    const dateStr = pickupDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const startTime = pickupDate.toTimeString().slice(0, 5); // HH:MM
    const endTime = new Date(pickupDate.getTime() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5); // +2 hours

    // Check for conflicts
    const conflictCheck = await driverSchedulingService.checkBookingConflicts(
      dateStr,
      startTime,
      endTime
    );

    if (conflictCheck.hasConflict) {
      throw new Error(`Time slot conflicts with existing bookings. Suggested times: ${conflictCheck.suggestedTimeSlots.join(', ')}`);
    }

    // Get available drivers for the time slot
    const availableDrivers = await driverSchedulingService.getAvailableDriversForTimeSlot(
      dateStr,
      startTime,
      endTime
    );

    if (availableDrivers.length === 0) {
      throw new Error('No driver is available for the requested time slot. Please try a different time.');
    }

    // Select driver (single driver setup)
    const selectedDriver = availableDrivers[0];
    
    if (!selectedDriver) {
      throw new Error('No driver is available for the requested time slot');
    }

    // Calculate deposit (30% of total fare)
    const fare = bookingData.fare || bookingData.trip?.fare || 0;
    const depositAmount = Math.round(fare * 0.3 * 100) / 100; // Round to 2 decimal places
    const balanceDue = fare - depositAmount;

    const db = getAdminDb();
    // Create booking document
    const bookingDoc = {
      ...bookingData,
      driverId: selectedDriver.driverId,
      driverName: selectedDriver.driverName,
      depositAmount,
      balanceDue,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('bookings').add(bookingDoc);
    const bookingId = docRef.id;

    // Book the time slot in the driver's schedule
    await driverSchedulingService.bookTimeSlot(
      selectedDriver.driverId,
      selectedDriver.driverName,
      dateStr,
      startTime,
      endTime,
      bookingId,
      bookingData.name || bookingData.customer?.name || 'Customer',
      bookingData.pickupLocation || bookingData.trip?.pickup?.address || '',
      bookingData.dropoffLocation || bookingData.trip?.dropoff?.address || ''
    );

    console.log(`Booking created successfully: ${bookingId} with driver: ${selectedDriver.driverName}`);
    return { bookingId };
  } catch (error) {
    console.error('Error creating booking:', error);
    throw new Error('Failed to create booking');
  }
};

// Get booking with real-time status
export const getBooking = async (bookingId: string): Promise<Booking | null> => {
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
    
    return {
      id: doc.id,
      ...data,
      pickupDateTime: safeToDate(data?.pickupDateTime),
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

// Cancel booking with refund logic and schedule cleanup
export const cancelBooking = async (bookingId: string, reason?: string): Promise<void> => {
  const db = getAdminDb();
  // Get booking first to check for calendar event
  const booking = await getBooking(bookingId);
  
  // Delete calendar event if it exists
  if (booking?.calendarEventId) {
    try {
      // Skip calendar operations in smoke test mode
      const isSmokeTest = process.env.SMOKE_TEST_MODE === 'true';
      if (isSmokeTest) {
        console.log(`🧪 Smoke test mode - skipping calendar event deletion for booking ${bookingId}`);
      } else {
        // Try to get calendar tokens from environment or stored location
        // For now, we'll attempt deletion if calendar integration is enabled
        const calendarIntegrationEnabled = process.env.ENABLE_GOOGLE_CALENDAR === 'true';
        
        if (calendarIntegrationEnabled) {
        // Import calendar service
        const { 
          createOAuth2Client, 
          setCredentials, 
          initializeCalendarAPI, 
          deleteBookingEvent 
        } = await import('./google-calendar');
        
        // Try to get stored tokens (TODO: implement secure token storage)
        // For now, check if we have tokens in environment or need to fetch from DB
        const storedTokens = process.env.GOOGLE_CALENDAR_TOKENS 
          ? JSON.parse(process.env.GOOGLE_CALENDAR_TOKENS) 
          : null;
        
        if (storedTokens) {
          const oauth2Client = createOAuth2Client();
          setCredentials(oauth2Client, storedTokens);
          const calendar = initializeCalendarAPI(oauth2Client);
          
          await deleteBookingEvent(calendar, booking.calendarEventId);
          console.log(`✅ Deleted calendar event ${booking.calendarEventId} for booking ${bookingId}`);
        } else {
          console.warn(`⚠️ Calendar tokens not available - cannot delete event ${booking.calendarEventId} for booking ${bookingId}`);
        }
        }
      }
    } catch (error) {
      // Don't fail cancellation if calendar deletion fails
      console.error(`Failed to delete calendar event for booking ${bookingId}:`, error);
    }
  }
  
  await db.collection('bookings').doc(bookingId).update({
    status: 'cancelled',
    updatedAt: FieldValue.serverTimestamp(),
    cancellationReason: reason,
    calendarEventId: null, // Clear the calendar event ID
  });
  
  // Free up the time slot in the driver's schedule
  await driverSchedulingService.cancelBooking(bookingId);
  
  // TODO: Implement refund logic with Square API
  // await processRefund(bookingId);
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

// Time slot availability check
export const isTimeSlotAvailable = async (pickupDate: Date, bufferMinutes = 60): Promise<boolean> => {
  try {
    // Get all bookings for the same day
    const startOfDay = new Date(pickupDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(pickupDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const bookings = await getBookings();
    const dayBookings = bookings.filter(booking => {
      const bookingDate = safeToDate(booking.pickupDateTime);
      return bookingDate >= startOfDay && bookingDate <= endOfDay;
    });
    
    // Check if the requested time slot conflicts with existing bookings
    const requestedStart = new Date(pickupDate.getTime() - bufferMinutes * 60 * 1000);
    const requestedEnd = new Date(pickupDate.getTime() + bufferMinutes * 60 * 1000);
    
    for (const booking of dayBookings) {
      const bookingStart = new Date(safeToDate(booking.pickupDateTime).getTime() - bufferMinutes * 60 * 1000);
      const bookingEnd = new Date(safeToDate(booking.pickupDateTime).getTime() + bufferMinutes * 60 * 1000);
      
      if (requestedStart < bookingEnd && requestedEnd > bookingStart) {
        return false; // Time slot conflicts
      }
    }
    
    return true; // Time slot is available
  } catch (error) {
    console.error('Error checking time slot availability:', error);
    return false;
  }
};

// Get available drivers for a specific time
export const getAvailableDrivers = async (pickupTime?: Date): Promise<Driver[]> => {
  try {
    const db = getAdminDb();
    // Query database for available drivers
    const driversSnapshot = await db.collection('drivers').where('status', '==', 'available').get();
    
    if (driversSnapshot.empty) {
      return [];
    }
    
    const availableDrivers = driversSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }) as Driver);
    
    // If a specific pickup time is provided, check availability
    if (pickupTime) {
      const isAvailable = await isTimeSlotAvailable(pickupTime);
      if (!isAvailable) {
        return []; // No drivers available for this time
      }
    }
    
    return availableDrivers;
  } catch (error) {
    console.error('Error getting available drivers:', error);
    return [];
  }
};
