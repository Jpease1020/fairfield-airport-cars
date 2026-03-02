import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  _context: { params: Promise<{ id: string }> }
) {
  return NextResponse.json(
    {
      error: 'Deprecated endpoint',
      code: 'DEPRECATED_ENDPOINT',
      message: 'Use POST /api/tracking/eta for ETA calculations.',
    },
    { status: 410 }
  );
} 
