'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { listBookings } from '../../../lib/services/booking-service';
import { 
  AdminPageWrapper, 
  InfoCard, 
  GridSection,
  Container,
  H3,
  Text,
  Span
} from '@/components/ui';

const FullCalendar = dynamic(() => import('@fullcalendar/react') as any, { ssr: false });
const dayGridPlugin = dynamic(() => import('@fullcalendar/daygrid') as any, { ssr: false });

const CalendarPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
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
  };

  const getEventColor = (status: string) => {
    switch (status) {
      case 'cancelled': return '#dc2626';
      case 'confirmed': return '#059669';
      case 'completed': return '#0d9488';
      case 'pending': return '#d97706';
      default: return '#6b7280';
    }
  };

  const headerActions = [
    { 
      label: 'Refresh',
      onClick: fetchCalendarData,
      variant: 'outline' as const,
      disabled: loading
    },
    { 
      label: 'View Bookings', 
      href: '/admin/bookings', 
      variant: 'outline' as const 
    },
    { 
      label: 'Add Booking', 
      href: '/admin/bookings/new', 
      variant: 'primary' as const 
    }
  ];

  return (
    <AdminPageWrapper
      title="Ride Calendar"
      subtitle="View all bookings in calendar format"
      actions={headerActions}
      loading={loading}
      error={error}
      loadingMessage="Loading calendar data..."
      errorTitle="Calendar Load Error"
    >
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="📅 Monthly Booking Calendar"
          description={`Showing ${events.length} bookings with color-coded status`}
        >
          {!loading && !error && (
            <Container className="calendar-container">
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
            <Container className="calendar-empty-state">
              <Container className="calendar-empty-icon">📅</Container>
              <H3 className="calendar-empty-title">No bookings found</H3>
              <Text>No bookings scheduled for this month.</Text>
            </Container>
          )}
        </InfoCard>
      </GridSection>

      {/* Calendar Legend */}
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="📊 Status Legend"
          description="Color coding for booking statuses"
        >
          <Container className="calendar-legend">
            <Container className="calendar-legend-item">
              <Container className="calendar-legend-color calendar-legend-color-pending"></Container>
              <Span className="calendar-legend-text">Pending</Span>
            </Container>
            <Container className="calendar-legend-item">
              <Container className="calendar-legend-color calendar-legend-color-confirmed"></Container>
              <Span className="calendar-legend-text">Confirmed</Span>
            </Container>
            <Container className="calendar-legend-item">
              <Container className="calendar-legend-color calendar-legend-color-completed"></Container>
              <Span className="calendar-legend-text">Completed</Span>
            </Container>
            <Container className="calendar-legend-item">
              <Container className="calendar-legend-color calendar-legend-color-cancelled"></Container>
              <Span className="calendar-legend-text">Cancelled</Span>
            </Container>
          </Container>
        </InfoCard>
      </GridSection>
    </AdminPageWrapper>
  );
};

export default CalendarPage;
