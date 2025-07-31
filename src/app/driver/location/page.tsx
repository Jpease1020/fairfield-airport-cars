'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, Suspense } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/utils/firebase';
import { useSearchParams } from 'next/navigation';
import { 
  GridSection,
  LoadingSpinner,
  Container,
  Text
} from '@/ui';
import { ContentBox } from '@/ui';
import { Stack } from '@/ui';
import { EditableText } from '@/ui';
import { Layout } from '@/ui';

// Simple driver ID constant for single-driver setup
const DRIVER_ID = 'gregg';

function DriverLocationContent() {
  const search = useSearchParams();
  const allowed = search.get('key') === process.env.NEXT_PUBLIC_DRIVER_SECRET;
  
  const [status, setStatus] = useState('Requesting location permission…');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!allowed) return;
    
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
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

  if(!isClient) {
    return (
      <Layout>
        <GridSection variant="content" columns={1}>
          <ContentBox variant="elevated" padding="lg">
            <Stack spacing="md">
              <Text size="lg" weight="bold">Loading...</Text>
              <Text>Initializing location services</Text>
              <Container>
                <LoadingSpinner text="Loading..." />
              </Container>
            </Stack>
          </ContentBox>
        </GridSection>
      </Layout>
    );
  }

  if(!allowed) {
    return (
      <Layout>
        <GridSection variant="content" columns={1}>
          <ContentBox variant="elevated" padding="lg">
            <Stack spacing="md">
              <Text size="lg" weight="bold">❌ Unauthorized</Text>
              <Text>You are not authorized to access this page</Text>
              <Container>
                <Text>
                  <EditableText field="driver.location.unauthorized" defaultValue="You are not authorized to access this page.">
                    You are not authorized to access this page.
                  </EditableText>
                </Text>
              </Container>
            </Stack>
          </ContentBox>
        </GridSection>
      </Layout>
    );
  }

  return (
    <Layout>
      <GridSection variant="content" columns={1}>
        <ContentBox variant="elevated" padding="lg">
          <Stack spacing="md">
            <Text size="lg" weight="bold">📍 Location Status</Text>
            <Text>Your current location sharing status</Text>
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
          </Stack>
        </ContentBox>
      </GridSection>
    </Layout>
  );
}

const DriverLocationPage = dynamic(() => Promise.resolve(() => {
  return (
    <Suspense fallback={
      <Layout>
        <GridSection variant="content" columns={1}>
          <ContentBox variant="elevated" padding="lg">
            <Stack spacing="md">
              <Text size="lg" weight="bold">Loading...</Text>
              <Text>Initializing location services</Text>
              <Container>
                <LoadingSpinner text="Loading..." />
              </Container>
            </Stack>
          </ContentBox>
        </GridSection>
      </Layout>
    }>
      <DriverLocationContent />
    </Suspense>
  );
}), { ssr: false });

export default DriverLocationPage; 