'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Input } from './Input';
import { colors, spacing, fontSize, shadows } from '../../../system/tokens/tokens';
import { isAirportLocation, isWithinHomeAreaNormal, isWithinHomeAreaExtended } from '@/lib/services/service-area-validation';

const LocationInputContainer = styled.div<{ $fullWidth: boolean }>`
  position: relative;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
`;

const ErrorMessage = styled.div`
  color: ${colors.danger[600]};
  font-size: ${fontSize.xs};
  margin-top: ${spacing.xs};
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
`;

const PlacesUnavailableMessage = styled.div`
  margin-top: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  background-color: ${colors.background.secondary};
  border: 1px solid ${colors.border.default};
  border-radius: 0.5rem;
  font-size: ${fontSize.sm};
  color: ${colors.text.secondary};
`;

const RetryLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: inherit;
  color: ${colors.primary[600]};
  text-decoration: underline;
  cursor: pointer;
  margin-left: ${spacing.xs};
  &:hover {
    color: ${colors.primary[700]};
  }
`;

// Always use absolute positioning - tied to bottom of input field
const PredictionsDropdown = styled.div<{ $isMobile: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  width: 100%;
  margin-top: ${spacing.xs};
  background-color: ${colors.background.primary};
  border: 1px solid ${colors.border.default};
  border-radius: 0.5rem;
  box-shadow: ${shadows.lg};
  z-index: 9999; /* Very high z-index to appear above keyboard and other elements */
  max-height: ${({ $isMobile }) => ($isMobile ? '40vh' : '300px')};
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  
  /* Mobile-specific: ensure dropdown is visible and scrollable */
  @media (max-width: 768px) {
    max-height: min(40vh, 300px);
    /* Prevent body scroll when dropdown is open */
    overscroll-behavior: contain;
  }
`;

const PredictionItem = styled.div<{ $isLast: boolean; $isSelected: boolean }>`
  padding: ${spacing.md} ${spacing.lg};
  cursor: pointer;
  background-color: ${({ $isSelected }) => ($isSelected ? colors.background.secondary : 'transparent')};
  border-bottom: ${({ $isLast }) => ($isLast ? 'none' : `1px solid ${colors.border.light}`)};
  transition: background-color 0.15s ease;
  min-height: 44px; /* Touch-friendly minimum height (WCAG) */
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  /* Active state for touch devices */
  -webkit-tap-highlight-color: transparent;
  
  &:hover,
  &:active {
    background-color: ${colors.background.secondary};
  }
  
  /* Ensure text is readable and properly sized */
  @media (max-width: 768px) {
    padding: ${spacing.md};
    min-height: 48px; /* Slightly larger on mobile for easier tapping */
  }
`;

const PredictionMainText = styled.div`
  font-weight: 500;
  font-size: ${fontSize.md};
  color: ${colors.text.primary};
  line-height: 1.4;
`;

const PredictionSecondaryText = styled.div`
  font-size: ${fontSize.sm};
  color: ${colors.text.secondary};
  margin-top: ${spacing.xs};
  line-height: 1.3;
`;

const LoadingIndicator = styled.div<{ $isMobile: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  width: 100%;
  margin-top: ${spacing.xs};
  background-color: ${colors.background.primary};
  border: 1px solid ${colors.border.default};
  border-radius: 0.5rem;
  padding: ${spacing.md};
  text-align: center;
  color: ${colors.text.secondary};
  font-size: ${fontSize.sm};
  z-index: 9999;
`;

interface LocationInputProps {
  value: string;
  onChange: (_value: string) => void;
  onLocationSelect: (_address: string, _coordinates: { lat: number; lng: number }) => void;
  onCoordsChange?: (_coordinates: { lat: number; lng: number } | null) => void;
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

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
}

interface PlaceDetails {
  place_id: string;
  formatted_address: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  types: string[];
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
  // Track validation error state
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const predictionsRef = useRef<HTMLDivElement>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [placesUnavailable, setPlacesUnavailable] = useState(false);

  // Detect when Google Places API never loads (e.g. script error, no API key) and show fallback message
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.google?.maps?.places) return;

    const PLACES_LOAD_TIMEOUT_MS = 10000;
    const timeoutId = setTimeout(() => {
      if (!window.google?.maps?.places) {
        setPlacesUnavailable(true);
      }
    }, PLACES_LOAD_TIMEOUT_MS);

    return () => clearTimeout(timeoutId);
  }, []);

  const handlePlacesRetry = useCallback(() => {
    if (typeof window !== 'undefined' && window.google?.maps?.places) {
      setPlacesUnavailable(false);
    }
  }, []);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice =
        typeof window !== 'undefined' &&
        (window.innerWidth <= 768 ||
          /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  // Fetch predictions using Google Places AutocompleteService directly from frontend
  const fetchPredictions = useCallback(
    async (input: string) => {
      if (!input.trim() || input.length < 3) {
        setPredictions([]);
        setShowPredictions(false);
        return;
      }

      // If Places API isn't loaded yet (script error, no key, or slow load), show fallback so user isn't left with nothing
      if (typeof window === 'undefined' || !window.google?.maps?.places) {
        setPredictions([]);
        setShowPredictions(false);
        if (typeof window !== 'undefined') {
          setPlacesUnavailable(true);
        }
        return;
      }

      setPlacesUnavailable(false);
      setIsLoading(true);
      try {
        const autocompleteService = new window.google.maps.places.AutocompleteService();
        let settled = false;

        const settle = () => {
          if (settled) return false;
          settled = true;
          return true;
        };

        // Protect against external API hangs so users don't get stuck on a perpetual loader.
        const fallbackTimeout = setTimeout(() => {
          if (!settle()) return;
          setPredictions([]);
          setShowPredictions(false);
          setPlacesUnavailable(true);
          setIsLoading(false);
        }, 3500);

        // Define service area bounds (Fairfield County, CT + nearby airports)
        // Bounding box covers: Fairfield County, CT + NYC airports (JFK, LGA, EWR)
        // Southwest: NYC area, Northeast: CT area
        const serviceAreaBounds = new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(40.5, -74.5), // Southwest corner (NYC area)
          new window.google.maps.LatLng(42.0, -72.5)  // Northeast corner (CT area)
        );

        autocompleteService.getPlacePredictions(
          {
            input: input,
            componentRestrictions: { country: 'us' },
            ...(restrictToAirports
              ? { types: ['airport'] }
              : {
                  // Don't specify types - Google doesn't allow mixing 'address' with other types
                  // Just use bounds to prefer results in our service area
                  // We'll filter out cities/regions client-side
                  bounds: serviceAreaBounds
                }
            ),
          },
          (predictions, status) => {
            clearTimeout(fallbackTimeout);
            if (!settle()) return;

            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              predictions
            ) {
              let filteredPredictions = predictions.map((p) => ({
                place_id: p.place_id,
                description: p.description,
                structured_formatting: p.structured_formatting,
                types: p.types || [],
              }));

              // Additional filtering for airports if needed
              if (restrictToAirports) {
                filteredPredictions = filteredPredictions.filter((p) =>
                  p.types?.some((type) => type === 'airport')
                );
              }

              // For flexible inputs (addresses OR airports), filter out cities/regions
              // But allow both addresses and airports
              if (!restrictToAirports) {
                filteredPredictions = filteredPredictions.filter((p) => {
                  const isAirport = p.types?.some((type) => type === 'airport');

                  // Always allow airports
                  if (isAirport) {
                    return true;
                  }

                  // Keep specific location-like predictions and only reject pure political regions.
                  // Google often returns `route`, `geocode`, or `subpremise` for valid addresses.
                  const excludedTypes = [
                    'locality',
                    'administrative_area_level_1',
                    'administrative_area_level_2',
                    'country',
                    'political',
                  ];
                  const addressLikeTypes = [
                    'street_address',
                    'route',
                    'geocode',
                    'premise',
                    'subpremise',
                    'establishment',
                    'point_of_interest',
                    'intersection',
                    'postal_code',
                    'plus_code',
                  ];

                  const hasAddressLikeType = p.types?.some((type) =>
                    addressLikeTypes.includes(type)
                  );
                  const isPurePolitical = p.types?.every((type) =>
                    excludedTypes.includes(type)
                  );

                  return hasAddressLikeType && !isPurePolitical;
                });
              }

              setPredictions(filteredPredictions);
              setShowPredictions(filteredPredictions.length > 0);
              setSelectedIndex(-1);
              setPlacesUnavailable(false);
            } else {
              setPredictions([]);
              setShowPredictions(false);

              const unavailableStatuses = [
                window.google.maps.places.PlacesServiceStatus.INVALID_REQUEST,
                window.google.maps.places.PlacesServiceStatus.REQUEST_DENIED,
                window.google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT,
                window.google.maps.places.PlacesServiceStatus.UNKNOWN_ERROR,
              ];
              setPlacesUnavailable(unavailableStatuses.includes(status));
            }
            setIsLoading(false);
          }
        );
      } catch (_error) {
        if (typeof window !== 'undefined') {
          setPlacesUnavailable(true);
        }
        setPredictions([]);
        setShowPredictions(false);
        setIsLoading(false);
      }
    },
    [restrictToAirports]
  );

  // Debounce timer for search
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch place details using Google Places Service directly from frontend
  const fetchPlaceDetails = useCallback(
    async (placeId: string): Promise<PlaceDetails | null> => {
      // Wait for Google Maps to be available
      if (typeof window === 'undefined' || !window.google?.maps?.places) {
        return null;
      }

      return new Promise((resolve) => {
        const placesService = new window.google.maps.places.PlacesService(
          document.createElement('div')
        );

        placesService.getDetails(
          {
            placeId: placeId,
            fields: ['formatted_address', 'geometry', 'name', 'place_id', 'types'],
          },
          (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
              if (!place.geometry?.location) {
                resolve(null);
                return;
              }

              resolve({
                place_id: place.place_id || placeId,
                formatted_address: place.formatted_address || place.name || '',
                name: place.name || place.formatted_address || '',
                coordinates: {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                },
                types: place.types || [],
              });
            } else {
              resolve(null);
            }
          }
        );
      });
    },
    []
  );

  // Handle prediction selection
  const handlePredictionSelect = useCallback(
    async (prediction: Prediction) => {
      // Clear any pending search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }

      // Close dropdown immediately
      setShowPredictions(false);
      setPredictions([]);
      setSelectedIndex(-1);

      // Fetch place details to get coordinates
      const placeDetails = await fetchPlaceDetails(prediction.place_id);

      if (placeDetails) {
        // Check if this is an airport (airports are always allowed regardless of location)
        const isAirport = isAirportLocation(placeDetails.formatted_address || placeDetails.name, placeDetails.coordinates);
        
        // For flexible inputs (not restricted to airports only), validate that it's either an airport or an address (not a city/region)
        if (!restrictToAirports) {
          // Always allow airports
          if (!isAirport) {
            const excludedTypes = ['locality', 'administrative_area_level_1', 'administrative_area_level_2', 'country', 'political', 'postal_code'];
            const isCityOrRegion = placeDetails.types?.some((type) => excludedTypes.includes(type));
            const isAddress = placeDetails.types?.some((type) => 
              type === 'street_address' || 
              type === 'premise' || 
              type === 'subpremise' ||
              type === 'establishment' ||
              type === 'point_of_interest'
            );

            // Reject if it's a city/region and not a valid address
            if (isCityOrRegion && !isAddress) {
              // Clear the selection and show error message
              onChange('');
              if (onCoordsChange) {
                onCoordsChange(null);
              }
              setValidationError('Please enter a specific address, not a city or region');
              setTimeout(() => setValidationError(null), 8000);
              return;
            }

            // Client-side validation: Check if address is within service area
            if (placeDetails.coordinates) {
              const inNormalArea = isWithinHomeAreaNormal(placeDetails.coordinates);
              const inExtendedArea = isWithinHomeAreaExtended(placeDetails.coordinates);
              
              // If address is outside extended area, reject it immediately
              if (!inNormalArea && !inExtendedArea) {
                // Clear the selection
                onChange('');
                if (onCoordsChange) {
                  onCoordsChange(null);
                }
                // Set validation error message
                setValidationError('Address outside service area. We serve Fairfield County, CT and nearby airports.');
                // Clear error after 8 seconds (give user time to read)
                setTimeout(() => setValidationError(null), 8000);
                return;
              }
              
              // Clear validation error if address is valid
              setValidationError(null);
            }
          }
        } else {
          // For airport-only inputs, verify it's actually an airport
          if (!isAirport) {
            onChange('');
            if (onCoordsChange) {
              onCoordsChange(null);
            }
            // Set validation error message
            setValidationError('Please select an airport (e.g., JFK, LGA, EWR, BDL, HVN, HPN).');
            // Clear error after 5 seconds
            setTimeout(() => setValidationError(null), 5000);
            return;
          }
          
          // Clear validation error if airport is valid
          setValidationError(null);
        }

        // For airports, prioritize the name field which contains the full airport name
        // Otherwise use formatted_address for regular addresses
        const address = isAirport 
          ? (placeDetails.name || prediction.description || placeDetails.formatted_address)
          : (placeDetails.formatted_address || placeDetails.name || prediction.description);
        
        onChange(address);
        onLocationSelect(address, placeDetails.coordinates);
        if (onCoordsChange) {
          onCoordsChange(placeDetails.coordinates);
        }
      } else {
        // Fallback: use prediction description which usually has the full name
        onChange(prediction.description);
        if (onCoordsChange) {
          onCoordsChange(null);
        }
      }

      // Don't scroll - let the user maintain their scroll position
      // Only scroll if the input is actually out of view (which we can check, but for now, skip it)
    },
    [onChange, onLocationSelect, onCoordsChange, fetchPlaceDetails, isMobile, restrictToAirports]
  );

  // Handle input change - user is typing
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);

      // Clear any pending search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (newValue.trim().length >= 3) {
        // Debounce the search - only fetch when user stops typing
        searchTimeoutRef.current = setTimeout(() => {
          fetchPredictions(newValue);
        }, 300);
      } else {
        setShowPredictions(false);
        setPredictions([]);
      }
    },
    [onChange, fetchPredictions]
  );

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    if (predictions.length > 0) {
      setShowPredictions(true);
    }
  }, [predictions.length]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setShowPredictions(false);
        setSelectedIndex(-1);
        return;
      }

      if (!showPredictions || predictions.length === 0) {
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, predictions.length - 1));
        setShowPredictions(true);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        setShowPredictions(true);
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handlePredictionSelect(predictions[selectedIndex]);
      }
    },
    [showPredictions, predictions, handlePredictionSelect, selectedIndex]
  );

  // Handle click outside to close predictions
  useEffect(() => {
    if (!showPredictions) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Element;
      // Check if click is outside both input and predictions dropdown
      if (
        predictionsRef.current &&
        !predictionsRef.current.contains(target) &&
        inputRef.current &&
        !inputRef.current.contains(target)
      ) {
        setShowPredictions(false);
        setSelectedIndex(-1);
      }
    };

    // Use both mousedown and touchstart for mobile
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showPredictions]);

  // Don't prevent body scroll - it causes layout shifts and jumping
  // The dropdown is positioned fixed on mobile, so it will stay in place during scroll

  // Combine external error prop with internal validation error
  const hasError = error || !!validationError;

  return (
    <LocationInputContainer $fullWidth={fullWidth}>
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        error={hasError}
        size={size}
        fullWidth={fullWidth}
        name={name}
        id={id}
        required={required}
        data-testid={dataTestId}
        {...rest}
      />
      {validationError && (
        <ErrorMessage role="alert" aria-live="polite">
          {validationError}
        </ErrorMessage>
      )}

      {placesUnavailable && (
        <PlacesUnavailableMessage role="alert" data-testid="location-input-places-unavailable">
          Address search is temporarily unavailable. Please refresh the page or{' '}
          <RetryLink type="button" onClick={handlePlacesRetry} data-testid="location-input-places-retry">
            try again
          </RetryLink>
          . You can still enter an address manually.
        </PlacesUnavailableMessage>
      )}

      {showPredictions && predictions.length > 0 && (
        <PredictionsDropdown
          ref={predictionsRef}
          $isMobile={isMobile}
          data-testid="location-predictions-dropdown"
        >
          {predictions.map((prediction, index) => (
            <PredictionItem
              key={prediction.place_id}
              $isLast={index === predictions.length - 1}
              $isSelected={selectedIndex === index}
              onClick={() => handlePredictionSelect(prediction)}
            >
              <PredictionMainText>
                {prediction.structured_formatting.main_text}
              </PredictionMainText>
              {prediction.structured_formatting.secondary_text && (
                <PredictionSecondaryText>
                  {prediction.structured_formatting.secondary_text}
                </PredictionSecondaryText>
              )}
            </PredictionItem>
          ))}
        </PredictionsDropdown>
      )}

      {isLoading && (
        <LoadingIndicator $isMobile={isMobile}>
          Loading...
        </LoadingIndicator>
      )}
    </LocationInputContainer>
  );
};
