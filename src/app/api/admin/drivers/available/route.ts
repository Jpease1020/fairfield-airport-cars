import { NextResponse } from 'next/server';
import { getAvailableDrivers } from '@/lib/services/booking-service';

export async function GET() {
  try {
    const drivers = await getAvailableDrivers();
    return NextResponse.json({ drivers });
  } catch (error) {
    console.error('Error fetching available drivers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available drivers' },
      { status: 500 }
    );
  }
}

