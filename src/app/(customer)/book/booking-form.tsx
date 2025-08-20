'use client';

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Stack, 
  Box, 
  RadioButton,
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
  const [currentPhase, setCurrentPhase] = useState<'trip-details' | 'payment' | 'contact-info' | 'payment-processing'>('trip-details');
  
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
  const [depositAmount, setDepositAmount] = useState<number | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  // Contact info phase
  const [name, setName] = useState(booking?.name || '');
  const [email, setEmail] = useState(booking?.email || '');
  const [phone, setPhone] = useState(booking?.phone || '');
  const [notes, setNotes] = useState(booking?.notes || '');
  const [saveInfoForFuture, setSaveInfoForFuture] = useState(true);
  
  // Form state
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pickupSuggestions, setPickupSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);

  const { isLoaded: mapsLoaded, isError: mapsError } = useGoogleMapsScript(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '');

  // Calculate deposit amount when fare changes
  useEffect(() => {
    if (fare) {
      setDepositAmount(Math.round(fare * 0.2 * 100) / 100); // 20% deposit
    }
  }, [fare]);

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
  };

  const handleDropoffSuggestionSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    setDropoffLocation(prediction.description);
    setShowDropoffSuggestions(false);
  };

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

  const handleBackToPayment = () => {
    setCurrentPhase('payment');
  };

  // Process deposit payment
  const handleDepositPayment = async () => {
    if (!depositAmount || !fare) {
      setPaymentError('Invalid deposit amount');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      // Create a temporary booking for payment processing
      const tempBookingData = {
        name: name || 'Temporary',
        email: email || 'temp@example.com',
        phone: phone || '000-000-0000',
        pickupLocation,
        dropoffLocation,
        pickupDateTime,
        notes: notes || '',
        fare: fare + tipAmount,
        tipAmount,
        tipPercent,
        totalAmount: fare + tipAmount,
        flightInfo,
        fareType,
        saveInfoForFuture,
      };

      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tempBookingData),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking for payment');
      }

      const data = await response.json();
      
      if (data.paymentLinkUrl) {
        // Redirect to payment page
        window.location.href = data.paymentLinkUrl;
      } else {
        // If no payment link, proceed to contact info (for demo/testing)
        setCurrentPhase('contact-info');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setPaymentError('Failed to process payment. Please try again.');
    } finally {
      setIsProcessingPayment(false);
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
          notes,
          fare,
          tipAmount,
          tipPercent,
          totalAmount: getTotalWithTip(),
          flightInfo,
          fareType, // Include fareType in the submission
          saveInfoForFuture, // Include saveInfoForFuture in the submission
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
              <Container maxWidth="4xl" padding="xl">
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
          <Container maxWidth="5xl" padding="xl" data-testid="booking-form-container">
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
                <Stack spacing="lg" align="center">
                  <H2 
                    align="center"
                    data-cms-id="pages.booking.tripDetails.title"
                    mode={mode}
                  >
                    {getCMSField(cmsData, 'pages.booking.tripDetails.title', 'Where & When?')}
                  </H2>
                  
                  <Stack spacing="lg" align="center">
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
                    </Stack>
                    
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
                    </Stack>
                    
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
                  </Stack>
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
                  
                  <Stack direction={{ xs: 'vertical', md: 'horizontal' }} spacing="lg">
                    <RadioButton
                      id="personalFare"
                      name="fareType"
                      value="personal"
                      checked={fareType === 'personal'}
                      onChange={(value) => setFareType(value as 'personal' | 'business')}
                      label={getCMSField(cmsData, 'pages.booking.form.personalFare.label', 'Personal Ride')}
                      description={getCMSField(cmsData, 'pages.booking.form.personalFare.description', 'Get 10% off our standard rate')}
                      variant="elevated"
                      size="lg"
                    />
                    
                    <RadioButton
                      id="businessFare"
                      name="fareType"
                      value="business"
                      checked={fareType === 'business'}
                      onChange={(value) => setFareType(value as 'personal' | 'business')}
                      label={getCMSField(cmsData, 'pages.booking.form.businessFare.label', 'Business Ride')}
                      description={getCMSField(cmsData, 'pages.booking.form.businessFare.description', 'Standard business rate')}
                      variant="elevated"
                      size="lg"
                    />
                  </Stack>
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
                  
                  <Stack spacing="lg">
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

                  </Stack>
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
                        <Text weight="bold">Base Fare:</Text>
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
                  
                  <Stack direction="horizontal" justify="space-between">
                    <Text weight="bold">Total Amount:</Text>
                    <Text weight="bold" size="lg">${(fare || 0) + tipAmount}</Text>
                  </Stack>
                </Stack>
              </Box>

              {/* Deposit Information */}
              <Box variant="elevated" padding="lg">
                <Stack spacing="lg">
                  <H2 align="center" data-cms-id="pages.booking.payment.deposit" mode={mode}>
                    {getCMSField(cmsData, 'pages.booking.payment.deposit', 'Deposit Required')}
                  </H2>
                  
                  <Box variant="outlined" padding="md">
                    <Stack spacing="sm">
                      <Stack direction="horizontal" justify="space-between">
                        <Text>Total Trip Cost:</Text>
                        <Text weight="medium">${(fare || 0) + tipAmount}</Text>
                      </Stack>
                      <Stack direction="horizontal" justify="space-between">
                        <Text>Deposit (20%):</Text>
                        <Text weight="bold" size="lg" color="primary">${depositAmount?.toFixed(2)}</Text>
                      </Stack>
                      <Stack direction="horizontal" justify="space-between">
                        <Text>Balance Due:</Text>
                        <Text weight="medium">${((fare || 0) + tipAmount - (depositAmount || 0)).toFixed(2)}</Text>
                      </Stack>
                    </Stack>
                  </Box>
                  
                  <Text size="sm" color="secondary" align="center">
                    {getCMSField(cmsData, 'pages.booking.payment.depositNote', 'A 20% deposit is required to confirm your booking. The remaining balance will be due before your trip.')}
                  </Text>
                </Stack>
              </Box>

              {/* Payment Error */}
              {paymentError && (
                <StatusMessage 
                  type="error" 
                  message={paymentError} 
                  id="payment-error-message" 
                  data-testid="payment-error-message" 
                />
              )}

              {/* Navigation Buttons */}
              <Stack direction="horizontal" spacing="md">
                <Button
                  onClick={handleBackToTripDetails}
                  variant="outline"
                  fullWidth
                >
                  {getCMSField(cmsData, 'pages.booking.steps.back', 'Back')}
                </Button>
                
                <Button
                  onClick={handleDepositPayment}
                  variant="primary"
                  fullWidth
                  disabled={!depositAmount || isProcessingPayment}
                >
                  {isProcessingPayment ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Processing...
                    </>
                  ) : (
                    `Pay Deposit $${depositAmount?.toFixed(2)}`
                  )}
                </Button>
              </Stack>
            </>
          )}

          {/* Phase 2.5: Payment Processing */}
          {currentPhase === 'payment-processing' && (
            <Box variant="elevated" padding="xl">
              <Stack spacing="lg" align="center">
                <LoadingSpinner size="lg" />
                <H2 align="center">
                  {getCMSField(cmsData, 'pages.booking.payment.processing.title', 'Processing Payment...')}
                </H2>
                <Text align="center" color="secondary">
                  {getCMSField(cmsData, 'pages.booking.payment.processing.description', 'Please wait while we process your deposit payment. You will be redirected to the payment page shortly.')}
                </Text>
              </Stack>
            </Box>
          )}

          {/* Phase 3: Contact Info & Special Requests */}
          {currentPhase === 'contact-info' && (
            <>
              {/* Payment Status */}
              <Box variant="elevated" padding="lg">
                <Stack spacing="lg" align="center">
                  <Text size="lg" color="success" weight="bold">
                    ✅ {getCMSField(cmsData, 'pages.booking.payment.completed', 'Deposit Payment Completed!')}
                  </Text>
                  <Text align="center" color="secondary">
                    {getCMSField(cmsData, 'pages.booking.payment.completedNote', 'Your deposit has been processed. Please complete your contact information to finalize your booking.')}
                  </Text>
                </Stack>
              </Box>

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
                  
                  <Stack spacing="lg">
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

                    
                    <Stack spacing="sm">
                        <Label htmlFor="phone" data-cms-id="pages.booking.form.phone.label" mode={mode}>
                          {getCMSField(cmsData, 'pages.booking.form.phone.label', 'Phone Number')}
                        </Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                          placeholder={getCMSField(cmsData, 'pages.booking.form.phone.placeholder', 'Enter your phone number')}
                          data-cms-id="pages.booking.form.phone.input"
                          fullWidth
                        />
                      </Stack>

                    
                    <Stack spacing="sm">
                        <Label htmlFor="notes" data-cms-id="pages.booking.form.notes.label" mode={mode}>
                          {getCMSField(cmsData, 'pages.booking.form.notes.label', 'Special Requests')}
                        </Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                          placeholder={getCMSField(cmsData, 'pages.booking.form.notes.placeholder', 'Any special requests or notes for your driver')}
                          data-cms-id="pages.booking.form.notes.input"
                          rows={3}
                          fullWidth
                        />
                      </Stack>

                    
                    <Stack spacing="sm">
                        <Label htmlFor="flightInfo" data-cms-id="pages.booking.form.flightInfo.label" mode={mode}>
                          {getCMSField(cmsData, 'pages.booking.form.flightInfo.label', 'Flight Information (Optional)')}
                        </Label>
                        <Stack spacing="sm">
                          <Stack direction="horizontal" spacing="sm">
                            <Input
                              placeholder="Airline"
                              value={flightInfo.airline}
                              onChange={(e) => setFlightInfo(prev => ({ ...prev, airline: e.target.value }))}
                              data-cms-id="pages.booking.form.flightInfo.airline"
                            />
                            <Input
                              placeholder="Flight Number"
                              value={flightInfo.flightNumber}
                              onChange={(e) => setFlightInfo(prev => ({ ...prev, flightNumber: e.target.value }))}
                              data-cms-id="pages.booking.form.flightInfo.flightNumber"
                            />
                          </Stack>
                          <Stack direction="horizontal" spacing="sm">
                            <Input
                              placeholder="Arrival Time"
                              value={flightInfo.arrivalTime}
                              onChange={(e) => setFlightInfo(prev => ({ ...prev, arrivalTime: e.target.value }))}
                              data-cms-id="pages.booking.form.flightInfo.arrivalTime"
                            />
                            <Input
                              placeholder="Terminal"
                              value={flightInfo.terminal}
                              onChange={(e) => setFlightInfo(prev => ({ ...prev, terminal: e.target.value }))}
                              data-cms-id="pages.booking.form.flightInfo.terminal"
                            />
                          </Stack>
                        </Stack>
                      </Stack>

                    
                    <Stack spacing="sm">
                        <Label htmlFor="fareType" data-cms-id="pages.booking.form.fareType.label" mode={mode}>
                          {getCMSField(cmsData, 'pages.booking.form.fareType.label', 'Fare Type')}
                        </Label>
                        <Stack direction="horizontal" spacing="md">
                          <RadioButton
                            id="personal"
                            name="fareType"
                            value="personal"
                            checked={fareType === 'personal'}
                            onChange={(value) => setFareType(value as 'personal' | 'business')}
                            label={getCMSField(cmsData, 'pages.booking.form.fareType.personal', 'Personal')}
                          />
                          <RadioButton
                            id="business"
                            name="fareType"
                            value="business"
                            checked={fareType === 'business'}
                            onChange={(value) => setFareType(value as 'personal' | 'business')}
                            label={getCMSField(cmsData, 'pages.booking.form.fareType.business', 'Business')}
                          />
                        </Stack>
                      </Stack>

                    
                    <Stack spacing="sm">
                        <Label htmlFor="saveInfoForFuture" data-cms-id="pages.booking.form.saveInfoForFuture.label" mode={mode}>
                          {getCMSField(cmsData, 'pages.booking.form.saveInfoForFuture.label', 'Save Information')}
                        </Label>
                        <RadioButton
                          id="saveInfoForFuture"
                          name="saveInfoForFuture"
                          value="true"
                          checked={saveInfoForFuture}
                          onChange={(value) => setSaveInfoForFuture(value === 'true')}
                          label={getCMSField(cmsData, 'pages.booking.form.saveInfoForFuture.description', 'Save my information for future bookings')}
                        />
                      </Stack>
                  </Stack>
                </Stack>
              </Box>

              {/* Navigation Buttons */}
              <Stack direction="horizontal" spacing="md">
                <Button
                  onClick={handleBackToPayment}
                  variant="outline"
                  fullWidth
                >
                  {getCMSField(cmsData, 'pages.booking.steps.back', 'Back to Payment')}
                </Button>
                
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={!name || !email || !phone}
                >
                  {getCMSField(cmsData, 'pages.booking.submit', 'Complete Booking')}
                </Button>
              </Stack>
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

