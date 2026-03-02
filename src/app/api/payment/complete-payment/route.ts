import { NextResponse } from 'next/server';

export async function POST(_request: Request) {
  return NextResponse.json(
    {
      error: 'Deprecated endpoint',
      code: 'DEPRECATED_ENDPOINT',
      message: 'Use POST /api/payment/process-payment for payment processing.',
    },
    { status: 410 }
  );
} 
