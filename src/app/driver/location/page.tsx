'use client';

import { useEffect, useState, Suspense } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/utils/firebase';
import { useSearchParams } from 'next/navigation';
import { 
  GridSection,
  InfoCard,
  StatusMessage,
  LoadingSpinner
} from '@/components/ui';
import { UnifiedLayout } from '@/components/layout';

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
      <UnifiedLayout
        layoutType="standard"
        title="Driver Live Location"
        subtitle="Unauthorized access"
      >
        <GridSection variant="content" columns={1}>
          <InfoCard title="❌ Unauthorized" description="You are not authorized to access this page">
            <div className="driver-location-unauthorized">
              <p className="driver-location-unauthorized-text">
                You are not authorized to access this page.
              </p>
            </div>
          </InfoCard>
        </GridSection>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout
      layoutType="standard"
      title="Driver Live Location"
      subtitle="Sharing your location with passengers"
    >
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="📍 Location Status"
          description="Your current location sharing status"
        >
          <div className="driver-location-status">
            <p className="driver-location-status-text">{status}</p>
            {coords && (
              <div className="driver-location-coordinates">
                <p className="driver-location-coordinates-label">Current Coordinates:</p>
                <p className="driver-location-coordinates-value">
                  Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
                </p>
              </div>
            )}
          </div>
        </InfoCard>
      </GridSection>
    </UnifiedLayout>
  );
}

export default function DriverLocationPage() {
  return (
    <Suspense fallback={
      <UnifiedLayout
        layoutType="standard"
        title="Driver Live Location"
        subtitle="Loading..."
      >
        <GridSection variant="content" columns={1}>
          <InfoCard title="Loading..." description="Initializing location services">
            <div className="driver-location-loading">
              <LoadingSpinner text="Loading..." />
            </div>
          </InfoCard>
        </GridSection>
      </UnifiedLayout>
    }>
      <DriverLocationContent />
    </Suspense>
  );
} 