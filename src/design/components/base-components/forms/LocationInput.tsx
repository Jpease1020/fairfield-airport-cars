'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Input } from './Input';
import { colors, spacing, fontSize, shadows } from '../../../system/tokens/tokens';

const LocationInputContainer = styled.div<{ $fullWidth: boolean }>`
  position: relative;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
`;

// Always use absolute positioning - tied to bottom of input field
const PredictionsDropdown = styled.div<{ $isMobile: boolean; $top: number; $left: number; $width: number }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
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

const LoadingIndicator = styled.div<{ $isMobile: boolean; $top: number; $left: number; $width: number }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
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
  const inputRef = useRef<HTMLInputElement>(null);
  const predictionsRef = useRef<HTMLDivElement>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

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

  // Calculate dropdown position
  const updateDropdownPosition = useCallback(() => {
    if (!inputRef.current) return;

    const inputRect = inputRef.current.getBoundingClientRect();

    // Always use absolute positioning - tied to bottom of input field
    // Position is now handled by CSS (top: 100%), so we don't need to set position state
    // But we keep the state for potential future use
    setDropdownPosition({
      top: 0,
      left: 0,
      width: 0,
    });
  }, []);

  // Update position when input position changes or predictions show
  useEffect(() => {
    if (!showPredictions || !inputRef.current) {
      return;
    }

    updateDropdownPosition();

    // Update position on scroll/resize - use passive listener and debounce for performance
    let scrollTimeout: NodeJS.Timeout | null = null;
    const handleUpdate = () => {
      if (inputRef.current) {
        updateDropdownPosition();
      }
    };
    
    const handleScroll = () => {
      // Debounce scroll updates to prevent excessive recalculations
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(handleUpdate, 50);
    };
    
    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleUpdate);

    // Handle visual viewport changes (keyboard show/hide on mobile)
    let visualViewport: (typeof window)['visualViewport'] | null = null;
    if (typeof window !== 'undefined' && window.visualViewport) {
      visualViewport = window.visualViewport;
      visualViewport.addEventListener('resize', handleUpdate);
    }

    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleUpdate);
      if (visualViewport) {
        visualViewport.removeEventListener('resize', handleUpdate);
      }
    };
  }, [showPredictions, updateDropdownPosition]);

  // Fetch predictions using Google Places AutocompleteService directly from frontend
  const fetchPredictions = useCallback(
    async (input: string) => {
      if (!input.trim() || input.length < 3) {
        setPredictions([]);
        setShowPredictions(false);
        return;
      }

      // Wait for Google Maps to be available
      if (typeof window === 'undefined' || !window.google?.maps?.places) {
        setPredictions([]);
        setShowPredictions(false);
        return;
      }

      setIsLoading(true);
      try {
        const autocompleteService = new window.google.maps.places.AutocompleteService();

        autocompleteService.getPlacePredictions(
          {
            input: input,
            componentRestrictions: { country: 'us' },
            ...(restrictToAirports && { types: ['airport'] }),
          },
          (predictions, status) => {
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

              setPredictions(filteredPredictions);
              setShowPredictions(filteredPredictions.length > 0);
              setSelectedIndex(-1);
            } else {
              setPredictions([]);
              setShowPredictions(false);
            }
            setIsLoading(false);
          }
        );
      } catch (_error) {
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
        // For airports, prioritize the name field which contains the full airport name
        // Otherwise use formatted_address for regular addresses
        const isAirport = placeDetails.types?.some(type => type === 'airport');
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
    [onChange, onLocationSelect, onCoordsChange, fetchPlaceDetails, isMobile]
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
      updateDropdownPosition();
    }
  }, [predictions.length, updateDropdownPosition]);

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
        error={error}
        size={size}
        fullWidth={fullWidth}
        name={name}
        id={id}
        required={required}
        data-testid={dataTestId}
        {...rest}
      />

      {showPredictions && predictions.length > 0 && (
        <PredictionsDropdown
          ref={predictionsRef}
          $isMobile={isMobile}
          $top={dropdownPosition.top}
          $left={dropdownPosition.left}
          $width={dropdownPosition.width}
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
        <LoadingIndicator
          $isMobile={isMobile}
          $top={dropdownPosition.top}
          $left={dropdownPosition.left}
          $width={dropdownPosition.width}
        >
          Loading...
        </LoadingIndicator>
      )}
    </LocationInputContainer>
  );
};
