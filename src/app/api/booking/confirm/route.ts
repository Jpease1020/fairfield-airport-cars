import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/utils/firebase-server';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getBooking } from '@/lib/services/booking-service';
import { sendConfirmationEmail } from '@/lib/services/email-service';
import { adaptOldBookingToNew } from '@/utils/bookingAdapter';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, token } = await request.json();

    if (!bookingId || !token) {
      return NextResponse.json(
        { error: 'bookingId and token are required' },
        { status: 400 }
      );
    }

    const bookingSnapshot = await getDoc(doc(db, 'bookings', bookingId));

    if (!bookingSnapshot.exists()) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const bookingData = bookingSnapshot.data();
    const confirmation = bookingData.confirmation;

    if (!confirmation || !confirmation.token) {
      return NextResponse.json(
        { error: 'Confirmation token missing. Please contact support.' },
        { status: 409 }
      );
    }

    if (confirmation.status === 'confirmed') {
      return NextResponse.json({
        message: 'Booking already confirmed.'
      });
    }

    if (confirmation.token !== token) {
      return NextResponse.json(
        { error: 'Invalid confirmation token.' },
        { status: 401 }
      );
    }

    await updateDoc(doc(db, 'bookings', bookingId), {
      status: 'confirmed',
      confirmation: {
        status: 'confirmed',
        token: null,
        sentAt: confirmation.sentAt ?? null,
        confirmedAt: new Date().toISOString()
      },
      updatedAt: serverTimestamp()
    });

    const bookingRecord = await getBooking(bookingId);
    if (bookingRecord) {
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

