import React, { useState, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Container, Text, Span, Label } from '@/components/ui';
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
  className?: string;
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
  className,
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
      
      <Container>
        <Container>
          {isLoading && (
            <Loader2 />
          )}
          <input
            data-autocomplete-input
            id={fieldId}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
          />
          {!isLoading && (
            <MapPin />
          )}
        </Container>
        
        {error && (
          <Text size="sm">{error}</Text>
        )}
        
        {helperText && !error && (
          <Text size="sm">{helperText}</Text>
        )}
      </Container>

      {showSuggestions && suggestions.length > 0 && (
        <Container data-suggestions>
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <Container>
                <MapPin />
                <Container>
                  <Container>
                    {suggestion.structured_formatting?.main_text || suggestion.description}
                  </Container>
                  {suggestion.structured_formatting?.secondary_text && (
                    <Text size="sm">
                      {suggestion.structured_formatting.secondary_text}
                    </Text>
                  )}
                </Container>
              </Container>
            </Button>
          ))}
        </Container>
      )}
    </Container>
  );
};

export { LocationAutocomplete }; 