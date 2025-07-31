'use client';

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Container, Button, Stack, Text, Span } from '@/ui';
import { Loader2, MapPin } from 'lucide-react';
import { colors, spacing, fontSize, transitions } from '../../system/tokens/tokens';

const StyledLoader = styled(Loader2)`
  width: 1rem;
  height: 1rem;
  color: ${colors.text.disabled};
`;

const StyledMapPin = styled(MapPin)`
  width: 1rem;
  height: 1rem;
  color: ${colors.text.disabled};
`;

const StyledInput = styled.input`
  flex: 1;
  border: 0;
  outline: none;
  background-color: transparent;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-primary, #111827);
`;

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (place: any) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  fieldId?: string;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = 'Enter location...',
  label,
  required = false,
  error,
  helperText,
  fieldId
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Element)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchPlaces = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/places-autocomplete?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.predictions || []);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.length > 2) {
      searchPlaces(newValue);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    onChange(suggestion.description);
    if (onSelect) {
      onSelect(suggestion);
    }
    setShowSuggestions(false);
    setIsFocused(false);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay to allow suggestion clicks
    setTimeout(() => {
      setIsFocused(false);
    }, 100);
  };

  return (
    <Container>
      {label && (
        <Label htmlFor={fieldId}>
          {label}
          {required && <Span>*</Span>}
        </Label>
      )}
      
      <Container spacing="xs">
        <Container
          variant="default"
          padding="sm"
          as="div"
        >
          {isLoading && <StyledLoader />}
          <StyledInput
            data-autocomplete-input
            id={fieldId}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
          />
          {!isLoading && <StyledMapPin />}
        </Container>
        
        {error && <Text size="sm" color="error">{error}</Text>}
        {helperText && !error && <Text size="sm" color="muted">{helperText}</Text>}
      </Container>

      {showSuggestions && suggestions.length > 0 && (
        <Container data-suggestions>
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <Stack direction="horizontal" spacing="sm" align="center">
                <MapPin />
                <Stack direction="vertical" spacing="xs">
                  <Text weight="medium">
                    {suggestion.structuredformatting?.maintext || suggestion.description}
                  </Text>
                  {suggestion.structuredformatting?.secondarytext && (
                    <Text size="sm" color="muted">
                      {suggestion.structuredformatting.secondarytext}
                    </Text>
                  )}
                </Stack>
              </Stack>
            </Button>
          ))}
        </Container>
      )}
    </Container>
  );
};

export { LocationAutocomplete }; 