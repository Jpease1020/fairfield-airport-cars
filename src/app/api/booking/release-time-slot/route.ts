import { NextRequest, NextResponse } from 'next/server';
import { bookingLockService } from '@/lib/services/booking-lock-service';
import { requireAdmin } from '@/lib/utils/auth-server';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

    const { timeSlot } = await request.json();

    if (!timeSlot) {
      return NextResponse.json(
        { error: 'Time slot is required' },
        { status: 400 }
      );
    }

    await bookingLockService.releaseTimeSlot(timeSlot, 'any'); // Release any lock for this slot

    return NextResponse.json({
      success: true,
      message: 'Time slot released successfully'
    });

  } catch (error) {
    console.error('Error releasing time slot:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to release time slot' 
      },
      { status: 500 }
    );
  }
}
