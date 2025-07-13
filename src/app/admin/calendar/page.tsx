'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import withAuth from '../withAuth';
import { listBookings } from '../../../lib/booking-service';
// Booking type not needed directly here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false }) as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dayGridPlugin = dynamic(() => import('@fullcalendar/daygrid') as any, { ssr: false });

const CalendarPage = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    <div className="min-h-screen p-4 bg-background">
      <h1 className="text-2xl font-bold mb-4">Ride Calendar</h1>
      {typeof window !== 'undefined' && (
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
        />
      )}
    </div>
  );
};

export default withAuth(CalendarPage); 