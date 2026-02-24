import { NextRequest, NextResponse } from 'next/server';
import { getBooking } from '@/lib/services/booking-service';
import { requireOwnerOrAdmin } from '@/lib/utils/auth-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const booking = await getBooking(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const accessResult = await requireOwnerOrAdmin(request, booking);
    if (!accessResult.ok) return accessResult.response;

    return NextResponse.json({
      status: booking.status,
      booking,
      estimatedArrival: booking.estimatedArrival
        ? new Date(booking.estimatedArrival).toISOString()
        : null,
    });
  } catch (error) {
    console.error('Error fetching booking status:', error);
    return NextResponse.json({ error: 'Failed to fetch booking status' }, { status: 500 });
  }
}
