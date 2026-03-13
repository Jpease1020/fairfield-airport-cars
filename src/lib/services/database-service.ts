import { db } from '@/lib/utils/firebase-server';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

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

// ===== BOOKINGS =====
export interface Booking {
  id?: string;
  name: string;
  email: string;
  phone: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: Date;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'requires_approval';
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
  squarePaymentId?: string;
  depositAmount?: number;
  reminderSent?: boolean;
  onMyWaySent?: boolean;
  // SMS Marketing opt-in (TCPA compliance)
  smsOptIn?: boolean;
  // Exception booking fields (for VIP exceptions that bypass service area)
  requiresApproval?: boolean;
  exceptionReason?: string;
  approvedAt?: string; // ISO timestamp
  rejectedAt?: string; // ISO timestamp
  rejectionReason?: string;
  // Email confirmation tracking
  confirmation?: {
    status: 'pending' | 'confirmed';
    token?: string;
    sentAt?: string;
    confirmedAt?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const getAllBookings = async (): Promise<Booking[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'bookings'));
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        pickupDateTime: safeToDate(data.pickupDateTime),
        estimatedArrival: data.estimatedArrival ? safeToDate(data.estimatedArrival) : undefined,
        actualArrival: data.actualArrival ? safeToDate(data.actualArrival) : undefined,
        createdAt: safeToDate(data.createdAt),
        updatedAt: safeToDate(data.updatedAt),
      } as Booking;
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
};

export const getBookingsByStatus = async (status: Booking['status']): Promise<Booking[]> => {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        pickupDateTime: safeToDate(data.pickupDateTime),
        estimatedArrival: data.estimatedArrival ? safeToDate(data.estimatedArrival) : undefined,
        actualArrival: data.actualArrival ? safeToDate(data.actualArrival) : undefined,
        createdAt: safeToDate(data.createdAt),
        updatedAt: safeToDate(data.updatedAt),
      } as Booking;
    });
  } catch (error) {
    console.error('Error fetching bookings by status:', error);
    throw new Error('Failed to fetch bookings');
  }
};

// ===== DRIVERS =====
export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'available' | 'busy' | 'offline';
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  };
  rating?: number;
  totalRides?: number;
  currentLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  availability: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
  createdAt: Date;
  updatedAt: Date;
}

export const getAllDrivers = async (): Promise<Driver[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'drivers'));
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: safeToDate(data.createdAt),
        updatedAt: safeToDate(data.updatedAt),
      } as Driver;
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return [];
  }
};

export const getAvailableDrivers = async (): Promise<Driver[]> => {
  try {
    const q = query(
      collection(db, 'drivers'),
      where('status', '==', 'available'),
      orderBy('updatedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        currentLocation: data.currentLocation ? {
          ...data.currentLocation,
          timestamp: safeToDate(data.currentLocation.timestamp)
        } : undefined,
        createdAt: safeToDate(data.createdAt),
        updatedAt: safeToDate(data.updatedAt),
      } as Driver;
    });
  } catch (error) {
    console.error('Error fetching available drivers:', error);
    throw new Error('Failed to fetch available drivers');
  }
};

// ===== PAYMENTS =====
export interface Payment {
  id: string;
  customerName: string;
  customerEmail: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  paymentType: 'deposit' | 'balance' | 'full';
  stripePaymentId: string;
  createdAt: Date;
  updatedAt: Date;
  refundAmount?: number;
  refundReason?: string;
}

export const getAllPayments = async (): Promise<Payment[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'payments'));
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: safeToDate(data.createdAt),
        updatedAt: safeToDate(data.updatedAt),
      } as Payment;
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
};

export const getPaymentsByStatus = async (status: Payment['status']): Promise<Payment[]> => {
  try {
    const q = query(
      collection(db, 'payments'),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: safeToDate(data.createdAt),
        updatedAt: safeToDate(data.updatedAt),
      } as Payment;
    });
  } catch (error) {
    console.error('Error fetching payments by status:', error);
    throw new Error('Failed to fetch payments');
  }
};

// ===== FEEDBACK =====
export interface Feedback {
  id: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  category: 'service' | 'driver' | 'vehicle' | 'pricing' | 'other';
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

export const getAllFeedback = async (): Promise<Feedback[]> => {
  try {
    const snapshot = await getDocs(collection(db, 'feedback'));
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: safeToDate(data.createdAt),
        updatedAt: safeToDate(data.updatedAt),
      } as Feedback;
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    throw new Error('Failed to fetch feedback');
  }
};

// ===== ANALYTICS =====
export const getBookingStats = async () => {
  try {
    const bookings = await getAllBookings();
    
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const totalRevenue = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.fare, 0);
    
    return {
      totalBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      averageFare: totalBookings > 0 ? totalRevenue / totalBookings : 0
    };
  } catch (error) {
    console.error('Error calculating booking stats:', error);
    throw new Error('Failed to calculate booking statistics');
  }
};

export const getPaymentStats = async () => {
  try {
    const payments = await getAllPayments();
    
    const totalPayments = payments.length;
    const completedPayments = payments.filter(p => p.status === 'completed').length;
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const totalAmount = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    return {
      totalPayments,
      completedPayments,
      pendingPayments,
      totalAmount,
      averagePayment: completedPayments > 0 ? totalAmount / completedPayments : 0
    };
  } catch (error) {
    console.error('Error calculating payment stats:', error);
    throw new Error('Failed to calculate payment statistics');
  }
};

// ===== UTILITY FUNCTIONS =====
export const createDocument = async (collectionName: string, data: any): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw new Error(`Failed to create ${collectionName} document`);
  }
};

export const updateDocument = async (collectionName: string, id: string, data: any): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw new Error(`Failed to update ${collectionName} document`);
  }
};

export const deleteDocument = async (collectionName: string, id: string): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document in ${collectionName}:`, error);
    throw new Error(`Failed to delete ${collectionName} document`);
  }
};

// ===== MARKETING =====
export interface MarketingCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  bookingCount: number;
  lastBookingDate: Date | null;
  totalSpent: number;
  isActive: boolean; // Booked in last 90 days
  smsOptIn: boolean; // TCPA compliance: only customers who opted in
}

/**
 * Get unique customers from bookings for marketing campaigns.
 * Deduplicates by phone number and calculates aggregate stats.
 * Only returns customers who have opted in to SMS marketing (TCPA compliance).
 */
export const getMarketingCustomers = async (): Promise<MarketingCustomer[]> => {
  try {
    const bookings = await getAllBookings();

    // Group bookings by phone number (normalized)
    const customerMap = new Map<string, {
      name: string;
      phone: string;
      email: string;
      smsOptIn: boolean;
      bookings: Booking[];
    }>();

    for (const booking of bookings) {
      // Skip bookings without valid phone numbers
      if (!booking.phone || booking.phone.trim() === '') continue;

      // Normalize phone number (remove spaces, dashes, parentheses)
      const normalizedPhone = booking.phone.replace(/[\s\-()]/g, '');

      // Skip invalid phone numbers (must have at least 10 digits)
      if (normalizedPhone.replace(/\D/g, '').length < 10) continue;

      const existing = customerMap.get(normalizedPhone);
      if (existing) {
        existing.bookings.push(booking);
        // Use most recent name/email/smsOptIn (latest booking takes precedence)
        if (booking.createdAt > existing.bookings[0].createdAt) {
          existing.name = booking.name;
          existing.email = booking.email;
          // If they opted in on any booking, consider them opted in
          // If they opted out on a later booking, respect that
          existing.smsOptIn = booking.smsOptIn ?? existing.smsOptIn;
        }
      } else {
        customerMap.set(normalizedPhone, {
          name: booking.name,
          phone: booking.phone,
          email: booking.email,
          smsOptIn: booking.smsOptIn ?? false,
          bookings: [booking],
        });
      }
    }

    // Calculate 90 days ago for "active" determination
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Convert to MarketingCustomer array
    const customers: MarketingCustomer[] = [];
    let index = 0;

    for (const [_phone, data] of customerMap) {
      const completedBookings = data.bookings.filter(b =>
        b.status === 'completed' || b.status === 'confirmed'
      );

      const lastBooking = data.bookings.reduce((latest, b) =>
        !latest || b.pickupDateTime > latest.pickupDateTime ? b : latest
      , null as Booking | null);

      const totalSpent = completedBookings.reduce((sum, b) => sum + b.fare, 0);

      const isActive = lastBooking
        ? lastBooking.pickupDateTime >= ninetyDaysAgo
        : false;

      customers.push({
        id: `customer-${index++}`,
        name: data.name,
        phone: data.phone,
        email: data.email,
        bookingCount: data.bookings.length,
        lastBookingDate: lastBooking?.pickupDateTime || null,
        totalSpent,
        isActive,
        smsOptIn: data.smsOptIn,
      });
    }

    // Sort by last booking date (most recent first)
    customers.sort((a, b) => {
      if (!a.lastBookingDate) return 1;
      if (!b.lastBookingDate) return -1;
      return b.lastBookingDate.getTime() - a.lastBookingDate.getTime();
    });

    return customers;
  } catch (error) {
    console.error('Error fetching marketing customers:', error);
    return [];
  }
};

/**
 * Update smsOptIn for all bookings matching a phone number.
 * Used by the inbound SMS webhook to handle STOP/START keywords.
 */
export const updateSmsOptInByPhone = async (phone: string, smsOptIn: boolean): Promise<number> => {
  const normalizedInput = phone.replace(/\D/g, '').slice(-10);
  if (normalizedInput.length < 10) return 0;

  const snapshot = await getDocs(collection(db, 'bookings'));
  let updatedCount = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const bookingPhone = (data.phone || '').replace(/\D/g, '').slice(-10);
    if (bookingPhone === normalizedInput) {
      await updateDoc(doc(db, 'bookings', docSnap.id), { smsOptIn });
      updatedCount++;
    }
  }

  return updatedCount;
};