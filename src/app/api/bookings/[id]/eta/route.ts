import { NextRequest, NextResponse } from 'next/server';
import { getEstimatedArrival } from '@/lib/services/booking-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
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