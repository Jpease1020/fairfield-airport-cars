import { Booking as NewBooking } from '@/types/booking';
import { Booking as OldBooking } from '@/lib/services/booking-service';

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
      pickupDateTime: oldBooking.trip?.pickupDateTime 
        ? (oldBooking.trip.pickupDateTime instanceof Date 
            ? oldBooking.trip.pickupDateTime.toISOString() 
            : String(oldBooking.trip.pickupDateTime))
        : (oldBooking.pickupDateTime 
            ? (oldBooking.pickupDateTime instanceof Date 
                ? oldBooking.pickupDateTime.toISOString() 
                : new Date(oldBooking.pickupDateTime).toISOString())
            : new Date().toISOString()),
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
      saveInfoForFuture: oldBooking.customer?.saveInfoForFuture || false
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
