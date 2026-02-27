import { BookingFormData } from '@/types/booking';

export function isQuickBookingFormValid(formData: BookingFormData): boolean {
  return formData.trip.pickup.address.trim() !== '' &&
    formData.trip.dropoff.address.trim() !== '' &&
    formData.trip.pickupDateTime !== '' &&
    formData.trip.pickup.coordinates !== null &&
    formData.trip.dropoff.coordinates !== null;
}

export function isContactInfoComplete(formData: BookingFormData): boolean {
  return formData.customer.name.trim() !== '' &&
    formData.customer.email.trim() !== '' &&
    formData.customer.phone.trim() !== '';
}

export function hasAnyFormData(formData: BookingFormData): boolean {
  return formData.trip.pickup.address.trim() !== '' ||
    formData.trip.dropoff.address.trim() !== '' ||
    formData.trip.pickupDateTime !== '' ||
    formData.customer.name.trim() !== '' ||
    formData.customer.email.trim() !== '' ||
    formData.customer.phone.trim() !== '';
}
