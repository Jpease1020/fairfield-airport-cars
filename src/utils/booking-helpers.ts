/**
 * Booking Data Helpers
 *
 * Centralized utilities for accessing booking data that handle both
 * nested structure (customer.name, trip.pickup.address) and legacy
 * flat structure (name, pickupLocation).
 *
 * All services should use these helpers instead of accessing booking
 * properties directly to ensure consistency.
 */

// Type for any booking object (handles both structures)
type AnyBooking = Record<string, any>;

/**
 * Get customer name from booking
 */
export function getCustomerName(booking: AnyBooking): string {
  return booking?.customer?.name ?? booking?.name ?? '';
}

/**
 * Get customer email from booking
 */
export function getCustomerEmail(booking: AnyBooking): string {
  return booking?.customer?.email ?? booking?.email ?? '';
}

/**
 * Get customer phone from booking
 */
export function getCustomerPhone(booking: AnyBooking): string {
  return booking?.customer?.phone ?? booking?.phone ?? '';
}

/**
 * Get customer notes from booking
 */
export function getCustomerNotes(booking: AnyBooking): string {
  return booking?.customer?.notes ?? booking?.notes ?? '';
}

/**
 * Get SMS opt-in status from booking
 */
export function getSmsOptIn(booking: AnyBooking): boolean {
  return booking?.customer?.smsOptIn ?? booking?.smsOptIn ?? false;
}

/**
 * Get pickup address from booking
 */
export function getPickupAddress(booking: AnyBooking): string {
  return booking?.trip?.pickup?.address ?? booking?.pickupLocation ?? '';
}

/**
 * Get pickup coordinates from booking
 */
export function getPickupCoordinates(booking: AnyBooking): { lat: number; lng: number } | null {
  return booking?.trip?.pickup?.coordinates ?? null;
}

/**
 * Get dropoff address from booking
 */
export function getDropoffAddress(booking: AnyBooking): string {
  return booking?.trip?.dropoff?.address ?? booking?.dropoffLocation ?? '';
}

/**
 * Get dropoff coordinates from booking
 */
export function getDropoffCoordinates(booking: AnyBooking): { lat: number; lng: number } | null {
  return booking?.trip?.dropoff?.coordinates ?? null;
}

/**
 * Get pickup date/time from booking
 * Returns the raw value - caller should handle Firestore timestamp conversion
 */
export function getPickupDateTime(booking: AnyBooking): any {
  return booking?.trip?.pickupDateTime ?? booking?.pickupDateTime;
}

/**
 * Get fare type from booking
 */
export function getFareType(booking: AnyBooking): 'personal' | 'business' {
  return booking?.trip?.fareType ?? 'personal';
}

/**
 * Get fare amount from booking
 */
export function getFare(booking: AnyBooking): number {
  return booking?.trip?.fare ?? booking?.fare ?? 0;
}

/**
 * Get flight number from booking
 */
export function getFlightNumber(booking: AnyBooking): string {
  return booking?.trip?.flightInfo?.flightNumber ?? booking?.flightNumber ?? '';
}

/**
 * Get flight info object from booking
 */
export function getFlightInfo(booking: AnyBooking): {
  hasFlight: boolean;
  airline: string;
  flightNumber: string;
  arrivalTime: string;
  terminal: string;
} {
  if (booking?.trip?.flightInfo) {
    return booking.trip.flightInfo;
  }
  return {
    hasFlight: !!booking?.flightNumber,
    airline: '',
    flightNumber: booking?.flightNumber ?? '',
    arrivalTime: '',
    terminal: '',
  };
}

/**
 * Get deposit amount from booking
 */
export function getDepositAmount(booking: AnyBooking): number {
  return booking?.payment?.depositAmount ?? booking?.depositAmount ?? 0;
}

/**
 * Check if deposit is paid
 */
export function isDepositPaid(booking: AnyBooking): boolean {
  return booking?.payment?.depositPaid ?? booking?.depositPaid ?? false;
}

/**
 * Get balance due from booking
 */
export function getBalanceDue(booking: AnyBooking): number {
  return booking?.payment?.balanceDue ?? booking?.balanceDue ?? 0;
}

/**
 * Get tip amount from booking
 */
export function getTipAmount(booking: AnyBooking): number {
  return booking?.payment?.tipAmount ?? booking?.tipAmount ?? 0;
}

/**
 * Parse various date formats and convert to Date object
 * Handles: Date objects, ISO strings, Firestore Timestamps, Unix timestamps
 */
export function parseBookingDate(dateValue: any): Date | null {
  if (!dateValue) return null;

  // Already a Date object
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }

  // ISO string
  if (typeof dateValue === 'string') {
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  // Firestore Timestamp with toDate method
  if (typeof dateValue === 'object' && typeof dateValue.toDate === 'function') {
    return dateValue.toDate();
  }

  // Firestore Timestamp serialized with _seconds (from JSON)
  if (typeof dateValue === 'object' && '_seconds' in dateValue) {
    return new Date(dateValue._seconds * 1000);
  }

  // Firestore Timestamp with seconds property
  if (typeof dateValue === 'object' && 'seconds' in dateValue) {
    return new Date(dateValue.seconds * 1000);
  }

  // Unix timestamp (number)
  if (typeof dateValue === 'number') {
    return new Date(dateValue);
  }

  return null;
}

/**
 * Format a booking date for display
 */
export function formatBookingDate(dateValue: any): string {
  const date = parseBookingDate(dateValue);
  if (!date) return 'No date set';

  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return 'Date error';
  }
}

/**
 * Convert date to ISO string safely
 */
export function toISOString(dateValue: any): string {
  const date = parseBookingDate(dateValue);
  return date ? date.toISOString() : new Date().toISOString();
}
