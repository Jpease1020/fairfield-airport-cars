import { Booking, BookingFormData } from '@/types/booking';

export function getEmptyBookingFormData(): BookingFormData {
  return {
    trip: {
      pickup: { address: '', coordinates: null },
      dropoff: { address: '', coordinates: null },
      pickupDateTime: '',
      fareType: 'personal',
      flightInfo: {
        hasFlight: false,
        airline: '',
        flightNumber: '',
        arrivalTime: '',
        terminal: '',
      },
    },
    customer: {
      name: '',
      email: '',
      phone: '',
      notes: '',
      saveInfoForFuture: false,
      smsOptIn: false,
    },
    payment: {
      depositAmount: null,
      balanceDue: 0,
      depositPaid: false,
      tipAmount: 0,
      tipPercent: 15,
      totalAmount: 0,
    },
  };
}

export function getFormDataFromExistingBooking(existingBooking: Booking): BookingFormData {
  return {
    trip: {
      pickup: {
        address: existingBooking.trip.pickup.address || '',
        coordinates: existingBooking.trip.pickup.coordinates || null,
      },
      dropoff: {
        address: existingBooking.trip.dropoff.address || '',
        coordinates: existingBooking.trip.dropoff.coordinates || null,
      },
      pickupDateTime: existingBooking.trip.pickupDateTime || '',
      fareType: existingBooking.trip.fareType || 'personal',
      flightInfo: existingBooking.trip.flightInfo || {
        hasFlight: false,
        airline: '',
        flightNumber: '',
        arrivalTime: '',
        terminal: '',
      },
      fare: existingBooking.trip.fare || null,
      baseFare: existingBooking.trip.baseFare || null,
      tipAmount: existingBooking.trip.tipAmount || 0,
      tipPercent: existingBooking.trip.tipPercent || 15,
      totalFare: existingBooking.trip.totalFare || 0,
    },
    customer: {
      name: existingBooking.customer.name || '',
      email: existingBooking.customer.email || '',
      phone: existingBooking.customer.phone || '',
      notes: existingBooking.customer.notes || '',
      saveInfoForFuture: existingBooking.customer.saveInfoForFuture || false,
      smsOptIn: existingBooking.customer.smsOptIn ?? true,
    },
    payment: {
      depositAmount: existingBooking.payment.depositAmount || null,
      balanceDue: existingBooking.payment.balanceDue || 0,
      depositPaid: existingBooking.payment.depositPaid || false,
      tipAmount: existingBooking.payment.tipAmount || 0,
      tipPercent: existingBooking.payment.tipPercent || 15,
      totalAmount: existingBooking.payment.totalAmount || 0,
    },
  };
}
