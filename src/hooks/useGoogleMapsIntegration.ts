import { useRef, useCallback, useEffect, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { useErrorHandler } from './useErrorHandler';

export interface GoogleMapsIntegrationOptions {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  onError?: (error: string) => void;
  variant?: 'autocomplete' | 'places-api';
}

export interface GoogleMapsIntegrationReturn {
  inputRef: React.RefObject<HTMLInputElement | null>;
  isLoaded: boolean;
  autocomplete: google.maps.places.Autocomplete | null;
  error: string | null;
  clearError: () => void;
}

export const useGoogleMapsIntegration = ({
  onPlaceSelect,
  onError,
  variant = 'autocomplete'
}: GoogleMapsIntegrationOptions): GoogleMapsIntegrationReturn => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const places = useMapsLibrary('places');
  const isLoaded = !!places;

  const { error, handleAsync, clearError } = useErrorHandler({
    onError: (error) => {
      if (onError) {
        onError(error);
      }
    }
  });

  // Initialize autocomplete when places library is loaded
  useEffect(() => {
    if (!places || !inputRef.current || variant !== 'autocomplete') return;

    const initializeAutocomplete = async () => {
      try {
        const options = {
          fields: ['formatted_address', 'geometry', 'name', 'place_id', 'types'],
          componentRestrictions: { country: 'us' }
        };

        const autocompleteInstance = new places.Autocomplete(inputRef.current!, options);
        setAutocomplete(autocompleteInstance);
      } catch (err) {
        console.error('Failed to initialize Google Maps autocomplete:', err);
      }
    };

    initializeAutocomplete();
  }, [places, variant]);

  // Handle place selection from autocomplete
  const handlePlaceSelect = useCallback((place: google.maps.places.PlaceResult) => {
    if (place && place.place_id) {
      onPlaceSelect(place);
    }
  }, [onPlaceSelect]);

  // Add place_changed listener
  useEffect(() => {
    if (!autocomplete) return;

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      handlePlaceSelect(place);
    });

    return () => {
      if (listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [autocomplete, handlePlaceSelect]);

  // Handle Places API variant
  const handlePlacesAPI = useCallback(async (input: string) => {
    if (!input.trim() || input.length < 3) return;

    await handleAsync(async () => {
      const response = await fetch('/api/places-autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.predictions && data.predictions.length > 0) {
          // Convert prediction to place-like object
          const prediction = data.predictions[0];
          const place: google.maps.places.PlaceResult = {
            place_id: prediction.place_id,
            formatted_address: prediction.description,
            name: prediction.structured_formatting?.main_text || prediction.description,
            types: prediction.types || [],
          };
          onPlaceSelect(place);
        }
      }
    });
  }, [handleAsync, onPlaceSelect]);

  return {
    inputRef,
    isLoaded,
    autocomplete,
    error,
    clearError,
  };
};
