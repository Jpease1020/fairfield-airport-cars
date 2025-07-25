'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import withAuth from '../withAuth';
import { listBookings } from '../../../lib/services/booking-service';
import { PageHeader, InfoCard, GridSection } from '@/components/ui';

const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false }) as any;
const dayGridPlugin = dynamic(() => import('@fullcalendar/daygrid') as any, { ssr: false });

const CalendarPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const bookings = await listBookings();
        const ev = bookings.map((b) => ({
          id: b.id,
          title: `${b.name} – $${b.fare}`,
          start: b.pickupDateTime,
          url: `/booking/${b.id}`,
          backgroundColor: b.status === 'cancelled' ? '#fca5a5' : b.status === 'confirmed' ? '#6ee7b7' : '#fcd34d',
        }));
        setEvents(ev);
      } catch (error) {
        console.error('Failed to load bookings:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const headerActions = [
    { 
      label: 'View Bookings List', 
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
    <div className="admin-dashboard">
      <PageHeader
        title="Ride Calendar"
        subtitle="View all bookings in calendar format"
        actions={headerActions}
      />

      <GridSection variant="content" columns={1}>
        <InfoCard
          title="Monthly Booking Calendar"
          description={`Showing ${events.length} bookings this month`}
        >
          {loading ? (
            <div className="loading-spinner py-8">
              <div className="loading-spinner-icon">🔄</div>
              <p>Loading calendar...</p>
            </div>
          ) : (
            <div className="calendar-container">
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
                />
              )}
            </div>
          )}
        </InfoCard>
      </GridSection>
    </div>
  );
};

export default withAuth(CalendarPage); 