import { NextRequest, NextResponse } from 'next/server';
import { driverSchedulingService } from '@/lib/services/driver-scheduling-service';

export async function POST(request: NextRequest) {
  try {
    const { date, startTime, endTime } = await request.json();

    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Date, startTime, and endTime are required' },
        { status: 400 }
      );
    }

    // Check for booking conflicts
    const conflictCheck = await driverSchedulingService.checkBookingConflicts(
      date,
      startTime,
      endTime
    );

    // Get available drivers for the time slot
    const availableDrivers = await driverSchedulingService.getAvailableDriversForTimeSlot(
      date,
      startTime,
      endTime
    );

    return NextResponse.json({
      isAvailable: !conflictCheck.hasConflict && availableDrivers.length > 0,
      hasConflict: conflictCheck.hasConflict,
      conflictingBookings: conflictCheck.conflictingBookings,
      suggestedTimeSlots: conflictCheck.suggestedTimeSlots,
      availableDrivers: availableDrivers.length,
      drivers: availableDrivers,
      driverName: availableDrivers.length > 0 ? 'Gregg' : null
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
