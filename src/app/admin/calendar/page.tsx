'use client';

import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { listBookings } from '../../../lib/services/booking-service';
import { 
  AdminPageWrapper, 
  GridSection,
  Container,
  Span,
  Stack,
} from '@/components/ui';
import { EditableText } from '@/design/components/core/layout/EditableSystem';
import { EditableHeading } from '@/design/components/core/layout/EditableSystem';
import { Card } from '@/design/components/core/layout/card';

const CalendarPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendarData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('📅 Loading calendar data...');
      
      const bookings = await listBookings();
      const calendarEvents = bookings.map((booking) => ({
        id: booking.id,
        title: `${booking.name} – $${booking.fare}`,
        start: booking.pickupDateTime,
        url: `/booking/${booking.id}`,
        backgroundColor: getEventColor(booking.status),
        borderColor: getEventColor(booking.status),
        textColor: '#ffffff'
      }));
      
      console.log('✅ Calendar events loaded:', calendarEvents.length);
      setEvents(calendarEvents);
    } catch (err) {
      console.error('❌ Failed to load calendar data:', err);
      setError('Failed to load calendar data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const getEventColor = (status: string) => {
    switch (status) {
      case 'cancelled': return '#dc2626';
      case 'confirmed': return '#059669';
      case 'completed': return '#0d9488';
      case 'pending': return '#d97706';
      default: return '#6b7280';
    }
  };

  return (
    <AdminPageWrapper
      title="Ride Calendar"
      subtitle="View all bookings in calendar format"
      loading={loading}
      error={error}
      loadingMessage="Loading calendar data..."
      errorTitle="Calendar Load Error"
    >
      <GridSection variant="content" columns={1}>
        <Card
          title="📅 Monthly Booking Calendar"
          description={`Showing ${events.length} bookings with color-coded status`}
        >
          {!loading && !error && (
            <Container>
              {typeof window !== 'undefined' && (
                <FullCalendar
                  plugins={[dayGridPlugin]}
                  initialView="dayGridMonth"
                  events={events}
                  height="auto"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,dayGridWeek'
                  }}
                  eventClick={(info: any) => {
                    if (info.event.url) {
                      window.open(info.event.url, '_blank');
                      info.jsEvent.preventDefault();
                    }
                  }}
                  eventDisplay="block"
                  dayMaxEvents={3}
                  moreLinkClick="popover"
                />
              )}
            </Container>
          )}

          {!loading && !error && events.length === 0 && (
            <Container>
              <Span>📅</Span>
              <EditableHeading field="admin.calendar.noBookings.title" defaultValue="No bookings found">
                No bookings found
              </EditableHeading>
              <EditableText field="admin.calendar.noBookings" defaultValue="No bookings scheduled for this month.">
                No bookings scheduled for this month.
              </EditableText>
            </Container>
          )}
        </Card>
      </GridSection>

      {/* Calendar Legend */}
      <GridSection variant="content" columns={1}>
        <Card
          title="📊 Status Legend"
          description="Color coding for booking statuses"
        >
          <Container>
            <Stack direction="horizontal" spacing="sm" align="center">
              <Span>🟡</Span>
              <Span>
                <EditableText field="admin.calendar.legend.pending" defaultValue="Pending">
                  Pending
                </EditableText>
              </Span>
            </Stack>
            <Stack direction="horizontal" spacing="sm" align="center">
              <Span>🟢</Span>
              <Span>
                <EditableText field="admin.calendar.legend.confirmed" defaultValue="Confirmed">
                  Confirmed
                </EditableText>
              </Span>
            </Stack>
            <Stack direction="horizontal" spacing="sm" align="center">
              <Span>🔵</Span>
              <Span>
                <EditableText field="admin.calendar.legend.completed" defaultValue="Completed">
                  Completed
                </EditableText>
              </Span>
            </Stack>
            <Stack direction="horizontal" spacing="sm" align="center">
              <Span>🔴</Span>
              <Span>
                <EditableText field="admin.calendar.legend.cancelled" defaultValue="Cancelled">
                  Cancelled
                </EditableText>
              </Span>
            </Stack>
          </Container>
        </Card>
      </GridSection>
    </AdminPageWrapper>
  );
};

export default CalendarPage;
