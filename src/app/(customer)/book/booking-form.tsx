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
  EditableText,
} from '@/ui';
import { Input, Select, Label, Textarea } from '@/ui';
import { Booking } from '@/types/booking';
import { TipCalculator } from '@/components/business/TipCalculator';

interface BookingFormProps {
  booking?: Booking;
}

// Vehicle and service options
const VEHICLE_OPTIONS = [
  { value: 'sedan', label: 'Sedan', description: 'Comfortable 4-seater', price: 0 },
  { value: 'suv', label: 'SUV', description: 'Spacious 6-seater', price: 15 },
  { value: 'luxury', label: 'Luxury', description: 'Premium vehicle', price: 25 },
  { value: 'van', label: 'Van', description: 'Large group transport', price: 20 }
];

const SERVICE_LEVELS = [
  { value: 'standard', label: 'Standard', description: 'Reliable airport transfer', price: 0 },
  { value: 'premium', label: 'Premium', description: 'Enhanced service with amenities', price: 20 },
  { value: 'luxury', label: 'Luxury', description: 'Ultimate comfort experience', price: 40 }
];

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
  const [flightNumber] = useState(booking?.flightNumber || '');
  const [notes, setNotes] = useState(booking?.notes || '');
  const [fare, setFare] = useState<number | null>(null);
  const [tipAmount, setTipAmount] = useState(0);
  const [tipPercent, setTipPercent] = useState(18);
  const [isCalculating, setIsCalculating] = useState(false);
  const [_error, setError] = useState<string | null>(null);
  const [_success, setSuccess] = useState<string | null>(null);
  const [pickupSuggestions, setPickupSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);

  // Enhanced booking options
  const [selectedVehicle, setSelectedVehicle] = useState('sedan');
  const [selectedServiceLevel, setSelectedServiceLevel] = useState('standard');
  const [specialRequests, setSpecialRequests] = useState({
    childSeat: false,
    wheelchair: false,
    extraLuggage: false,
    meetAndGreet: false,
    flightTracking: false
  });
  const [flightInfo, setFlightInfo] = useState({
    airline: '',
    flightNumber: '',
    arrivalTime: '',
    terminal: ''
  });

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

  const handleCalculateFare = async () => {
    if (!pickupLocation || !dropoffLocation || !pickupDateTime) {
      setError('Please fill in pickup location, dropoff location, and pickup time to calculate fare');
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
          passengers,
          vehicleType: selectedVehicle,
          serviceLevel: selectedServiceLevel,
          specialRequests
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate fare');
      }

      const data = await response.json();
      setFare(data.fare);
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
          tipAmount,
          tipPercent,
          totalAmount: getTotalWithTip(),
          vehicleType: selectedVehicle,
          serviceLevel: selectedServiceLevel,
          specialRequests,
          flightInfo: specialRequests.flightTracking ? flightInfo : null
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

  const handleSpecialRequestChange = (request: string, checked: boolean) => {
    setSpecialRequests(prev => ({
      ...prev,
      [request]: checked
    }));
  };

  const getTotalFare = () => {
    if (!fare) return 0;
    const vehiclePrice = VEHICLE_OPTIONS.find(v => v.value === selectedVehicle)?.price || 0;
    const servicePrice = SERVICE_LEVELS.find(s => s.value === selectedServiceLevel)?.price || 0;
    return fare + vehiclePrice + servicePrice;
  };

  const getTotalWithTip = () => {
    return getTotalFare() + tipAmount;
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
          
          {/* Contact Information */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="lg">
              <H2 align="center">
                <EditableText field="booking.personalInfo.title" defaultValue="Contact Information">
                  Contact Information
                </EditableText>
              </H2>
              
              <Grid cols={1} gap="md" responsive>
                <GridItem>
                  <Stack spacing="sm">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      data-testid="name-input"
                      fullWidth
                    />
                  </Stack>
                </GridItem>
                
                <GridItem>
                  <Stack spacing="sm">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      data-testid="email-input"
                      fullWidth
                    />
                  </Stack>
                </GridItem>
                
                <GridItem>
                  <Stack spacing="sm">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                      placeholder="(123) 456-7890"
                      data-testid="phone-input"
                      fullWidth
                    />
                  </Stack>
                </GridItem>
              </Grid>
            </Stack>
          </Box>

          {/* Trip Details */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="lg">
              <H2 align="center">
                <EditableText field="booking.tripDetails.title" defaultValue="Trip Details">
                  Trip Details
                </EditableText>
              </H2>
              
              <Grid cols={1} gap="md" responsive>
                <GridItem>
                  <Stack spacing="sm">
                    <Label htmlFor="pickupLocation">Pickup Location</Label>
                    <Input
                      id="pickupLocation"
                      value={pickupLocation}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePickupInputChange(e.target.value)}
                      placeholder="Enter pickup address"
                      data-testid="pickup-location-input"
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
                    <Label htmlFor="dropoffLocation">Dropoff Location</Label>
                    <Input
                      id="dropoffLocation"
                      value={dropoffLocation}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDropoffInputChange(e.target.value)}
                      placeholder="Enter dropoff address"
                      data-testid="dropoff-location-input"
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
                    <Label htmlFor="pickupDateTime">Pickup Date & Time</Label>
                    <Input
                      id="pickupDateTime"
                      type="datetime-local"
                      value={pickupDateTime}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPickupDateTime(e.target.value)}
                      data-testid="pickup-datetime-input"
                      fullWidth
                    />
                  </Stack>
                </GridItem>
                
                <GridItem>
                  <Stack spacing="sm">
                    <Label htmlFor="passengers">Number of Passengers</Label>
                    <Select
                      id="passengers"
                      value={passengers.toString()}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPassengers(parseInt(e.target.value))}
                      data-testid="passengers-select"
                      fullWidth
                      options={[1, 2, 3, 4, 5, 6, 7, 8].map(num => ({
                        value: num.toString(),
                        label: `${num} ${num === 1 ? 'passenger' : 'passengers'}`
                      }))}
                    />
                  </Stack>
                </GridItem>
              </Grid>
            </Stack>
          </Box>

          {/* Vehicle & Service Selection */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="lg">
              <H2 align="center">
                <EditableText field="booking.vehicleService.title" defaultValue="Vehicle & Service Options">
                  Vehicle & Service Options
                </EditableText>
              </H2>
              
              <Grid cols={2} gap="lg" responsive>
                <GridItem>
                  <Stack spacing="md">
                    <Text weight="bold">Vehicle Type</Text>
                    {VEHICLE_OPTIONS.map((vehicle) => (
                      <Stack key={vehicle.value} direction="horizontal" align="center" spacing="sm">
                        <input
                          type="radio"
                          id={`vehicle-${vehicle.value}`}
                          name="vehicle"
                          value={vehicle.value}
                          checked={selectedVehicle === vehicle.value}
                          onChange={(e) => setSelectedVehicle(e.target.value)}
                        />
                        <Stack spacing="xs">
                          <Label htmlFor={`vehicle-${vehicle.value}`}>
                            {vehicle.label} {vehicle.price > 0 && `(+$${vehicle.price})`}
                          </Label>
                          <Text variant="muted" size="sm">{vehicle.description}</Text>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                </GridItem>
                
                <GridItem>
                  <Stack spacing="md">
                    <Text weight="bold">Service Level</Text>
                    {SERVICE_LEVELS.map((service) => (
                      <Stack key={service.value} direction="horizontal" align="center" spacing="sm">
                        <input
                          type="radio"
                          id={`service-${service.value}`}
                          name="service"
                          value={service.value}
                          checked={selectedServiceLevel === service.value}
                          onChange={(e) => setSelectedServiceLevel(e.target.value)}
                        />
                        <Stack spacing="xs">
                          <Label htmlFor={`service-${service.value}`}>
                            {service.label} {service.price > 0 && `(+$${service.price})`}
                          </Label>
                          <Text variant="muted" size="sm">{service.description}</Text>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                </GridItem>
              </Grid>
            </Stack>
          </Box>

          {/* Special Requests */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="lg">
              <H2 align="center">
                <EditableText field="booking.specialRequests.title" defaultValue="Special Requests">
                  Special Requests
                </EditableText>
              </H2>
              
              <Grid cols={2} gap="md" responsive>
                <GridItem>
                  <Stack spacing="sm">
                    <Stack direction="horizontal" align="center" spacing="sm">
                      <input
                        type="checkbox"
                        id="childSeat"
                        checked={specialRequests.childSeat}
                        onChange={(e) => handleSpecialRequestChange('childSeat', e.target.checked)}
                      />
                      <Label htmlFor="childSeat">Child Seat Required</Label>
                    </Stack>
                  </Stack>
                </GridItem>
                
                <GridItem>
                  <Stack spacing="sm">
                    <Stack direction="horizontal" align="center" spacing="sm">
                      <input
                        type="checkbox"
                        id="wheelchair"
                        checked={specialRequests.wheelchair}
                        onChange={(e) => handleSpecialRequestChange('wheelchair', e.target.checked)}
                      />
                      <Label htmlFor="wheelchair">Wheelchair Accessible</Label>
                    </Stack>
                  </Stack>
                </GridItem>
                
                <GridItem>
                  <Stack spacing="sm">
                    <Stack direction="horizontal" align="center" spacing="sm">
                      <input
                        type="checkbox"
                        id="extraLuggage"
                        checked={specialRequests.extraLuggage}
                        onChange={(e) => handleSpecialRequestChange('extraLuggage', e.target.checked)}
                      />
                      <Label htmlFor="extraLuggage">Extra Luggage Space</Label>
                    </Stack>
                  </Stack>
                </GridItem>
                
                <GridItem>
                  <Stack spacing="sm">
                    <Stack direction="horizontal" align="center" spacing="sm">
                      <input
                        type="checkbox"
                        id="meetAndGreet"
                        checked={specialRequests.meetAndGreet}
                        onChange={(e) => handleSpecialRequestChange('meetAndGreet', e.target.checked)}
                      />
                      <Label htmlFor="meetAndGreet">Meet & Greet Service</Label>
                    </Stack>
                  </Stack>
                </GridItem>
                
                <GridItem>
                  <Stack spacing="sm">
                    <Stack direction="horizontal" align="center" spacing="sm">
                      <input
                        type="checkbox"
                        id="flightTracking"
                        checked={specialRequests.flightTracking}
                        onChange={(e) => handleSpecialRequestChange('flightTracking', e.target.checked)}
                      />
                      <Label htmlFor="flightTracking">Flight Tracking</Label>
                    </Stack>
                  </Stack>
                </GridItem>
              </Grid>

              {/* Flight Information (if flight tracking is selected) */}
              {specialRequests.flightTracking && (
                <Box variant="outlined" padding="md">
                  <Stack spacing="md">
                    <Text weight="bold">Flight Information</Text>
                    <Grid cols={2} gap="md" responsive>
                      <GridItem>
                        <Stack spacing="sm">
                          <Label htmlFor="airline">Airline</Label>
                          <Input
                            id="airline"
                            value={flightInfo.airline}
                            onChange={(e) => setFlightInfo(prev => ({ ...prev, airline: e.target.value }))}
                            placeholder="e.g., Delta Airlines"
                            fullWidth
                          />
                        </Stack>
                      </GridItem>
                      
                      <GridItem>
                        <Stack spacing="sm">
                          <Label htmlFor="flightNumber">Flight Number</Label>
                          <Input
                            id="flightNumber"
                            value={flightInfo.flightNumber}
                            onChange={(e) => setFlightInfo(prev => ({ ...prev, flightNumber: e.target.value }))}
                            placeholder="e.g., DL1234"
                            fullWidth
                          />
                        </Stack>
                      </GridItem>
                      
                      <GridItem>
                        <Stack spacing="sm">
                          <Label htmlFor="arrivalTime">Arrival Time</Label>
                                                     <Input
                             id="arrivalTime"
                             type="text"
                             value={flightInfo.arrivalTime}
                             onChange={(e) => setFlightInfo(prev => ({ ...prev, arrivalTime: e.target.value }))}
                             placeholder="HH:MM"
                             fullWidth
                           />
                        </Stack>
                      </GridItem>
                      
                      <GridItem>
                        <Stack spacing="sm">
                          <Label htmlFor="terminal">Terminal</Label>
                          <Input
                            id="terminal"
                            value={flightInfo.terminal}
                            onChange={(e) => setFlightInfo(prev => ({ ...prev, terminal: e.target.value }))}
                            placeholder="e.g., Terminal 1"
                            fullWidth
                          />
                        </Stack>
                      </GridItem>
                    </Grid>
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Additional Notes */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="lg">
              <H2 align="center">
                <EditableText field="booking.notes.title" defaultValue="Additional Notes">
                  Additional Notes
                </EditableText>
              </H2>
              
              <Grid cols={1} gap="md" responsive>
                <GridItem>
                  <Stack spacing="sm">
                    <Label htmlFor="notes">Special Instructions</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                      placeholder="Any special instructions or requests..."
                      rows={4}
                      fullWidth
                    />
                  </Stack>
                </GridItem>
              </Grid>
            </Stack>
          </Box>

          {/* Fare Calculation & Submit */}
          <Box variant="elevated" padding="lg">
            <Stack spacing="lg">
              <H2 align="center">
                <EditableText field="booking.fare.title" defaultValue="Fare & Booking">
                  Fare & Booking
                </EditableText>
              </H2>
              
              <Stack spacing="md">
                {fare && (
                  <Box variant="outlined" padding="md">
                    <Stack spacing="sm">
                      <Text weight="bold">Estimated Fare Breakdown</Text>
                      <Stack spacing="xs">
                        <Stack direction="horizontal" justify="space-between">
                          <Text>Base Fare:</Text>
                          <Text>${fare.toFixed(2)}</Text>
                        </Stack>
                                                 {(() => {
                           const vehicle = VEHICLE_OPTIONS.find(v => v.value === selectedVehicle);
                           return vehicle && vehicle.price > 0 ? (
                             <Stack direction="horizontal" justify="space-between">
                               <Text>Vehicle Upgrade:</Text>
                               <Text>+${vehicle.price.toFixed(2)}</Text>
                             </Stack>
                           ) : null;
                         })()}
                         {(() => {
                           const service = SERVICE_LEVELS.find(s => s.value === selectedServiceLevel);
                           return service && service.price > 0 ? (
                             <Stack direction="horizontal" justify="space-between">
                               <Text>Service Level:</Text>
                               <Text>+${service.price.toFixed(2)}</Text>
                             </Stack>
                           ) : null;
                         })()}
                        <Stack direction="horizontal" justify="space-between">
                          <Text weight="bold">Total:</Text>
                          <Text weight="bold">${getTotalFare().toFixed(2)}</Text>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Box>
                )}

                {/* Tip Calculator */}
                {fare && (
                  <TipCalculator
                    baseAmount={getTotalFare()}
                    onTipChange={handleTipChange}
                  />
                )}
                
                <Stack direction="horizontal" spacing="md">
                  <Button
                    type="button"
                    onClick={handleCalculateFare}
                    disabled={isCalculating || !pickupLocation || !dropoffLocation || !pickupDateTime}
                    variant="outline"
                    fullWidth
                  >
                    {isCalculating ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Calculating...
                      </>
                    ) : (
                      'Calculate Fare'
                    )}
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={!fare || isCalculating}
                    variant="primary"
                    fullWidth
                  >
                    <EditableText field="booking.submit" defaultValue="Book Now">
                      Book Now
                    </EditableText>
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Box>
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
