'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Container, Stack, Text, Box, Button, LoadingSpinner, Alert } from '@/design/ui';
import { useCMSData } from '@/design/providers/CMSDataProvider';
import { driverSchedulingService } from '@/lib/services/driver-scheduling-service';

const TimeSlotBox = styled(Box)<{ $backgroundColor: string; $color: string; $border: string }>`
  background-color: ${props => props.$backgroundColor};
  color: ${props => props.$color};
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  white-space: pre-line;
  border-radius: 8px;
  border: ${props => props.$border};
`;

const LegendBox = styled(Box)<{ $backgroundColor: string }>`
  width: 20px;
  height: 20px;
  background-color: ${props => props.$backgroundColor};
  border-radius: 4px;
`;

export default function DriverCalendarPage() {
  const { cmsData } = useCMSData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Driver ID (hardcoded for single driver setup) - keep ID consistent with database
  const DRIVER_ID = 'gregg-driver-001';
  const DRIVER_NAME = 'Driver'; // User-facing name is generic

  const loadSchedule = async (date: Date) => {
    try {
      setLoading(true);
      setError(null);
      
      const dateStr = date.toISOString().split('T')[0];
      const driverSchedule = await driverSchedulingService.getDriverSchedule(DRIVER_ID, dateStr);
      
      setSchedule(driverSchedule);
    } catch (err) {
      console.error('Error loading schedule:', err);
      setError('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule(currentDate);
  }, [currentDate]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeSlotColor = (slot: any) => {
    switch (slot.status) {
      case 'booked': return '#ff6b6b'; // Red
      case 'available': return '#51cf66'; // Green
      case 'blocked': return '#ffd43b'; // Yellow
      case 'break': return '#74c0fc'; // Blue
      default: return '#e9ecef'; // Gray
    }
  };

  const getTimeSlotText = (slot: any) => {
    if (slot.status === 'booked') {
      return `${slot.startTime}-${slot.endTime}\n${slot.customerName || 'Customer'}\n${slot.pickupLocation || ''}`;
    }
    return `${slot.startTime}-${slot.endTime}\nAvailable`;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  if (loading) {
    return (
      <Container>
        <Stack spacing="lg" align="center">
          <LoadingSpinner size="lg" />
          <Text>Loading driver schedule...</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="error">
          <Text>{error}</Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Stack spacing="lg">
        {/* Header */}
        <Stack direction="horizontal" justify="space-between" align="center">
          <Text size="xl" weight="bold">
            📅 Driver Schedule - {formatDate(currentDate)}
          </Text>
          <Stack direction="horizontal" spacing="md">
            <Button 
              variant="outline" 
              onClick={() => navigateDate('prev')}
            >
              ← Previous Day
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigateDate('next')}
            >
              Next Day →
            </Button>
          </Stack>
        </Stack>

        {/* Schedule Grid */}
        <Box variant="elevated" padding="lg">
          <Stack spacing="md">
            <Text size="lg" weight="semibold">
              Time Slots
            </Text>
            
            {schedule?.timeSlots?.length > 0 ? (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem' 
              }}>
                {schedule.timeSlots.map((slot: any, index: number) => (
                  <TimeSlotBox
                    key={index}
                    variant="filled"
                    padding="md"
                    $backgroundColor={getTimeSlotColor(slot)}
                    $color={slot.status === 'booked' ? 'white' : 'black'}
                    $border={slot.status === 'booked' ? '2px solid #ff6b6b' : '1px solid #ddd'}
                  >
                    <Text size="sm" weight="medium">
                      {getTimeSlotText(slot)}
                    </Text>
                  </TimeSlotBox>
                ))}
              </div>
            ) : (
              <Alert variant="info">
                <Text>No schedule data available for this date.</Text>
              </Alert>
            )}
          </Stack>
        </Box>

        {/* Legend */}
        <Box variant="outlined" padding="md">
          <Stack spacing="sm">
            <Text weight="semibold">Legend:</Text>
            <Stack direction="horizontal" spacing="lg">
              <Stack direction="horizontal" spacing="sm" align="center">
                <LegendBox $backgroundColor="#ff6b6b">{null}</LegendBox>
                <Text size="sm">Booked</Text>
              </Stack>
              <Stack direction="horizontal" spacing="sm" align="center">
                <LegendBox $backgroundColor="#51cf66">{null}</LegendBox>
                <Text size="sm">Available</Text>
              </Stack>
              <Stack direction="horizontal" spacing="sm" align="center">
                <LegendBox $backgroundColor="#ffd43b">{null}</LegendBox>
                <Text size="sm">Blocked</Text>
              </Stack>
              <Stack direction="horizontal" spacing="sm" align="center">
                <LegendBox $backgroundColor="#74c0fc">{null}</LegendBox>
                <Text size="sm">Break</Text>
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
