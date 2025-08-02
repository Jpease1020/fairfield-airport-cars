'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, Suspense } from 'react';
import { realTimeTrackingService } from '@/lib/services/real-time-tracking-service';
import { useSearchParams } from 'next/navigation';
import { 
  GridSection,
  LoadingSpinner,
  Container,
  Text,
  ActionButtonGroup,
  useToast,
  Stack,
  Box,
  Badge
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
          await realTimeTrackingService.startDriverLocationTracking(DRIVER_ID);
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
            <Stack direction="vertical" spacing="lg" align="center">
              <LoadingSpinner />
              <EditableText field="driver.location.loading.message" defaultValue="Please wait while we initialize location services...">
                Please wait while we initialize location services...
              </EditableText>
            </Stack>
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
            <Stack direction="vertical" spacing="lg" align="center">
              <Text variant="lead" weight="bold" color="error">
                <EditableText field="driver.location.unauthorized.title" defaultValue="❌ Unauthorized">
                  ❌ Unauthorized
                </EditableText>
              </Text>
              <Text variant="body" color="muted" align="center">
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
            </Stack>
          </Container>
        </GridSection>
      </Container>
    );
  }

  return (
    <Container variant="default" padding="none">
      <GridSection variant="content" columns={1}>
        <Container>
          <Stack direction="vertical" spacing="lg">
            <Stack direction="vertical" spacing="md" align="center">
              <Text variant="lead" weight="bold">
                <EditableText field="driver.location.title" defaultValue="📍 Location Status">
                  📍 Location Status
                </EditableText>
              </Text>
              
              <Box variant="outlined" padding="md" rounded="md">
                <Stack direction="vertical" spacing="sm">
                  <Stack direction="horizontal" spacing="sm" align="center">
                    <Badge variant="info">
                      <EditableText field="driver.location.status.label" defaultValue="Status:">
                        Status:
                      </EditableText>
                    </Badge>
                    <Text variant="body">{status}</Text>
                  </Stack>
                  
                  {coords && (
                    <Stack direction="vertical" spacing="xs">
                      <Text variant="small" weight="medium">
                        <EditableText field="driver.location.coordinates.label" defaultValue="Current Coordinates:">
                          Current Coordinates:
                        </EditableText>
                      </Text>
                      <Text variant="body" fontFamily="mono">
                        <EditableText field="driver.location.coords" defaultValue={`Lat: ${coords.lat.toFixed(5)}, Lng: ${coords.lng.toFixed(5)}`}>
                          Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
                        </EditableText>
                      </Text>
                    </Stack>
                  )}
                </Stack>
              </Box>
            </Stack>
            
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
          </Stack>
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
          <Stack direction="vertical" spacing="lg" align="center">
            <LoadingSpinner text="Loading..." />
          </Stack>
        </Container>
      </GridSection>
    }>
      <DriverLocationContent />
    </Suspense>
  );
}), { ssr: false });

export default DriverLocationPage; 