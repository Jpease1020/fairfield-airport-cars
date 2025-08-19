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
  LoadingSpinner,
} from '@/ui';
import { Input, Label, Textarea } from '@/ui';
import { Booking } from '@/types/booking';
import { TipCalculator } from '@/components/business/TipCalculator';
import { useCMSData, getCMSField } from '@/design/hooks/useCMSData';
import { useInteractionMode } from '@/design/providers/InteractionModeProvider';

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

    let isCancelled = false;
    const checkPlaces = () => {
      if (isCancelled) return;
      if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps && (window as any).google.maps.places) {
        setIsLoaded(true);
        return;
      }
      // Stop retrying after 50 attempts (~5s)
      const attempts = Number((window as any).__gmapsAttempts || 0) + 1;
      (window as any).__gmapsAttempts = attempts;
      if (attempts > 50) {
        setIsError(true);
        return;
      }
      setTimeout(checkPlaces, 100);
    };

    // Avoid duplicate loads
    const existing = document.querySelector('script[data-gmaps="true"]') as any;
    if (existing) {
      checkPlaces();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-gmaps', 'true');

    script.onload = () => {
      checkPlaces();
    };

    script.onerror = () => {
      setIsError(true);
    };

    document.head.appendChild(script);

    return () => {
      isCancelled = true;
    };
  }, [apiKey]);

  return { isLoaded, isError };
};

function BookingFormContent({ booking }: BookingFormProps) {
  const { cmsData } = useCMSData();
  const { mode } = useInteractionMode();
  
  // Phase management (invisible to user)
  const [currentPhase, setCurrentPhase] = useState<'trip-details' | 'payment' | 'contact-info'>('trip-details');
  
  // Trip details phase
  const [pickupLocation, setPickupLocation] = useState(booking?.pickupLocation || '');
  const [dropoffLocation, setDropoffLocation] = useState(booking?.dropoffLocation || '');
  const [pickupDateTime, setPickupDateTime] = useState(booking?.pickupDateTime ? new Date(booking?.pickupDateTime).toISOString().slice(0, 16) : '');
  const [fareType, setFareType] = useState<'personal' | 'business'>('personal');
  const [flightInfo, setFlightInfo] = useState({
    airline: '',
    flightNumber: '',
    arrivalTime: '',
    terminal: ''
  });
  
  // Payment phase
  const [fare, setFare] = useState<number | null>(null);
  const [baseFare, setBaseFare] = useState<number | null>(null);
  const [tipAmount, setTipAmount] = useState(0);
  const [tipPercent, setTipPercent] = useState(15);
  
  // Contact info phase
  const [name, setName] = useState(booking?.name || '');
  const [email, setEmail] = useState(booking?.email || '');
  const [phone, setPhone] = useState(booking?.phone || '');
  const [notes, setNotes] = useState(booking?.notes || '');
  
  // Form state
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pickupSuggestions, setPickupSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);

  const { isLoaded: mapsLoaded, isError: mapsError } = useGoogleMapsScript(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '');

  const getPlacePredictions = async (input: string, callback: (_predictions: google.maps.places.AutocompletePrediction[]) => void) => {
    if (!mapsLoaded || typeof window === 'undefined' || !window.google) {
      callback([]);
      return;
    }

    try {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        {
          input,
          types: ['establishment', 'geocode'],
          componentRestrictions: { country: 'us' }
        },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            callback(predictions);
          } else {
            callback([]);
          }
        }
      );
    } catch (error) {
      console.error('Error getting place predictions:', error);
      callback([]);
    }
  };

  function debounce<T extends (..._args: Parameters<T>) => void>(func: T, delay: number) {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  const handlePickupInputChange = (value: string) => {
    setPickupLocation(value);
    setShowPickupSuggestions(value.length > 2);
    
    if (value.length > 2) {
      debounce(() => {
        getPlacePredictions(value, setPickupSuggestions);
      }, 300)();
    } else {
      setPickupSuggestions([]);
    }
  };

  const handleDropoffInputChange = (value: string) => {
    setDropoffLocation(value);
    setShowDropoffSuggestions(value.length > 2);
    
    if (value.length > 2) {
      debounce(() => {
        getPlacePredictions(value, setDropoffSuggestions);
      }, 300)();
    } else {
      setDropoffSuggestions([]);
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

  // Automatic fare calculation when trip details change
  const calculateFareAutomatically = async () => {
    if (!pickupLocation || !dropoffLocation || !pickupDateTime) {
      setFare(null);
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
          origin: pickupLocation,
          destination: dropoffLocation,
          pickupDateTime,
          fareType, // Pass fareType to the backend
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fare calculation failed:', response.status, errorText);
        throw new Error(`Failed to calculate fare: ${response.status}`);
      }

      const data = await response.json();
      setFare(data.fare);
      setBaseFare(data.baseFare); // Store base fare for tip calculation
    } catch (error) {
      console.error('Error calculating fare:', error);
      setError('Failed to calculate fare. Please try again.');
      setFare(null);
    } finally {
      setIsCalculating(false);
    }
  };

  // Auto-calculate fare when trip details change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateFareAutomatically();
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timeoutId);
  }, [pickupLocation, dropoffLocation, pickupDateTime, fareType]); // Add fareType to dependencies

  // Handle phase transitions
  const handleBookNow = () => {
    if (fare) {
      setCurrentPhase('payment');
    }
  };

  const handlePaymentComplete = () => {
    setCurrentPhase('contact-info');
  };

  const handleBackToTripDetails = () => {
    setCurrentPhase('trip-details');
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
          notes,
          fare,
          tipAmount,
          tipPercent,
          totalAmount: getTotalWithTip(),
          flightInfo,
          fareType, // Include fareType in the submission
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

  const getTotalFare = () => {
    if (!fare) return 0;
    return fare + tipAmount;
  };

  const getTotalWithTip = () => {
    return getTotalFare();
  };

  const handleTipChange = (amount: number, percent: number) => {
    setTipAmount(amount);
    setTipPercent(percent);
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
        <Stack spacing="xl" data-testid="booking-form-stack">
          
          {/* Error and Success Messages */}
          {error && (
            <StatusMessage 
              type="error" 
              message={error} 
              id="booking-error-message" 
              data-testid="booking-error-message" 
            />
          )}
          
          {success && (
            <StatusMessage 
              type="success" 
              message={success} 
              id="booking-success-message" 
              data-testid="booking-success-message" 
            />
          )}
          
          {/* Phase 1: Trip Details */}
          {currentPhase === 'trip-details' && (
            <>
              {/* Trip Details */}
              <Box variant="elevated" padding="lg">
                <Stack spacing="lg">
                  <H2 
                    align="center"
                    data-cms-id="pages.booking.tripDetails.title"
                    mode={mode}
                  >
                    {getCMSField(cmsData, 'pages.booking.tripDetails.title', 'Where & When?')}
                  </H2>
                  
                  <Grid cols={1} gap="md" responsive>
                    <GridItem>
                      <Stack spacing="sm">
                        <Label htmlFor="pickupLocation" data-cms-id="pages.booking.form.pickupLocation.label" mode={mode}>
                          {getCMSField(cmsData, 'pages.booking.form.pickupLocation.label', 'Pickup Location')}
                        </Label>
                        <Input
                          id="pickupLocation"
                          value={pickupLocation}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePickupInputChange(e.target.value)}
                          placeholder={getCMSField(cmsData, 'pages.booking.form.pickupLocation.placeholder', 'Enter pickup address')}
                          data-cms-id="pages.booking.form.pickupLocation.input"
                          fullWidth
                        />
                      </Stack>
                      {showPickupSuggestions && pickupSuggestions.length > 0 && (
                        <Box variant="outlined" padding="sm">
                          <Stack spacing="xs">
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
                    
                    <GridItem>
                      <Stack spacing="sm">
                        <Label htmlFor="dropoffLocation" data-cms-id="pages.booking.form.dropoffLocation.label" mode={mode}>
                          {getCMSField(cmsData, 'pages.booking.form.dropoffLocation.label', 'Dropoff Location')}
                        </Label>
                        <Input
                          id="dropoffLocation"
                          value={dropoffLocation}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDropoffInputChange(e.target.value)}
                          placeholder={getCMSField(cmsData, 'pages.booking.form.dropoffLocation.placeholder', 'Enter dropoff address')}
                          data-cms-id="pages.booking.form.dropoffLocation.input"
                          fullWidth
                        />
                      </Stack>
                      {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                        <Box variant="outlined" padding="sm">
                          <Stack spacing="xs">
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
                    
                    <GridItem>
                      <Stack spacing="sm">
                        <Label htmlFor="pickupDateTime" data-cms-id="pages.booking.form.pickupDateTime.label" mode={mode}>
                          {getCMSField(cmsData, 'pages.booking.form.pickupDateTime.label', 'Pickup Date & Time')}
                        </Label>
                        <Input
                          id="pickupDateTime"
                          type="datetime-local"
                          value={pickupDateTime}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPickupDateTime(e.target.value)}
                          data-cms-id="pages.booking.form.pickupDateTime.input"
                          fullWidth
                        />
                      </Stack>
                    </GridItem>
                  </Grid>
                </Stack>
              </Box>

              {/* Fare Type Selection */}
              <Box variant="elevated" padding="lg">
                <Stack spacing="lg">
                  <H2 align="center" data-cms-id="pages.booking.fareType.title" mode={mode}>
                    {getCMSField(cmsData, 'pages.booking.fareType.title', 'Fare Type')}
                  </H2>
                  <Grid cols={2} gap="md" responsive>
                    <GridItem>
                      <Button
                        onClick={() => setFareType('personal')}
                        variant={fareType === 'personal' ? 'primary' : 'outline'}
                        fullWidth
                      >
                        {getCMSField(cmsData, 'pages.booking.fareType.personal', 'Personal Ride')}
                      </Button>
                    </GridItem>
                    <GridItem>
                      <Button
                        onClick={() => setFareType('business')}
                        variant={fareType === 'business' ? 'primary' : 'outline'}
                        fullWidth
                      >
                        {getCMSField(cmsData, 'pages.booking.fareType.business', 'Business Ride')}
                      </Button>
                    </GridItem>
                  </Grid>
                </Stack>
              </Box>

              {/* Fare Type Selection */}
              <Box variant="elevated" padding="lg">
                <Stack spacing="lg">
                  <H2 
                    align="center"
                    data-cms-id="pages.booking.fareType.title"
                    mode={mode}
                  >
                    {getCMSField(cmsData, 'pages.booking.fareType.title', 'Fare Type')}
                  </H2>
                  
                  <Grid cols={2} gap="md" responsive>
                    <GridItem>
                      <Stack spacing="sm">
                        <Label htmlFor="personalFare" data-cms-id="pages.booking.form.personalFare.label" mode={mode}>
                          {getCMSField(cmsData, 'pages.booking.form.personalFare.label', 'Personal Ride')}
                        </Label>
                        <input
                          id="personalFare"
                          type="radio"
                          name="fareType"
                          checked={fareType === 'personal'}
                          onChange={() => setFareType('personal')}
                          data-cms-id="pages.booking.form.personalFare.input"
                        />
                        <Text size="sm" color="secondary" data-cms-id="pages.booking.form.personalFare.description" mode={mode}>
                          {getCMSField(cmsData, 'pages.booking.form.personalFare.description', 'Get 10% off our standard rate')}
                        </Text>
                      </Stack>
                    </GridItem>
                    
                    <GridItem>
                      <Stack spacing="sm">
                        <Label htmlFor="businessFare" data-cms-id="pages.booking.form.businessFare.label" mode={mode}>
                          {getCMSField(cmsData, 'pages.booking.form.businessFare.label', 'Business Ride')}
                        </Label>
                        <input
                          id="businessFare"
                          type="radio"
                          name="fareType"
                          checked={fareType === 'business'}
                          onChange={() => setFareType('business')}
                          data-cms-id="pages.booking.form.businessFare.input"
                        />
                        <Text size="sm" color="secondary" data-cms-id="pages.booking.form.businessFare.description" mode={mode}>
                          {getCMSField(cmsData, 'pages.booking.form.businessFare.description', 'Standard business rate')}
                        </Text>
                      </Stack>
                    </GridItem>
                  </Grid>
                </Stack>
              </Box>

              {/* Flight Information */}
              <Box variant="elevated" padding="lg">
                <Stack spacing="lg">
                  <H2 
                    align="center"
                    data-cms-id="pages.booking.flightInfo.title"
                    mode={mode}
                  >
                    {getCMSField(cmsData, 'pages.booking.flightInfo.title', 'Flight Information')}
                  </H2>
                  
                  <Grid cols={2} gap="md" responsive>
                    <GridItem>
                      <Stack spacing="sm">
                        <Label htmlFor="airline" data-cms-id="pages.booking.form.airline.label" mode={mode}>
                          {getCMSField(cmsData, 'pages.booking.form.airline.label', 'Airline')}
                        </Label>
                        <Input
                          id="airline"
                          value={flightInfo.airline}
                          onChange={(e) => setFlightInfo(prev => ({ ...prev, airline: e.target.value }))}
                          placeholder={getCMSField(cmsData, 'pages.booking.form.airline.placeholder', 'e.g., Delta Airlines')}
                          data-cms-id="pages.booking.form.airline.input"
                          fullWidth
                        />
                      </Stack>
                    </GridItem>
                    
                    <GridItem>
                      <Stack spacing="sm">
                        <Label htmlFor="flightNumber" data-cms-id="pages.booking.form.flightNumber.label" mode={mode}>
                          {getCMSField(cmsData, 'pages.booking.form.flightNumber.label', 'Flight Number')}
                        </Label>
                        <Input
                          id="flightNumber"
                          value={flightInfo.flightNumber}
                          onChange={(e) => setFlightInfo(prev => ({ ...prev, flightNumber: e.target.value }))}
                          placeholder={getCMSField(cmsData, 'pages.booking.form.flightNumber.placeholder', 'e.g., DL1234')}
                          data-cms-id="pages.booking.form.flightNumber.input"
                          fullWidth
                        />
                      </Stack>
                    </GridItem>
                    
                    <GridItem>
                      <Stack spacing="sm">
                        <Label htmlFor="arrivalTime" data-cms-id="pages.booking.form.arrivalTime.label" mode={mode}>
                          {getCMSField(cmsData, 'pages.booking.form.arrivalTime.label', 'Arrival Time')}
                        </Label>
                        <Input
                          id="arrivalTime"
                          type="text"
                          value={flightInfo.arrivalTime}
                          onChange={(e) => setFlightInfo(prev => ({ ...prev, arrivalTime: e.target.value }))}
                          placeholder={getCMSField(cmsData, 'pages.booking.form.arrivalTime.placeholder', 'HH:MM')}
                          data-cms-id="pages.booking.form.arrivalTime.input"
                          fullWidth
                        />
                      </Stack>
                    </GridItem>
                    
                    <GridItem>
                      <Stack spacing="sm">
                        <Label htmlFor="terminal" data-cms-id="pages.booking.form.terminal.label" mode={mode}>
                          {getCMSField(cmsData, 'pages.booking.form.terminal.label', 'Terminal')}
                        </Label>
                        <Input
                          id="terminal"
                          value={flightInfo.terminal}
                          onChange={(e) => setFlightInfo(prev => ({ ...prev, terminal: e.target.value }))}
                          placeholder={getCMSField(cmsData, 'pages.booking.form.terminal.placeholder', 'e.g., Terminal 1')}
                          data-cms-id="pages.booking.form.terminal.input"
                          fullWidth
                        />
                      </Stack>
                    </GridItem>
                  </Grid>
                </Stack>
              </Box>

              {/* Fare Display & Book Now */}
              <Box variant="elevated" padding="lg">
                <Stack spacing="lg">
                  <H2 
                    align="center"
                    data-cms-id="pages.booking.fare.title"
                    mode={mode}
                  >
                    {getCMSField(cmsData, 'pages.booking.fare.title', 'Your Fare')}
                  </H2>
                  
                  {/* Fare Display and Book Now Button */}
                  <Stack direction="horizontal" justify="space-between" align="center" fullWidth>
                    {/* Fare Display or Loading State */}
                    {fare ? (
                      <Box variant="outlined" padding="lg">
                        <Stack spacing="md" align="center">
                          <Text size="xl" weight="bold">
                            {getCMSField(cmsData, 'pages.booking.fare.amount', `$${fare.toFixed(2)}`)}
                          </Text>
                          {baseFare && fareType === 'personal' && baseFare > fare && (
                            <Text size="sm" color="secondary">
                              {getCMSField(cmsData, 'pages.booking.fare.discount', `Original: $${baseFare.toFixed(2)} - 10% discount applied!`)}
                            </Text>
                          )}
                          <Text size="sm" color="secondary">
                            {getCMSField(cmsData, 'pages.booking.fare.description', 'Estimated fare for your trip')}
                          </Text>
                        </Stack>
                      </Box>
                    ) : (pickupLocation && dropoffLocation && pickupDateTime) ? (
                      <Box variant="outlined" padding="md">
                        <Stack spacing="sm" align="center">
                          {isCalculating ? (
                            <>
                              <LoadingSpinner size="lg" />
                              <Text>{getCMSField(cmsData, 'pages.booking.form.calculating', 'Calculating your fare...')}</Text>
                            </>
                          ) : (
                            <Text>{getCMSField(cmsData, 'pages.booking.form.waiting', 'Calculating fare... Please wait a moment.')}</Text>
                          )}
                        </Stack>
                      </Box>
                    ) : (
                      <Text>Fare:</Text>
                    )}
                    
                    {/* Book Now Button */}
                    <Button
                      onClick={handleBookNow}
                      disabled={!fare || isCalculating}
                      variant="primary"
                      size="lg"
                    >
                      {getCMSField(cmsData, 'pages.booking.submit', 'Book Now')}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </>
          )}

          {/* Phase 2: Payment */}
          {currentPhase === 'payment' && (
            <>
              {/* Trip Summary */}
              <Box variant="elevated" padding="lg">
                <Stack spacing="lg">
                  <H2 align="center" data-cms-id="pages.booking.payment.tripSummary" mode={mode}>
                    {getCMSField(cmsData, 'pages.booking.payment.tripSummary', 'Trip Summary')}
                  </H2>
                  
                  <Box variant="outlined" padding="md">
                    <Stack spacing="sm">
                      <Stack direction="horizontal" justify="space-between">
                        <Text>From:</Text>
                        <Text weight="medium">{pickupLocation}</Text>
                      </Stack>
                      <Stack direction="horizontal" justify="space-between">
                        <Text>To:</Text>
                        <Text weight="medium">{dropoffLocation}</Text>
                      </Stack>
                      <Stack direction="horizontal" justify="space-between">
                        <Text>When:</Text>
                        <Text weight="medium">{new Date(pickupDateTime).toLocaleString()}</Text>
                      </Stack>
                      <Stack direction="horizontal" justify="space-between">
                        <Text weight="bold">Fare:</Text>
                        <Text weight="bold" size="lg">${fare?.toFixed(2)}</Text>
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              </Box>

              {/* Tip Calculator */}
              <Box variant="elevated" padding="lg">
                <Stack spacing="lg">
                  <H2 align="center" data-cms-id="pages.booking.payment.tip" mode={mode}>
                    {getCMSField(cmsData, 'pages.booking.payment.tip', 'Add a Tip')}
                  </H2>
                  
                  <TipCalculator
                    baseAmount={fare || 0}
                    onTipChange={handleTipChange}
                  />
                  
                  <Stack direction="horizontal" spacing="md">
                    <Button
                      onClick={handleBackToTripDetails}
                      variant="outline"
                      fullWidth
                    >
                      {getCMSField(cmsData, 'pages.booking.steps.back', 'Back')}
                    </Button>
                    
                    <Button
                      onClick={handlePaymentComplete}
                      variant="primary"
                      fullWidth
                    >
                      {getCMSField(cmsData, 'pages.booking.steps.continueToContact', 'Continue')}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </>
          )}

          {/* Phase 3: Contact Info & Special Requests */}
          {currentPhase === 'contact-info' && (
            <>
              {/* Contact Information */}
              <Box variant="elevated" padding="lg">
                <Stack spacing="lg">
                  <H2 
                    align="center"
                    data-cms-id="pages.booking.personalInfo.title"
                    mode={mode}
                  >
                    {getCMSField(cmsData, 'pages.booking.personalInfo.title', 'Contact Information')}
                  </H2>
                  
                  <Grid cols={1} gap="md" responsive>
                    <GridItem>
                      <Stack spacing="sm">
                        <Label htmlFor="name" data-cms-id="pages.booking.form.name.label" mode={mode}>
                          {getCMSField(cmsData, 'pages.booking.form.name.label', 'Full Name')}
                        </Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                          placeholder={getCMSField(cmsData, 'pages.booking.form.name.placeholder', 'Enter your full name')}
                          data-cms-id="pages.booking.form.name.input"
                          fullWidth
                        />
                      </Stack>
                    </GridItem>
                    
                    <GridItem>
                      <Stack spacing="sm">
                        <Label htmlFor="email" data-cms-id="pages.booking.form.email.label" mode={mode}>
                          {getCMSField(cmsData, 'pages.booking.form.email.label', 'Email Address')}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                          placeholder={getCMSField(cmsData, 'pages.booking.form.email.placeholder', 'Enter your email')}
                          data-cms-id="pages.booking.form.email.input"
                          fullWidth
                        />
                      </Stack>
                    </GridItem>
                    
                    <GridItem>
                      <Stack spacing="sm">
                        <Label htmlFor="phone" data-cms-id="pages.booking.form.phone.label" mode={mode}>
                          {getCMSField(cmsData, 'pages.booking.form.phone.label', 'Phone Number')}
                        </Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                          placeholder={getCMSField(cmsData, 'pages.booking.form.phone.placeholder', '(123) 456-7890')}
                          data-cms-id="pages.booking.form.phone.input"
                          fullWidth
                        />
                      </Stack>
                    </GridItem>
                  </Grid>
                </Stack>
              </Box>

              {/* Additional Notes */}
              <Box variant="elevated" padding="lg">
                <Stack spacing="lg">
                  <H2 
                    align="center"
                    data-cms-id="pages.booking.notes.title"
                    mode={mode}
                  >
                    {getCMSField(cmsData, 'pages.booking.notes.title', 'Additional Notes')}
                  </H2>
                  
                  <Grid cols={1} gap="md" responsive>
                    <GridItem>
                      <Stack spacing="sm">
                        <Label htmlFor="notes" data-cms-id="pages.booking.form.notes.label" mode={mode}>
                          {getCMSField(cmsData, 'pages.booking.form.notes.label', 'Special Instructions')}
                        </Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                          placeholder={getCMSField(cmsData, 'pages.booking.form.notes.placeholder', 'Any special instructions or requests...')}
                          rows={4}
                          data-cms-id="pages.booking.form.notes.textarea"
                          fullWidth
                        />
                      </Stack>
                    </GridItem>
                  </Grid>
                </Stack>
              </Box>

              {/* Final Submit */}
              <Box variant="elevated" padding="lg">
                <Stack spacing="lg">
                  <H2 align="center" data-cms-id="pages.booking.final.title" mode={mode}>
                    {getCMSField(cmsData, 'pages.booking.final.title', 'Complete Your Booking')}
                  </H2>
                  
                  <Box variant="outlined" padding="md">
                    <Stack spacing="sm">
                      <Text weight="bold" data-cms-id="pages.booking.final.breakdown.title" mode={mode}>
                        {getCMSField(cmsData, 'pages.booking.final.breakdown.title', 'Final Fare Breakdown')}
                      </Text>
                      <Stack spacing="xs">
                        <Stack direction="horizontal" justify="space-between">
                          <Text data-cms-id="pages.booking.fare.base.label" mode={mode}>
                            {getCMSField(cmsData, 'pages.booking.fare.base.label', 'Base Fare:')}
                          </Text>
                          <Text data-cms-id="pages.booking.fare.base.value" mode={mode}>
                            {getCMSField(cmsData, 'pages.booking.fare.base.value', `$${baseFare?.toFixed(2)}`)}
                          </Text>
                        </Stack>
                        <Stack direction="horizontal" justify="space-between">
                           <Text weight="bold" data-cms-id="pages.booking.fare.total.label" mode={mode}>
                            {getCMSField(cmsData, 'pages.booking.fare.total.label', 'Total:')}
                          </Text>
                          <Text weight="bold" data-cms-id="pages.booking.fare.total.value" mode={mode}>
                            {getCMSField(cmsData, 'pages.booking.fare.total.value', `$${getTotalFare().toFixed(2)}`)}
                          </Text>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Box>
                  
                  <Stack direction="horizontal" spacing="md">
                    <Button
                      onClick={() => setCurrentPhase('payment')}
                      variant="outline"
                      fullWidth
                    >
                      {getCMSField(cmsData, 'pages.booking.steps.back', 'Back')}
                    </Button>
                    
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      size="lg"
                    >
                      {getCMSField(cmsData, 'pages.booking.submit', 'Complete Booking')}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </>
          )}
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

