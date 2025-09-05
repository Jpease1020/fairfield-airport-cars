import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // 🚨 SECURITY: Direct booking creation is disabled
  // All bookings must go through payment processing for security
  console.log('🚨 SECURITY BLOCK: Direct booking creation attempted - blocked for security');
  
  return NextResponse.json({ 
    error: 'Direct booking creation is disabled for security. All bookings must be processed through payment.',
    code: 'SECURITY_BLOCKED',
    message: 'Please use the payment flow to create bookings securely.'
  }, { status: 403 });
} 