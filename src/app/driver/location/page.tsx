'use client';

import { useEffect, useState, Suspense } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/utils/firebase';
import { useSearchParams } from 'next/navigation';
import { 
  GridSection,
  InfoCard,
  LoadingSpinner,
  Container,
  Text,
  EditableText
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
        layoutType="admin"
        title="Driver Live Location"
        subtitle="Unauthorized access"
      >
        <GridSection variant="content" columns={1}>
          <InfoCard title="❌ Unauthorized" description="You are not authorized to access this page">
            <Container>
              <Text>
                <EditableText field="driver.location.unauthorized" defaultValue="You are not authorized to access this page.">
                  You are not authorized to access this page.
                </EditableText>
              </Text>
            </Container>
          </InfoCard>
        </GridSection>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout
      layoutType="admin"
      title="Driver Live Location"
      subtitle="Sharing your location with passengers"
    >
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="📍 Location Status"
          description="Your current location sharing status"
        >
          <Container>
            <Text>
              <EditableText field="driver.location.status" defaultValue={status}>
                {status}
              </EditableText>
            </Text>
            {coords && (
              <Container>
                <Text>
                  <EditableText field="driver.location.coordinates" defaultValue="Current Coordinates:">
                    Current Coordinates:
                  </EditableText>
                </Text>
                <Text>
                  <EditableText field="driver.location.coords" defaultValue={`Lat: ${coords.lat.toFixed(5)}, Lng: ${coords.lng.toFixed(5)}`}>
                    Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
                  </EditableText>
                </Text>
              </Container>
            )}
          </Container>
        </InfoCard>
      </GridSection>
    </UnifiedLayout>
  );
}

export default function DriverLocationPage() {
  return (
    <Suspense fallback={
      <UnifiedLayout
        layoutType="admin"
        title="Driver Live Location"
        subtitle="Loading..."
      >
        <GridSection variant="content" columns={1}>
          <InfoCard title="Loading..." description="Initializing location services">
            <Container>
              <LoadingSpinner text="Loading..." />
            </Container>
          </InfoCard>
        </GridSection>
      </UnifiedLayout>
    }>
      <DriverLocationContent />
    </Suspense>
  );
} 