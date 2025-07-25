'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import withAuth from '../withAuth';
import { listBookings } from '../../../lib/services/booking-service';

const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false }) as any;
const dayGridPlugin = dynamic(() => import('@fullcalendar/daygrid') as any, { ssr: false });

const CalendarPage = () => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const bookings = await listBookings();
      const ev = bookings.map((b) => ({
        id: b.id,
        title: `${b.name} – $${b.fare}`,
        start: b.pickupDateTime,
        url: `/booking/${b.id}`,
        backgroundColor: b.status === 'cancelled' ? '#fca5a5' : b.status === 'confirmed' ? '#6ee7b7' : '#fcd34d',
      }));
      setEvents(ev);
    })();
  }, []);

  return (
    <div className="admin-dashboard">
      <div className="section-header">
        <h1 className="page-title">Ride Calendar</h1>
        <p className="page-subtitle">View all bookings in calendar format</p>
      </div>

      <div className="standard-content">
        <div className="card">
          <div className="card-body">
            {typeof window !== 'undefined' && (
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                events={events}
                height="auto"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(CalendarPage); 