'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Stack, 
  Box, 
  Grid, 
  GridItem,
  Text, 
  H2, 
  Button, 
  StatusMessage,
  Form,
  ToastProvider,
  LoadingSpinner
} from '@/ui';
import { Input, Select, Label } from '@/ui';
import { EditableText } from '@/ui';
import { Booking } from '@/types/booking';

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

    if (typeof document === 'undefined') return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    const checkPlaces = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps && window.google.maps.places) {
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
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
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
    if (!mapsLoaded || typeof window === 'undefined' || !window.google) {
      callback([]);
      return;
    }

    try {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        { input, componentRestrictions: { country: 'us' } },
        (predictions) => {
          callback(predictions || []);
        }
      );
    } catch (error) {
      console.error('Error getting place predictions:', error);
      callback([]);
    }
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
        const predictions = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve) => {
          getPlacePredictions(input, resolve);
        });
        setPickupSuggestions(predictions);
        setShowPickupSuggestions(true);
      }, 300);
      
      debouncedSearch(value);
    }
  };

  const handleDropoffInputChange = (value: string) => {
    setDropoffLocation(value);
    setShowDropoffSuggestions(false);
    
    if (value.length > 2) {
      const debouncedSearch = debounce(async (input: string) => {
        const predictions = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve) => {
          getPlacePredictions(input, resolve);
        });
        setDropoffSuggestions(predictions);
        setShowDropoffSuggestions(true);
      }, 300);
      
      debouncedSearch(value);
    }
  };

  const handlePickupSuggestionSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    setPickupLocation(prediction.description);
    setShowPickupSuggestions(false);
    setPickupSuggestions([]);
  };

  const handleDropoffSuggestionSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    setDropoffLocation(prediction.description);
    setShowDropoffSuggestions(false);
    setDropoffSuggestions([]);
  };

  const handleCalculateFare = async () => {
    if (!pickupLocation || !dropoffLocation || !pickupDateTime) {
      setError('Please fill in pickup and dropoff locations and pickup date/time');
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const response = await fetch('/api/estimate-fare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickupLocation,
          dropoffLocation,
          pickupDateTime,
          passengers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate fare');
      }

      const data = await response.json();
      setFare(data.fare);
      setSuccess('Fare calculated successfully!');
    } catch (error) {
      console.error('Error calculating fare:', error);
      setError('Failed to calculate fare. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !phone || !pickupLocation || !dropoffLocation || !pickupDateTime) {
      setError('Please fill in all required fields');
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
          fare,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const data = await response.json();
      setSuccess('Booking created successfully!');
      
      // Store booking ID in session storage for tracking
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('lastBookingId', data.bookingId);
      }
      
      // Redirect to booking status page
      if (typeof window !== 'undefined') {
        window.location.href = `/booking/${data.bookingId}`;
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking. Please try again.');
    }
  };

  if (mapsError) {
    return (
      <Container maxWidth="lg" padding="xl">
        <StatusMessage 
          type="error" 
          message="Failed to load Google Maps. Please refresh the page and try again." 
          id="maps-error-message" 
          data-testid="maps-error-message" 
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="2xl" padding="xl" data-testid="booking-form-container">
      <Form onSubmit={handleSubmit} id="booking-form" data-testid="booking-form">
        {/* Single clean form container */}
        <Stack spacing="xl" data-testid="booking-form-stack">
          
          {/* Personal Information - Enhanced with card styling */}
          <div>
            <Box variant="elevated" padding="lg" id="contact-information-card">
              <Stack spacing="lg" data-testid="contact-information-stack" align="center" justify="center">
              <H2 variant="primary" id="contact-information-title">
                <EditableText field="booking.personalInfo.title" defaultValue="Contact Information">
                  Contact Information
                </EditableText>
              </H2>
              
              <Grid cols={2} gap="lg" responsive data-testid="contact-information-grid">
                <GridItem data-testid="name-grid-item">
                  <Stack spacing="sm">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      data-testid="name-input"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </Stack>
                </GridItem>
                
                <GridItem data-testid="email-grid-item">
                  <Stack spacing="sm">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      data-testid="email-input"
                    />
                  </Stack>
                </GridItem>
              </Grid>
              
              <Stack spacing="sm">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                  placeholder="(123) 456-7890"
                  data-testid="phone-input"
                />
              </Stack>
            </Stack>
          </Box>
          </div>

          {/* Trip Details - Enhanced with card styling */}
          <div>
            <Box variant="elevated" padding="lg" id="trip-details-card">
            <Stack spacing="lg" data-testid="trip-details-stack" align="center" justify="center">
              <H2 variant="primary" id="trip-details-title">
                <EditableText field="booking.tripDetails.title" defaultValue="Trip Details">
                  Trip Details
                </EditableText>
              </H2>
              
              <Grid cols={2} gap="lg" responsive data-testid="location-grid">
                <GridItem data-testid="pickup-location-grid-item">
                  <Stack spacing="sm">
                    <Label htmlFor="pickupLocation">Pickup Location</Label>
                    <Input
                      id="pickupLocation"
                      value={pickupLocation}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePickupInputChange(e.target.value)}
                      placeholder="Enter pickup address"
                      data-testid="pickup-location-input"
                    />
                  </Stack>
                  {showPickupSuggestions && pickupSuggestions.length > 0 && (
                    <Box variant="outlined" padding="sm" id="pickup-suggestions-card">
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
                    </Box>
                  )}
                </GridItem>
                
                <GridItem data-testid="dropoff-location-grid-item">
                  <Stack spacing="sm">
                    <Label htmlFor="dropoffLocation">Dropoff Location</Label>
                    <Input
                      id="dropoffLocation"
                      value={dropoffLocation}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDropoffInputChange(e.target.value)}
                      placeholder="Enter dropoff address"
                      data-testid="dropoff-location-input"
                    />
                  </Stack>
                  {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                    <Box variant="outlined" padding="sm" id="dropoff-suggestions-card">
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
                    </Box>
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPickupDateTime(e.target.value)}
                      required
                      data-testid="pickup-datetime-input"
                    />
                  </Stack>
                </GridItem>
                
                <GridItem data-testid="flight-number-grid-item">
                  <Stack spacing="sm">
                    <Label htmlFor="flightNumber">Flight Number (Optional)</Label>
                    <Input
                      id="flightNumber"
                      value={flightNumber}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFlightNumber(e.target.value)}
                      placeholder="e.g., AA123"
                      data-testid="flight-number-input"
                    />
                  </Stack>
                </GridItem>
              </Grid>
            </Stack>
          </Box>
          </div>

          {/* Additional Details - Enhanced with card styling */}
          <div>
            <Box variant="elevated" padding="lg" id="additional-information-card">
            <Stack spacing="lg" data-testid="additional-information-stack" align="center" justify="center">
              <H2 variant="primary" id="additional-information-title">
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
                      options={[1, 2, 3, 4, 5, 6, 7, 8].map(num => ({
                        value: num.toString(),
                        label: `${num} passenger${num > 1 ? 's' : ''}`
                      }))}
                    />
                  </Stack>
                </GridItem>
                
                <GridItem data-testid="notes-grid-item">
                  <Stack spacing="sm">
                    <Label htmlFor="notes">Special Requests</Label>
                    <Input
                      id="notes"
                      value={notes}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
                      placeholder="Wheelchair, extra luggage, etc."
                      data-testid="notes-input"
                    />
                  </Stack>
                </GridItem>
              </Grid>
            </Stack>
          </Box>
          </div>

          {/* Fare Calculation - Enhanced styling */}
          {fare !== null && (
            <Box variant="elevated" padding="lg" data-testid="fare-section" id="fare-calculation-card">
              <Stack spacing="md" align="center" justify="center" data-testid="fare-calculation-stack">
                <H2 variant="primary" id="fare-calculation-title">
                  <EditableText field="booking.fare.title" defaultValue="Estimated Fare">
                    Estimated Fare
                  </EditableText>
                </H2>
                <Text 
                  variant="lead" 
                  size="xl" 
                  color="primary"
                  weight="bold"
                  id="fare-amount"
                  data-testid="fare-amount"
                >
                  ${fare?.toFixed(2) || '0.00'}
                </Text>
              </Stack>
            </Box>
          )}

          {/* Error and Success Messages */}
          {error && (
            <StatusMessage 
              type="error" 
              message={error} 
              id="error-message" 
              data-testid="error-message" 
            />
          )}
          
          {success && (
            <StatusMessage 
              type="success" 
              message={success} 
              id="success-message" 
              data-testid="success-message" 
            />
          )}

          {/* Action Buttons - Enhanced styling */}
          <div>
            <Box variant="elevated" padding="lg" id="action-buttons-card">
            <Stack direction="vertical" spacing="lg" align="center" justify="center" data-testid="action-buttons-stack">
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
                    <LoadingSpinner />
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
          </Box>
          </div>
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
