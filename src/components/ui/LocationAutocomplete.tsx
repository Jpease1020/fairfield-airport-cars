import React, { useState, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Container, Text, Span, Label } from '@/components/ui';
import { Stack } from '@/components/ui/layout/containers';
import { Button } from '@/components/ui/button';

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
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // State-based click outside detection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const isInputClick = target.closest('[data-autocomplete-input]');
      const isSuggestionClick = target.closest('[data-suggestions]');
      
      if (!isInputClick && !isSuggestionClick) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    if (isFocused || showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isFocused, showSuggestions]);

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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          transition: 'border-color 0.2s, box-shadow 0.2s'
        }}>
          {isLoading && <Loader2 style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} />}
          <input
            data-autocomplete-input
            id={fieldId}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            style={{
              flex: '1',
              border: '0',
              outline: 'none',
              backgroundColor: 'transparent'
            }}
          />
          {!isLoading && <MapPin style={{ width: '1rem', height: '1rem', color: '#9ca3af' }} />}
        </div>
        
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
                    {suggestion.structured_formatting?.main_text || suggestion.description}
                  </Text>
                  {suggestion.structured_formatting?.secondary_text && (
                    <Text size="sm" color="muted">
                      {suggestion.structured_formatting.secondary_text}
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