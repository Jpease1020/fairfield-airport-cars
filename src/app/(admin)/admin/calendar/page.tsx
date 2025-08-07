'use client';

import React, { useState } from 'react';
import { 
  Container, 
  Stack, 
  Text, 
  Box,
  H1,
  colors } from '@/ui';
import styled from 'styled-components';

const CalendarHeader = styled.div`
  background-color: ${colors.primary[600]};
  color: white;
  padding: 1rem;
  border-radius: 8px 8px 0 0;
`;

const DayHeader = styled.div`
  background-color: ${colors.primary[600]};
  color: white;
  padding: 0.5rem;
  text-align: center;
  font-weight: bold;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
`;

const CalendarDay = styled.div`
  padding: 0.5rem;
  text-align: center;
`;

function CalendarPageContent() {
  const [selectedDate] = useState<Date>(new Date());
  const [events] = useState<any[]>([]);

  return (
    <Container>
      <Stack spacing="xl">
        <H1>Calendar</H1>
        
        <Box>
          <Stack spacing="lg">
            <CalendarHeader>
              <Text size="lg" weight="bold">Booking Calendar</Text>
            </CalendarHeader>
            
            <CalendarGrid>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <DayHeader key={day}>
                  {day}
                </DayHeader>
              ))}
              
              {/* Calendar days would go here */}
              {Array.from({ length: 35 }, (_, i) => (
                <CalendarDay key={i}>
                  {i + 1}
                </CalendarDay>
              ))}
            </CalendarGrid>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}

const CalendarPage = () => {
  return <CalendarPageContent />;
};

export default CalendarPage;
