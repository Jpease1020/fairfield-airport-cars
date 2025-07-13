'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBooking, deleteBooking } from '@/lib/booking-service';
import { Booking } from '@/types/booking';

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
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
        } catch {
          setError('Failed to fetch booking details.');
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [id]);

  const handleCancelBooking = async () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await deleteBooking(id as string);
        alert('Booking cancelled successfully.');
        router.push('/');
      } catch {
        setError('Failed to cancel booking.');
      }
    }
  };

  const handlePayment = async () => {
    if (!booking) return;

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: Math.ceil((booking.depositAmount ?? booking.fare / 2) * 100),
          currency: 'USD',
          description: `Deposit for ride from ${booking.pickupLocation} to ${booking.dropoffLocation}`,
        }),
      });

      if (response.ok) {
        const { paymentLinkUrl } = await response.json();
        window.location.href = paymentLinkUrl;
      } else {
        setError('Failed to create payment link.');
      }
    } catch {
      setError('Failed to initiate payment.');
    }
  };

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
        <h1 className="text-2xl font-bold text-center mb-4 text-green-600">Booking Confirmed!</h1>
        <p className="text-center mb-6">Your ride is booked. Here are the details:</p>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Ride Details</h3>
            <p><strong>From:</strong> {booking.pickupLocation}</p>
            <p><strong>To:</strong> {booking.dropoffLocation}</p>
            <p><strong>Date & Time:</strong> {new Date(booking.pickupDateTime).toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium">Your Information</h3>
            <p><strong>Name:</strong> {booking.name}</p>
            <p><strong>Email:</strong> {booking.email}</p>
            <p><strong>Phone:</strong> {booking.phone}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium">Next Steps</h3>
            <p>You will receive an SMS confirmation shortly. We will contact you if there are any issues.</p>
            <div className="mt-6 flex flex-col space-y-2">
              <button
                onClick={handlePayment}
                className="w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Pay Deposit (${(booking.depositAmount ?? booking.fare / 2).toFixed(2)})
              </button>
              <a
                href={`/booking/${booking.id}/edit`}
                className="w-full text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Edit Booking
              </a>
              <button
                onClick={handleCancelBooking}
                className="w-full text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
