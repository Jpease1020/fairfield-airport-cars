
export interface Booking {
  id?: string;
  name: string;
  email: string;
  phone: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: Date;
  flightNumber?: string;
  passengers: number;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  fare: number;
  createdAt: Date;
  updatedAt: Date;
}

