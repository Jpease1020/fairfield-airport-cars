import { NextRequest, NextResponse } from 'next/server';
import { driverLocationService } from '@/lib/services/driver-location-service';
import { getBooking, updateBooking } from '@/lib/services/booking-service';

export async function POST(request: NextRequest) {
  try {
    const { bookingId, driverId, driverName } = await request.json();

    if (!bookingId || !driverId) {
      return NextResponse.json(
        { error: 'Booking ID and driver ID are required' },
        { status: 400 }
      );
    }

    // Verify booking exists
    const booking = await getBooking(bookingId);
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if tracking is already active
    if (driverLocationService.getTrackingStatus(bookingId)) {
      return NextResponse.json(
        { error: 'Tracking already active for this booking' },
        { status: 409 }
      );
    }

    // Update booking with driver assignment
    await updateBooking(bookingId, {
      driverId,
      driverName: driverName || `Driver ${driverId}`,
      status: 'confirmed',
      updatedAt: new Date(),
    });

    // Start driver tracking
    await driverLocationService.startTracking(bookingId, driverId);

    // Send real-time update
    await fetch(`${request.nextUrl.origin}/api/ws/bookings/${bookingId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'driver_assigned',
        data: {
          driverId,
          driverName: driverName || `Driver ${driverId}`,
        },
      }),
    });

    return NextResponse.json({
      success: true,
      message: 'Driver tracking started successfully',
      bookingId,
      driverId,
    });
  } catch (error) {
    console.error('Error starting driver tracking:', error);
    return NextResponse.json(
      { error: 'Failed to start driver tracking' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Stop driver tracking
    driverLocationService.stopTracking(bookingId);

    return NextResponse.json({
      success: true,
      message: 'Driver tracking stopped successfully',
      bookingId,
    });
  } catch (error) {
    console.error('Error stopping driver tracking:', error);
    return NextResponse.json(
      { error: 'Failed to stop driver tracking' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (bookingId) {
      // Get tracking status for specific booking
      const isTracking = driverLocationService.getTrackingStatus(bookingId);
      return NextResponse.json({
        bookingId,
        isTracking,
      });
    } else {
      // Get all active trackings
      const activeTrackings = driverLocationService.getActiveTrackings();
      return NextResponse.json({
        activeTrackings,
        count: activeTrackings.length,
      });
    }
  } catch (error) {
    console.error('Error getting tracking status:', error);
    return NextResponse.json(
      { error: 'Failed to get tracking status' },
      { status: 500 }
    );
  }
} 