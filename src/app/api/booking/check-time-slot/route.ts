import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pickupDateTime, bufferMinutes = 60 } = body;
    
    if (!pickupDateTime) {
      return NextResponse.json(
        { error: 'pickupDateTime is required' },
        { status: 400 }
      );
    }

    const pickupDate = new Date(pickupDateTime);
    const start = new Date(pickupDate.getTime() - bufferMinutes * 60 * 1000);
    const end = new Date(pickupDate.getTime() + bufferMinutes * 60 * 1000);

    // Simple availability logic - always return available for now
    // In a real app, this would check against existing bookings
    const isAvailable = true;
    const conflictingBookings = 0;
    
    console.log('✅ Time slot check completed (simple):', { 
      pickupDateTime, 
      bufferMinutes, 
      isAvailable, 
      conflictingBookings
    });
    
    return NextResponse.json({
      success: true,
      isAvailable,
      conflictingBookings,
      timeRange: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Error checking time slot:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to check time slot',
      details: error.code || 'unknown_error'
    }, { status: 500 });
  }
} 