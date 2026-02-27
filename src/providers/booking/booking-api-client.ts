import { Booking } from '@/types/booking';
import { authFetch } from '@/lib/utils/auth-fetch';

export async function createBookingRequest(data: Partial<Booking>): Promise<Booking> {
  const response = await authFetch('/api/booking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create booking');
  }

  return response.json();
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
