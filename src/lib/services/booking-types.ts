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

/** Options for cancelBooking when the caller has already computed refund/fee (e.g. cancel-booking API route). Refund is processed via Square when refundAmount (dollars) and squarePaymentId are provided. */
export interface CancelBookingOptions {
  refundAmount?: number; // dollars; converted to cents when calling Square
  squarePaymentId?: string;
  cancellationFee?: number;
}
