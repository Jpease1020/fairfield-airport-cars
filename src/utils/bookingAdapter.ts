import { Booking as NewBooking } from '@/types/booking';
import { Booking as OldBooking } from '@/lib/services/booking-service';

/**
 * Helper to safely convert various date formats to ISO string
 * Handles: Date objects, ISO strings, Firestore Timestamps (with _seconds or seconds), numbers
 */
function safeToISOString(dateValue: any): string {
  if (!dateValue) {
    return new Date().toISOString();
  }

  // Already a Date object
  if (dateValue instanceof Date) {
    return dateValue.toISOString();
  }

  // Already an ISO string
  if (typeof dateValue === 'string') {
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  }

  // Firestore Timestamp with toDate method
  if (typeof dateValue === 'object' && typeof dateValue.toDate === 'function') {
    return dateValue.toDate().toISOString();
  }

  // Firestore Timestamp serialized with _seconds (from JSON)
  if (typeof dateValue === 'object' && '_seconds' in dateValue) {
    return new Date(dateValue._seconds * 1000).toISOString();
  }

  // Firestore Timestamp with seconds property
  if (typeof dateValue === 'object' && 'seconds' in dateValue) {
    return new Date(dateValue.seconds * 1000).toISOString();
  }

  // Unix timestamp (number)
  if (typeof dateValue === 'number') {
    return new Date(dateValue).toISOString();
  }

  // Fallback - log and return current date
  console.warn('[bookingAdapter] Could not parse date value:', dateValue);
  return new Date().toISOString();
}

/**
 * Converts old Booking interface to new Booking interface
 * This maintains backward compatibility while using the new structure
 */
export function adaptOldBookingToNew(oldBooking: OldBooking): NewBooking {
  return {
    id: oldBooking.id,
    status: oldBooking.status,
    createdAt: oldBooking.createdAt,
    updatedAt: oldBooking.updatedAt,

    // Core data - map from old structure to new structure
    // Check nested structure first (new format), then fall back to flat fields (old format)
    trip: {
      pickup: {
        address: oldBooking.trip?.pickup?.address || oldBooking.pickupLocation || '',
        coordinates: oldBooking.trip?.pickup?.coordinates || null
      },
      dropoff: {
        address: oldBooking.trip?.dropoff?.address || oldBooking.dropoffLocation || '',
        coordinates: oldBooking.trip?.dropoff?.coordinates || null
      },
      pickupDateTime: safeToISOString(oldBooking.trip?.pickupDateTime || oldBooking.pickupDateTime),
      fareType: oldBooking.trip?.fareType || 'personal',
      flightInfo: oldBooking.trip?.flightInfo || {
        hasFlight: !!oldBooking.flightNumber,
        airline: '',
        flightNumber: oldBooking.flightNumber || '',
        arrivalTime: '',
        terminal: ''
      },
      fare: oldBooking.trip?.fare || oldBooking.fare || 0,
      baseFare: (oldBooking.trip as any)?.baseFare || oldBooking.fare || 0,
      tipAmount: (oldBooking.trip as any)?.tipAmount || oldBooking.tipAmount || 0,
      tipPercent: (oldBooking.trip as any)?.tipPercent || 0,
      totalFare: (oldBooking.trip as any)?.totalFare || ((oldBooking.fare || 0) + (oldBooking.tipAmount || 0))
    },
    
    customer: {
      // Check nested structure first (new format), then fall back to flat fields (old format)
      name: oldBooking.customer?.name || oldBooking.name || '',
      email: oldBooking.customer?.email || oldBooking.email || '',
      phone: oldBooking.customer?.phone || oldBooking.phone || '',
      notes: oldBooking.customer?.notes || oldBooking.notes || '',
      saveInfoForFuture: oldBooking.customer?.saveInfoForFuture || false,
      smsOptIn: oldBooking.customer?.smsOptIn ?? false // Default to false for legacy bookings
    },
    
    payment: {
      depositAmount: oldBooking.depositAmount || null,
      balanceDue: oldBooking.balanceDue || 0,
      depositPaid: oldBooking.depositPaid || false,
      squareOrderId: oldBooking.squareOrderId,
      squarePaymentId: oldBooking.squarePaymentId,
      tipAmount: oldBooking.tipAmount || 0,
      tipPercent: 0,
      totalAmount: (oldBooking.fare || 0) + (oldBooking.tipAmount || 0)
    },
    
    // Optional data
    driver: oldBooking.driverId ? {
      id: oldBooking.driverId,
      name: oldBooking.driverName || '',
      phone: '',
      estimatedArrival: oldBooking.estimatedArrival,
      actualArrival: oldBooking.actualArrival
    } : undefined,
    
    tracking: oldBooking.driverLocation ? {
      driverLocation: oldBooking.driverLocation,
      status: oldBooking.status,
      lastUpdated: new Date()
    } : undefined,
  
  confirmation: oldBooking.confirmation
    ? {
        status: oldBooking.confirmation.status,
        token: oldBooking.confirmation.token,
        sentAt: oldBooking.confirmation.sentAt
          ? (oldBooking.confirmation.sentAt instanceof Date
              ? oldBooking.confirmation.sentAt.toISOString()
              : String(oldBooking.confirmation.sentAt))
          : undefined,
        confirmedAt: oldBooking.confirmation.confirmedAt
          ? (oldBooking.confirmation.confirmedAt instanceof Date
              ? oldBooking.confirmation.confirmedAt.toISOString()
              : String(oldBooking.confirmation.confirmedAt))
          : undefined
      }
    : {
        status: oldBooking.status === 'confirmed' ? 'confirmed' : 'pending'
      },
    
    // Legacy fields for backward compatibility
    pickupLocation: oldBooking.pickupLocation,
    dropoffLocation: oldBooking.dropoffLocation,
    pickupDateTime: oldBooking.pickupDateTime,
    fare: oldBooking.fare,
    dynamicFare: oldBooking.dynamicFare,
    depositPaid: oldBooking.depositPaid,
    balanceDue: oldBooking.balanceDue,
    flightNumber: oldBooking.flightNumber,
    notes: oldBooking.notes,
    driverId: oldBooking.driverId,
    driverName: oldBooking.driverName,
    estimatedArrival: oldBooking.estimatedArrival,
    actualArrival: oldBooking.actualArrival,
    tipAmount: oldBooking.tipAmount,
    cancellationFee: oldBooking.cancellationFee,
    squareOrderId: oldBooking.squareOrderId,
    squarePaymentId: oldBooking.squarePaymentId,
    depositAmount: oldBooking.depositAmount,
    reminderSent: oldBooking.reminderSent,
    onMyWaySent: oldBooking.onMyWaySent
  };
}
