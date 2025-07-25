import { NextRequest, NextResponse } from 'next/server';
import { getAvailableDrivers } from '@/lib/services/booking-service';

export async function GET() {
  try {
    const drivers = await getAvailableDrivers();
    
    return NextResponse.json({
      success: true,
      drivers,
      count: drivers.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching driver availability:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch driver availability',
      drivers: [],
      count: 0,
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { driverId, location, status } = await request.json();
    
    // Update driver location and status
    // This would typically update the driver's location in the database
    // For now, we'll return a success response
    
    return NextResponse.json({
      success: true,
      message: 'Driver location updated',
      driverId,
      location,
      status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating driver location:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update driver location',
    }, { status: 500 });
  }
} 