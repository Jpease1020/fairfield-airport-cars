'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/types/booking';

export default function ManageBookingPage() {
  const { id } = useParams();
  const router = useRouter();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(
      doc(db, 'bookings', id as string),
      (snap) => {
        if (snap.exists()) {
          setBooking({ id: snap.id, ...snap.data() } as Booking);
        } else {
          setError('Booking not found');
        }
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setError('Failed to load booking');
        setLoading(false);
      }
    );
    return () => unsub();
  }, [id]);

  const handleCancel = async () => {
    if (!booking) return;
    const confirmed = window.confirm('Are you sure you want to cancel this ride? A cancellation fee may apply.');
    if (!confirmed) return;
    try {
      const res = await fetch('/api/cancel-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg('Ride cancelled. You will receive a confirmation shortly.');
      } else {
        setActionMsg(data.error || 'Failed to cancel');
      }
    } catch {
      setActionMsg('Network error');
    }
  };

  const handleResend = async () => {
    if (!booking) return;
    try {
      const res = await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      if (res.ok) setActionMsg('Confirmation sent!');
      else setActionMsg('Failed to send confirmation');
    } catch {
      setActionMsg('Network error');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || !booking) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-4 text-center">Manage Your Booking</h1>
        <p className="text-sm text-gray-600 mb-2">Reference: <span className="font-mono">{booking.id}</span></p>
        <p className="mb-4">Pickup on {new Date(booking.pickupDateTime).toLocaleString()}</p>

        <div className="space-y-3">
          <button
            onClick={handleResend}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
          >
            Re-send Confirmation Email/SMS
          </button>

          {booking.status !== 'cancelled' && (
            <button
              onClick={handleCancel}
              className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
            >
              Cancel Ride
            </button>
          )}

          {booking.balanceDue > 0 && booking.status === 'completed' && (
            <button
              onClick={async () => {
                const res = await fetch('/api/complete-payment', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ bookingId: booking.id })});
                if (res.ok) {
                  const { paymentLinkUrl } = await res.json();
                  window.location.href = paymentLinkUrl;
                } else {
                  setActionMsg('Failed to create balance payment link');
                }
              }}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
              Pay Remaining Balance (${booking.balanceDue.toFixed(2)})
            </button>
          )}
        </div>

        {actionMsg && <p className="mt-4 text-center text-sm text-gray-700">{actionMsg}</p>}

        <button onClick={() => router.push(`/status/${booking.id}`)} className="mt-6 text-indigo-600 underline w-full text-center">
          View Status Page
        </button>
      </div>
    </div>
  );
} 