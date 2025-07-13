import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationAutocompleteProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onSelect'> {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (prediction: google.maps.places.AutocompletePrediction) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

const LocationAutocomplete = React.forwardRef<HTMLInputElement, LocationAutocompleteProps>(
  ({ 
    className, 
    label, 
    placeholder = 'Enter location...',
    value, 
    onChange, 
    onSelect,
    error,
    helperText,
    required,
    disabled,
    loading,
    id,
    ...props 
  }, ref) => {
    const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const fieldId = id || `location-${label.toLowerCase().replace(/\s+/g, '-')}`;

    // Get place predictions using the API
    const getPlacePredictions = async (input: string) => {
      if (!input.trim()) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('/api/places-autocomplete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: input.trim() }),
        });

        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.predictions || []);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching place predictions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounced version to reduce API calls
    const debouncedGetPredictions = React.useCallback((input: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => getPlacePredictions(input), 300);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      onChange(newValue);
      setShowSuggestions(true);
      debouncedGetPredictions(newValue);
    };

    const handleSuggestionSelect = (prediction: google.maps.places.AutocompletePrediction) => {
      onChange(prediction.description);
      setSuggestions([]);
      setShowSuggestions(false);
      onSelect?.(prediction);
    };

    const handleInputFocus = () => {
      if (suggestions.length > 0) {
        setShowSuggestions(true);
      }
    };

    const handleInputBlur = () => {
      // Delay hiding suggestions to allow for clicks
      setTimeout(() => setShowSuggestions(false), 200);
    };

    // Close suggestions when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setShowSuggestions(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div ref={containerRef} className="relative">
        <div className="space-y-2">
          <Label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <div className="relative">
            <Input
              ref={ref}
              id={fieldId}
              type="text"
              value={value}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                'pr-10',
                error && 'border-red-500 focus-visible:ring-red-500',
                className
              )}
              {...props}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {isLoading || loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              ) : (
                <MapPin className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {helperText && !error && (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.place_id}
                type="button"
                className={cn(
                  'w-full px-4 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none',
                  index === 0 && 'rounded-t-md',
                  index === suggestions.length - 1 && 'rounded-b-md'
                )}
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {suggestion.structured_formatting?.main_text}
                    </div>
                    {suggestion.structured_formatting?.secondary_text && (
                      <div className="text-xs text-gray-500">
                        {suggestion.structured_formatting.secondary_text}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);
LocationAutocomplete.displayName = 'LocationAutocomplete';

export { LocationAutocomplete }; 