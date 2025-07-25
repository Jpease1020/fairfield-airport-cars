'use client';

import { useEffect, useState, Suspense } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/utils/firebase';
import { useSearchParams } from 'next/navigation';
import { PageHeader, InfoCard } from '@/components/ui';
import { Alert } from '@/components/feedback';
import { LoadingSpinner } from '@/components/data';

// Simple driver ID constant for single-driver setup
const DRIVER_ID = 'gregg';

function DriverLocationContent() {
  const search = useSearchParams();
  const allowed = search.get('key') === process.env.NEXT_PUBLIC_DRIVER_SECRET;
  
  const [status, setStatus] = useState('Requesting location permission…');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!allowed) return;
    
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
        } catch {
          setStatus('Error updating location');
        }
      },
      (err) => {
        setStatus(err.message);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [allowed]);

  if(!allowed) {
    return (
      <div className="admin-dashboard">
        <PageHeader
          title="Driver Live Location"
          subtitle="Unauthorized access"
        />
        <Alert variant="error" title="Unauthorized">
          You are not authorized to access this page.
        </Alert>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <PageHeader 
        title="Driver Live Location" 
        subtitle="Sharing your location with passengers"
      />
      
      <div className="standard-content max-w-2xl mx-auto">
        <InfoCard
          title="📍 Location Status"
          description="Your current location sharing status"
        >
          <div className="text-center p-6">
            <p className="mb-4 text-gray-700 text-lg">{status}</p>
            {coords && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Current Coordinates:</p>
                <p className="font-mono text-sm">
                  Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
                </p>
              </div>
            )}
          </div>
        </InfoCard>
      </div>
    </div>
  );
}

export default function DriverLocationPage() {
  return (
    <Suspense fallback={
      <div className="admin-dashboard">
        <PageHeader
          title="Driver Live Location"
          subtitle="Loading..."
        />
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading..." />
        </div>
      </div>
    }>
      <DriverLocationContent />
    </Suspense>
  );
} 