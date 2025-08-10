import { db } from '@/lib/utils/firebase';
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