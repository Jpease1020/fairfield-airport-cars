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
  
  // Use refs for callbacks to prevent recreating autocomplete
  const onChangeRef = useRef(onChange);
  const onLocationSelectRef = useRef(onLocationSelect);
  const onCoordsChangeRef = useRef(onCoordsChange);
  
  // Update refs when callbacks change
  useEffect(() => {
    onChangeRef.current = onChange;
    onLocationSelectRef.current = onLocationSelect;
    onCoordsChangeRef.current = onCoordsChange;
  }, [onChange, onLocationSelect, onCoordsChange]);

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
  // This is the ONLY place where we update React state from Google Maps events
  // We avoid direct DOM manipulation - let React control the value through state
  // Using a stable callback that doesn't change to prevent autocomplete recreation
  const handlePlaceSelect = useCallback((place: google.maps.places.PlaceResult) => {
    if (!place.geometry?.location) {
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

    // Update React state ONLY - React will update the DOM through the controlled component
    // Use flushSync to ensure state updates synchronously before blur events fire on mobile
    flushSync(() => {
      onChangeRef.current(address);
    });

    // Notify callbacks about location selection
    onLocationSelectRef.current(address, coordinates);
    if (onCoordsChangeRef.current) {
      onCoordsChangeRef.current(coordinates);
    }

    // Keep input in view on mobile after selection
    // Use requestAnimationFrame to ensure this happens after React re-render
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    if (typeof window !== 'undefined' && window.requestAnimationFrame && isMobile) {
      window.requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }

    // Clear the processing flag after a delay
    // This ensures any blur events that fire can check the flag
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      isProcessingPlaceSelection.current = false;
      timeoutRef.current = null;
    }, 200);
  }, [getAddressFromPlace]);

  // Initialize autocomplete when places library is loaded
  // This effect should ONLY run when places library loads or restrictToAirports changes
  // NOT when value or handlePlaceSelect changes (to prevent recreating autocomplete)
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

    // Add place_changed listener - this is the PRIMARY way Google Maps notifies us
    const placeChangedListener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      // Check if place has geometry (required for coordinates)
      if (place && place.geometry?.location) {
        handlePlaceSelect(place);
      } else {
        // Even without geometry, update the address if we have one
        if (place.formatted_address || place.name) {
          const address = place.formatted_address || place.name || '';
          flushSync(() => {
            onChangeRef.current(address);
          });
        }
      }
    });

    // Cleanup: remove listener
    return () => {
      if (placeChangedListener && google.maps && google.maps.event) {
        google.maps.event.removeListener(placeChangedListener);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    // Only recreate autocomplete when places library or restrictToAirports changes
    // handlePlaceSelect is stable (doesn't change), so it's safe to include
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [places, restrictToAirports]);

  // Handle manual input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Only update if we're not processing a place selection
    // This prevents conflicts when Google Maps autocomplete sets the value
    if (!isProcessingPlaceSelection.current) {
      onChangeRef.current(e.target.value);
    }
  }, []);

  // Handle blur - sync DOM value to React state if they differ
  // This handles cases where Google Maps sets a value but React state didn't update
  const handleBlur = useCallback(() => {
    // If we're processing a place selection, the value should already be synced via flushSync
    // But we check as a safety net in case something went wrong
    if (isProcessingPlaceSelection.current) {
      // The value should already be set, but verify DOM matches React state
      if (inputRef.current && inputRef.current.value !== value) {
        // If DOM has a value but React state doesn't match, sync it
        const domValue = inputRef.current.value;
        if (domValue) {
          flushSync(() => {
            onChangeRef.current(domValue);
          });
        }
      }
      return;
    }
    
    // Normal blur: sync DOM value to React state if they differ
    // This handles edge cases where Google Maps might have set a value
    if (inputRef.current && inputRef.current.value !== value) {
      const domValue = inputRef.current.value;
      if (domValue) {
        onChangeRef.current(domValue);
      }
    }
  }, [value]);

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
