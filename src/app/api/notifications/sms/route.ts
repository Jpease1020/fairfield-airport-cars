import { NextRequest, NextResponse } from 'next/server';
import { sendSms } from '@/lib/services/twilio-service';
import { requireAdmin } from '@/lib/utils/auth-server';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

    const { to, message } = await request.json();

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Send SMS
    const result = await sendSms({
      to: to.replace(/\s/g, ''), // Remove spaces
      body: message
    });

    return NextResponse.json({
      success: true,
      messageId: result.sid,
      to: to,
      message: 'SMS sent successfully'
    });

  } catch (error) {
    console.error('SMS API error:', error);
    
    // Handle specific Twilio errors
    if (error instanceof Error) {
      if (error.message.includes('not configured')) {
        return NextResponse.json(
          { error: 'SMS service not configured. Please check Twilio credentials.' },
          { status: 503 }
        );
      }
      
      if (error.message.includes('Invalid phone number')) {
        return NextResponse.json(
          { error: 'Invalid phone number format' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
}
