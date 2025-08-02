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
  Text,
  ActionButtonGroup,
  useToast
} from '@/ui';
import { EditableText } from '@/ui';

// Simple driver ID constant for single-driver setup
const DRIVER_ID = 'gregg';

function DriverLocationContent() {
  const search = useSearchParams();
  const allowed = search.get('key') === process.env.NEXT_PUBLIC_DRIVER_SECRET;
  const { addToast } = useToast();
  
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
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            <LoadingSpinner />
            <EditableText field="driver.location.loading.message" defaultValue="Please wait while we initialize location services...">
              Please wait while we initialize location services...
            </EditableText>
          </Container>
        </GridSection>
      </Container>
    );
  }

  if(!allowed) {
    return (
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            <Text>
              <EditableText field="driver.location.unauthorized.title" defaultValue="❌ Unauthorized">
                ❌ Unauthorized
              </EditableText>
            </Text>
            <Text>
              <EditableText field="driver.location.unauthorized.description" defaultValue="You are not authorized to access this page.">
                You are not authorized to access this page.
              </EditableText>
            </Text>
            <ActionButtonGroup buttons={[
              {
                id: 'go-back',
                label: 'Go Back',
                onClick: () => window.history.back(),
                variant: 'primary',
                icon: '⬅️'
              },
              {
                id: 'contact-support',
                label: 'Contact Support',
                onClick: () => addToast('info', 'Support: (203) 555-0123'),
                variant: 'outline',
                icon: '📞'
              }
            ]} />
          </Container>
        </GridSection>
      </Container>
    );
  }

  return (
    <Container variant="default" padding="none">
      <GridSection variant="content" columns={1}>
        <Container>
          <Text>
            <EditableText field="driver.location.title" defaultValue="📍 Location Status">
              📍 Location Status
            </EditableText>
          </Text>
          
          <div>
            <Text>
              <EditableText field="driver.location.status.label" defaultValue="Status:">
                Status:
              </EditableText>
              {' '}{status}
            </Text>
            
            {coords && (
              <div>
                <Text>
                  <strong>
                    <EditableText field="driver.location.coordinates.label" defaultValue="Current Coordinates:">
                      Current Coordinates:
                    </EditableText>
                  </strong>
                </Text>
                <Text>
                  <EditableText field="driver.location.coords" defaultValue={`Lat: ${coords.lat.toFixed(5)}, Lng: ${coords.lng.toFixed(5)}`}>
                    Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
                  </EditableText>
                </Text>
              </div>
            )}
          </div>
          
          <ActionButtonGroup buttons={[
            {
              id: 'refresh-location',
              label: 'Refresh Location',
              onClick: () => window.location.reload(),
              variant: 'primary',
              icon: '🔄'
            },
            {
              id: 'stop-sharing',
              label: 'Stop Sharing',
              onClick: () => {
                setStatus('Location sharing stopped');
                addToast('info', 'Location sharing stopped');
              },
              variant: 'outline',
              icon: '⏹️'
            }
          ]} />
        </Container>
      </GridSection>
    </Container>
  );
}

const DriverLocationPage = dynamic(() => Promise.resolve(() => {
  return (
    <Suspense fallback={
      <GridSection variant="content" columns={1}>
        <Container>
          <LoadingSpinner text="Loading..." />
        </Container>
      </GridSection>
    }>
      <DriverLocationContent />
    </Suspense>
  );
}), { ssr: false });

export default DriverLocationPage; 