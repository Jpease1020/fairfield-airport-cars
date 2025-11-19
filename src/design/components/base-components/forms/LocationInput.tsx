'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { Input } from './Input';

const LocationInputContainer = styled.div`
  position: relative;
  width: 100%;
`;

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (address: string, coordinates: { lat: number; lng: number }) => void;
  onCoordsChange?: (coordinates: { lat: number; lng: number } | null) => void;
  coords?: { lat: number; lng: number } | null;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  name?: string;
  id?: string;
  required?: boolean;
  restrictToAirports?: boolean; // Restrict autocomplete to airports only
  'data-testid'?: string;
  [key: string]: unknown;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  onLocationSelect,
  onCoordsChange,
  coords,
  placeholder,
  disabled = false,
  error = false,
  size = 'md',
  fullWidth = false,
  name,
  id,
  required = false,
  restrictToAirports = false,
  'data-testid': dataTestId,
  ...rest
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [placeAutocomplete, setPlaceAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const places = useMapsLibrary('places');

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
      
      // Also notify about coordinate changes if callback provided
      if (onCoordsChange) {
        onCoordsChange(coordinates);
      }
    }
  }, [onChange, onLocationSelect, onCoordsChange]);

  // Initialize autocomplete when places library is loaded
  useEffect(() => {
    if (!places || !inputRef.current) {
      setPlaceAutocomplete(null);
      return;
    }

    const options: google.maps.places.AutocompleteOptions = {
      fields: ['formatted_address', 'geometry', 'name', 'place_id', 'types'],
      componentRestrictions: { country: 'us' },
      ...(restrictToAirports && { types: ['airport'] }) // Restrict to airports if specified
    };

    const autocomplete = new places.Autocomplete(inputRef.current, options);
    setPlaceAutocomplete(autocomplete);

    // Add place_changed listener
    const listener = autocomplete.addListener('place_changed', () => {
      handlePlaceSelect(autocomplete.getPlace());
    });

    // Cleanup: remove listener when component unmounts or dependencies change
    return () => {
      if (listener && google.maps && google.maps.event) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [places, restrictToAirports, handlePlaceSelect]);

  // Handle manual input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <LocationInputContainer>
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        error={error}
        size={size}
        fullWidth={fullWidth}
        name={name}
        id={id}
        required={required}
        data-testid={dataTestId}
        {...rest}
      />
    </LocationInputContainer>
  );
};
