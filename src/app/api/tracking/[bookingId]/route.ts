import { NextRequest, NextResponse } from 'next/server';
import { getBooking } from '@/lib/services/booking-service';
import { getDriver } from '@/lib/services/driver-service';
import { requireOwnerOrAdmin } from '@/lib/utils/auth-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;

    // Get booking details
    const booking = await getBooking(bookingId);
    if (!booking) {
      return NextResponse.json({ 
        error: 'Booking not found' 
      }, { status: 404 });
    }

    const token = request.nextUrl.searchParams.get('token');
    const hasTrackingAccess = token && (booking as any).trackingToken && token === (booking as any).trackingToken;

    if (!hasTrackingAccess) {
      const accessResult = await requireOwnerOrAdmin(request, booking);
      if (!accessResult.ok) return accessResult.response;
    }

    // Get driver details
    const driver = await getDriver(booking.driverId || '');
    if (!driver) {
      return NextResponse.json({ 
        error: 'Driver not found' 
      }, { status: 404 });
    }

    // Return tracking information
    return NextResponse.json({
      bookingId,
      driverName: driver.name,
      driverPhone: driver.phone,
      vehicleInfo: driver.vehicleInfo,
      currentLocation: driver.currentLocation,
      status: booking.status,
      estimatedArrival: booking.estimatedArrival,
      pickupLocation: booking.pickupLocation,
      pickupDateTime: booking.pickupDateTime,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting tracking info:', error);
    return NextResponse.json({ 
      error: 'Failed to get tracking information' 
    }, { status: 500 });
  }
} 
