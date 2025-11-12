// src/app/api/calendar/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createOAuth2Client, setCredentials, initializeCalendarAPI, createBookingEvent, updateBookingEvent, deleteBookingEvent } from '@/lib/services/google-calendar';

const calendarIntegrationEnabled = process.env.ENABLE_GOOGLE_CALENDAR === 'true';

const disabledResponse = NextResponse.json(
  { error: 'Google Calendar integration is disabled.' },
  { status: 501 }
);

export async function POST(request: NextRequest) {
  if (!calendarIntegrationEnabled) {
    return disabledResponse;
  }

  try {
    const body = await request.json();
    const { tokens, bookingData } = body;

    if (!tokens || !bookingData) {
      return NextResponse.json(
        { error: 'Authentication tokens and booking data required' },
        { status: 400 }
      );
    }

    // Initialize calendar API with tokens
    const oauth2Client = createOAuth2Client();
    setCredentials(oauth2Client, tokens);
    const calendar = initializeCalendarAPI(oauth2Client);

    // Create calendar event
    const event = await createBookingEvent(calendar, bookingData);

    return NextResponse.json({
      success: true,
      event: event
    });

  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!calendarIntegrationEnabled) {
    return disabledResponse;
  }

  try {
    const body = await request.json();
    const { tokens, eventId, updates } = body;

    if (!tokens || !eventId || !updates) {
      return NextResponse.json(
        { error: 'Authentication tokens, event ID, and updates required' },
        { status: 400 }
      );
    }

    // Initialize calendar API with tokens
    const oauth2Client = createOAuth2Client();
    setCredentials(oauth2Client, tokens);
    const calendar = initializeCalendarAPI(oauth2Client);

    // Update calendar event
    const event = await updateBookingEvent(calendar, eventId, updates);

    return NextResponse.json({
      success: true,
      event: event
    });

  } catch (error) {
    console.error('Error updating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to update calendar event' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!calendarIntegrationEnabled) {
    return disabledResponse;
  }

  try {
    const body = await request.json();
    const { tokens, eventId } = body;

    if (!tokens || !eventId) {
      return NextResponse.json(
        { error: 'Authentication tokens and event ID required' },
        { status: 400 }
      );
    }

    // Initialize calendar API with tokens
    const oauth2Client = createOAuth2Client();
    setCredentials(oauth2Client, tokens);
    const calendar = initializeCalendarAPI(oauth2Client);

    // Delete calendar event
    await deleteBookingEvent(calendar, eventId);

    return NextResponse.json({
      success: true,
      message: 'Calendar event deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to delete calendar event' },
      { status: 500 }
    );
  }
}


