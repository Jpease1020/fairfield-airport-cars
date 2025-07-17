export interface BookingData {
  name: string;
  email: string;
  phone: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: string;
  passengers: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateBookingData(booking: BookingData): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!booking.name?.trim()) {
    errors.push('Name is required');
  }

  if (!booking.email?.trim()) {
    errors.push('Email is required');
  } else if (!isValidEmail(booking.email)) {
    errors.push('Invalid email format');
  }

  if (!booking.phone?.trim()) {
    errors.push('Phone is required');
  }

  if (!booking.pickupLocation?.trim()) {
    errors.push('Pickup location is required');
  }

  if (!booking.dropoffLocation?.trim()) {
    errors.push('Dropoff location is required');
  }

  if (!booking.pickupDateTime) {
    errors.push('Pickup date and time is required');
  } else {
    const pickupDate = new Date(booking.pickupDateTime);
    const now = new Date();
    
    if (pickupDate <= now) {
      errors.push('Pickup date must be in the future');
    }
  }

  if (!booking.passengers || booking.passengers < 1) {
    errors.push('At least 1 passenger is required');
  }

  if (booking.passengers > 10) {
    errors.push('Maximum 10 passengers allowed');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
} 