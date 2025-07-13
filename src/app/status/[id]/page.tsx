'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc as fsDoc, onSnapshot as fsSnap } from 'firebase/firestore';
import { doc as fsDocDriver } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/types/booking';

// Helper to determine the progress percentage for the UI
const getStatusStep = (status: Booking['status']) => {
  switch (status) {
    case 'pending':
      return 0;
    case 'confirmed':
      return 1;
    case 'completed': // We can add more statuses like 'On The Way' later
      return 2;
    case 'cancelled':
      return -1; // Special case for cancelled
    default:
      return 0;
  }
};

const statusDescriptions = {
  pending: "We've received your booking and will confirm it shortly.",
  confirmed: "Your ride is confirmed! We'll notify you when your driver is on the way.",
  completed: 'Your ride is complete. Thank you for choosing us!',
  cancelled: 'This booking has been cancelled.',
};

export default function RideStatusPage() {
  const params = useParams();
  const { id } = params;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverLoc, setDriverLoc] = useState<{ lat:number; lng:number; updatedAt: Date } | null>(null);

  useEffect(() => {
    if (!id) return;

    const docRef = fsDoc(db, 'bookings', id as string);
    
    const unsubscribe = fsSnap(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setBooking({ id: docSnap.id, ...docSnap.data() } as Booking);
      } else {
        setError('Booking not found.');
      }
      setLoading(false);
    }, (err) => {
      console.error("Failed to listen for booking updates:", err);
      setError('Failed to load booking status.');
      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    const driverDoc = fsDocDriver(db, 'drivers', 'gregg');
    const unsubDriver = fsSnap(driverDoc, (snap)=>{
      if(snap.exists()){
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = snap.data() as any;
        if(d.lat && d.lng && d.updatedAt){
          setDriverLoc({ lat:d.lat, lng:d.lng, updatedAt: d.updatedAt.toDate() });
        }
      }
    });
    return () => unsubDriver();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading ride status...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!booking) {
    return <div className="min-h-screen flex items-center justify-center">No booking found.</div>;
  }

  const step = getStatusStep(booking.status);
  const isDriverFresh = driverLoc && (Date.now() - driverLoc.updatedAt.getTime() < 2*60*1000);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-2">Your Ride Status</h1>
        <p className="text-center text-gray-600 mb-8">
          {new Date(booking.pickupDateTime).toLocaleString()}
        </p>

        {booking.status === 'cancelled' ? (
          <div className="text-center text-red-500 font-bold text-xl p-4 border-2 border-red-200 rounded-md">
            {statusDescriptions.cancelled}
          </div>
        ) : (
          <div className="relative">
            {/* Progress Bar */}
            <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 transform -translate-y-1/2">
              <div 
                className="absolute left-0 h-1 bg-indigo-600 transition-all duration-500"
                style={{ width: `${(step / 2) * 100}%` }}
              ></div>
            </div>
            
            {/* Status Steps */}
            <div className="relative flex justify-between">
              <div className="text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${step >= 0 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>1</div>
                <p className="mt-2 text-sm">Pending</p>
              </div>
              <div className="text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>2</div>
                <p className="mt-2 text-sm">Confirmed</p>
              </div>
              <div className="text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>3</div>
                <p className="mt-2 text-sm">Completed</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center p-4 bg-gray-50 rounded-md">
          <p className="font-semibold text-lg capitalize">{booking.status}</p>
          <p className="text-gray-700">{statusDescriptions[booking.status]}</p>
        </div>
        {isDriverFresh && (
  <div className="mt-6">
    <h2 className="text-lg font-medium mb-2 text-center">Live Driver Location</h2>
    <iframe
      title="Driver live location map"
      width="100%"
      height="300"
      style={{ border: 0 }}
      loading="lazy"
      allowFullScreen
      src={`https://maps.google.com/maps?q=${driverLoc!.lat},${driverLoc!.lng}&z=15&output=embed`}
    ></iframe>
  </div>
)}
      </div>
    </div>
  );
}
