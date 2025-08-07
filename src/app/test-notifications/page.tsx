'use client';

import React from 'react';
import { NotificationManager } from '@/components/business/NotificationManager';
import { Container, Stack, Text, Button, Badge } from '@/ui';
import { useAuth } from '@/hooks/useAuth';
import { bookingNotificationService } from '@/lib/services/booking-notification-service';

export default function TestNotificationsPage() {
  const { user } = useAuth();
  const [testResults, setTestResults] = React.useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testBookingConfirmation = async () => {
    if (!user?.uid) {
      addTestResult('❌ No user logged in');
      return;
    }

    try {
      await bookingNotificationService.sendBookingConfirmation('test-booking-123', user.uid);
      addTestResult('✅ Booking confirmation sent');
    } catch (error) {
      addTestResult(`❌ Booking confirmation failed: ${error}`);
    }
  };

  const testDriverUpdate = async () => {
    if (!user?.uid) {
      addTestResult('❌ No user logged in');
      return;
    }

    try {
      await bookingNotificationService.sendDriverEnRoute('test-booking-123', user.uid, 'John Smith', 15);
      addTestResult('✅ Driver update sent');
    } catch (error) {
      addTestResult(`❌ Driver update failed: ${error}`);
    }
  };

  const testFlightDelay = async () => {
    if (!user?.uid) {
      addTestResult('❌ No user logged in');
      return;
    }

    try {
      await bookingNotificationService.sendFlightDelay('test-booking-123', user.uid, 'AA123', 30);
      addTestResult('✅ Flight delay notification sent');
    } catch (error) {
      addTestResult(`❌ Flight delay notification failed: ${error}`);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Container>
      <Stack spacing ="lg">
        <Stack spacing="md">
          <Text variant="h2">Push Notification Testing</Text>
          
          {user ? (
            <Badge variant="success">Logged in as: {user.email}</Badge>
          ) : (
            <Badge variant="warning">Not logged in</Badge>
          )}
        </Stack>

        <NotificationManager 
          showSettings={true}
          onNotificationReceived={(payload) => {
            addTestResult(`📱 Notification received: ${payload.notification?.title}`);
          }}
        />

        <Stack spacing="md">
          <Text variant="h3">Test Notifications</Text>
          
          <Stack spacing="sm">
            <Button onClick={testBookingConfirmation} variant="primary">
              Test Booking Confirmation
            </Button>
            
            <Button onClick={testDriverUpdate} variant="secondary">
              Test Driver Update
            </Button>
            
            <Button onClick={testFlightDelay} variant="secondary">
              Test Flight Delay
            </Button>
            
            <Button onClick={clearResults} variant="outline">
              Clear Results
            </Button>
          </Stack>
        </Stack>

        {testResults.length > 0 && (
          <Stack spacing="sm">
            <Text variant="h3">Test Results</Text>
            <Stack spacing="sm">
              {testResults.map((result, index) => (
                <Text key={index} size="sm">
                  {result}
                </Text>
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>
    </Container>
  );
} 