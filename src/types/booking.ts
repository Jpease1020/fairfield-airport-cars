
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
  
  // Real-time tracking fields
  driverLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
    heading?: number;
    speed?: number;
  };
  
  // Advanced Booking Features
  vehicleType?: 'sedan' | 'suv' | 'luxury' | 'van';
  serviceLevel?: 'standard' | 'premium' | 'luxury';
  specialRequests?: {
    childSeat?: boolean;
    wheelchair?: boolean;
    extraLuggage?: boolean;
    meetAndGreet?: boolean;
    flightTracking?: boolean;
  };
  flightInfo?: {
    airline?: string;
    flightNumber?: string;
    arrivalTime?: string;
    terminal?: string;
  };
  vehicleUpgradePrice?: number;
  serviceLevelPrice?: number;
  totalFare?: number;
}

