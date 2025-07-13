'use client';

import { useEffect, useState, Suspense } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSearchParams } from 'next/navigation';

// Simple driver ID constant for single-driver setup
const DRIVER_ID = 'gregg';

function DriverLocationContent() {
  const search= useSearchParams();
  const allowed = search.get('key') === process.env.NEXT_PUBLIC_DRIVER_SECRET;
  
  const [status, setStatus] = useState('Requesting location permission…');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  if(!allowed) return <div className="min-h-screen flex items-center justify-center">Unauthorized</div>;

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setStatus('Geolocation is not supported by this browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        setStatus('Sharing live location…');
        try {
          await setDoc(
            doc(db, 'drivers', DRIVER_ID),
            { lat, lng, updatedAt: serverTimestamp() },
            { merge: true }
          );
        } catch (err) {
          console.error('Failed to write location', err);
          setStatus('Error updating location');
        }
      },
      (err) => {
        console.error(err);
        setStatus(err.message);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Driver Live Location</h1>
      <p className="mb-4 text-gray-700">{status}</p>
      {coords && (
        <p className="text-sm text-gray-500">
          Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
        </p>
      )}
    </div>
  );
}

export default function DriverLocationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DriverLocationContent />
    </Suspense>
  );
} 