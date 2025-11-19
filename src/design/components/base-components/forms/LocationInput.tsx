'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
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
  restrictToAirports?: boolean;
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
  const [_placeAutocomplete, setPlaceAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const isProcessingPlaceSelection = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const places = useMapsLibrary('places');

  // Extract address from place result
  const getAddressFromPlace = useCallback((place: google.maps.places.PlaceResult): string => {
    if (place.types?.includes('airport')) {
      return place.name || place.formatted_address || '';
    }
    if (place.types?.includes('establishment') || place.types?.includes('point_of_interest')) {
      return place.name || place.formatted_address || '';
    }
    return place.formatted_address || place.name || '';
  }, []);

  // Handle place selection from autocomplete
  const handlePlaceSelect = useCallback((place: google.maps.places.PlaceResult) => {
    if (!place.geometry?.location || !inputRef.current) {
      return;
    }

    const address = getAddressFromPlace(place);
    if (!address) {
      return;
    }

    const coordinates = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };

    // Mark that we're processing a place selection to prevent input change conflicts
    isProcessingPlaceSelection.current = true;

    // Force immediate React state update using flushSync
    // This ensures React state syncs synchronously before Google Maps blur event fires
    // Critical for mobile Chrome where blur happens immediately after selection
    flushSync(() => {
      onChange(address);
    });

    // Notify callbacks about location selection
    onLocationSelect(address, coordinates);
    if (onCoordsChange) {
      onCoordsChange(coordinates);
    }

    // Keep input in view on mobile after selection
    // Use requestAnimationFrame to ensure this happens after React re-render
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      window.requestAnimationFrame(() => {
        if (!inputRef.current) {
          isProcessingPlaceSelection.current = false;
          return;
        }

        // Scroll input into view to ensure user sees the filled value
        // Only on mobile devices (screen width <= 768px)
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
          inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Clear the processing flag after a short delay
        // This ensures any blur events that fire can check the flag
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          isProcessingPlaceSelection.current = false;
          timeoutRef.current = null;
        }, 200);
      });
    } else {
      // Fallback if requestAnimationFrame is not available
      setTimeout(() => {
        isProcessingPlaceSelection.current = false;
      }, 200);
    }
  }, [onChange, onLocationSelect, onCoordsChange, getAddressFromPlace]);

  // Initialize autocomplete when places library is loaded
  useEffect(() => {
    if (!places || !inputRef.current) {
      setPlaceAutocomplete(null);
      return;
    }

    const options: google.maps.places.AutocompleteOptions = {
      fields: ['formatted_address', 'geometry', 'name', 'place_id', 'types'],
      componentRestrictions: { country: 'us' },
      ...(restrictToAirports && { types: ['airport'] })
    };

    const autocomplete = new places.Autocomplete(inputRef.current, options);
    setPlaceAutocomplete(autocomplete);

    // Add place_changed listener
    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place && place.place_id) {
        handlePlaceSelect(place);
      }
    });

    // Cleanup: remove listener and clear timeout
    return () => {
      if (listener && google.maps && google.maps.event) {
        google.maps.event.removeListener(listener);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [places, restrictToAirports, handlePlaceSelect]);

  // Handle manual input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Only update if we're not processing a place selection
    // This prevents conflicts when Google Maps autocomplete sets the value
    if (!isProcessingPlaceSelection.current) {
      onChange(e.target.value);
    }
  }, [onChange]);

  // Handle blur - ensure value persists during place selection
  const handleBlur = useCallback(() => {
    // If we're processing a place selection, the value should already be set via flushSync
    // But we check the DOM value as a safety net in case something went wrong
    if (isProcessingPlaceSelection.current && inputRef.current) {
      const domValue = inputRef.current.value;
      // If DOM has a value but React state doesn't match, sync it
      // This handles edge cases where Google Maps sets a value but React state didn't update
      if (domValue && domValue !== value) {
        flushSync(() => {
          onChange(domValue);
        });
      }
    }
  }, [value, onChange]);

  return (
    <LocationInputContainer>
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
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
