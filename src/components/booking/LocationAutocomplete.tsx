import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/utils';
import { Container, Text, Span } from '@/components/ui';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    setSuggestions([]);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <Container className={className}>
      {label && (
        <Label htmlFor={fieldId}>
          {label}
          {required && <Span>*</Span>}
        </Label>
      )}
      
      <Container>
        <div>
          {isLoading && (
            <Loader2 />
          )}
          <input
            ref={inputRef}
            id={fieldId}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
          />
          {!isLoading && (
            <MapPin />
          )}
        </div>
        
        {error && (
          <Text size="sm">{error}</Text>
        )}
        
        {helperText && !error && (
          <Text size="sm">{helperText}</Text>
        )}
      </Container>

      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef}>
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div>
                <MapPin />
                <div>
                  <div>
                    {suggestion.structured_formatting?.main_text || suggestion.description}
                  </div>
                  {suggestion.structured_formatting?.secondary_text && (
                    <Text size="sm">
                      {suggestion.structured_formatting.secondary_text}
                    </Text>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>
      )}
    </Container>
  );
};

export { LocationAutocomplete }; 