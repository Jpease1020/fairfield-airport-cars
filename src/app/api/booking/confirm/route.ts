import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/utils/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getBooking } from '@/lib/services/booking-service';
import { sendConfirmationEmail } from '@/lib/services/email-service';
import { adaptOldBookingToNew } from '@/utils/bookingAdapter';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, token } = await request.json();

    // Check for smoke test mode
    const smokeTestHeader = request.headers.get('x-smoke-test');
    const isSmokeTest = smokeTestHeader === 'true' || process.env.SMOKE_TEST_MODE === 'true';

    if (!bookingId || !token) {
      return NextResponse.json(
        { error: 'bookingId and token are required' },
        { status: 400 }
      );
    }

    // Verify Firebase Admin is initialized
    let db;
    try {
      db = getAdminDb();
    } catch (adminError) {
      console.error('Firebase Admin not initialized:', adminError);
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    const bookingDoc = await db.collection('bookings').doc(bookingId).get();

    if (!bookingDoc.exists) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const bookingData = bookingDoc.data();
    const confirmation = bookingData?.confirmation;

    // Log diagnostic info for debugging
    console.log(`[BOOKING CONFIRM] Booking ${bookingId} confirmation check:`, {
      hasConfirmation: !!confirmation,
      hasToken: !!confirmation?.token,
      confirmationStatus: confirmation?.status,
      bookingStatus: bookingData?.status
    });

    // Check if already confirmed FIRST (before checking token)
    // Only consider it confirmed if confirmation.status is explicitly 'confirmed'
    // Don't rely on booking.status alone, as that can be set by other processes (e.g., payment webhook)
    if (confirmation?.status === 'confirmed') {
      return NextResponse.json({
        message: 'Booking already confirmed.'
      });
    }

    if (!confirmation || !confirmation.token) {
      // If booking exists but token is missing, provide helpful error
      console.warn(`[BOOKING CONFIRM] Booking ${bookingId} exists but confirmation token is missing`);
      return NextResponse.json(
        { 
          error: 'Confirmation token missing. Please contact support.',
          details: 'This booking may have been created before the confirmation system was implemented, or there was an error saving the token. Please contact support to confirm your booking.',
          bookingId,
          bookingStatus: bookingData?.status
        },
        { status: 409 }
      );
    }

    if (confirmation.token !== token) {
      return NextResponse.json(
        { error: 'Invalid confirmation token.' },
        { status: 401 }
      );
    }

    await db.collection('bookings').doc(bookingId).update({
      status: 'confirmed',
      confirmation: {
        status: 'confirmed',
        token: null,
        sentAt: confirmation.sentAt ?? null,
        confirmedAt: new Date().toISOString()
      },
      updatedAt: FieldValue.serverTimestamp()
    });

    const bookingRecord = await getBooking(bookingId);
    if (bookingRecord) {
      // Create calendar event for confirmed booking
      try {
        const { createBookingCalendarEvent } = await import('@/lib/services/google-calendar');
        const pickupDateTime = bookingRecord.trip?.pickupDateTime || bookingRecord.pickupDateTime || new Date();
        const tripData = bookingRecord.trip || {
          pickup: { address: bookingRecord.pickupLocation || '' },
          dropoff: { address: bookingRecord.dropoffLocation || '' },
          pickupDateTime: pickupDateTime as Date | string,
        };
        const customerData = bookingRecord.customer || {
          name: bookingRecord.name || '',
          email: bookingRecord.email || '',
        };
        const calendarEventId = await createBookingCalendarEvent({
          id: bookingId,
          trip: tripData,
          customer: customerData,
        }, { smokeTest: isSmokeTest });

        // Store calendar event ID in booking
        if (calendarEventId) {
          await db.collection('bookings').doc(bookingId).update({
            calendarEventId: calendarEventId,
            updatedAt: FieldValue.serverTimestamp()
          });
        }
      } catch (calendarError) {
        console.error('Failed to create calendar event (non-blocking):', calendarError);
        // Don't fail confirmation if calendar event creation fails
      }

      await sendConfirmationEmail(adaptOldBookingToNew(bookingRecord));
    }

    return NextResponse.json({
      message: 'Booking confirmed successfully.'
    });
  } catch (error) {
    console.error('Booking confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm booking.' },
      { status: 500 }
    );
  }
}

