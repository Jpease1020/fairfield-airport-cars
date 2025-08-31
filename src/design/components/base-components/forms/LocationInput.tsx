'use client';

import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Input } from './Input';
import { useGoogleMaps } from '../../../../providers/GoogleMapsProvider';

const LocationInputContainer = styled.div`
  position: relative;
  width: 100%;
`;

interface LocationInputProps {
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
  'data-testid'?: string;
  [key: string]: unknown;
}

export const LocationInput: React.FC<LocationInputProps> = ({
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
  'data-testid': dataTestId,
  ...rest
}) => {
  const { isLoaded } = useGoogleMaps();
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    try {
      // Create autocomplete instance
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['formatted_address', 'geometry', 'name', 'place_id']
      });

      // Store reference
      autocompleteRef.current = autocomplete;

      // Add place changed listener
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (place.geometry?.location) {
          const address = place.formatted_address || place.name || '';
          const coordinates = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          
          // Update the input value
          onChange(address);
          
          // Notify parent component with both address and coordinates
          onLocationSelect(address, coordinates);
        }
      });

      // Cleanup function
      return () => {
        if (autocompleteRef.current) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
          autocompleteRef.current = null;
        }
      };
    } catch (error) {
      console.error('Failed to initialize Google Places Autocomplete:', error);
    }
  }, [isLoaded, onChange, onLocationSelect]);

  return (
    <LocationInputContainer>
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
