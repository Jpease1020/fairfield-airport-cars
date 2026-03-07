import React from 'react';
import { Box, Button, Container, H1, Stack, Text } from '@/design/ui';

const BUSINESS_TIME_ZONE = 'America/New_York';

function buildCalendarEmbedUrl() {
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

function buildCalendarOpenUrl() {
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

export function AdminGoogleCalendarView() {
  const embedUrl = buildCalendarEmbedUrl();
  const openUrl = buildCalendarOpenUrl();

  return (
    <Container maxWidth="7xl" padding="xl">
      <Stack spacing="lg">
        <Box variant="elevated" padding="lg">
          <Stack spacing="sm">
            <H1>Schedule</H1>
            <Text color="secondary">
              This is the live Google Calendar used for booking visibility. Make schedule changes there so Gregg and the booking system stay aligned.
            </Text>
          </Stack>
        </Box>

        <Stack direction="horizontal" spacing="md" align="center" wrap="wrap">
          <Button
            href={openUrl}
            variant="primary"
            text="Open in Google Calendar"
          />
          <Text color="secondary">
            Time zone: Eastern Time
          </Text>
        </Stack>

        {embedUrl ? (
          <Box variant="elevated" padding="sm">
            <iframe
              src={embedUrl}
              title="Google Calendar"
              style={{
                border: 0,
                width: '100%',
                minHeight: '920px',
                borderRadius: '12px',
                background: '#fff',
              }}
            />
          </Box>
        ) : (
          <Box variant="elevated" padding="lg">
            <Stack spacing="sm">
              <Text weight="bold">Calendar embed is not configured.</Text>
              <Text color="secondary">
                Set `NEXT_PUBLIC_GOOGLE_CALENDAR_EMBED_URL` or `NEXT_PUBLIC_GOOGLE_CALENDAR_ID` in Vercel if you want the calendar to render inline here.
              </Text>
              <Text color="secondary">
                Until then, use the button above to open Google Calendar directly.
              </Text>
            </Stack>
          </Box>
        )}
      </Stack>
    </Container>
  );
}
