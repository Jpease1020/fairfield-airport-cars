'use client';

import React, { useEffect, useState } from 'react';
import { Box, Button, Container, H1, LoadingSpinner, Stack, Text } from '@/design/ui';
import { authFetch } from '@/lib/utils/auth-fetch';

interface CalendarEmbedConfig {
  embedUrl: string | null;
  openUrl: string;
  timeZone: string;
}

export function AdminGoogleCalendarView() {
  const [config, setConfig] = useState<CalendarEmbedConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    authFetch('/api/admin/calendar-embed')
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error ?? `Failed to load calendar config (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setConfig(data);
      })
      .catch((err) => {
        console.error('Failed to load calendar embed config:', err);
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load calendar config');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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

        {loading ? (
          <Stack spacing="md" align="center">
            <LoadingSpinner size="lg" />
          </Stack>
        ) : error ? (
          <Box variant="elevated" padding="lg">
            <Stack spacing="sm">
              <Text weight="bold" color="error">Failed to load calendar settings</Text>
              <Text color="secondary">{error}</Text>
              <Text color="secondary">
                If you were recently signed out, try refreshing the page and signing in again.
              </Text>
            </Stack>
          </Box>
        ) : (
          <>
            <Stack direction="horizontal" spacing="md" align="center" wrap="wrap">
              <Button
                href={config?.openUrl}
                variant="primary"
                text="Open in Google Calendar"
              />
              <Text color="secondary">
                Time zone: {config?.timeZone ?? 'Eastern Time'}
              </Text>
            </Stack>

            {config?.embedUrl ? (
              <Box variant="elevated" padding="sm">
                <iframe
                  src={config.embedUrl}
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
          </>
        )}
      </Stack>
    </Container>
  );
}
