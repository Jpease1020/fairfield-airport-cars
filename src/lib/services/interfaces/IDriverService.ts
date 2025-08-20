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
  calendarId?: string;
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

export interface IDriverService {
  getDriver(driverId: string): Promise<Driver | null>;
  updateDriverLocation(driverId: string, latitude: number, longitude: number, heading?: number, speed?: number): Promise<void>;
  updateDriverStatus(driverId: string, status: Driver['status']): Promise<void>;
  checkDriverAvailability(driverId: string, date: Date, time: string): Promise<boolean>;
  getAvailableDrivers(location: { latitude: number; longitude: number }): Promise<Driver[]>;
  assignDriverToBooking(bookingId: string, driverId: string): Promise<string>;
}
