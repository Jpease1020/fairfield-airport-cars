import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/utils/firebase-admin';

/**
 * Look up a customer's most recent preferences by phone number
 * Used to auto-fill returning customers' opt-in preferences
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Normalize phone number (remove all non-digits)
    const normalizedPhone = phone.replace(/\D/g, '');

    // Phone must be at least 10 digits
    if (normalizedPhone.length < 10) {
      return NextResponse.json(
        { error: 'Invalid phone number' },
        { status: 400 }
      );
    }

    // Look up most recent booking by this phone number
    const db = getAdminDb();
    const bookingsRef = db.collection('bookings');

    // Try exact match first (normalized phone stored in customer.phone)
    const snapshot = await bookingsRef
      .orderBy('createdAt', 'desc')
      .limit(50) // Get recent bookings to search through
      .get();

    // Find most recent booking matching this phone
    let matchingBooking = null;
    for (const doc of snapshot.docs) {
      const booking = doc.data();
      const bookingPhone = (booking.customer?.phone || booking.phone || '').replace(/\D/g, '');

      // Match last 10 digits (handles +1 prefix variations)
      if (bookingPhone.slice(-10) === normalizedPhone.slice(-10)) {
        matchingBooking = booking;
        break; // Most recent match found
      }
    }

    if (!matchingBooking) {
      // No previous bookings found - return default preferences
      // smsOptIn defaults to false for TCPA compliance (affirmative consent required)
      return NextResponse.json({
        found: false,
        preferences: {
          smsOptIn: false,
          saveInfoForFuture: false
        }
      });
    }

    // Return customer's most recent preferences
    return NextResponse.json({
      found: true,
      preferences: {
        smsOptIn: matchingBooking.customer?.smsOptIn ?? false,
        saveInfoForFuture: matchingBooking.customer?.saveInfoForFuture ?? false
      }
    });
  } catch (error) {
    console.error('[Customer Preferences API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to lookup preferences' },
      { status: 500 }
    );
  }
}
