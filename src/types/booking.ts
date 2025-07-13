
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
  depositPaid: boolean;
  balanceDue: number; // remaining amount in dollars to be charged post-ride
  squareOrderId?: string;
  depositAmount?: number; // deposit in dollars
  cancellationFee?: number; // fee retained on cancellation
  reminderSent?: boolean; // 24h reminder
  onMyWaySent?: boolean; // driver en route message
  tipAmount?: number; // dollars
  createdAt: Date;
  updatedAt: Date;
}

