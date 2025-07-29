'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Container, 
  Stack, 
  Card, 
  CardBody, 
  Grid, 
  GridItem,
  Text, 
  H2, 
  H3, 
  Span, 
  Button, 
  Input, 
  Select, 
  Option, 
  Label,
  StatusMessage,
  Form,
  SettingInput,
  EditableText,
  ToastProvider,
  EditableHeading
} from '@/components/ui';
import { Booking } from '@/types/booking';
import { WarningIcon, LoadingSpinnerIcon } from '@/components/ui/icons';

interface BookingFormProps {
  booking?: Booking;
}

const useGoogleMapsScript = (apiKey: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!apiKey) {
      setIsError(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    const checkPlaces = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsLoaded(true);
      } else {
        setTimeout(checkPlaces, 100);
      }
    };

    script.onload = () => {
      checkPlaces();
    };

    script.onerror = () => {
      setIsError(true);
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [apiKey]);

  return { isLoaded, isError };
};

function BookingFormContent({ booking }: BookingFormProps) {
  const [name, setName] = useState(booking?.name || '');
  const [email, setEmail] = useState(booking?.email || '');
  const [phone, setPhone] = useState(booking?.phone || '');
  const [pickupLocation, setPickupLocation] = useState(booking?.pickupLocation || '');
  const [dropoffLocation, setDropoffLocation] = useState(booking?.dropoffLocation || '');
  const [pickupDateTime, setPickupDateTime] = useState(booking?.pickupDateTime ? new Date(booking.pickupDateTime).toISOString().slice(0, 16) : '');
  const [passengers, setPassengers] = useState(booking?.passengers || 1);
  const [flightNumber, setFlightNumber] = useState(booking?.flightNumber || '');
  const [notes, setNotes] = useState(booking?.notes || '');
  const [fare, setFare] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pickupSuggestions, setPickupSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);

  const { isLoaded: mapsLoaded, isError: mapsError } = useGoogleMapsScript(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '');

  const getPlacePredictions = async (input: string, callback: (predictions: google.maps.places.AutocompletePrediction[]) => void) => {
    if (!mapsLoaded || !window.google) {
      callback([]);
      return;
    }

    const service = new window.google.maps.places.AutocompleteService();
    service.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: 'us' },
        types: ['establishment', 'geocode']
      },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          callback(predictions);
        } else {
          callback([]);
        }
      }
    );
  };

  function debounce<T extends (...args: Parameters<T>) => void>(func: T, delay: number) {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  const handlePickupInputChange = (value: string) => {
    setPickupLocation(value);
    setShowPickupSuggestions(false);
    
    if (value.length > 2) {
      const debouncedSearch = debounce(async (input: string) => {
        const predictions = await getPlacePredictions(input, (preds) => {
          setPickupSuggestions(preds);
          setShowPickupSuggestions(true);
        });
      }, 300);
      
      debouncedSearch(value);
    }
  };

  const handleDropoffInputChange = (value: string) => {
    setDropoffLocation(value);
    setShowDropoffSuggestions(false);
    
    if (value.length > 2) {
      const debouncedSearch = debounce(async (input: string) => {
        const predictions = await getPlacePredictions(input, (preds) => {
          setDropoffSuggestions(preds);
          setShowDropoffSuggestions(true);
        });
      }, 300);
      
      debouncedSearch(value);
    }
  };

  const handlePickupSuggestionSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    setPickupLocation(prediction.description);
    setShowPickupSuggestions(false);
  };

  const handleDropoffSuggestionSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    setDropoffLocation(prediction.description);
    setShowDropoffSuggestions(false);
  };

  const handleCalculateFare = async () => {
    if (!pickupLocation || !dropoffLocation || !pickupDateTime) {
      setError('Please fill in pickup location, dropoff location, and pickup time');
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const response = await fetch('/api/booking/estimate-fare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickupLocation,
          dropoffLocation,
          pickupDateTime,
          passengers
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFare(data.fare);
        setSuccess('Fare calculated successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to calculate fare');
      }
    } catch (error) {
      console.error('Error estimating fare:', error);
      setError('Error estimating fare. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fare) {
      setError('Please calculate fare before booking');
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          pickupLocation,
          dropoffLocation,
          pickupDateTime,
          passengers,
          flightNumber,
          notes,
          fare
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = `/success?bookingId=${data.bookingId}`;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      setIsCalculating(false);
    }
  };

  return (
    <Container padding="lg" maxWidth="xl" data-testid="booking-form-container">
      {/* Google Maps Error - Simplified */}
      {mapsError && (
        <StatusMessage 
          type="warning" 
          message="Location autocomplete is temporarily unavailable. You can still fill out the form manually."
          id="maps-error-message"
        />
      )}

      <Form onSubmit={handleSubmit} id="booking-form">
        {/* Single clean form container */}
        <Stack spacing="xl" gap="xl" data-testid="booking-form-stack" fullWidth>
          
          {/* Personal Information - Enhanced with card styling */}
          <Card variant="elevated" padding="lg" id="contact-information-card" fullWidth>
            <Stack spacing="lg" data-testid="contact-information-stack" fullWidth align="center" justify="center">
              <H2 style={{ color: 'var(--primary-color, #0B1F3A)' }} id="contact-information-title">
                <EditableText field="booking.personalInfo.title" defaultValue="Contact Information">
                  Contact Information
                </EditableText>
              </H2>
              
              <Grid cols={2} gap="lg" responsive data-testid="contact-information-grid">
                <GridItem data-testid="name-grid-item">
                  <SettingInput
                    id="name"
                    label="Full Name"
                    value={name}
                    onChange={setName}
                    placeholder="Enter your full name"
                    icon="👤"
                    data-testid="name-input"
                  />
                </GridItem>
                
                <GridItem data-testid="email-grid-item">
                  <SettingInput
                    id="email"
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="Enter your email"
                    icon="✉️"
                    data-testid="email-input"
                  />
                </GridItem>
              </Grid>
              
              <SettingInput
                id="phone"
                label="Phone Number"
                value={phone}
                onChange={setPhone}
                placeholder="(123) 456-7890"
                icon="📞"
                data-testid="phone-input"
              />
            </Stack>
          </Card>

          {/* Trip Details - Enhanced with card styling */}
          <Card variant="elevated" padding="lg" id="trip-details-card" fullWidth>
            <Stack spacing="lg" data-testid="trip-details-stack" fullWidth align="center" justify="center">
              <H2 style={{ color: 'var(--primary-color, #0B1F3A)' }} id="trip-details-title">
                <EditableText field="booking.tripDetails.title" defaultValue="Trip Details">
                  Trip Details
                </EditableText>
              </H2>
              
              <Grid cols={2} gap="lg" responsive data-testid="location-grid">
                <GridItem data-testid="pickup-location-grid-item">
                  <SettingInput
                    id="pickupLocation"
                    label="Pickup Location"
                    value={pickupLocation}
                    onChange={handlePickupInputChange}
                    placeholder="Enter pickup address"
                    icon="📍"
                    data-testid="pickup-location-input"
                  />
                  {showPickupSuggestions && pickupSuggestions.length > 0 && (
                    <Card variant="outlined" padding="sm" marginTop="sm" id="pickup-suggestions-card">
                      <Stack spacing="xs" data-testid="pickup-suggestions-stack">
                        {pickupSuggestions.map((prediction) => (
                          <Button
                            key={prediction.place_id}
                            variant="ghost"
                            onClick={() => handlePickupSuggestionSelect(prediction)}
                            data-testid="pickup-suggestion-button"
                          >
                            {prediction.description}
                          </Button>
                        ))}
                      </Stack>
                    </Card>
                  )}
                </GridItem>
                
                <GridItem data-testid="dropoff-location-grid-item">
                  <SettingInput
                    id="dropoffLocation"
                    label="Dropoff Location"
                    value={dropoffLocation}
                    onChange={handleDropoffInputChange}
                    placeholder="Enter dropoff address"
                    icon="🎯"
                    data-testid="dropoff-location-input"
                  />
                  {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                    <Card variant="outlined" padding="sm" marginTop="sm" id="dropoff-suggestions-card">
                      <Stack spacing="xs" data-testid="dropoff-suggestions-stack">
                        {dropoffSuggestions.map((prediction) => (
                          <Button
                            key={prediction.place_id}
                            variant="ghost"
                            onClick={() => handleDropoffSuggestionSelect(prediction)}
                            data-testid="dropoff-suggestion-button"
                          >
                            {prediction.description}
                          </Button>
                        ))}
                      </Stack>
                    </Card>
                  )}
                </GridItem>
              </Grid>
              
              <Grid cols={2} gap="lg" responsive data-testid="datetime-flight-grid">
                <GridItem data-testid="pickup-datetime-grid-item">
                  <Stack spacing="sm" data-testid="pickup-datetime-stack">
                    <Label htmlFor="pickupDateTime" id="pickup-datetime-label">Pickup Date & Time</Label>
                    <Input
                      id="pickupDateTime"
                      type="datetime-local"
                      value={pickupDateTime}
                      onChange={(e) => setPickupDateTime(e.target.value)}
                      required
                      data-testid="pickup-datetime-input"
                    />
                  </Stack>
                </GridItem>
                
                <GridItem data-testid="flight-number-grid-item">
                  <SettingInput
                    id="flightNumber"
                    label="Flight Number (Optional)"
                    value={flightNumber}
                    onChange={setFlightNumber}
                    placeholder="e.g., AA123"
                    icon="✈️"
                    data-testid="flight-number-input"
                  />
                </GridItem>
              </Grid>
            </Stack>
          </Card>

          {/* Additional Details - Enhanced with card styling */}
          <Card variant="elevated" padding="lg" id="additional-information-card" fullWidth>
            <Stack spacing="lg" data-testid="additional-information-stack" fullWidth align="center" justify="center">
              <H2 style={{ color: 'var(--primary-color, #0B1F3A)' }} id="additional-information-title">
                <EditableText field="booking.additionalDetails.title" defaultValue="Additional Information">
                  Additional Information
                </EditableText>
              </H2>
              
              <Grid cols={2} gap="lg" responsive data-testid="passengers-notes-grid">
                <GridItem data-testid="passengers-grid-item">
                  <Stack spacing="sm" data-testid="passengers-stack">
                    <Label htmlFor="passengers" id="passengers-label">Number of Passengers</Label>
                    <Select
                      id="passengers"
                      value={passengers.toString()}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPassengers(Number(e.target.value))}
                      data-testid="passengers-select"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <Option key={num} value={num.toString()} id={`passenger-option-${num}`}>{num} passenger{num > 1 ? 's' : ''}</Option>
                      ))}
                    </Select>
                  </Stack>
                </GridItem>
                
                <GridItem data-testid="notes-grid-item">
                  <SettingInput
                    id="notes"
                    label="Special Requests"
                    value={notes}
                    onChange={setNotes}
                    placeholder="Wheelchair, extra luggage, etc."
                    icon="💡"
                    data-testid="notes-input"
                  />
                </GridItem>
              </Grid>
            </Stack>
          </Card>

          {/* Fare Calculation - Enhanced styling */}
          {fare !== null && (
            <Card variant="elevated" padding="lg" data-testid="fare-section" id="fare-calculation-card" fullWidth>
              <Stack spacing="md" align="center" justify="center" data-testid="fare-calculation-stack" fullWidth>
                <H2 style={{ color: 'var(--primary-color, #0B1F3A)' }} id="fare-calculation-title">
                  <EditableText field="booking.fare.title" defaultValue="Estimated Fare">
                    Estimated Fare
                  </EditableText>
                </H2>
                <Text variant="lead" size="xl" style={{ color: 'var(--primary-color, #0B1F3A)', fontWeight: 'bold', fontSize: '2.5rem' }} id="fare-amount">
                  ${fare?.toFixed(2) || '0.00'}
                </Text>
              </Stack>
            </Card>
          )}

          {/* Error and Success Messages */}
          {error && (
            <StatusMessage type="error" message={error} id="error-message" />
          )}
          
          {success && (
            <StatusMessage type="success" message={success} id="success-message" />
          )}

          {/* Action Buttons - Enhanced styling */}
          <Card variant="elevated" padding="lg" id="action-buttons-card" fullWidth>
            <Stack direction="vertical" spacing="lg" gap="lg" align="center" justify="center" data-testid="action-buttons-stack" fullWidth>
              <Button
                type="button"
                onClick={handleCalculateFare}
                disabled={isCalculating || !pickupLocation || !dropoffLocation || !pickupDateTime}
                variant="outline"
                data-testid="calculate-fare-button"
                size="lg"
                fullWidth
              >
                {isCalculating ? (
                  <>
                    <LoadingSpinnerIcon />
                    <EditableText field="booking.calculatingButton" defaultValue="Calculating...">
                      Calculating...
                    </EditableText>
                  </>
                ) : (
                  <EditableText field="booking.calculateButton" defaultValue="Calculate Fare">
                    Calculate Fare
                  </EditableText>
                )}
              </Button>
              
              <Button
                type="submit"
                disabled={!name || !email || !phone || !pickupLocation || !dropoffLocation || !pickupDateTime || isCalculating}
                variant="primary"
                data-testid="book-now-button"
                size="lg"
                fullWidth
              >
                <EditableText field="booking.submitButton" defaultValue="Book Now">
                  Book Now
                </EditableText>
              </Button>
            </Stack>
          </Card>
        </Stack>
      </Form>
    </Container>
  );
}

export default function BookingForm(props: BookingFormProps) {
  return (
    <ToastProvider>
      <BookingFormContent {...props} />
    </ToastProvider>
  );
}
