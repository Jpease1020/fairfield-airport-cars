'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/types/booking';

const SuccessPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(!!bookingId);

  useEffect(() => {
    if (!bookingId) return;

    const docRef = doc(db, 'bookings', bookingId);
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setBooking({ id: snap.id, ...snap.data() } as Booking);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [bookingId]);

  if (!bookingId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 bg-white rounded shadow">
          <h1 className="text-xl font-bold mb-2">Payment Successful</h1>
          <p className="text-gray-700">No booking reference found, but your payment was processed.</p>
        </div>
      </div>
    );
  }

  if (loading || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading your booking...</div>
      </div>
    );
  }

  const statusText = booking.status === 'pending' ? 'Pending Confirmation' : booking.status === 'confirmed' ? 'Confirmed' : booking.status;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-indigo-600 mb-4">Payment Successful!</h1>
        <p className="text-gray-700 mb-6">
          Booking reference <span className="font-mono font-semibold">{bookingId}</span>
        </p>
        <p className="text-lg font-semibold mb-4">Current Status: <span className="capitalize">{statusText}</span></p>
        <button
          onClick={() => router.push(`/status/${bookingId}`)}
          className="mt-4 inline-block bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition"
        >
          View Detailed Status
        </button>
      </div>
    </div>
  );
};

const SuccessPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessPageContent />
    </Suspense>
  );
};

export default SuccessPage;
