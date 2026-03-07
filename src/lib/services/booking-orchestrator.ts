import { createHash, randomBytes } from 'crypto';
import { getAdminDb } from '@/lib/utils/firebase-admin';
import { getQuote, isQuoteValid } from '@/lib/services/quote-service';
import { createBookingAtomic, getBooking } from '@/lib/services/booking-service';
import { sendBookingVerificationEmail, sendDriverNotificationEmail } from '@/lib/services/email-service';
import { recordBookingAttempt } from '@/lib/services/booking-attempts-service';
import { notifyDriverOfNewBooking } from '@/lib/services/driver-notification-service';
import { classifyTrip } from '@/lib/services/service-area-validation';
import { sendBookingProblem } from '@/lib/services/notification-service';
import { formatBusinessDateTime, formatBusinessDateTimeWithZone } from '@/lib/utils/booking-date-time';
import { sendAdminSms } from '@/lib/services/admin-notification-service';
import { sendSms } from '@/lib/services/twilio-service';
import { adaptOldBookingToNew } from '@/utils/bookingAdapter';
import { Booking } from '@/types/booking';
import { SubmitBookingRequest, SubmitBookingSuccessResponse } from '@/lib/contracts/booking-api';

export class BookingApiError extends Error {
  readonly status: number;
  readonly body: Record<string, unknown>;

  constructor(status: number, body: Record<string, unknown>) {
    super(typeof body.error === 'string' ? body.error : 'Booking request failed');
    this.status = status;
    this.body = body;
  }
}

interface SubmitBookingParams {
  payload: SubmitBookingRequest;
  submittedPickupDateTimeRaw?: string;
  authUserId?: string | null;
}

interface CreatePaidBookingParams {
  bookingData: Record<string, any>;
  amountCents: number;
  tipCents: number;
  authUserId?: string | null;
  smokeTest?: boolean;
}

interface CreatePaidBookingResult {
  bookingId: string;
  emailWarning: string | null;
}

const BOOKING_CREATE_TIMEOUT_MS = 50_000;

function normalizeIso(value: Date | string): string {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new BookingApiError(400, {
      error: 'Invalid pickup date/time. Please choose a valid date and time.',
      code: 'INVALID_PICKUP_DATETIME',
    });
  }
  return parsed.toISOString();
}

async function validateQuoteForSubmit(payload: SubmitBookingRequest): Promise<void> {
  if (!payload.quoteId) {
    return;
  }

  const quote = await getQuote(payload.quoteId);
  if (!quote) {
    throw new BookingApiError(404, {
      error: 'Quote not found. Please request a new quote.',
      code: 'QUOTE_NOT_FOUND',
    });
  }

  if (!isQuoteValid(quote)) {
    throw new BookingApiError(410, {
      error: 'Quote has expired. Please request a new quote.',
      code: 'QUOTE_EXPIRED',
    });
  }

  const storedPickupDateTime = quote.pickupDateTime
    ? quote.pickupDateTime instanceof Date
      ? quote.pickupDateTime.toISOString()
      : new Date(quote.pickupDateTime).toISOString()
    : '';

  if (!storedPickupDateTime) {
    throw new BookingApiError(409, {
      error: 'Quote is missing trip time. Please request a new quote.',
      code: 'QUOTE_MISSING_TIME',
    });
  }

  const currentPickupDateTime = normalizeIso(payload.trip.pickupDateTime);
  const currentRouteHash = createHash('sha256')
    .update(
      `${payload.trip.pickup.address}|${payload.trip.dropoff.address}|${currentPickupDateTime}|${payload.trip.fareType}`
    )
    .digest('hex');
  const storedRouteHash = createHash('sha256')
    .update(
      `${quote.pickupAddress}|${quote.dropoffAddress}|${storedPickupDateTime}|${quote.fareType}`
    )
    .digest('hex');

  if (currentRouteHash !== storedRouteHash) {
    throw new BookingApiError(409, {
      error: 'Trip details have changed. Please request a new quote.',
      code: 'ROUTE_CHANGED',
    });
  }

  const fareDifference = Math.abs(payload.fare - quote.price);
  const fareTolerance = quote.price * 0.05;
  if (fareDifference > fareTolerance) {
    throw new BookingApiError(409, {
      error: 'Fare has changed. Please request a new quote.',
      code: 'FARE_MISMATCH',
      expectedFare: quote.price,
      providedFare: payload.fare,
    });
  }
}

function parseTimeSlotConflict(errorMessage: string): string[] {
  const conflictMatch = errorMessage.match(/suggested times?:\s*(.+)$/i);
  if (!conflictMatch?.[1]) return [];
  return conflictMatch[1]
    .split(',')
    .map((slot) => slot.trim())
    .filter(Boolean);
}

async function ensureConfirmationToken(
  bookingId: string,
  expectedToken: string,
  sentAtIso: string
): Promise<string> {
  const bookingRecord = await getBooking(bookingId);
  if (!bookingRecord) {
    throw new Error('Booking was created but could not be retrieved');
  }

  const savedConfirmation = bookingRecord.confirmation;
  if (!savedConfirmation?.token) {
    const db = getAdminDb();
    await db.collection('bookings').doc(bookingId).update({
      confirmation: {
        status: 'pending',
        token: expectedToken,
        sentAt: sentAtIso,
      },
    });
    return expectedToken;
  }

  return savedConfirmation.token;
}

export async function submitBookingOrchestration(
  params: SubmitBookingParams
): Promise<SubmitBookingSuccessResponse> {
  const { payload, submittedPickupDateTimeRaw, authUserId } = params;
  const { quoteId, fare, exceptionCode, customer, trip } = payload;

  const isExceptionBooking =
    !!exceptionCode && exceptionCode === process.env.BOOKING_EXCEPTION_SECRET;
  if (!isExceptionBooking && !quoteId) {
    throw new BookingApiError(400, {
      error: 'Quote is required for booking submission. Please request a new quote.',
      code: 'QUOTE_REQUIRED',
    });
  }

  if (!isExceptionBooking) {
    const tripClassification = classifyTrip(
      trip.pickup.address,
      trip.dropoff.address,
      trip.pickup.coordinates ?? null,
      trip.dropoff.coordinates ?? null
    );
    if (tripClassification.classification !== 'normal') {
      throw new BookingApiError(400, {
        error: tripClassification.message,
        code: tripClassification.code,
      });
    }
  }

  await validateQuoteForSubmit(payload);

  try {
    getAdminDb();
  } catch {
    throw new BookingApiError(500, {
      error: 'Server configuration error. Please contact support.',
      details: 'Firebase Admin not initialized. Check environment variables.',
    });
  }

  const confirmationToken = randomBytes(32).toString('hex');
  const confirmationSentAt = new Date().toISOString();

  const bookingDataWithConfirmation = {
    trip: {
      pickup: trip.pickup,
      dropoff: trip.dropoff,
      pickupDateTime: trip.pickupDateTime,
      fareType: trip.fareType,
      flightInfo: trip.flightInfo || {
        hasFlight: false,
        airline: '',
        flightNumber: '',
        arrivalTime: '',
        terminal: '',
      },
      fare,
      baseFare: fare,
      tipAmount: 0,
      tipPercent: 0,
      totalFare: fare,
    },
    customer: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      notes: customer.notes || '',
      saveInfoForFuture: false,
      smsOptIn: customer.smsOptIn || false,
    },
    payment: {
      depositAmount: 0,
      balanceDue: fare,
      depositPaid: false,
      tipAmount: 0,
      tipPercent: 0,
      totalAmount: fare,
    },
    bookingTimeline: [
      {
        source: 'submit' as const,
        event: 'booking_submit_received',
        submittedPickupDateTimeRaw,
        normalizedPickupDateTimeIso: normalizeIso(trip.pickupDateTime),
        businessPickupDateTime: formatBusinessDateTime(trip.pickupDateTime),
        recordedAt: new Date().toISOString(),
      },
    ],
    customerUserId: authUserId ?? null,
    trackingToken: randomBytes(16).toString('hex'),
    status: isExceptionBooking ? ('requires_approval' as const) : ('pending' as const),
    ...(isExceptionBooking && {
      requiresApproval: true,
      exceptionReason: 'VIP exception',
    }),
    confirmation: {
      status: 'pending' as const,
      token: confirmationToken,
      sentAt: confirmationSentAt,
    },
  };

  try {
    const bookingPromise = createBookingAtomic(bookingDataWithConfirmation as any);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Booking creation timed out after 50 seconds')),
        BOOKING_CREATE_TIMEOUT_MS
      )
    );
    const bookingResult = (await Promise.race([
      bookingPromise,
      timeoutPromise,
    ])) as { bookingId: string };

    let emailWarning: string | null = null;
    const resolvedConfirmationToken = await ensureConfirmationToken(
      bookingResult.bookingId,
      confirmationToken,
      confirmationSentAt
    );
    const bookingRecord = await getBooking(bookingResult.bookingId);
    if (!bookingRecord) {
      throw new Error('Booking was created but could not be retrieved');
    }

    const confirmationUrlBase =
      process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
    const confirmationUrl = `${confirmationUrlBase}/booking/confirm?bookingId=${bookingResult.bookingId}&token=${resolvedConfirmationToken}`;

    try {
      await sendBookingVerificationEmail(bookingRecord as unknown as Booking, confirmationUrl);
    } catch {
      emailWarning =
        'Your ride request is saved, but we could not send the confirmation email. Please text us at (203) 990-1815 so we can finalize it.';
      await recordBookingAttempt({
        stage: 'submit',
        status: 'warning',
        bookingId: bookingResult.bookingId,
        reason: emailWarning,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        pickupAddress: trip.pickup.address,
        dropoffAddress: trip.dropoff.address,
        pickupDateTime: trip.pickupDateTime.toISOString(),
      });
    }

    try {
      await sendDriverNotificationEmail(bookingRecord as unknown as Booking);
    } catch {
      // Non-critical
    }

    try {
      await notifyDriverOfNewBooking({
        bookingId: bookingResult.bookingId,
        customerName: customer.name,
        pickupAddress: trip.pickup.address,
        dropoffAddress: trip.dropoff.address,
        pickupDateTime: trip.pickupDateTime.toISOString(),
        fare,
      });
    } catch {
      // Non-critical
    }

    try {
      const pickupDateTimeStr = formatBusinessDateTimeWithZone(trip.pickupDateTime);
      const message = `New booking: ${customer.name} - Pickup time: ${pickupDateTimeStr} - Route: ${trip.pickup.address} -> ${trip.dropoff.address} - $${fare.toFixed(2)}`;
      await sendAdminSms(message);
    } catch {
      // Non-critical
    }

    return {
      success: true,
      bookingId: bookingResult.bookingId,
      totalFare: fare,
      message: 'Booking created successfully — pending email confirmation',
      emailWarning,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
    const isTimeSlotConflict =
      /time slot conflicts|not available|conflicts with existing|already booked|no driver is available/i.test(
        errorMessage
      );

    if (isTimeSlotConflict) {
      await recordBookingAttempt({
        stage: 'submit',
        status: 'failed',
        reason: errorMessage,
        customerName: customer?.name,
        customerEmail: customer?.email,
        customerPhone: customer?.phone,
        pickupAddress: trip?.pickup?.address,
        dropoffAddress: trip?.dropoff?.address,
        pickupDateTime: trip?.pickupDateTime?.toISOString?.() || String(trip?.pickupDateTime),
      });

      throw new BookingApiError(409, {
        error: 'This time slot is no longer available. Please choose a different time.',
        code: 'TIME_SLOT_CONFLICT',
        details: errorMessage,
        suggestedTimes: parseTimeSlotConflict(errorMessage),
      });
    }

    await recordBookingAttempt({
      stage: 'submit',
      status: 'failed',
      reason: errorMessage,
      customerName: customer?.name,
      customerEmail: customer?.email,
      customerPhone: customer?.phone,
      pickupAddress: trip?.pickup?.address,
      dropoffAddress: trip?.dropoff?.address,
      pickupDateTime: trip?.pickupDateTime?.toISOString?.() || String(trip?.pickupDateTime),
    });

    await sendBookingProblem('submit', error, {
      userPhone: customer?.phone,
      userEmail: customer?.email,
    });

    throw new BookingApiError(500, {
      error: 'Failed to create booking',
      details: errorMessage,
    });
  }
}

export async function createPaidBookingAndNotify(
  params: CreatePaidBookingParams
): Promise<CreatePaidBookingResult> {
  const { bookingData, amountCents, tipCents, authUserId, smokeTest } = params;
  const pickupDateTimeValue = bookingData.pickupDateTime || bookingData.trip?.pickupDateTime;
  const parsedPickupDateTime = new Date(pickupDateTimeValue || Date.now());
  const normalizedPickupDateTimeIso = Number.isNaN(parsedPickupDateTime.getTime())
    ? new Date().toISOString()
    : parsedPickupDateTime.toISOString();

  const bookingResult = await createBookingAtomic({
    ...bookingData,
    bookingTimeline: [
      ...(Array.isArray(bookingData.bookingTimeline) ? bookingData.bookingTimeline : []),
      {
        source: 'payment',
        event: 'payment_booking_create',
        submittedPickupDateTimeRaw:
          typeof pickupDateTimeValue === 'string' ? pickupDateTimeValue : undefined,
        normalizedPickupDateTimeIso,
        businessPickupDateTime: formatBusinessDateTime(normalizedPickupDateTimeIso),
        recordedAt: new Date().toISOString(),
      },
    ],
    customerUserId: authUserId ?? null,
    trackingToken: bookingData?.trackingToken || randomBytes(16).toString('hex'),
    squareOrderId: bookingData?.squareOrderId,
    squarePaymentId: bookingData?.squarePaymentId,
    depositPaid: true,
    depositAmount: amountCents / 100,
    tipAmount: tipCents > 0 ? tipCents / 100 : 0,
    status: 'pending',
    balanceDue: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any);

  if (smokeTest && bookingResult.bookingId) {
    const db = getAdminDb();
    await db.collection('bookings').doc(bookingResult.bookingId).update({
      _smokeTest: true,
      _smokeTestTimestamp: new Date().toISOString(),
    });
  }

  let emailWarning: string | null = null;
  try {
    const confirmationToken = randomBytes(32).toString('hex');
    const db = getAdminDb();
    await db.collection('bookings').doc(bookingResult.bookingId).update({
      confirmation: {
        status: 'pending',
        token: confirmationToken,
        sentAt: new Date().toISOString(),
      },
    });

    const bookingRecord = await getBooking(bookingResult.bookingId);
    if (bookingRecord) {
      const confirmationUrlBase =
        process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
      const confirmationUrl = `${confirmationUrlBase}/booking/confirm?bookingId=${bookingResult.bookingId}&token=${confirmationToken}`;
      await sendBookingVerificationEmail(adaptOldBookingToNew(bookingRecord), confirmationUrl);

      const smsMessage = `We received your booking request.\nPickup time: ${formatBusinessDateTimeWithZone(pickupDateTimeValue)}\nPlease check your email to confirm the ride. Booking ID: ${bookingResult.bookingId}`;
      await sendSms({
        to: bookingData.customer.phone,
        body: smsMessage,
      });
    }
  } catch (notificationError) {
    console.error('Failed to send verification notifications:', notificationError);
    emailWarning =
      'Your booking is saved, but we could not send the confirmation email. Please text us at (203) 990-1815 to finish confirming.';
    await recordBookingAttempt({
      stage: 'payment',
      status: 'warning',
      bookingId: bookingResult.bookingId,
      reason: emailWarning,
    });
  }

  return {
    bookingId: bookingResult.bookingId,
    emailWarning,
  };
}
