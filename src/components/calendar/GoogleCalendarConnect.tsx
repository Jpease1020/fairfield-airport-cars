// src/components/calendar/GoogleCalendarConnect.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button, Stack, Text, Box } from '@/design/ui';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import styled from 'styled-components';
import { colors, spacing } from '@/design/system/tokens/tokens';

const ConnectionStatus = styled(Box)<{ $connected: boolean }>`
  padding: ${spacing.md};
  border-radius: 8px;
  background-color: ${({ $connected }) => 
    $connected ? colors.success[100] : colors.warning[100]};
  border: 1px solid ${({ $connected }) => 
    $connected ? colors.success[300] : colors.warning[300]};
`;

const StatusText = styled(Text)<{ $connected: boolean }>`
  color: ${({ $connected }) => 
    $connected ? colors.success[700] : colors.warning[700]};
  font-weight: 500;
`;

const MessageBox = styled(Box)<{ $variant: 'error' | 'info' }>`
  padding: ${spacing.md};
  border-radius: 8px;
  background-color: ${({ $variant }) =>
    $variant === 'error' ? colors.danger[100] : colors.primary[50]};
  border: 1px solid ${({ $variant }) =>
    $variant === 'error' ? colors.danger[300] : colors.primary[200]};
`;

export const GoogleCalendarConnect: React.FC = () => {
  const {
    isAvailable,
    isConnected,
    loading,
    error,
    getAuthUrl,
    completeAuth,
    disconnect,
  } = useGoogleCalendar();

  const [authUrl, setAuthUrl] = useState<string | null>(null);

  // Get authorization URL on component mount
  useEffect(() => {
    const fetchAuthUrl = async () => {
      try {
        const url = await getAuthUrl();
        setAuthUrl(url);
      } catch (err) {
        console.error('Failed to get auth URL:', err);
      }
    };

    fetchAuthUrl();
  }, [getAuthUrl]);

  // Handle authorization completion
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && !isConnected) {
      completeAuth(code);
    }
  }, [completeAuth, isConnected]);

  const handleConnect = () => {
    if (authUrl) {
      window.location.href = authUrl;
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (!isAvailable) {
    return (
      <MessageBox $variant="info">
        <Stack spacing="sm">
          <Text size="lg" weight="bold">
            Google Calendar integration is disabled
          </Text>
          <Text color="secondary">
            This feature isn’t available in the current environment. Enable it by setting
            the appropriate feature flag when you’re ready to test the integration.
          </Text>
        </Stack>
      </MessageBox>
    );
  }

  if (loading) {
    return (
      <Stack spacing="md" align="center">
        <Text>Connecting to Google Calendar...</Text>
      </Stack>
    );
  }

  return (
    <Stack spacing="lg">
      <Stack spacing="md">
        <Text size="lg" weight="bold">
          Google Calendar Integration
        </Text>
        <Text color="secondary">
          Connect your Google Calendar to automatically check availability and create booking events.
        </Text>
      </Stack>

      <ConnectionStatus $connected={isConnected}>
        <Stack spacing="sm">
          <StatusText $connected={isConnected} weight="bold">
            {isConnected ? '✅ Connected' : '⚠️ Not Connected'}
          </StatusText>
          <Text size="sm" color="secondary">
            {isConnected 
              ? 'Your calendar is connected and ready to use.'
              : 'Connect your Google Calendar to enable availability checking.'
            }
          </Text>
        </Stack>
      </ConnectionStatus>

      {error && (
        <MessageBox $variant="error">
          <Text color="error" weight="bold">
            Error: {error}
          </Text>
        </MessageBox>
      )}

      <Stack spacing="md" align="center">
        {!isConnected ? (
          <Button
            onClick={handleConnect}
            variant="primary"
            size="lg"
            disabled={!authUrl || loading}
            data-testid="connect-calendar-button"
          >
            Connect Google Calendar
          </Button>
        ) : (
          <Button
            onClick={handleDisconnect}
            variant="outline"
            size="md"
            data-testid="disconnect-calendar-button"
          >
            Disconnect Calendar
          </Button>
        )}
      </Stack>

      {isConnected && (
        <MessageBox $variant="info">
          <Stack spacing="sm">
            <Text size="sm" weight="bold" color="primary">
              🎉 Calendar Connected!
            </Text>
            <Text size="sm" color="secondary">
              Your Google Calendar is now integrated. The system will automatically:
            </Text>
            <ul style={{ margin: 0, paddingLeft: '1rem' }}>
              <li>Check availability before allowing bookings</li>
              <li>Create calendar events for confirmed rides</li>
              <li>Add 1-hour buffer times around rides</li>
              <li>Sync with your existing calendar events</li>
            </ul>
          </Stack>
        </MessageBox>
      )}
    </Stack>
  );
};
