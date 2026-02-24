import { NextRequest, NextResponse } from 'next/server';
import { getEstimatedArrival, getBooking } from '@/lib/services/booking-service';
import { requireOwnerOrAdmin } from '@/lib/utils/auth-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const booking = await getBooking(bookingId);
    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found',
        estimatedArrival: null,
      }, { status: 404 });
    }

    const accessResult = await requireOwnerOrAdmin(request, booking);
    if (!accessResult.ok) return accessResult.response;

    const estimatedArrival = await getEstimatedArrival(bookingId);
    
    if (!estimatedArrival) {
      return NextResponse.json({
        success: false,
        error: 'Unable to calculate estimated arrival time',
        estimatedArrival: null,
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      estimatedArrival: estimatedArrival.toISOString(),
      bookingId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error calculating estimated arrival:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to calculate estimated arrival time',
      estimatedArrival: null,
    }, { status: 500 });
  }
} 
