import { v4 as uuidv4 } from 'uuid';

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
  currentLocation?: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
  status: 'available' | 'busy' | 'offline';
  calendarId?: string; // Google Calendar ID for sync
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

// Initialize Gregg as the main driver
export const initializeGreggDriver = (): Driver => {
  return {
    id: 'gregg-main-driver',
    name: 'Gregg',
    phone: '(203) 555-0123',
    email: 'gregg@fairfieldairportcars.com',
    vehicleInfo: {
      make: 'Toyota',
      model: 'Highlander',
      year: 2022,
      color: 'Silver',
      licensePlate: 'CT-ABC123'
    },
    availability: {
      monday: { start: '06:00', end: '22:00', available: true },
      tuesday: { start: '06:00', end: '22:00', available: true },
      wednesday: { start: '06:00', end: '22:00', available: true },
      thursday: { start: '06:00', end: '22:00', available: true },
      friday: { start: '06:00', end: '22:00', available: true },
      saturday: { start: '06:00', end: '22:00', available: true },
      sunday: { start: '06:00', end: '22:00', available: true }
    },
    status: 'available',
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// Driver management functions
export const getDriver = async (driverId: string): Promise<Driver | null> => {
  // In a real app, this would fetch from database
  // For now, return Gregg's profile
  if (driverId === 'gregg-main-driver') {
    return initializeGreggDriver();
  }
  return null;
};

export const updateDriverLocation = async (
  driverId: string, 
  latitude: number, 
  longitude: number,
  heading?: number,
  speed?: number
): Promise<void> => {
  // In a real app, this would update the database
  console.log(`Driver ${driverId} location updated:`, { latitude, longitude, heading, speed });
};

export const updateDriverStatus = async (driverId: string, status: Driver['status']): Promise<void> => {
  // In a real app, this would update the database
  console.log(`Driver ${driverId} status updated to:`, status);
};

export const checkDriverAvailability = async (
  driverId: string, 
  date: Date, 
  time: string
): Promise<boolean> => {
  const driver = await getDriver(driverId);
  if (!driver) return false;

  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof typeof driver.availability;
  const daySchedule = driver.availability[dayOfWeek];
  
  if (!daySchedule.available) return false;

  const requestedTime = new Date(`2000-01-01T${time}`);
  const startTime = new Date(`2000-01-01T${daySchedule.start}`);
  const endTime = new Date(`2000-01-01T${daySchedule.end}`);

  return requestedTime >= startTime && requestedTime <= endTime;
};

export const assignDriverToBooking = async (bookingId: string): Promise<string> => {
  // For now, always assign Gregg
  // In a real app, this would check availability and assign the best driver
  return 'gregg-main-driver';
};

export const getDriverSchedule = async (driverId: string, date: Date): Promise<any[]> => {
  // In a real app, this would fetch from Google Calendar or database
  return [];
};

export const updateDriverSchedule = async (driverId: string, date: Date, bookings: any[]): Promise<void> => {
  // In a real app, this would sync with Google Calendar
  console.log(`Updating driver ${driverId} schedule for ${date}:`, bookings);
}; 