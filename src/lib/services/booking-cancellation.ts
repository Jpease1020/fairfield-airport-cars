import { getAdminDb } from '@/lib/utils/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { driverSchedulingService } from './driver-scheduling-service';
import { refundPayment } from './square-service';
import type { CancelBookingOptions } from './booking-types';

export type { CancelBookingOptions } from './booking-types';

export const cancelBooking = async (
  bookingId: string,
  reason?: string,
  options?: CancelBookingOptions
): Promise<void> => {
  const db = getAdminDb();
  const bookingDoc = await db.collection('bookings').doc(bookingId).get();
  const bookingData = bookingDoc.exists ? bookingDoc.data() : null;
  const calendarEventId = bookingData?.calendarEventId;

  if (calendarEventId) {
    try {
      const isSmokeTest = process.env.SMOKE_TEST_MODE === 'true';
      if (isSmokeTest) {
        console.log(`🧪 Smoke test mode - skipping calendar event deletion for booking ${bookingId}`);
      } else {
        const calendarIntegrationEnabled = process.env.ENABLE_GOOGLE_CALENDAR === 'true';

        if (calendarIntegrationEnabled) {
          const {
            createOAuth2Client,
            setCredentials,
            initializeCalendarAPI,
            deleteBookingEvent,
          } = await import('./google-calendar');

          const storedTokens = process.env.GOOGLE_CALENDAR_TOKENS
            ? JSON.parse(process.env.GOOGLE_CALENDAR_TOKENS)
            : null;

          if (storedTokens) {
            const oauth2Client = createOAuth2Client();
            setCredentials(oauth2Client, storedTokens);
            const calendar = initializeCalendarAPI(oauth2Client);

            await deleteBookingEvent(calendar, calendarEventId);
            console.log(`✅ Deleted calendar event ${calendarEventId} for booking ${bookingId}`);
          } else {
            console.warn(`⚠️ Calendar tokens not available - cannot delete event ${calendarEventId} for booking ${bookingId}`);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to delete calendar event for booking ${bookingId}:`, error);
    }
  }

  await db.collection('bookings').doc(bookingId).update({
    status: 'cancelled',
    updatedAt: FieldValue.serverTimestamp(),
    cancellationReason: reason,
    calendarEventId: null,
  });

  await driverSchedulingService.cancelBooking(bookingId);

  if (options?.refundAmount != null && options.refundAmount > 0 && options.squarePaymentId) {
    try {
      await refundPayment(options.squarePaymentId, options.refundAmount * 100, 'USD', reason);
      console.log(`✅ Refund processed: $${options.refundAmount.toFixed(2)} for booking ${bookingId}`);
    } catch (refundError) {
      console.error(`❌ Refund failed for booking ${bookingId}:`, refundError);
    }
  } else if (options?.refundAmount != null && options.refundAmount > 0 && !options?.squarePaymentId) {
    console.warn(`⚠️ Cannot process refund - no payment ID stored for booking ${bookingId}`);
  }

  if (options?.cancellationFee != null) {
    await db.collection('bookings').doc(bookingId).update({
      cancellationFee: options.cancellationFee,
      balanceDue: 0,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
};
