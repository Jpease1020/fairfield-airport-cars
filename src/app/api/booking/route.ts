import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return NextResponse.json(
    {
      error: 'Deprecated endpoint',
      code: 'DEPRECATED_ENDPOINT',
      message: 'Use POST /api/booking/submit for booking creation.',
    },
    { status: 410 }
  );
}
