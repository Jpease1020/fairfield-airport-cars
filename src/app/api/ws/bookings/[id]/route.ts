import { NextRequest, NextResponse } from 'next/server';
import { getBooking, updateBooking } from '@/lib/services/booking-service';

// WebSocket handler for real-time booking updates
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params;
  
  if (!bookingId) {
    return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
  }

  try {
    // Verify booking exists
    const booking = await getBooking(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Return WebSocket upgrade response
    return new NextResponse(null, {
      status: 101,
      headers: {
        'Upgrade': 'websocket',
        'Connection': 'Upgrade',
        'Sec-WebSocket-Accept': 's3pPLMBiTxaQ9kYGzzhZRbK+xOo=',
      },
    });
  } catch (error) {
    console.error('WebSocket setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle WebSocket connections
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params;
  
  if (!bookingId) {
    return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
  }

  try {
    const { type, data } = await request.json();
    
    switch (type) {
      case 'status_update':
        await updateBooking(bookingId, {
          status: data.status,
          updatedAt: new Date(),
        });
        break;
        
      case 'location_update':
        await updateBooking(bookingId, {
          driverLocation: data.location,
          estimatedArrival: data.estimatedArrival,
          updatedAt: new Date(),
        });
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid message type' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('WebSocket message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 