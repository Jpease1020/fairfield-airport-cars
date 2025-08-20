import { collection, doc, getDoc, updateDoc, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/utils/firebase';

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
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
  status: 'available' | 'busy' | 'offline';
  currentLocation?: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DriverLocation {
  driverId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  heading?: number; // Direction in degrees
  speed?: number; // Speed in mph
}

// Driver management functions - All database-driven
export const getDriver = async (driverId: string): Promise<Driver | null> => {
  try {
    if (!db) {
      console.error('Database not initialized');
      return null;
    }
    const driverDoc = await getDoc(doc(db, 'drivers', driverId));
    if (driverDoc.exists()) {
      return { id: driverDoc.id, ...driverDoc.data() } as Driver;
    }
    return null;
  } catch (error) {
    console.error('Error fetching driver:', error);
    return null;
  }
};

export const updateDriverLocation = async (
  driverId: string, 
  latitude: number, 
  longitude: number,
  heading?: number,
  speed?: number
): Promise<void> => {
  try {
    if (!db) {
      throw new Error('Database not initialized');
    }
    await updateDoc(doc(db, 'drivers', driverId), {
      currentLocation: {
        latitude,
        longitude,
        timestamp: new Date(),
        heading,
        speed
      },
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating driver location:', error);
    throw error;
  }
};

export const updateDriverStatus = async (driverId: string, status: Driver['status']): Promise<void> => {
  try {
    if (!db) {
      throw new Error('Database not initialized');
    }
    await updateDoc(doc(db, 'drivers', driverId), {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating driver status:', error);
    throw error;
  }
};

export const checkDriverAvailability = async (
  driverId: string, 
  date: Date, 
  time: string
): Promise<boolean> => {
  try {
    const driver = await getDriver(driverId);
    if (!driver) return false;

    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof driver.availability;
    const daySchedule = driver.availability[dayOfWeek];
    
    if (!daySchedule.available) return false;

    const requestedTime = new Date(`2000-01-01T${time}`);
    const startTime = new Date(`2000-01-01T${daySchedule.start}`);
    const endTime = new Date(`2000-01-01T${daySchedule.end}`);

    return requestedTime >= startTime && requestedTime <= endTime;
  } catch (error) {
    console.error('Error checking driver availability:', error);
    return false;
  }
};

export const assignDriverToBooking = async (bookingId: string): Promise<string> => {
  try {
    if (!db) {
      throw new Error('Database not initialized');
    }
    // Find available drivers
    const driversQuery = query(collection(db, 'drivers'), where('status', '==', 'available'));
    const driversSnapshot = await getDocs(driversQuery);
    
    if (driversSnapshot.empty) {
      throw new Error('No available drivers');
    }
    
    // For now, assign the first available driver
    // In the future, this could implement smart assignment logic
    const firstDriver = driversSnapshot.docs[0];
    return firstDriver.id;
  } catch (error) {
    console.error('Error assigning driver:', error);
    throw error;
  }
};

export const getDriverSchedule = async (driverId: string, date: Date): Promise<any[]> => {
  return [];
  // try {
  //   // This would fetch from a schedule collection or Google Calendar integration
  //   // For now, return empty array - implement when needed
  // } catch (error) {
  //   console.error('Error fetching driver schedule:', error);
  //   throw error;
  // }
};

export const updateDriverSchedule = async (driverId: string, date: Date, bookings: any[]): Promise<void> => {
  try {
    // This would sync with a schedule collection or Google Calendar
    // For now, just log - implement when needed
    console.log(`Updating driver ${driverId} schedule for ${date}:`, bookings);
  } catch (error) {
    console.error('Error updating driver schedule:', error);
    throw error;
  }
};

export const getAllDrivers = async (): Promise<Driver[]> => {
  try {
    if (!db) {
      console.error('Database not initialized');
      return [];
    }
    const driversSnapshot = await getDocs(collection(db, 'drivers'));
    return driversSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Driver);
  } catch (error) {
    console.error('Error fetching all drivers:', error);
    return [];
  }
};

export const createDriver = async (driverData: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    if (!db) {
      throw new Error('Database not initialized');
    }
    const docRef = await addDoc(collection(db, 'drivers'), {
      ...driverData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating driver:', error);
    throw error;
  }
}; 