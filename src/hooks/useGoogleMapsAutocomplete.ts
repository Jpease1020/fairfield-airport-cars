import { useEffect, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface UseAutocompleteOptions {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export const useGoogleMapsAutocomplete = ({
  onPlaceSelect,
  inputRef
}: UseAutocompleteOptions) => {
  const places = useMapsLibrary('places');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  // Initialize autocomplete when places library is loaded
  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ['formatted_address', 'geometry', 'name', 'place_id', 'types'],
      componentRestrictions: { country: 'us' }
    };

    const autocompleteInstance = new places.Autocomplete(inputRef.current, options);
    setAutocomplete(autocompleteInstance);

    return () => {
      if (autocompleteInstance) {
        google.maps.event.clearInstanceListeners(autocompleteInstance);
      }
    };
  }, [places, inputRef]);

  // Add place_changed listener
  useEffect(() => {
    if (!autocomplete) return;

    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place && place.place_id) {
        onPlaceSelect(place);
      }
    });

    return () => {
      if (listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [autocomplete, onPlaceSelect]);

  return {
    isLoaded: !!places,
    autocomplete
  };
};