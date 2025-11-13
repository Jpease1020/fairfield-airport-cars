// Single source of truth for all booking data
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationData {
  address: string;
  coordinates: Coordinates | null;
}

export interface TripDetails {
  pickup: LocationData;
  dropoff: LocationData;
  pickupDateTime: string;
  fareType: 'personal' | 'business';
  flightInfo: FlightInfo;
  // Note: fare is managed via currentQuote during booking, not stored in formData
  // These fields exist only in the database after booking is created
  fare?: number | null;
  baseFare?: number | null;
  tipAmount?: number;
  tipPercent?: number;
  totalFare?: number;
}

export interface FlightInfo {
  hasFlight: boolean;
  airline: string;
  flightNumber: string;
  arrivalTime: string;
  terminal: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  notes: string;
  saveInfoForFuture: boolean;
}

export interface PaymentInfo {
  depositAmount: number | null;
  balanceDue: number;
  depositPaid: boolean;
  squareOrderId?: string;
  squarePaymentId?: string;
  tipAmount: number;
  tipPercent: number;
  totalAmount: number;
}

export interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  estimatedArrival?: Date;
  actualArrival?: Date;
}

export interface TrackingInfo {
  driverLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
    heading?: number;
    speed?: number;
  };
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  lastUpdated: Date;
}

export type BookingStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

export interface BookingConfirmation {
  status: 'pending' | 'confirmed';
  token?: string;
  sentAt?: string;
  confirmedAt?: string;
}

export interface Booking {
  id?: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
  
  // Core data
  trip: TripDetails;
  customer: CustomerInfo;
  payment: PaymentInfo;
  
  // Optional data
  driver?: DriverInfo;
  tracking?: TrackingInfo;
  confirmation?: BookingConfirmation;
  calendarEventId?: string; // Google Calendar event ID for rides@fairfieldairportcars.com
  
  // Legacy fields for backward compatibility
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupDateTime?: Date;
  fare?: number;
  dynamicFare?: number;
  depositPaid?: boolean;
  balanceDue?: number;
  flightNumber?: string;
  notes?: string;
  name?: string;
  email?: string;
  phone?: string;
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
  driverLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
    heading?: number;
    speed?: number;
  };
  flightInfo?: {
    airline?: string;
    flightNumber?: string;
    arrivalTime?: string;
    terminal?: string;
  };
  totalFare?: number;
}

// Form data interfaces
export interface BookingFormData {
  trip: TripDetails;
  customer: CustomerInfo;
  payment: PaymentInfo;
}

// Clean booking creation data (nested structure only)
// Note: pickupDateTime is Date (from API Zod validation), not string
export interface BookingCreateData {
  trip: Omit<TripDetails, 'pickupDateTime'> & { pickupDateTime: Date };
  customer: CustomerInfo;
  payment: PaymentInfo;
  status: BookingStatus;
  driver?: DriverInfo;
  tracking?: TrackingInfo;
  confirmation?: BookingConfirmation;
}

export type BookingPhase = 'trip-details' | 'contact-info' | 'payment' | 'payment-processing' | 'flight-info';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Quote data with expiration (15-minute temporary offer)
export interface QuoteData {
  availabilityWarning?: string | null;
  suggestedTimes?: string[];
  quoteId: string;
  fare: number;
  distanceMiles: number;
  durationMinutes: number;
  fareType: 'personal' | 'business';
  expiresAt: string;  // ISO datetime string
  expiresInMinutes: number;
}