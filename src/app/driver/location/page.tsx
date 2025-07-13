'use client';

import { useEffect, useState, Suspense } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useSearchParams } from 'next/navigation';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Alert } from '@/components/feedback';
import { LoadingSpinner } from '@/components/data';
import { Card, CardContent } from '@/components/ui/card';

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
  }, [allowed]);

  if(!allowed) {
    return (
      <PageContainer>
        <Alert variant="error" title="Unauthorized">
          You are not authorized to access this page.
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="md" padding="lg">
      <PageHeader 
        title="Driver Live Location" 
        subtitle="Sharing your location with passengers"
      />
      <PageContent>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="mb-4 text-gray-700">{status}</p>
            {coords && (
              <p className="text-sm text-gray-500">
                Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
              </p>
            )}
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
}

export default function DriverLocationPage() {
  return (
    <Suspense fallback={
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading..." />
        </div>
      </PageContainer>
    }>
      <DriverLocationContent />
    </Suspense>
  );
} 