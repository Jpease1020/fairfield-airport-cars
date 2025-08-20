export interface CreateBookingData {
  name: string;
  email: string;
  phone: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: Date;
  passengers: number;
  fare: number;
  flightNumber?: string;
  notes?: string;
}

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
  driverLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
    heading?: number;
    speed?: number;
  };
}

export interface IBookingService {
  createBooking(data: CreateBookingData): Promise<string>;
  getBooking(bookingId: string): Promise<Booking | null>;
  updateBooking(bookingId: string, updates: Partial<Booking>): Promise<void>;
  cancelBooking(bookingId: string): Promise<void>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  getBookingsByDriver(driverId: string): Promise<Booking[]>;
  getAllBookings(): Promise<Booking[]>;
  assignDriver(bookingId: string, driverId: string): Promise<void>;
  calculateFare(pickupLocation: string, dropoffLocation: string, passengers: number): Promise<number>;
}
