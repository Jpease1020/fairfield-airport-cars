'use client';

import { useState, useEffect } from 'react';

interface GoogleMapsScriptResult {
  isLoaded: boolean;
  isError: boolean;
}

export const useGoogleMapsScript = (apiKey: string): GoogleMapsScriptResult => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!apiKey) {
      setIsError(true);
      return;
    }

    // Check if Google Maps script is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      setIsError(true);
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [apiKey]);

  return { isLoaded, isError };
};
