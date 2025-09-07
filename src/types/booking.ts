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
  fare: number | null;
  baseFare: number | null;
  tipAmount: number;
  tipPercent: number;
  totalFare: number;
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

export type BookingPhase = 'trip-details' | 'contact-info' | 'payment' | 'payment-processing';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}