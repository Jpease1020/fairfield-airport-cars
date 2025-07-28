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
          <Stack direction="horizontal" spacing="md" align="center">
            <Container>
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </Container>
            <Container>
              <EditableHeading field="booking.mapsError.title" defaultValue="Location autocomplete temporarily unavailable">
                Location autocomplete temporarily unavailable
              </EditableHeading>
              <EditableText field="booking.mapsError.description" defaultValue="You can still fill out the form manually. Location suggestions will be restored shortly.">
                You can still fill out the form manually. Location suggestions will be restored shortly.
              </EditableText>
            </Container>
          </Stack>
        </Container>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <Container>
          <Stack spacing="lg">
            <Container>
              <Span>👤</Span>
              <EditableHeading field="booking.personalInfo.title" defaultValue="Personal Information">
                Personal Information
              </EditableHeading>
            </Container>
            <EditableText field="booking.personalInfo.description" defaultValue="Please provide your contact details for the booking">
              Please provide your contact details for the booking
            </EditableText>
            <Grid cols={2} gap="md">
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
          </Stack>
        </Container>

        {/* Trip Details */}
        <Container>
          <Stack spacing="lg">
            <Container>
              <Span>🚗</Span>
              <EditableHeading field="booking.tripDetails.title" defaultValue="Trip Details">
                Trip Details
              </EditableHeading>
            </Container>
            <EditableText field="booking.tripDetails.description" defaultValue="Tell us where you need to go and when">
              Tell us where you need to go and when
            </EditableText>
            {/* Location Fields - Improved Layout */}
            <Grid cols={2} gap="md">
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
                      <Button
                        key={prediction.place_id}
                        onClick={() => handlePickupSuggestionSelect(prediction)}
                        variant="ghost"
                        size="sm"
                        fullWidth
                      >
                        <Container>
                          <Span>
                            {prediction.structured_formatting?.main_text || prediction.description}
                          </Span>
                          <Span>
                            {prediction.structured_formatting?.secondary_text || ''}
                          </Span>
                        </Container>
                      </Button>
                    ))}
                  </Container>
                )}
              </GridItem>
              
              <GridItem>
                <SettingInput
                  id="dropoffLocation"
                  label="Dropoff Location"
                  description="Where should we take you?"
                  value={dropoffLocation}
                  onChange={handleDropoffInputChange}
                  placeholder="Enter destination address"
                  icon="🎯"
                />
                {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                  <Container>
                    {dropoffSuggestions.map((prediction) => (
                      <Button
                        key={prediction.place_id}
                        onClick={() => handleDropoffSuggestionSelect(prediction)}
                        variant="ghost"
                        size="sm"
                        fullWidth
                      >
                        <Container>
                          <Span>
                            {prediction.structured_formatting?.main_text || prediction.description}
                          </Span>
                          <Span>
                            {prediction.structured_formatting?.secondary_text || ''}
                          </Span>
                        </Container>
                      </Button>
                    ))}
                  </Container>
                )}
              </GridItem>
            </Grid>
            
            <Grid cols={2} gap="md">
              <GridItem>
                <Container>
                  <Stack>
                    <Span>📅</Span>
                    <Label htmlFor="pickupDate">Pickup Date</Label>
                  </Stack>
                  <EditableText field="booking.pickupDate.description" defaultValue="When do you need to be picked up?">
                    When do you need to be picked up?
                  </EditableText>
                  <Input
                    id="pickupDate"
                    type="date"
                    value={pickupDateTime.slice(0, 10)}
                    onChange={(e) => setPickupDateTime(e.target.value + 'T' + pickupDateTime.slice(11))}
                    required
                  />
                </Container>
              </GridItem>
              
              <GridItem>
                <Container>
                  <Stack>
                    <Span>⏰</Span>
                    <Label htmlFor="pickupTime">Pickup Time</Label>
                  </Stack>
                  <EditableText field="booking.pickupTime.description" defaultValue="What time should we pick you up?">
                    What time should we pick you up?
                  </EditableText>
                  <Input
                    id="pickupTime"
                    type="time"
                    value={pickupDateTime.slice(11)}
                    onChange={(e) => setPickupDateTime(pickupDateTime.slice(0, 11) + e.target.value)}
                    required
                  />
                </Container>
              </GridItem>
            </Grid>
          </Stack>
        </Container>

        {/* Additional Details */}
        <Container>
          <Stack spacing="lg">
            <Container>
              <Span>📝</Span>
              <EditableHeading field="booking.additionalDetails.title" defaultValue="Additional Details">
                Additional Details
              </EditableHeading>
            </Container>
            <EditableText field="booking.additionalDetails.description" defaultValue="Help us provide the best service for your trip">
              Help us provide the best service for your trip
            </EditableText>
            
            <Grid cols={2} gap="md">
              <GridItem>
                <Container>
                  <Stack>
                    <Span>👥</Span>
                    <Label htmlFor="passengers">Number of Passengers</Label>
                  </Stack>
                  <EditableText field="booking.passengers.description" defaultValue="How many people are traveling?">
                    How many people are traveling?
                  </EditableText>
                  <Select
                    id="passengers"
                    value={passengers.toString()}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPassengers(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <Option key={num} value={num.toString()}>{num} passenger{num > 1 ? 's' : ''}</Option>
                    ))}
                  </Select>
                </Container>
              </GridItem>
              
              <GridItem>
                <Container>
                  <Stack>
                    <Span>💡</Span>
                    <Label htmlFor="specialRequests">Special Requests</Label>
                  </Stack>
                  <EditableText field="booking.specialRequests.description" defaultValue="Any special requirements or requests?">
                    Any special requirements or requests?
                  </EditableText>
                  <Input
                    id="specialRequests"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Wheelchair, extra luggage, etc."
                  />
                </Container>
              </GridItem>
            </Grid>
          </Stack>
        </Container>

        {/* Action Section */}
        <Container>
          <Stack spacing="lg">
            <Container>
              <Span>💳</Span>
              <EditableHeading field="booking.actionSection.title" defaultValue="Book Your Ride">
                Book Your Ride
              </EditableHeading>
            </Container>
            <EditableText field="booking.actionSection.description" defaultValue="Calculate your fare and complete your booking">
              Calculate your fare and complete your booking
            </EditableText>
            
            {fare && (
              <Container>
                <Text>
                  Estimated Fare: <Span>${fare}</Span>
                </Text>
              </Container>
            )}
            
            <Button
              type="submit"
              disabled={isCalculating || !fare}
              loading={isCalculating}
              fullWidth
              size="lg"
              variant="primary"
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
                <>🚗 Book Now - ${fare}</>
              )}
            </Button>
          </Stack>
        </Container>
        
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
