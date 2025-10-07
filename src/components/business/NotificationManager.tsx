'use client';

import React, { useState, useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Container, Stack, Button, Text, Badge } from '@/design/ui';

interface NotificationManagerProps {
  showSettings?: boolean;
  onNotificationReceived?: (payload: any) => void;
  cmsData: any;
}

export function NotificationManager({ 
  showSettings = false, 
  onNotificationReceived: onNotificationReceivedProp,
  cmsData
}: NotificationManagerProps) {
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
          <Text variant="h2" cmsId="notification-manager-title">{cmsData?.['notificationManagerTitle'] || 'Push Notifications'}</Text>
          <Badge variant="error" cmsId="ignore">Not Supported</Badge> 
          <Text cmsId="notification-manager-not-supported">
            {cmsData?.['notificationManagerNotSupported'] || 'Push notifications are not supported in your browser. Please use a modern browser like Chrome, Firefox, or Safari.'}
          </Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container>
      <Stack spacing="lg">
        <Stack spacing="md">
          <Text variant="h2" cmsId="notification-manager-title">{cmsData?.['notificationManagerTitle'] || 'Push Notifications'}</Text>
          
          <Stack spacing="sm">
            <Stack direction="horizontal" align="center" spacing="sm">
              <Text cmsId="notification-manager-status">{cmsData?.['notificationManagerStatus'] || 'Status:'}</Text>
              <Badge variant={isEnabled ? "success" : "warning"}>
                {isEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </Stack>

            <Stack direction="horizontal" align="center" spacing="sm">
              <Text cmsId="notification-manager-initialized">{cmsData?.['notificationManagerInitialized'] || 'Initialized:'}</Text>
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
              cmsId="notification-manager-enable-notifications"
              text={isLoading ? cmsData?.['notificationManagerEnabling'] || 'Enabling...' : cmsData?.['notificationManagerEnableNotifications'] || 'Enable Notifications'}
            />
          )}

          {isEnabled && (
            <Button 
              onClick={handleTestNotification}
              disabled={isLoading}
              variant="secondary"
              cmsId="notification-manager-send-test-notification"
              text={isLoading ? cmsData?.['notificationManagerSending'] || 'Sending...' : cmsData?.['notificationManagerSendTestNotification'] || 'Send Test Notification'}
            />
          )}

          {lastNotification && (
            <Stack spacing="sm">
              <Text variant="h3" cmsId="notification-manager-last-notification">{cmsData?.['notificationManagerLastNotification'] || 'Last Notification:'}</Text>
              <Text cmsId="ignore">{lastNotification}</Text>
            </Stack>
          )}
        </Stack>

        {showSettings && userSettings && (
          <Stack spacing="md">
            <Text variant="h3" cmsId="notification-manager-settings-title">{cmsData?.['notificationManagerSettingsTitle'] || 'Notification Settings'}</Text>
            
            <Stack spacing="sm">
              <Stack direction="horizontal" align="center" justify="space-between">
                <Text cmsId="notification-manager-booking-confirmations">{cmsData?.['notificationManagerBookingConfirmations'] || 'Booking Confirmations'}</Text>
                <Button
                  variant={userSettings.bookingConfirmations ? 'success' : 'outline'}
                  size="sm"
                  onClick={() => handleSettingChange('bookingConfirmations', !userSettings.bookingConfirmations)}
                  cmsId="notification-manager-booking-confirmations-button"
                  text={userSettings.bookingConfirmations ? 'On' : 'Off'}
                />
              </Stack>

              <Stack direction="horizontal" align="center" justify="space-between">
                <Text cmsId="notification-manager-driver-updates">{cmsData?.['notificationManagerDriverUpdates'] || 'Driver Updates'}</Text>
                <Button
                  variant={userSettings.driverUpdates ? 'success' : 'outline'}
                  size="sm"
                  onClick={() => handleSettingChange('driverUpdates', !userSettings.driverUpdates)}
                  cmsId="notification-manager-driver-updates-button"
                  text={userSettings.driverUpdates ? 'On' : 'Off'}
                />
                  {userSettings.driverUpdates ? 'On' : 'Off'}
              </Stack>

              <Stack direction="horizontal" align="center" justify="space-between">
                <Text cmsId="notification-manager-flight-updates">{cmsData?.['notificationManagerFlightUpdates'] || 'Flight Updates'}</Text>
                <Button
                  variant={userSettings.flightUpdates ? 'success' : 'outline'}
                  size="sm"
                  onClick={() => handleSettingChange('flightUpdates', !userSettings.flightUpdates)}
                  cmsId="notification-manager-flight-updates-button"
                  text={userSettings.flightUpdates ? 'On' : 'Off'}
                />
              </Stack>

              <Stack direction="horizontal" align="center" justify="space-between">
                <Text cmsId="notification-manager-reminders">{cmsData?.['notificationManagerReminders'] || 'Reminders'}</Text>
                <Button
                  variant={userSettings.reminders ? 'success' : 'outline'}
                  size="sm"
                  onClick={() => handleSettingChange('reminders', !userSettings.reminders)}
                  cmsId="notification-manager-reminders-button"
                  text={userSettings.reminders ? 'On' : 'Off'}
                />
              </Stack>
            </Stack>
          </Stack>
        )}
      </Stack>
    </Container>
  );
} 