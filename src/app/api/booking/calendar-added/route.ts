import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/utils/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { requireOwnerOrAdmin } from '@/lib/utils/auth-server';

/**
 * API endpoint to mark that a user has added the booking to their calendar
 * This allows the confirmation email to skip the .ics attachment if already added
 */
export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: 'bookingId is required' },
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
    const accessResult = await requireOwnerOrAdmin(request, bookingData);
    if (!accessResult.ok) return accessResult.response;

    // Mark that user has added calendar event
    await db.collection('bookings').doc(bookingId).update({
      calendarAddedByUser: true,
      calendarAddedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    return NextResponse.json({
      success: true,
      message: 'Calendar addition tracked successfully'
    });
  } catch (error) {
    console.error('Calendar addition tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track calendar addition.' },
      { status: 500 }
    );
  }
}
