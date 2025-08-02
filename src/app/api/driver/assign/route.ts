import { NextResponse } from 'next/server';
import { driverAssignmentService } from '@/lib/services/driver-assignment-service';

export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ 
        error: 'Booking ID is required' 
      }, { status: 400 });
    }

    const assignment = await driverAssignmentService.assignDriverToBooking(bookingId);

    return NextResponse.json({
      success: true,
      data: assignment,
      message: 'Driver assigned successfully'
    });

  } catch (error) {
    console.error('Error assigning driver:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assign driver'
    }, { status: 500 });
  }
} 