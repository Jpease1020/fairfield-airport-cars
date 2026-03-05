// src/components/calendar/AvailabilityChecker.tsx
'use client';

import React, { useState } from 'react';
import { Button, Stack, Text, Box, Input } from '@/design/ui';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import styled from 'styled-components';
import { colors, spacing } from '@/design/system/tokens/tokens';
import { formatDateTimeNoSeconds } from '@/utils/formatting';

const CheckerContainer = styled(Box)`
  padding: ${spacing.lg};
  border: 1px solid ${colors.border.default};
  border-radius: 8px;
  background-color: ${colors.background.secondary};
`;

const InfoBox = styled(Box)`
  padding: ${spacing.md};
  border-radius: 8px;
  background-color: ${colors.primary[50]};
  border: 1px solid ${colors.primary[200]};
`;

const ErrorBox = styled(Box)`
  padding: ${spacing.md};
  border-radius: 8px;
  background-color: ${colors.danger[100]};
  border: 1px solid ${colors.danger[300]};
`;

const TimeSlot = styled(Box)<{ $available: boolean }>`
  padding: ${spacing.sm} ${spacing.md};
  border-radius: 4px;
  background-color: ${({ $available }) => 
    $available ? colors.success[100] : colors.danger[100]};
  border: 1px solid ${({ $available }) => 
    $available ? colors.success[300] : colors.danger[300]};
  margin: ${spacing.xs} 0;
`;

export const AvailabilityChecker: React.FC = () => {
  const {
    isAvailable,
    isConnected,
    tokens,
    checkAvailability,
    getAvailableSlots,
    loading,
    error,
  } = useGoogleCalendar();

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [availability, setAvailability] = useState<any[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  if (!isAvailable) {
    return (
      <InfoBox>
        <Text color="secondary" align="center">
          Google Calendar availability checks are disabled in this environment.
          Enable the integration to use the scheduling tools.
        </Text>
      </InfoBox>
    );
  }

  const handleCheckSpecificTime = async () => {
    if (!selectedDate || !selectedTime || !tokens) return;

    try {
      setCheckingAvailability(true);
      const startTime = new Date(`${selectedDate}T${selectedTime}`);
      const endTime = new Date(startTime.getTime() + parseInt(duration) * 60000);

      const result = await checkAvailability(startTime, endTime, 60);
      setAvailability(result);
    } catch (err) {
      console.error('Error checking availability:', err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleGetAvailableSlots = async () => {
    if (!selectedDate || !tokens) return;

    try {
      setCheckingAvailability(true);
      const date = new Date(selectedDate);
      const result = await getAvailableSlots(date, parseInt(duration), 60);
      setAvailability(result);
    } catch (err) {
      console.error('Error getting available slots:', err);
    } finally {
      setCheckingAvailability(false);
    }
  };

  if (!isConnected || !tokens) {
    return (
      <CheckerContainer>
        <Text color="secondary" align="center">
          Please connect your Google Calendar first to check availability.
        </Text>
      </CheckerContainer>
    );
  }

  return (
    <CheckerContainer>
      <Stack spacing="lg">
        <Stack spacing="md">
          <Text size="lg" weight="bold">
            Availability Checker
          </Text>
          <Text color="secondary">
            Test calendar availability checking functionality.
          </Text>
        </Stack>

        <Stack spacing="md">
          <Stack spacing="sm">
            <Text weight="medium">Select Date</Text>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              placeholder="Select date"
            />
          </Stack>

          <Stack spacing="sm">
            <Text weight="medium">Select Time (optional)</Text>
            <Input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              placeholder="Select time"
            />
          </Stack>

          <Stack spacing="sm">
            <Text weight="medium">Duration (minutes)</Text>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="60"
              min="30"
              max="480"
            />
          </Stack>
        </Stack>

        <Stack spacing="md" align="center">
          <Button
            onClick={handleCheckSpecificTime}
            variant="primary"
            size="md"
            disabled={!selectedDate || !selectedTime || checkingAvailability}
          >
            Check Specific Time
          </Button>

          <Button
            onClick={handleGetAvailableSlots}
            variant="outline"
            size="md"
            disabled={!selectedDate || checkingAvailability}
          >
            Get Available Slots
          </Button>
        </Stack>

        {checkingAvailability && (
          <Text align="center" color="secondary">
            Checking availability...
          </Text>
        )}

        {error && (
          <ErrorBox>
            <Text color="error" weight="bold">
              Error: {error}
            </Text>
          </ErrorBox>
        )}

        {availability.length > 0 && (
          <Stack spacing="md">
            <Text weight="bold">
              Availability Results ({availability.length} slots)
            </Text>
            {availability.map((slot, index) => (
              <TimeSlot key={index} $available={slot.available}>
                <Stack spacing="xs">
                  <Text weight="medium">
                    {slot.available ? '✅ Available' : '❌ Unavailable'}
                  </Text>
                  <Text size="sm">
                    {formatDateTimeNoSeconds(slot.start)} - {formatDateTimeNoSeconds(slot.end)}
                  </Text>
                  {slot.reason && (
                    <Text size="sm" color="secondary">
                      {slot.reason}
                    </Text>
                  )}
                </Stack>
              </TimeSlot>
            ))}
          </Stack>
        )}
      </Stack>
    </CheckerContainer>
  );
};
