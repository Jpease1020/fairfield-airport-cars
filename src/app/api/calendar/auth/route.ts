// src/app/api/calendar/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createOAuth2Client, getAuthUrl } from '@/lib/services/google-calendar';

const calendarIntegrationEnabled = process.env.ENABLE_GOOGLE_CALENDAR === 'true';

export async function GET(request: NextRequest) {
  if (!calendarIntegrationEnabled) {
    return NextResponse.json(
      { error: 'Google Calendar integration is disabled.' },
      { status: 501 }
    );
  }

  try {
    const oauth2Client = createOAuth2Client();
    const authUrl = getAuthUrl(oauth2Client);
    
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    );
  }
}


