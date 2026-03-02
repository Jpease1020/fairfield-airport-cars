import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  _request: NextRequest
) {
  return NextResponse.json(
    {
      error: 'Deprecated endpoint',
      code: 'DEPRECATED_ENDPOINT',
      message: 'Time-slot locking is no longer used. Booking conflicts are enforced by /api/booking/submit.',
    },
    { status: 410 }
  );
}
