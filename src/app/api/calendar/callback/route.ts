// src/app/api/calendar/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createOAuth2Client, getTokens, setCredentials, initializeCalendarAPI } from '@/lib/services/google-calendar';

const calendarIntegrationEnabled = process.env.ENABLE_GOOGLE_CALENDAR === 'true';

export async function GET(request: NextRequest) {
  if (!calendarIntegrationEnabled) {
    return NextResponse.json(
      { error: 'Google Calendar integration is disabled.' },
      { status: 501 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code not provided' },
        { status: 400 }
      );
    }

    const oauth2Client = createOAuth2Client();
    const tokens = await getTokens(oauth2Client, code);
    
    // Store tokens securely (in production, use a secure database)
    // For now, we'll return them to the client
    // TODO: Implement secure token storage
    
    setCredentials(oauth2Client, tokens);
    const calendar = initializeCalendarAPI(oauth2Client);
    
    // Test the connection
    const testResponse = await calendar.calendarList.list();
    
    return NextResponse.json({
      success: true,
      message: 'Google Calendar connected successfully',
      tokens: tokens, // Remove this in production
      calendars: testResponse.data.items?.length || 0
    });
    
  } catch (error) {
    console.error('Error in calendar callback:', error);
    return NextResponse.json(
      { error: 'Failed to complete Google Calendar authorization' },
      { status: 500 }
    );
  }
}


