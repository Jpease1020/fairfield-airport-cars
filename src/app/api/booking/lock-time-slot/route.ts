import { NextRequest, NextResponse } from 'next/server';
import { bookingLockService } from '@/lib/services/booking-lock-service';

export async function POST(request: NextRequest) {
  try {
    const { timeSlot } = await request.json();

    if (!timeSlot) {
      return NextResponse.json(
        { error: 'Time slot is required' },
        { status: 400 }
      );
    }

    // Generate a unique lock ID (could be session ID or booking ID)
    const lockId = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const success = await bookingLockService.lockTimeSlot(timeSlot, lockId);

    if (success) {
      return NextResponse.json({
        success: true,
        lockId,
        message: 'Time slot locked successfully'
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Time slot is already locked by another booking' 
        },
        { status: 409 }
      );
    }

  } catch (error) {
    console.error('Error locking time slot:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to lock time slot' 
      },
      { status: 500 }
    );
  }
}
