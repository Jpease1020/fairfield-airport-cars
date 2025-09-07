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
    trip: {
      pickup: {
        address: oldBooking.pickupLocation,
        coordinates: null // Old booking doesn't have coordinates
      },
      dropoff: {
        address: oldBooking.dropoffLocation,
        coordinates: null // Old booking doesn't have coordinates
      },
      pickupDateTime: oldBooking.pickupDateTime.toISOString(),
      fareType: 'personal', // Default to personal for old bookings
      flightInfo: {
        hasFlight: !!oldBooking.flightNumber,
        airline: '',
        flightNumber: oldBooking.flightNumber || '',
        arrivalTime: '',
        terminal: ''
      },
      fare: oldBooking.fare,
      baseFare: oldBooking.fare,
      tipAmount: oldBooking.tipAmount || 0,
      tipPercent: 0,
      totalFare: oldBooking.fare + (oldBooking.tipAmount || 0)
    },
    
    customer: {
      name: oldBooking.name,
      email: oldBooking.email,
      phone: oldBooking.phone,
      notes: oldBooking.notes || '',
      saveInfoForFuture: false
    },
    
    payment: {
      depositAmount: oldBooking.depositAmount || null,
      balanceDue: oldBooking.balanceDue,
      depositPaid: oldBooking.depositPaid,
      squareOrderId: oldBooking.squareOrderId,
      squarePaymentId: oldBooking.squarePaymentId,
      tipAmount: oldBooking.tipAmount || 0,
      tipPercent: 0,
      totalAmount: oldBooking.fare + (oldBooking.tipAmount || 0)
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
