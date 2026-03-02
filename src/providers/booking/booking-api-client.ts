import { Booking } from '@/types/booking';
import { authFetch } from '@/lib/utils/auth-fetch';

export async function createBookingRequest(data: Partial<Booking>): Promise<Booking> {
  const pickupDateTimeValue = data.trip?.pickupDateTime || data.pickupDateTime;
  const pickupDateTime =
    pickupDateTimeValue instanceof Date
      ? pickupDateTimeValue.toISOString()
      : typeof pickupDateTimeValue === 'string'
        ? pickupDateTimeValue
        : '';

  const pickupAddress = data.trip?.pickup?.address || data.pickupLocation || '';
  const dropoffAddress = data.trip?.dropoff?.address || data.dropoffLocation || '';

  const fareValue =
    data.trip?.fare ??
    data.fare ??
    data.payment?.totalAmount ??
    data.trip?.totalFare ??
    0;

  const payload = {
    quoteId: (data as Booking & { quoteId?: string }).quoteId,
    exceptionCode: (data as Booking & { exceptionCode?: string }).exceptionCode,
    fare: Number(fareValue),
    customer: {
      name: data.customer?.name || data.name || '',
      email: data.customer?.email || data.email || '',
      phone: data.customer?.phone || data.phone || '',
      notes: data.customer?.notes || data.notes || '',
      smsOptIn: data.customer?.smsOptIn ?? false,
    },
    trip: {
      pickup: {
        address: pickupAddress,
        coordinates: data.trip?.pickup?.coordinates || null,
      },
      dropoff: {
        address: dropoffAddress,
        coordinates: data.trip?.dropoff?.coordinates || null,
      },
      pickupDateTime,
      fareType: data.trip?.fareType || 'personal',
      flightInfo: data.trip?.flightInfo || {
        hasFlight: false,
        airline: '',
        flightNumber: '',
        arrivalTime: '',
        terminal: '',
      },
    },
  };

  const response = await authFetch('/api/booking/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create booking');
  }

  const result = await response.json();
  return {
    ...data,
    id: result.bookingId,
  } as Booking;
}

export async function updateBookingRequest(id: string, data: Partial<Booking>): Promise<Booking> {
  const response = await authFetch(`/api/booking/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update booking');
  }

  return response.json();
}

export async function getBookingRequest(id: string): Promise<Booking | null> {
  const response = await authFetch(`/api/booking/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch booking');
  }

  return response.json();
}

export async function deleteBookingRequest(id: string): Promise<void> {
  const response = await authFetch(`/api/booking/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete booking');
  }
}

export async function submitBookingRequest(requestBody: Record<string, unknown>): Promise<globalThis.Response> {
  return authFetch('/api/booking/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
}
