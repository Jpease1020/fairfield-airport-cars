'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getBooking } from '@/lib/booking-service';
import { Booking } from '@/types/booking';
import BookingForm from '@/app/book/booking-form';

export default function EditBookingPage() {
  const params = useParams();
  const { id } = params;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchBooking = async () => {
        try {
          const bookingData = await getBooking(id as string);
          if (bookingData) {
            setBooking(bookingData);
          } else {
            setError('Booking not found.');
          }
        } catch (err) {
          setError('Failed to fetch booking details.');
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading booking details...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!booking) {
    return <div className="min-h-screen flex items-center justify-center">No booking found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Edit Your Booking</h1>
        <BookingForm booking={booking} />
      </div>
    </div>
  );
}
