'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { Input } from '@/design/components/base-components/forms/Input';
import { Text } from '@/design/components/base-components/text/Text';
import { useErrorHandler } from '@/hooks/useErrorHandler';

const AddressInputContainer = styled.div`
  position: relative;
  width: 100%;
`;

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (address: string, coordinates: { lat: number; lng: number }) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  name?: string;
  id?: string;
  required?: boolean;
  variant?: 'autocomplete' | 'places-api';
  'data-testid'?: string;
  [key: string]: unknown;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  value,
  onChange,
  onLocationSelect,
  placeholder,
  disabled = false,
  error = false,
  size = 'md',
  fullWidth = false,
  name,
  id,
  required = false,
  variant = 'autocomplete',
  'data-testid': dataTestId,
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [placeAutocomplete, setPlaceAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const places = useMapsLibrary('places');
  
  const { error: autocompleteError, handleAsync } = useErrorHandler({
    onError: (error) => {
      console.error('AddressInput autocomplete error:', error);
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

        const autocomplete = new places.Autocomplete(inputRef.current!, options);
        setPlaceAutocomplete(autocomplete);
      } catch (err) {
        console.error('Failed to initialize Google Maps autocomplete:', err);
      }
    };

    initializeAutocomplete();
  }, [places, variant]);

  // Handle place selection from autocomplete
  const handlePlaceSelect = useCallback((place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      // Get the best address representation
      let address = '';
      if (place.types?.includes('airport')) {
        address = place.name || place.formatted_address || '';
      } else if (place.types?.includes('establishment') || place.types?.includes('point_of_interest')) {
        address = place.name || place.formatted_address || '';
      } else {
        address = place.formatted_address || place.name || '';
      }
      
      const coordinates = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      
      // Update both the input value and notify about selection
      onChange(address);
      onLocationSelect(address, coordinates);
    }
  }, [onChange, onLocationSelect]);

  // Add place_changed listener
  useEffect(() => {
    if (!placeAutocomplete) return;

    const listener = placeAutocomplete.addListener('place_changed', () => {
      const place = placeAutocomplete.getPlace();
      if (place && place.place_id) {
        handlePlaceSelect(place);
      }
    });

    return () => {
      if (listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [placeAutocomplete, handlePlaceSelect]);

  // Handle manual input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

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
        // Handle Places API response
        if (data.predictions && data.predictions.length > 0) {
          const prediction = data.predictions[0];
          onChange(prediction.description);
          // You might want to fetch place details for coordinates
          // This would require additional API call
        }
      }
    });
  }, [handleAsync, onChange]);

  // Handle input change for Places API
  useEffect(() => {
    if (variant === 'places-api' && value) {
      const timeoutId = setTimeout(() => {
        handlePlacesAPI(value);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [value, variant, handlePlacesAPI]);

  return (
    <AddressInputContainer>
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        error={error || !!autocompleteError}
        size={size}
        fullWidth={fullWidth}
        name={name}
        id={id}
        required={required}
        data-testid={dataTestId}
        {...rest}
      />
      {autocompleteError && (
        <Text size="sm" color="error">
          {autocompleteError}
        </Text>
      )}
    </AddressInputContainer>
  );
};
