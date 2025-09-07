'use client';

import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Input } from '@/design/components/base-components/forms/Input';
import { Text } from '@/design/components/base-components/text/Text';
import { useGoogleMapsIntegration } from '@/hooks/useGoogleMapsIntegration';
import { useErrorHandler } from '@/hooks/useErrorHandler';

const AddressInputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const ErrorMessage = styled.div`
  color: var(--error-color, var(--danger-color));
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

interface UnifiedAddressInputProps {
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

export const UnifiedAddressInput: React.FC<UnifiedAddressInputProps> = ({
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
  const [isLoading, setIsLoading] = useState(false);
  
  const { error: integrationError, handleAsync } = useErrorHandler({
    onError: (error) => {
      console.error('UnifiedAddressInput error:', error);
    }
  });

  // Handle place selection with coordinates
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

  // Google Maps integration
  const { inputRef, isLoaded, error: mapsError } = useGoogleMapsIntegration({
    onPlaceSelect: handlePlaceSelect,
    variant,
  });

  // Handle Places API variant
  const handlePlacesAPI = useCallback(async (input: string) => {
    if (!input.trim() || input.length < 3) return;

    setIsLoading(true);
    try {
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
            const prediction = data.predictions[0];
            onChange(prediction.description);
            // Note: For full coordinates, you'd need to make another API call
            // to get place details, but for now we'll just use the address
            onLocationSelect(prediction.description, { lat: 0, lng: 0 });
          }
        }
      });
    } finally {
      setIsLoading(false);
    }
  }, [handleAsync, onChange, onLocationSelect]);

  // Handle input change for Places API
  useEffect(() => {
    if (variant === 'places-api' && value) {
      const timeoutId = setTimeout(() => {
        handlePlacesAPI(value);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [value, variant, handlePlacesAPI]);

  // Handle manual input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const hasError = error || !!integrationError || !!mapsError;

  return (
    <AddressInputContainer>
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        error={hasError}
        size={size}
        fullWidth={fullWidth}
        name={name}
        id={id}
        required={required}
        data-testid={dataTestId}
        {...rest}
      />
      {(integrationError || mapsError) && (
        <ErrorMessage>
          {integrationError || mapsError}
        </ErrorMessage>
      )}
      {isLoading && (
        <Text size="sm" color="secondary" cmsId="address-loading-text">
          Loading suggestions...
        </Text>
      )}
    </AddressInputContainer>
  );
};
