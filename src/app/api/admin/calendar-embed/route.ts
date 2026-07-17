import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth-server';

const BUSINESS_TIME_ZONE = 'America/New_York';

function buildCalendarEmbedUrl(): string | null {
  const explicitEmbedUrl = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL;
  if (explicitEmbedUrl) {
    return explicitEmbedUrl;
  }

  const calendarId = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID || process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId || calendarId === 'primary') {
    return null;
  }

  const params = new URLSearchParams({
    src: calendarId,
    ctz: BUSINESS_TIME_ZONE,
    mode: 'WEEK',
    showTitle: '0',
    showPrint: '0',
    showCalendars: '0',
    showTabs: '1',
    showTz: '0',
    wkst: '1',
  });

  return `https://calendar.google.com/calendar/embed?${params.toString()}`;
}

function buildCalendarOpenUrl(): string {
  const explicitOpenUrl = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_OPEN_URL;
  if (explicitOpenUrl) {
    return explicitOpenUrl;
  }

  const calendarId = process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_ID || process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId || calendarId === 'primary') {
    return 'https://calendar.google.com/calendar/u/0/r';
  }

  return `https://calendar.google.com/calendar/u/0?cid=${encodeURIComponent(calendarId)}`;
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (!authResult.ok) return authResult.response;

    const response = NextResponse.json({
      embedUrl: buildCalendarEmbedUrl(),
      openUrl: buildCalendarOpenUrl(),
      timeZone: BUSINESS_TIME_ZONE,
    });
    // `private, max-age` is keyed by URL only — browsers don't partition their HTTP cache by
    // the Authorization header requireAdmin actually checks, so a cached response could be
    // replayed to a different identity on the same browser after a logout/account switch
    // within the cache window, without requireAdmin ever re-running. This endpoint is only hit
    // once per /admin/schedules visit, so the Firestore-lookup cost this was trying to avoid
    // isn't worth that gap — no-store instead.
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (err) {
    console.error('GET admin/calendar-embed failed:', err);
    return NextResponse.json({ error: 'Failed to load calendar config' }, { status: 500 });
  }
}
