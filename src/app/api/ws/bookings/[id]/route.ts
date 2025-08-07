import { NextRequest, NextResponse } from 'next/server';
import { getBooking, updateBooking } from '@/lib/services/booking-service';

// In-memory store for real-time updates (in production, use Redis)
const realTimeUpdates = new Map<string, any[]>();

// Real-time update handler for booking status
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

    // Get last update timestamp from query params
    const lastUpdate = request.nextUrl.searchParams.get('lastUpdate');
    
    // Get updates since last update
    const updates = getUpdatesSince(bookingId, lastUpdate);
    
    return NextResponse.json({
      booking: {
        id: booking.id,
        status: booking.status,
        driverId: booking.driverId,
        driverName: booking.driverName,
        estimatedArrival: booking.estimatedArrival,
        actualArrival: booking.actualArrival,
        driverLocation: booking.driverLocation,
        lastUpdated: booking.updatedAt,
      },
      updates,
      lastUpdate: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Real-time update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle real-time updates
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
        
        // Store update for real-time clients
        addUpdate(bookingId, {
          type: 'status_update',
          data: {
            status: data.status,
            lastUpdated: new Date(),
          },
          timestamp: new Date(),
        });
        break;
        
      case 'location_update':
        await updateBooking(bookingId, {
          driverLocation: data.location,
          estimatedArrival: data.estimatedArrival,
          updatedAt: new Date(),
        });
        
        // Store update for real-time clients
        addUpdate(bookingId, {
          type: 'location_update',
          data: {
            location: data.location,
            estimatedArrival: data.estimatedArrival,
            lastUpdated: new Date(),
          },
          timestamp: new Date(),
        });
        break;
        
      case 'eta_update':
        await updateBooking(bookingId, {
          estimatedArrival: data.estimatedArrival,
          updatedAt: new Date(),
        });
        
        // Store update for real-time clients
        addUpdate(bookingId, {
          type: 'eta_update',
          data: {
            estimatedArrival: data.estimatedArrival,
            lastUpdated: new Date(),
          },
          timestamp: new Date(),
        });
        break;
        
      case 'driver_assigned':
        await updateBooking(bookingId, {
          driverId: data.driverId,
          driverName: data.driverName,
          status: 'confirmed',
          updatedAt: new Date(),
        });
        
        // Store update for real-time clients
        addUpdate(bookingId, {
          type: 'driver_assigned',
          data: {
            driverId: data.driverId,
            driverName: data.driverName,
            status: 'confirmed',
            lastUpdated: new Date(),
          },
          timestamp: new Date(),
        });
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid message type' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Real-time update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Add update to real-time store
function addUpdate(bookingId: string, update: any) {
  if (!realTimeUpdates.has(bookingId)) {
    realTimeUpdates.set(bookingId, []);
  }
  
  const updates = realTimeUpdates.get(bookingId)!;
  updates.push(update);
  
  // Keep only last 100 updates
  if (updates.length > 100) {
    updates.splice(0, updates.length - 100);
  }
}

// Get updates since last update
function getUpdatesSince(bookingId: string, lastUpdate: string | null): any[] {
  if (!realTimeUpdates.has(bookingId)) {
    return [];
  }
  
  const updates = realTimeUpdates.get(bookingId)!;
  
  if (!lastUpdate) {
    return updates;
  }
  
  const lastUpdateTime = new Date(lastUpdate);
  return updates.filter(update => update.timestamp > lastUpdateTime);
}

// Note: These functions are for internal use only
// They should be moved to a separate service file in production 