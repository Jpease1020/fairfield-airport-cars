'use client';

import React, { useState, useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/hooks/useAuth';
import { Container, Stack, Button, Text, Badge } from '@/ui';

interface NotificationManagerProps {
  showSettings?: boolean;
  onNotificationReceived?: (payload: any) => void;
}

export function NotificationManager({ 
  showSettings = false, 
  onNotificationReceived: onNotificationReceivedProp 
}: NotificationManagerProps) {
  const { user } = useAuth();
  const {
    isSupported,
    isInitialized,
    isEnabled,
    userSettings,
    initialize,
    requestPermission,
    sendTestNotification,
    updateSettings,
    onNotificationReceived,
    removeNotificationHandler
  } = usePushNotifications();

  const [isLoading, setIsLoading] = useState(false);
  const [lastNotification, setLastNotification] = useState<string | null>(null);

  // Handle notification received
  useEffect(() => {
    if (onNotificationReceivedProp) {
      const handler = (payload: any) => {
        setLastNotification(`${payload.notification?.title}: ${payload.notification?.body}`);
        onNotificationReceivedProp(payload);
      };

      onNotificationReceived(handler);
      return () => removeNotificationHandler(handler);
    }
  }, [onNotificationReceived, removeNotificationHandler]);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        await initialize();
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setIsLoading(true);
    try {
      await sendTestNotification();
    } catch (error) {
      console.error('Failed to send test notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = async (setting: string, value: boolean) => {
    if (!userSettings) return;

    const newSettings = {
      ...userSettings,
      [setting]: value
    };

    await updateSettings(newSettings);
  };

  if (!isSupported) {
    return (
      <Container>
        <Stack spacing="md">
          <Text variant="h2">Push Notifications</Text>
          <Badge variant="error">Not Supported</Badge>
          <Text>
            Push notifications are not supported in your browser. 
            Please use a modern browser like Chrome, Firefox, or Safari.
          </Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container>
      <Stack spacing="lg">
        <Stack spacing="md">
          <Text variant="h2">Push Notifications</Text>
          
          <Stack spacing="sm">
            <Stack direction="horizontal" align="center" spacing="sm">
              <Text>Status:</Text>
              <Badge variant={isEnabled ? "success" : "warning"}>
                {isEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </Stack>

            <Stack direction="horizontal" align="center" spacing="sm">
              <Text>Initialized:</Text>
              <Badge variant={isInitialized ? "success" : "warning"}>
                {isInitialized ? "Yes" : "No"}
              </Badge>
            </Stack>
          </Stack>

          {!isEnabled && (
            <Button 
              onClick={handleEnableNotifications}
              disabled={isLoading}
              variant="primary"
            >
              {isLoading ? "Enabling..." : "Enable Notifications"}
            </Button>
          )}

          {isEnabled && (
            <Button 
              onClick={handleTestNotification}
              disabled={isLoading}
              variant="secondary"
            >
              {isLoading ? "Sending..." : "Send Test Notification"}
            </Button>
          )}

          {lastNotification && (
            <Stack spacing="sm">
              <Text variant="h3">Last Notification:</Text>
              <Text>{lastNotification}</Text>
            </Stack>
          )}
        </Stack>

        {showSettings && userSettings && (
          <Stack spacing="md">
            <Text variant="h3">Notification Settings</Text>
            
            <Stack spacing="sm">
              <Stack direction="horizontal" align="center" justify="space-between">
                <Text>Booking Confirmations</Text>
                <Button
                  variant={userSettings.bookingConfirmations ? 'success' : 'outline'}
                  size="sm"
                  onClick={() => handleSettingChange('bookingConfirmations', !userSettings.bookingConfirmations)}
                >
                  {userSettings.bookingConfirmations ? 'On' : 'Off'}
                </Button>
              </Stack>

              <Stack direction="horizontal" align="center" justify="space-between">
                <Text>Driver Updates</Text>
                <Button
                  variant={userSettings.driverUpdates ? 'success' : 'outline'}
                  size="sm"
                  onClick={() => handleSettingChange('driverUpdates', !userSettings.driverUpdates)}
                >
                  {userSettings.driverUpdates ? 'On' : 'Off'}
                </Button>
              </Stack>

              <Stack direction="horizontal" align="center" justify="space-between">
                <Text>Flight Updates</Text>
                <Button
                  variant={userSettings.flightUpdates ? 'success' : 'outline'}
                  size="sm"
                  onClick={() => handleSettingChange('flightUpdates', !userSettings.flightUpdates)}
                >
                  {userSettings.flightUpdates ? 'On' : 'Off'}
                </Button>
              </Stack>

              <Stack direction="horizontal" align="center" justify="space-between">
                <Text>Reminders</Text>
                <Button
                  variant={userSettings.reminders ? 'success' : 'outline'}
                  size="sm"
                  onClick={() => handleSettingChange('reminders', !userSettings.reminders)}
                >
                  {userSettings.reminders ? 'On' : 'Off'}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        )}
      </Stack>
    </Container>
  );
} 