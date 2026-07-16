// src/app/api/calendar/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createOAuth2Client, getTokens, setCredentials, initializeCalendarAPI, storeCalendarTokens } from '@/lib/services/google-calendar';
import { requireAdmin } from '@/lib/utils/auth-server';

const calendarIntegrationEnabled = process.env.ENABLE_GOOGLE_CALENDAR === 'true';

export async function GET(request: NextRequest) {
  if (!calendarIntegrationEnabled) {
    return NextResponse.json(
      { error: 'Google Calendar integration is disabled.' },
      { status: 501 }
    );
  }

  // API routes are excluded from middleware's admin gate (see matcher in middleware.ts),
  // and this route persists whatever OAuth tokens it receives as the app's shared calendar
  // credentials — without this check, anyone who completes Google's consent screen with
  // their own account could hijack calendar write access.
  const accessResult = await requireAdmin(request);
  if (!accessResult.ok) return accessResult.response;

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

    setCredentials(oauth2Client, tokens);
    const calendar = initializeCalendarAPI(oauth2Client);

    // Test the connection
    const testResponse = await calendar.calendarList.list();

    // Persist tokens server-side (Firestore) so future requests don't need this flow again
    await storeCalendarTokens(tokens);

    return NextResponse.json({
      success: true,
      message: 'Google Calendar connected successfully',
      tokens: tokens, // Kept for the existing client-side availability-checker flow
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


