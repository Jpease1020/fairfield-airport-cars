'use client';

import React, { useState, useEffect } from 'react';
import { Container, Stack, Box, Button, Text, H2, StatusMessage, Select, Input } from '@/ui';
import { driverSchedulingService, DriverSchedule, TimeSlot } from '@/lib/services/driver-scheduling-service';

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState<DriverSchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedDriver, setSelectedDriver] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Single driver setup - Gregg
  const drivers = [
    { id: 'gregg-driver-001', name: 'Gregg' }
  ];

  const fetchSchedules = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 7); // Show next 7 days
      
      const schedules = await driverSchedulingService.getDriverSchedulesForDateRange(
        selectedDate,
        endDate.toISOString().split('T')[0]
      );
      
      setSchedules(schedules);
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('Failed to fetch schedules');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [selectedDate]);

  const getStatusColor = (status: TimeSlot['status']) => {
    switch (status) {
      case 'available': return 'var(--color-green-500)';
      case 'booked': return 'var(--color-red-500)';
      case 'blocked': return 'var(--color-gray-500)';
      case 'break': return 'var(--color-yellow-500)';
      default: return 'var(--color-gray-300)';
    }
  };

  const getStatusText = (status: TimeSlot['status']) => {
    switch (status) {
      case 'available': return 'Available';
      case 'booked': return 'Booked';
      case 'blocked': return 'Blocked';
      case 'break': return 'Break';
      default: return 'Unknown';
    }
  };

  const filteredSchedules = selectedDriver === 'all' 
    ? schedules 
    : schedules.filter(schedule => schedule.driverId === selectedDriver);

  return (
    <Container maxWidth="7xl" padding="xl">
      <Stack spacing="lg">
        <Box variant="elevated" padding="lg">
          <H2>Gregg's Schedule</H2>
          <Text color="secondary">
            Manage Gregg's schedule and prevent double bookings
          </Text>
        </Box>

        {/* Filters */}
        <Box variant="elevated" padding="lg">
          <Stack direction="horizontal" spacing="md" align="center">
            <Box>
              <Text weight="medium" marginBottom="sm">Date Range:</Text>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </Box>
            
            <Box>
              <Text weight="medium" marginBottom="sm">Driver:</Text>
              <Select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                options={[
                  { value: 'all', label: 'All Drivers' },
                  ...drivers.map(driver => ({ value: driver.id, label: driver.name }))
                ]}
              >
                <option value="all">All Drivers</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </Select>
            </Box>
            
            <Button
              onClick={fetchSchedules}
              disabled={isLoading}
              variant="primary"
              text={isLoading ? 'Loading...' : 'Refresh'}
            />
          </Stack>
        </Box>

        {error && (
          <StatusMessage
            type="error"
            message={error}
          />
        )}

        {/* Schedule Grid */}
        {filteredSchedules.length === 0 ? (
          <Box variant="elevated" padding="lg">
            <Text align="center" color="secondary">
              No schedules found for the selected criteria
            </Text>
          </Box>
        ) : (
          <Stack spacing="md">
            {filteredSchedules.map(schedule => (
              <Box key={schedule.id} variant="elevated" padding="lg">
                <Stack spacing="md">
                  <Box>
                    <Text weight="bold" size="lg">
                      {schedule.driverName} - {schedule.date}
                    </Text>
                  </Box>
                  
                  <Box>
                    <Text weight="medium" marginBottom="sm">Time Slots:</Text>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                      gap: '8px' 
                    }}>
                      {schedule.timeSlots.map(slot => (
                        <Box
                          key={slot.id}
                          padding="sm"
                          variant={slot.status === 'booked' ? "outlined" : "elevated"}
                        >
                          <Text weight="medium" size="sm">
                            {slot.startTime} - {slot.endTime}
                          </Text>
                          <Text size="xs">
                            {getStatusText(slot.status)}
                          </Text>
                          {slot.status === 'booked' && slot.customerName && (
                            <Text size="xs">
                              {slot.customerName}
                            </Text>
                          )}
                        </Box>
                      ))}
                    </div>
                  </Box>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}

        {/* Summary Stats */}
        {filteredSchedules.length > 0 && (
          <Box variant="elevated" padding="lg">
            <Text weight="bold" marginBottom="md">Summary</Text>
            <Stack direction="horizontal" spacing="lg">
              <Box>
                <Text weight="medium">Total Drivers: {filteredSchedules.length}</Text>
              </Box>
              <Box>
                <Text weight="medium">
                  Total Booked Slots: {
                    filteredSchedules.reduce((total, schedule) => 
                      total + schedule.timeSlots.filter(slot => slot.status === 'booked').length, 0
                    )
                  }
                </Text>
              </Box>
              <Box>
                <Text weight="medium">
                  Available Slots: {
                    filteredSchedules.reduce((total, schedule) => 
                      total + schedule.timeSlots.filter(slot => slot.status === 'available').length, 0
                    )
                  }
                </Text>
              </Box>
            </Stack>
          </Box>
        )}
      </Stack>
    </Container>
  );
}
