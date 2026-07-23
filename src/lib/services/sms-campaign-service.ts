import type { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/utils/firebase-admin';
import { normalizePhoneToE164, sendBulkSms } from '@/lib/services/twilio-service';

export interface SmsCampaignOptions {
  activeWithinDays?: number;
  bookingScanLimit?: number;
}

export interface SmsCampaignRecipientPreview {
  name: string;
  phone: string;
  lastBookingDate: string | null;
}

export interface SmsCampaignPreflight {
  scannedBookings: number;
  uniqueContacts: number;
  optedInContacts: number;
  invalidPhoneContacts: number;
  excludedNoPhone: number;
  excludedOptedOut: number;
  recipients: SmsCampaignRecipientPreview[];
}

type InternalRecipient = {
  name: string;
  phone: string;
  normalizedPhone: string;
  lastBookingDate: Date | null;
};

const DEFAULT_SCAN_LIMIT = 5000;
const MAX_RECIPIENT_PREVIEW = 50;

type BookingLike = Record<string, any>;

const asDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const fromTimestamp = (value as { toDate?: () => Date }).toDate?.();
  if (fromTimestamp instanceof Date) return Number.isNaN(fromTimestamp.getTime()) ? null : fromTimestamp;
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

const normalizeOptIn = (booking: BookingLike): boolean => {
  if (typeof booking?.customer?.smsOptIn === 'boolean') return booking.customer.smsOptIn;
  if (typeof booking?.smsOptIn === 'boolean') return booking.smsOptIn;
  return false;
};

const extractName = (booking: BookingLike): string => {
  return (
    booking?.customer?.name ||
    booking?.name ||
    'Customer'
  );
};

const extractPhone = (booking: BookingLike): string => {
  return (
    booking?.customer?.phone ||
    booking?.phone ||
    ''
  );
};

const extractBookingDate = (booking: BookingLike): Date | null => {
  return (
    asDate(booking?.trip?.pickupDateTime) ||
    asDate(booking?.pickupDateTime) ||
    asDate(booking?.createdAt) ||
    null
  );
};

function dedupeContactsByPhone(
  bookings: BookingLike[]
): { dedupedByPhone: Map<string, InternalRecipient & { smsOptIn: boolean }>; excludedNoPhone: number; invalidPhoneContacts: number } {
  const dedupedByPhone = new Map<string, InternalRecipient & { smsOptIn: boolean }>();
  let excludedNoPhone = 0;
  let invalidPhoneContacts = 0;

  for (const booking of bookings) {
    const rawPhone = extractPhone(booking).trim();
    if (!rawPhone) {
      excludedNoPhone += 1;
      continue;
    }

    let normalizedPhone: string;
    try {
      normalizedPhone = normalizePhoneToE164(rawPhone);
    } catch {
      invalidPhoneContacts += 1;
      continue;
    }

    const smsOptIn = normalizeOptIn(booking);
    const name = extractName(booking);
    const bookingDate = extractBookingDate(booking);
    const existing = dedupedByPhone.get(normalizedPhone);

    if (!existing) {
      dedupedByPhone.set(normalizedPhone, {
        name,
        phone: rawPhone,
        normalizedPhone,
        lastBookingDate: bookingDate,
        smsOptIn,
      });
      continue;
    }

    const existingDate = existing.lastBookingDate?.getTime() ?? 0;
    const nextDate = bookingDate?.getTime() ?? 0;
    // The most recent booking's opt-in choice always wins — an older booking's smsOptIn must
    // never resurrect consent after a customer has since opted out on a newer booking.
    if (nextDate >= existingDate) {
      existing.name = name;
      existing.phone = rawPhone;
      existing.lastBookingDate = bookingDate;
      existing.smsOptIn = smsOptIn;
    }
  }

  return { dedupedByPhone, excludedNoPhone, invalidPhoneContacts };
}

export function buildSmsCampaignPreflight(
  bookings: BookingLike[],
  options: SmsCampaignOptions = {}
): SmsCampaignPreflight & { internalRecipients: InternalRecipient[] } {
  const { dedupedByPhone, excludedNoPhone, invalidPhoneContacts } = dedupeContactsByPhone(bookings);
  let excludedOptedOut = 0;

  const activeCutoff =
    typeof options.activeWithinDays === 'number' && options.activeWithinDays > 0
      ? new Date(Date.now() - options.activeWithinDays * 24 * 60 * 60 * 1000)
      : null;

  const recipients: InternalRecipient[] = [];
  for (const contact of dedupedByPhone.values()) {
    if (!contact.smsOptIn) {
      excludedOptedOut += 1;
      continue;
    }
    if (activeCutoff && contact.lastBookingDate && contact.lastBookingDate < activeCutoff) {
      continue;
    }
    recipients.push({
      name: contact.name,
      phone: contact.normalizedPhone,
      normalizedPhone: contact.normalizedPhone,
      lastBookingDate: contact.lastBookingDate,
    });
  }

  recipients.sort((a, b) => {
    const aTime = a.lastBookingDate?.getTime() ?? 0;
    const bTime = b.lastBookingDate?.getTime() ?? 0;
    return bTime - aTime;
  });

  return {
    scannedBookings: bookings.length,
    uniqueContacts: dedupedByPhone.size,
    optedInContacts: recipients.length,
    invalidPhoneContacts,
    excludedNoPhone,
    excludedOptedOut,
    recipients: recipients.slice(0, MAX_RECIPIENT_PREVIEW).map((recipient) => ({
      name: recipient.name,
      phone: recipient.phone,
      lastBookingDate: recipient.lastBookingDate?.toISOString() ?? null,
    })),
    internalRecipients: recipients,
  };
}

export async function getSmsCampaignPreflight(
  options: SmsCampaignOptions = {}
): Promise<SmsCampaignPreflight & { internalRecipients: InternalRecipient[] }> {
  const db = getAdminDb();
  const scanLimit = Math.min(Math.max(options.bookingScanLimit ?? DEFAULT_SCAN_LIMIT, 1), 20_000);
  const snapshot = await db.collection('bookings').orderBy('createdAt', 'desc').limit(scanLimit).get();
  const bookings = snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as BookingLike);
  return buildSmsCampaignPreflight(bookings, options);
}

export interface SmsContact {
  name: string;
  phone: string; // E.164
  optedIn: boolean;
  lastBookingDate: string | null;
}

// Every known contact, opted-in or not — for the mass-text picker, where Gregg chooses who
// to message and needs to see opt-in status rather than have it silently filtered out.
export function buildContactDirectory(
  bookings: BookingLike[]
): { scannedBookings: number; contacts: SmsContact[] } {
  const { dedupedByPhone } = dedupeContactsByPhone(bookings);

  const contacts: SmsContact[] = Array.from(dedupedByPhone.values()).map((contact) => ({
    name: contact.name,
    phone: contact.normalizedPhone,
    optedIn: contact.smsOptIn,
    lastBookingDate: contact.lastBookingDate?.toISOString() ?? null,
  }));

  contacts.sort((a, b) => {
    const aTime = a.lastBookingDate ? new Date(a.lastBookingDate).getTime() : 0;
    const bTime = b.lastBookingDate ? new Date(b.lastBookingDate).getTime() : 0;
    return bTime - aTime;
  });

  return { scannedBookings: bookings.length, contacts };
}

export async function getContactDirectory(
  options: Pick<SmsCampaignOptions, 'bookingScanLimit'> = {}
): Promise<{ scannedBookings: number; contacts: SmsContact[] }> {
  const db = getAdminDb();
  const scanLimit = Math.min(Math.max(options.bookingScanLimit ?? DEFAULT_SCAN_LIMIT, 1), 20_000);
  const snapshot = await db.collection('bookings').orderBy('createdAt', 'desc').limit(scanLimit).get();
  const bookings = snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as BookingLike);
  return buildContactDirectory(bookings);
}

// Sends to an explicit recipient list chosen by the admin — bypasses the opt-in filter in
// buildSmsCampaignPreflight/sendSmsCampaign by design, since Gregg reviews opt-in status
// himself in the picker UI and may deliberately message contacts who haven't opted in.
export async function sendSmsToList(
  recipients: Array<{ phone: string; name: string }>,
  messageTemplate: string
) {
  return sendBulkSms(recipients, messageTemplate, { includeOptOutNotice: true });
}

export async function sendSmsCampaign(
  messageTemplate: string,
  options: SmsCampaignOptions = {}
) {
  const preflight = await getSmsCampaignPreflight(options);
  const recipients = preflight.internalRecipients.map((recipient) => ({
    name: recipient.name,
    phone: recipient.phone,
  }));

  if (recipients.length === 0) {
    return {
      preflight,
      sendResult: {
        total: 0,
        successful: 0,
        failed: 0,
        results: [],
      },
    };
  }

  const sendResult = await sendBulkSms(recipients, messageTemplate, {
    includeOptOutNotice: true,
  });

  return { preflight, sendResult };
}
