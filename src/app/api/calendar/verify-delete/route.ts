// src/app/api/calendar/verify-delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBooking } from '@/lib/services/booking-service';
import { 
  createOAuth2Client, 
  setCredentials, 
  initializeCalendarAPI,
  getStoredCalendarTokens 
} from '@/lib/services/google-calendar';

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

export async function GET(request: NextRequest) {
  try {
    // Only allow in smoke test mode
    const isSmokeTest = request.headers.get('x-smoke-test') === 'true' || 
                       process.env.SMOKE_TEST_MODE === 'true';
    
    if (!isSmokeTest) {
      return NextResponse.json({ error: 'Unauthorized - smoke test only' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    
    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
    }

    const booking = await getBooking(bookingId);
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // If no calendar event ID, consider it deleted (or never created)
    if (!booking.calendarEventId) {
      return NextResponse.json({ 
        eventDeleted: true,
        message: 'No calendar event ID found - event was never created or already deleted'
      });
    }

    // In smoke test mode, check if it's a fake event ID
    if (booking.calendarEventId.startsWith('smoke-test-event-')) {
      return NextResponse.json({ 
        eventDeleted: true,
        message: 'Smoke test event - not a real calendar event'
      });
    }

    // Try to fetch the event from Google Calendar
    // If it doesn't exist (404), it was successfully deleted
    try {
      const tokens = await getStoredCalendarTokens();
      if (!tokens) {
        return NextResponse.json({ 
          eventDeleted: null,
          message: 'Cannot verify - calendar tokens not available'
        });
      }

      const oauth2Client = createOAuth2Client();
      setCredentials(oauth2Client, tokens);
      const calendar = initializeCalendarAPI(oauth2Client);

      await calendar.events.get({
        calendarId: CALENDAR_ID,
        eventId: booking.calendarEventId,
      });

      // Event still exists - deletion failed
      return NextResponse.json({ 
        eventDeleted: false,
        message: 'Calendar event still exists'
      });
    } catch (error: any) {
      if (error.code === 404) {
        // Event not found - successfully deleted
        return NextResponse.json({ 
          eventDeleted: true,
          message: 'Calendar event successfully deleted'
        });
      }
      
      // Other error
      throw error;
    }
  } catch (error) {
    console.error('Error verifying calendar event deletion:', error);
    return NextResponse.json({ 
      error: 'Failed to verify calendar event deletion',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

