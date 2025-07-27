'use client';

import React, { useState, useEffect } from 'react';
import { 
  Form,
  Input,
  Select,
  Option,
  Textarea,
  Button,
  SettingSection,
  SettingInput,
  StatusMessage,
  ToastProvider,
  Text,
  Span,
  Container,
  Grid,
  GridItem,
  H3
} from '@/components/ui';
import { Stack } from '@/components/ui/containers';
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
    setShowPickupSuggestions(true);
    
    if (value.length > 2) {
      debounce(() => {
        getPlacePredictions(value, (predictions) => {
          setPickupSuggestions(predictions);
        });
      }, 300)();
    } else {
      setPickupSuggestions([]);
    }
  };

  const handleDropoffInputChange = (value: string) => {
    setDropoffLocation(value);
    setShowDropoffSuggestions(true);
    
    if (value.length > 2) {
      debounce(() => {
        getPlacePredictions(value, (predictions) => {
          setDropoffSuggestions(predictions);
        });
      }, 300)();
    } else {
      setDropoffSuggestions([]);
    }
  };

  const handlePickupSuggestionSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    setPickupLocation(prediction.description);
    setPickupSuggestions([]);
    setShowPickupSuggestions(false);
  };

  const handleDropoffSuggestionSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    setDropoffLocation(prediction.description);
    setDropoffSuggestions([]);
    setShowDropoffSuggestions(false);
  };

  const handleCalculateFare = async () => {
    if (!pickupLocation || !dropoffLocation || !pickupDateTime) {
      setError('Please fill in all required fields');
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
          flightNumber
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFare(data.fare);
        setSuccess('Fare calculated successfully');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to calculate fare');
      }
    } catch (error) {
      console.error('Error estimating fare:', error);
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
    <Container>
      {/* Google Maps Error */}
      {mapsError && (
        <Container>
          <Container>
            <Container>
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </Container>
            <Container>
              <H3>
                Location autocomplete temporarily unavailable
              </H3>
              <Container>
                <Text>You can still fill out the form manually. Location suggestions will be restored shortly.</Text>
              </Container>
            </Container>
          </Container>
        </Container>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <SettingSection
          title="Personal Information"
          description="Please provide your contact details for the booking"
          icon="👤"
        >
          <Grid columns={2} spacing="md">
            <GridItem>
              <SettingInput
                id="name"
                label="Full Name"
                description="Your complete name as it appears on ID"
                value={name}
                onChange={setName}
                placeholder="Enter your full name"
                icon="👤"
              />
            </GridItem>
            
            <GridItem>
              <SettingInput
                id="email"
                label="Email Address"
                description="We'll send your booking confirmation here"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="Enter your email"
                icon="✉️"
              />
            </GridItem>
          </Grid>
          
          <SettingInput
            id="phone"
            label="Phone Number"
            description="Your driver will contact you on this number"
            value={phone}
            onChange={setPhone}
            placeholder="(123) 456-7890"
            icon="📞"
          />
        </SettingSection>

        {/* Trip Details */}
        <SettingSection
          title="Trip Details"
          description="Tell us where you need to go and when"
          icon="🚗"
        >
          {/* Location Fields - Improved Layout */}
          <Grid columns={2} spacing="md">
            <GridItem>
              <SettingInput
                id="pickupLocation"
                label="Pickup Location"
                description="Where should we pick you up?"
                value={pickupLocation}
                onChange={handlePickupInputChange}
                placeholder="Enter pickup address"
                icon="📍"
              />
              {showPickupSuggestions && pickupSuggestions.length > 0 && (
                <Container>
                  {pickupSuggestions.map((prediction) => (
                    <button
                      key={prediction.place_id}
                      onClick={() => handlePickupSuggestionSelect(prediction)}
                      style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', padding: '8px' }}
                    >
                      <Stack>
                        <Span>
                          {prediction.structured_formatting?.main_text || prediction.description}
                        </Span>
                        <Span>
                          {prediction.structured_formatting?.secondary_text || ''}
                        </Span>
                      </Stack>
                    </button>
                  ))}
                </Container>
              )}
            </GridItem>
            
            <GridItem>
              <SettingInput
                id="dropoffLocation"
                label="Destination"
                description="Where are you going?"
                value={dropoffLocation}
                onChange={handleDropoffInputChange}
                placeholder="Enter destination address"
                icon="🎯"
              />
              {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                <Container>
                  {dropoffSuggestions.map((prediction) => (
                    <button
                      key={prediction.place_id}
                      onClick={() => handleDropoffSuggestionSelect(prediction)}
                      style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', padding: '8px' }}
                    >
                      <Stack>
                        <Span>
                          {prediction.structured_formatting?.main_text || prediction.description}
                        </Span>
                        <Span>
                          {prediction.structured_formatting?.secondary_text || ''}
                        </Span>
                      </Stack>
                    </button>
                  ))}
                </Container>
              )}
            </GridItem>
          </Grid>
          
          {/* Pickup Date and Time - Styled like SettingInput */}
          <Container>
            <Stack>
              <Span>📅</Span>
              <label 
                htmlFor="pickupDateTime"
              >
                Pickup Date and Time
              </label>
            </Stack>
            
            <Text>
              When do you need to be picked up?
            </Text>
            
            <Input
              id="pickupDateTime"
              name="pickupDateTime"
              type="datetime-local"
              value={pickupDateTime}
              onChange={(e) => setPickupDateTime(e.target.value)}
              required
            />
          </Container>
        </SettingSection>

        {/* Additional Details */}
        <SettingSection
          title="Additional Details"
          description="Help us provide the best service for your trip"
          icon="⚙️"
        >
          <Grid columns={2} spacing="md">
            <GridItem>
              {/* Passengers - Styled like SettingInput */}
              <Container>
                <Stack>
                  <Span>👥</Span>
                  <label 
                    htmlFor="passengers"
                  >
                    Passengers
                  </label>
                </Stack>
                
                <Text>
                  Number of people traveling
                </Text>
                
                <Select
                  id="passengers"
                  name="passengers"
                  value={passengers}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPassengers(Number(e.target.value))}
                  
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <Option key={num} value={num}>{num} passenger{num > 1 ? 's' : ''}</Option>
                  ))}
                </Select>
              </Container>
            </GridItem>
            
            <GridItem>
              <SettingInput
                id="flightNumber"
                label="Flight Number (Optional)"
                description="We'll track your flight for delays"
                value={flightNumber}
                onChange={setFlightNumber}
                placeholder="AA1234"
                icon="✈️"
              />
            </GridItem>
          </Grid>
            
            {/* Special Instructions - Styled like SettingInput */}
            <Container>
              <Stack>
                <Span>📝</Span>
                <label 
                  htmlFor="notes"
                >
                  Special Instructions (Optional)
                </label>
              </Stack>
              
              <Text>
                Let us know about any special requirements
              </Text>
              
              <Textarea
                id="notes"
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Any special instructions or requests?"

              />
            </Container>
        </SettingSection>

        {/* Action Buttons */}
        <SettingSection
          title="Book Your Ride"
          description="Calculate your fare and complete your booking"
          icon="💳"
        >
          <Container>
            <Button
              type="button"
              onClick={handleCalculateFare}
              disabled={isCalculating}
              loading={isCalculating}
              fullWidth
              size="lg"
            >
              {isCalculating ? (
                <>
                  <Span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </Span>
                  Calculating...
                </>
              ) : (
                'Calculate Fare'
              )}
            </Button>
            {fare && (
              <Container>
                <Text>
                  Estimated Fare: <Span>${fare}</Span>
                </Text>
              </Container>
            )}
          </Container>
          
          {fare && (
            <Button
              type="submit"
              disabled={!fare}
              loading={false} // isSubmitting is not defined in this component, so it's always false for now
              fullWidth
              size="lg"
              variant="primary"
            >
              🚗 Book Now - ${fare}
            </Button>
          )}
        </SettingSection>
        
        {error && (
          <StatusMessage 
            type="error" 
            message={error} 
            onDismiss={() => setError(null)}
          />
        )}
        
        {success && (
          <StatusMessage 
            type="success" 
            message={success} 
            onDismiss={() => setSuccess(null)}
          />
        )}
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
