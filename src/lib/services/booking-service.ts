import { db } from '@/lib/utils/firebase';
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

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
  name: string;
  email: string;
  phone: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: Date;
  passengers: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  fare: number;
  dynamicFare?: number;
  depositPaid: boolean;
  balanceDue: number;
  flightNumber?: string;
  notes?: string;
  driverId?: string;
  driverName?: string;
  estimatedArrival?: Date;
  actualArrival?: Date;
  tipAmount?: number;
  cancellationFee?: number;
  squareOrderId?: string;
  depositAmount?: number;
  reminderSent?: boolean;
  onMyWaySent?: boolean;
  createdAt: Date;
  updatedAt: Date;
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

// Dynamic pricing calculation based on time, demand, and distance
export const calculateDynamicFare = (baseFare: number, pickupTime: Date, distance: number): number => {
  const hour = pickupTime.getHours();
  const dayOfWeek = pickupTime.getDay();
  
  // Base multipliers
  let multiplier = 1.0;
  
  // Peak time pricing (6-9 AM and 4-7 PM)
  const isPeakTime = (hour >= 6 && hour <= 9) || (hour >= 16 && hour <= 19);
  if (isPeakTime) multiplier *= 1.3;
  
  // Weekend pricing
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  if (isWeekend) multiplier *= 1.2;
  
  // Holiday pricing (simplified - could be enhanced with holiday API)
  const isHoliday = false; // TODO: Integrate with holiday API
  if (isHoliday) multiplier *= 1.25;
  
  // Distance-based pricing
  if (distance > 50) multiplier *= 1.1; // Long distance premium
  if (distance > 100) multiplier *= 1.2; // Very long distance premium
  
  // Weather conditions (could be enhanced with weather API)
  // For now, using a simple time-based approximation
  
  return Math.round(baseFare * multiplier);
};

// Real-time booking status management
export const updateBookingStatus = async (bookingId: string, status: Booking['status'], driverId?: string): Promise<void> => {
  const bookingRef = doc(db, 'bookings', bookingId);
  
  const updateData: any = {
    status,
    updatedAt: serverTimestamp(),
  };
  
  if (driverId) {
    updateData.driverId = driverId;
    // Get driver info
    const driverDoc = await getDoc(doc(db, 'drivers', driverId));
    if (driverDoc.exists()) {
      const driverData = driverDoc.data() as Driver;
      updateData.driverName = driverData.name;
    }
  }
  
  await updateDoc(bookingRef, updateData);
};

// Driver availability management
export const getAvailableDrivers = async (): Promise<Driver[]> => {
  const driversRef = collection(db, 'drivers');
  const q = query(driversRef, where('status', '==', 'available'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Driver[];
};

// Assign driver to booking
export const assignDriverToBooking = async (bookingId: string, driverId: string): Promise<void> => {
  const bookingRef = doc(db, 'bookings', bookingId);
  const driverRef = doc(db, 'drivers', driverId);
  
  // Update booking with driver assignment
  await updateDoc(bookingRef, {
    driverId,
    status: 'confirmed',
    updatedAt: serverTimestamp(),
  });
  
  // Update driver status to busy
  await updateDoc(driverRef, {
    status: 'busy',
    lastUpdated: serverTimestamp(),
  });
};

// Enhanced booking creation with dynamic pricing
export const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  // Calculate dynamic fare
  const dynamicFare = calculateDynamicFare(
    bookingData.fare,
    bookingData.pickupDateTime,
    0 // TODO: Calculate actual distance using Google Maps API
  );
  
  const booking = {
    ...bookingData,
    dynamicFare,
    balanceDue: dynamicFare - (bookingData.depositPaid ? bookingData.fare : 0),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(collection(db, 'bookings'), booking);
  return docRef.id;
};

// Get booking with real-time status
export const getBooking = async (bookingId: string): Promise<Booking | null> => {
  const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
  
  if (!bookingDoc.exists()) {
    return null;
  }
  
  const data = bookingDoc.data();
  
  return {
    id: bookingDoc.id,
    ...data,
    pickupDateTime: safeToDate(data.pickupDateTime),
    createdAt: safeToDate(data.createdAt),
    updatedAt: safeToDate(data.updatedAt),
  } as Booking;
};

// Get all bookings with filtering and sorting
export const getBookings = async (
  status?: Booking['status'],
  limit?: number
): Promise<Booking[]> => {
  let q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
  
  if (status) {
    q = query(q, where('status', '==', status));
  }
  
  if (limit) {
    q = query(q, orderBy('createdAt', 'desc'));
  }
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      pickupDateTime: safeToDate(data.pickupDateTime),
      createdAt: safeToDate(data.createdAt),
      updatedAt: safeToDate(data.updatedAt),
    };
  }) as Booking[];
};

// Legacy exports for backward compatibility
export const listBookings = getBookings;
export const updateBooking = async (id: string, updates: Partial<Booking>): Promise<void> => {
  const docRef = doc(db, 'bookings', id);
  await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
};

export const deleteBooking = async (id: string): Promise<void> => {
  const docRef = doc(db, 'bookings', id);
  await updateDoc(docRef, { status: 'cancelled', updatedAt: serverTimestamp() });
};

// Cancel booking with refund logic
export const cancelBooking = async (bookingId: string, reason?: string): Promise<void> => {
  const bookingRef = doc(db, 'bookings', bookingId);
  
  await updateDoc(bookingRef, {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
    cancellationReason: reason,
  });
  
  // TODO: Implement refund logic with Square API
  // await processRefund(bookingId);
};

// Update driver location for real-time tracking
export const updateDriverLocation = async (driverId: string, location: { lat: number; lng: number }): Promise<void> => {
  const driverRef = doc(db, 'drivers', driverId);
  
  await updateDoc(driverRef, {
    currentLocation: location,
    lastUpdated: serverTimestamp(),
  });
};

// Get estimated arrival time based on driver location and traffic
export const getEstimatedArrival = async (bookingId: string): Promise<Date | null> => {
  const booking = await getBooking(bookingId);
  if (!booking || !booking.driverId) return null;
  
  const driverDoc = await getDoc(doc(db, 'drivers', booking.driverId));
  if (!driverDoc.exists()) return null;
  
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
    const response = await fetch('/api/check-time-slot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickupDateTime: pickupDate.toISOString(),
        bufferMinutes,
      }),
    });

    const result = await response.json();
    return result.isAvailable || true; // Default to available if API fails
  } catch (error) {
    console.error('Error checking time slot:', error);
    return true; // Default to available to avoid blocking bookings
  }
};
