// src/app/api/calendar/availability/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createOAuth2Client, setCredentials, initializeCalendarAPI, checkAvailability, getAvailableSlots } from '@/lib/services/google-calendar';
import { getBusinessRules } from '@/lib/business/business-rules';

const calendarIntegrationEnabled = process.env.ENABLE_GOOGLE_CALENDAR === 'true';

export async function POST(request: NextRequest) {
  if (!calendarIntegrationEnabled) {
    return NextResponse.json(
      { error: 'Google Calendar integration is disabled.' },
      { status: 501 }
    );
  }

  try {
    const body = await request.json();
    const rules = await getBusinessRules();
    const { 
      startTime, 
      endTime, 
      date, 
      durationMinutes = 60, 
      bufferMinutes: bodyBuffer,
      tokens 
    } = body;
    const bufferMinutes = typeof bodyBuffer === 'number' ? bodyBuffer : rules.bookingBufferMinutes;

    if (!tokens) {
      return NextResponse.json(
        { error: 'Authentication tokens required' },
        { status: 401 }
      );
    }

    // Initialize calendar API with tokens
    const oauth2Client = createOAuth2Client();
    setCredentials(oauth2Client, tokens);
    const calendar = initializeCalendarAPI(oauth2Client);

    let result;

    if (startTime && endTime) {
      // Check availability for specific time slot
      result = await checkAvailability(
        calendar,
        new Date(startTime),
        new Date(endTime),
        bufferMinutes
      );
    } else if (date) {
      // Get available slots for a specific date
      result = await getAvailableSlots(
        calendar,
        new Date(date),
        durationMinutes,
        bufferMinutes
      );
    } else {
      return NextResponse.json(
        { error: 'Either startTime/endTime or date must be provided' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      availability: result
    });

  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { error: 'Failed to check calendar availability' },
      { status: 500 }
    );
  }
}


