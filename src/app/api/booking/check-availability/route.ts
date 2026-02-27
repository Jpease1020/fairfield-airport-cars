import { NextRequest, NextResponse } from 'next/server';
import { driverSchedulingService } from '@/lib/services/driver-scheduling-service';
import { z } from 'zod';

const requestSchema = z
  .object({
    pickupDateTime: z.string().optional(),
    date: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  })
  .refine(
    (data) => !!data.pickupDateTime || (!!data.date && !!data.startTime && !!data.endTime),
    { message: 'pickupDateTime or date/startTime/endTime are required' }
  );

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid request' },
        { status: 400 }
      );
    }

    let { date, startTime, endTime } = parsed.data;

    if (parsed.data.pickupDateTime) {
      const pickupDate = new Date(parsed.data.pickupDateTime);
      if (Number.isNaN(pickupDate.getTime())) {
        return NextResponse.json({ error: 'Invalid pickupDateTime' }, { status: 400 });
      }
      date = pickupDate.toISOString().split('T')[0];
      startTime = pickupDate.toTimeString().slice(0, 5);
      endTime = new Date(pickupDate.getTime() + 2 * 60 * 60 * 1000).toTimeString().slice(0, 5);
    }

    // Check for booking conflicts
    const conflictCheck = await driverSchedulingService.checkBookingConflicts(
      date!,
      startTime!,
      endTime!
    );

    // Get available drivers for the time slot
    const availableDrivers = await driverSchedulingService.getAvailableDriversForTimeSlot(
      date!,
      startTime!,
      endTime!
    );

    const isAvailable = !conflictCheck.hasConflict && availableDrivers.length > 0;
    let message = 'Time slot is available';

    if (!isAvailable && conflictCheck.hasConflict) {
      const firstConflict = conflictCheck.conflictingBookings[0];
      const suggested = conflictCheck.suggestedTimeSlots.length
        ? ` Try ${conflictCheck.suggestedTimeSlots.join(', ')} instead.`
        : '';
      message = firstConflict
        ? `That time overlaps with an existing ride (${firstConflict.timeSlot}).${suggested}`
        : `That time conflicts with another booking.${suggested}`;
    } else if (!isAvailable) {
      message = 'No drivers are available at that time. Please choose a different time.';
    }

    return NextResponse.json({
      isAvailable,
      hasConflict: conflictCheck.hasConflict,
      conflictingBookings: conflictCheck.conflictingBookings,
      suggestedTimeSlots: conflictCheck.suggestedTimeSlots,
      availableDrivers: availableDrivers.length,
      drivers: availableDrivers,
      driverName: availableDrivers.length > 0 ? 'Your Driver' : null,
      message,
      checkedWindow: {
        date,
        startTime,
        endTime,
      },
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}
