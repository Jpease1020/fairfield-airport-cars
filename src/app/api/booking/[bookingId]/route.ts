
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/utils/firebase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Get booking from Firebase
    const adminDb = getAdminDb();
    const bookingDoc = await adminDb.collection('bookings').doc(bookingId).get();
    
    if (!bookingDoc.exists) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const bookingData = bookingDoc.data();
    
    // Convert Firebase timestamps to ISO strings for JSON serialization
    const booking = {
      id: bookingDoc.id,
      ...bookingData,
      pickupDateTime: bookingData?.pickupDateTime?.toDate?.()?.toISOString() || bookingData?.pickupDateTime,
      createdAt: bookingData?.createdAt?.toDate?.()?.toISOString() || bookingData?.createdAt,
      updatedAt: bookingData?.updatedAt?.toDate?.()?.toISOString() || bookingData?.updatedAt,
    };

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking details' },
      { status: 500 }
    );
  }
}
