import { NextRequest, NextResponse } from 'next/server';
import { realTimeTrackingService } from '@/lib/services/real-time-tracking-service';
import { getBooking } from '@/lib/services/booking-service';
import { requireOwnerOrAdmin } from '@/lib/utils/auth-server';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, driverLocation, destination } = await request.json();

    if (!bookingId || !driverLocation || !destination) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const booking = await getBooking(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const accessResult = await requireOwnerOrAdmin(request, booking);
    if (!accessResult.ok) return accessResult.response;

    // Calculate ETA using the tracking service
    const etaInfo = await realTimeTrackingService.calculateETA(bookingId, driverLocation);

    if (!etaInfo) {
      return NextResponse.json(
        { error: 'Could not calculate ETA' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      estimatedArrival: etaInfo.estimatedArrival.toISOString(),
      distanceMiles: etaInfo.distanceMiles,
      timeMinutes: etaInfo.timeMinutes,
      trafficConditions: etaInfo.trafficConditions,
    });
  } catch (error) {
    console.error('Error calculating ETA:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
