import type { Booking } from '@/lib/services/database-service';

export const parseDate = (dateValue: any): Date | null => {
  if (!dateValue) return null;
  if (dateValue instanceof Date) return Number.isNaN(dateValue.getTime()) ? null : dateValue;
  if (typeof dateValue === 'string') {
    const parsed = new Date(dateValue);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof dateValue === 'object' && typeof dateValue.toDate === 'function') return dateValue.toDate();
  if (typeof dateValue === 'object' && '_seconds' in dateValue) return new Date(dateValue._seconds * 1000);
  if (typeof dateValue === 'object' && 'seconds' in dateValue) return new Date(dateValue.seconds * 1000);
  if (typeof dateValue === 'number') return new Date(dateValue);
  return null;
};

export const formatDate = (dateValue: any): string => {
  const date = parseDate(dateValue);
  if (!date) return 'No date set';
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

export const getBookingFare = (booking: Booking): number =>
  (booking as any).trip?.fare ?? booking.fare ?? 0;

export const getCustomerName = (booking: Booking): string =>
  (booking as any).customer?.name ?? booking.name ?? 'Unknown';

export const getCustomerEmail = (booking: Booking): string =>
  (booking as any).customer?.email ?? booking.email ?? '';

export const getCustomerPhone = (booking: Booking): string =>
  (booking as any).customer?.phone ?? booking.phone ?? '';

export const getPickupAddress = (booking: Booking): string =>
  (booking as any).trip?.pickup?.address ?? booking.pickupLocation ?? '';

export const getDropoffAddress = (booking: Booking): string =>
  (booking as any).trip?.dropoff?.address ?? booking.dropoffLocation ?? '';

export const getAirportFromBooking = (booking: Booking): string | null => {
  const pickup = getPickupAddress(booking).toLowerCase();
  const dropoff = getDropoffAddress(booking).toLowerCase();
  const codes = ['jfk', 'lga', 'ewr', 'bdl', 'hvn', 'hpn'];
  const names: Record<string, string[]> = {
    jfk: ['jfk', 'kennedy'],
    lga: ['lga', 'laguardia', 'la guardia'],
    ewr: ['ewr', 'newark'],
    bdl: ['bdl', 'bradley'],
    hvn: ['hvn', 'tweed'],
    hpn: ['hpn', 'westchester', 'white plains'],
  };

  for (const code of codes) {
    if (pickup.includes(code) || dropoff.includes(code)) return code.toUpperCase();
    for (const n of names[code] || []) {
      if (pickup.includes(n) || dropoff.includes(n)) return code.toUpperCase();
    }
  }
  return null;
};

export const getConfirmationSent = (booking: Booking): boolean => {
  const sentAt = (booking as any).confirmation?.sentAt ?? (booking as any).confirmationSentAt;
  return Boolean(sentAt);
};

export const getPickupDateTime = (booking: Booking): any =>
  (booking as any).trip?.pickupDateTime ?? booking.pickupDateTime;

export const getBalanceDue = (booking: Booking): number =>
  (booking as any).payment?.balanceDue ?? booking.balanceDue ?? 0;

export const getDepositPaid = (booking: Booking): boolean =>
  (booking as any).payment?.depositPaid ?? booking.depositPaid ?? false;

export const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'pending':
      return '⏳';
    case 'confirmed':
      return '✅';
    case 'completed':
      return '🎉';
    case 'cancelled':
      return '❌';
    case 'requires_approval':
      return '⚠️';
    case 'in-progress':
      return '🚗';
    default:
      return '📋';
  }
};

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'requires_approval':
      return 'Needs Approval';
    case 'in-progress':
      return 'In Progress';
    default:
      return status;
  }
};
