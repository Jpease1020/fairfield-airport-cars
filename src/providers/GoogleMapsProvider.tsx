'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface GoogleMapsContextValue {
  isLoaded: boolean;
  isError: boolean;
  error: string | null;
}

const GoogleMapsContext = createContext<GoogleMapsContextValue | null>(null);

export function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('Google Maps API key not configured');
      setIsError(true);
      return;
    }

    // Check if already loaded
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    // Load API once
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => setIsLoaded(true);
    script.onerror = () => {
      setError('Failed to load Google Maps API');
      setIsError(true);
    };

    document.head.appendChild(script);
  }, []);

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, isError, error }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error('useGoogleMaps must be used within GoogleMapsProvider');
  }
  return context;
}
