'use client';

import { APIProvider } from '@vis.gl/react-google-maps';
import { useEffect, useState } from 'react';

interface GoogleMapsClientProviderProps {
  children: React.ReactNode;
}

export function GoogleMapsClientProvider({ children }: GoogleMapsClientProviderProps) {
  const [isClient, setIsClient] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return <>{children}</>;
  }
  
  if (!apiKey) {
    console.error('Google Maps API key not found');
    return <>{children}</>;
  }

  return (
    <APIProvider 
      apiKey={apiKey} 
      libraries={['places', 'routes', 'maps']}
      solutionChannel="GMP_devsite_samples_v3_rgmautocomplete"
    >
      {children}
    </APIProvider>
  );
}
