// src/app/(admin)/calendar/page.tsx
'use client';

import React from 'react';
import { Container, Stack, H1, Text } from '@/design/ui';
import { GoogleCalendarConnect } from '@/components/calendar/GoogleCalendarConnect';
import { AvailabilityChecker } from '@/components/calendar/AvailabilityChecker';

export default function CalendarPage() {
  const calendarEnabled = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_CALENDAR === 'true';

  return (
    <Container maxWidth="4xl" padding="xl">
      <Stack spacing="xl">
        <Stack spacing="md">
          <H1>Calendar Integration</H1>
          <Text color="secondary">
            Manage Google Calendar integration for availability checking and booking events.
          </Text>
        </Stack>

        {calendarEnabled ? (
          <>
            <GoogleCalendarConnect />
            <AvailabilityChecker />
          </>
        ) : (
          <Text color="secondary">
            Google Calendar features are currently disabled. Set
            `NEXT_PUBLIC_ENABLE_GOOGLE_CALENDAR=true` and restart the app when you’re ready to
            evaluate the integration.
          </Text>
        )}
      </Stack>
    </Container>
  );
}
