'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Booking } from '@/types/booking';
import { createBooking, updateBooking } from '@/lib/booking-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BookingFormProps {
  booking?: Booking;
}

// Custom hook to load Google Maps script
const useGoogleMapsScript = (apiKey: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if Google Maps is already loaded with Places
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log('Google Maps with Places already loaded');
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('Found existing Google Maps script, waiting for it to load');
      
      const checkPlaces = () => {
        if (window.google?.maps?.places) {
          console.log('Places library now available');
          setIsLoaded(true);
        } else {
          console.log('Still waiting for Places library...');
          setTimeout(checkPlaces, 100);
        }
      };
      
      existingScript.addEventListener('load', checkPlaces);
      existingScript.addEventListener('error', () => setLoadError('Failed to load Google Maps'));
      return;
    }

    console.log('Loading Google Maps API with Places library');
    const script = document.createElement('script');
    // Ensure Places library is explicitly loaded with loading=async for better performance
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    // Create global callback function
    const initCallback = () => {
      console.log('Google Maps API loaded via callback');
      
      // Double-check that Places is available
      if (window.google?.maps?.places) {
        console.log('Places library confirmed available');
        setIsLoaded(true);
      } else {
        console.error('Places library not available after load');
        setLoadError('Places library not available');
      }
      
      // Clean up the global callback
      delete (window as typeof window & { initGoogleMaps?: () => void }).initGoogleMaps;
    };
    
    (window as typeof window & { initGoogleMaps?: () => void }).initGoogleMaps = initCallback;
    
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
      setLoadError('Failed to load Google Maps');
      delete (window as typeof window & { initGoogleMaps?: () => void }).initGoogleMaps;
    };
    
    document.head.appendChild(script);
  }, [apiKey]);

  return { isLoaded, loadError };
};

export default function BookingForm({ booking }: BookingFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupDateTime, setPickupDateTime] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [flightNumber, setFlightNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [fare, setFare] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // State for custom autocomplete
  const [pickupSuggestions, setPickupSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);

  const pickupInputRef = useRef<HTMLInputElement>(null);
  const dropoffInputRef = useRef<HTMLInputElement>(null);

  const { isLoaded, loadError } = useGoogleMapsScript(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!);

  const isEditMode = booking !== undefined;

  useEffect(() => {
    if (isEditMode && booking) {
      setName(booking.name);
      setEmail(booking.email);
      setPhone(booking.phone);
      setPickupLocation(booking.pickupLocation);
      setDropoffLocation(booking.dropoffLocation);
      const date = new Date(booking.pickupDateTime);
      const formattedDate = date.toISOString().slice(0, 16);
      setPickupDateTime(formattedDate);
      setPassengers(booking.passengers);
      setFlightNumber(booking.flightNumber || '');
      setNotes(booking.notes || '');
      setFare(booking.fare);
    }
  }, [isEditMode, booking]);

  // Initialize AutocompleteSuggestion when Google Maps is loaded
  useEffect(() => {
    console.log('UseEffect for AutocompleteSuggestion triggered', {
      isLoaded,
      hasGoogle: !!window.google,
      hasMaps: !!window.google?.maps,
      hasPlaces: !!window.google?.maps?.places,
      hasAutocompleteSuggestion: !!window.google?.maps?.places?.AutocompleteSuggestion,
    });

    if (!isLoaded) {
      console.log('Google Maps not loaded yet');
      return;
    }

    if (!window.google?.maps?.places) {
      console.log('Google Maps Places library not available');
      return;
    }

    console.log('Google Maps and Places library ready for AutocompleteSuggestion');
  }, [isLoaded]);

  // Function to get address predictions using the new AutocompleteSuggestion API
  const getPlacePredictions = async (input: string, callback: (predictions: google.maps.places.AutocompletePrediction[]) => void) => {
    console.log('getPlacePredictions called with:', {
      input,
      hasPlaces: !!window.google?.maps?.places,
      inputTrimmed: input.trim(),
      inputLength: input.trim().length
    });

    if (!window.google?.maps?.places || !input.trim()) {
      console.log('No Google Maps Places or empty input');
      callback([]);
      return;
    }

    try {
      // Use the new AutocompleteSuggestion API
      console.log('Calling AutocompleteSuggestion API with input:', input.trim());
      
      // For now, let's try a fetch-based approach to the Places API (New)
      const response = await fetch(`/api/places-autocomplete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Got predictions from API:', data.predictions);
        console.log('First prediction structure:', data.predictions[0]);
        callback(data.predictions || []);
      } else {
        console.log('Places API request failed:', response.status);
        callback([]);
      }
    } catch (error) {
      console.error('Error calling Places API:', error);
      callback([]);
    }
  };

  // Debounced version to reduce API calls
  const debouncedGetPlacePredictions = useRef(
    debounce((input: string, callback: (predictions: google.maps.places.AutocompletePrediction[]) => void) => {
      getPlacePredictions(input, callback);
    }, 300)
  ).current;

  // Debounce utility function
  function debounce<T extends (...args: Parameters<T>) => void>(func: T, delay: number) {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  // Handle pickup input change
  const handlePickupInputChange = (value: string) => {
    console.log('Pickup input changed:', value);
    setPickupLocation(value);
    if (value.length > 2) {
      console.log('Getting predictions for pickup:', value);
      debouncedGetPlacePredictions(value, (predictions) => {
        console.log('Received predictions for pickup:', predictions);
        setPickupSuggestions(predictions);
        setShowPickupSuggestions(true);
      });
    } else {
      console.log('Input too short, hiding suggestions');
      setShowPickupSuggestions(false);
    }
  };

  // Handle dropoff input change
  const handleDropoffInputChange = (value: string) => {
    console.log('Dropoff input changed:', value);
    setDropoffLocation(value);
    if (value.length > 2) {
      console.log('Getting predictions for dropoff:', value);
      debouncedGetPlacePredictions(value, (predictions) => {
        console.log('Received predictions for dropoff:', predictions);
        setDropoffSuggestions(predictions);
        setShowDropoffSuggestions(true);
      });
    } else {
      console.log('Input too short, hiding suggestions');
      setShowDropoffSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handlePickupSuggestionSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    setPickupLocation(prediction.description);
    setShowPickupSuggestions(false);
    console.log('Selected pickup:', prediction.description);
  };

  const handleDropoffSuggestionSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    setDropoffLocation(prediction.description);
    setShowDropoffSuggestions(false);
    console.log('Selected dropoff:', prediction.description);
  };

  const handleCalculateFare = async () => {
    // Debug: Log current state values
    console.log('Calculate fare called with:', {
      pickupLocation,
      dropoffLocation,
      pickupInputValue: pickupInputRef.current?.value,
      dropoffInputValue: dropoffInputRef.current?.value,
    });

    // Try to sync state with input values if they're out of sync
    const pickupValue = pickupInputRef.current?.value || '';
    const dropoffValue = dropoffInputRef.current?.value || '';
    
    if (pickupValue && !pickupLocation) {
      console.log('Syncing pickup location from input value');
      setPickupLocation(pickupValue);
    }
    
    if (dropoffValue && !dropoffLocation) {
      console.log('Syncing dropoff location from input value');
      setDropoffLocation(dropoffValue);
    }

    // Use the actual values from inputs if state is empty
    const finalPickupLocation = pickupLocation || pickupValue;
    const finalDropoffLocation = dropoffLocation || dropoffValue;

    if (!finalPickupLocation || !finalDropoffLocation) {
      alert("Please enter both pickup and drop-off locations.");
      return;
    }
    
    setIsCalculating(true);
    const response = await fetch('/api/estimate-fare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: finalPickupLocation, destination: finalDropoffLocation }),
    });

    if (response.ok) {
      const data = await response.json();
      setFare(data.fare);
      // Update state with the final values used
      setPickupLocation(finalPickupLocation);
      setDropoffLocation(finalDropoffLocation);
    } else {
      alert("Could not calculate fare. Please check the addresses.");
      setFare(null);
    }
    setIsCalculating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fare) {
      alert("Please calculate the fare before booking.");
      return;
    }

    const bookingData = {
      name,
      email,
      phone,
      pickupLocation,
      dropoffLocation,
      pickupDateTime: new Date(pickupDateTime),
      passengers,
      flightNumber,
      notes,
      fare,
    };

    try {
      if (isEditMode && booking.id) {
        await updateBooking(booking.id, bookingData);
        setSuccess('Booking updated successfully!');
        router.push(`/booking/${booking.id}`);
      } else {
        const finalBookingData = { ...bookingData, status: 'pending' as const };
        const bookingId = await createBooking(finalBookingData);
        setSuccess('Booking created successfully! Sending confirmation...');
        try {
          await fetch('/api/send-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId }),
          });
        } catch (smsError) {
          console.error('Failed to send SMS confirmation:', smsError);
        }
        router.push(`/booking/${bookingId}`);
      }
    } catch {
      setError(isEditMode ? 'Failed to update booking.' : 'Failed to create booking.');
    }
  };

  if (loadError) return <div>Could not load locations. Please try again later.</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="pickupLocation">Pickup Location</Label>
        <div className="relative">
          <Input 
            id="pickupLocation" 
            ref={pickupInputRef}
            type="text" 
            value={pickupLocation}
            onChange={(e) => handlePickupInputChange(e.target.value)}
            onBlur={() => {
              // Delay hiding suggestions to allow clicking
              setTimeout(() => setShowPickupSuggestions(false), 200);
            }}
            onFocus={() => {
              if (pickupSuggestions.length > 0) {
                setShowPickupSuggestions(true);
              }
            }}
            required 
          />
          {showPickupSuggestions && pickupSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {pickupSuggestions.map((prediction) => (
                <div
                  key={prediction.place_id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                  onClick={() => handlePickupSuggestionSelect(prediction)}
                >
                  <div className="font-medium text-sm text-black">
                    {prediction.structured_formatting?.main_text || prediction.description}
                  </div>
                  <div className="text-xs text-gray-600">
                    {prediction.structured_formatting?.secondary_text || ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="dropoffLocation">Dropoff Location</Label>
        <div className="relative">
          <Input 
            id="dropoffLocation" 
            ref={dropoffInputRef}
            type="text" 
            value={dropoffLocation}
            onChange={(e) => handleDropoffInputChange(e.target.value)}
            onBlur={() => {
              // Delay hiding suggestions to allow clicking
              setTimeout(() => setShowDropoffSuggestions(false), 200);
            }}
            onFocus={() => {
              if (dropoffSuggestions.length > 0) {
                setShowDropoffSuggestions(true);
              }
            }}
            required 
          />
          {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {dropoffSuggestions.map((prediction) => (
                <div
                  key={prediction.place_id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                  onClick={() => handleDropoffSuggestionSelect(prediction)}
                >
                  <div className="font-medium text-sm text-black">
                    {prediction.structured_formatting?.main_text || prediction.description}
                  </div>
                  <div className="text-xs text-gray-600">
                    {prediction.structured_formatting?.secondary_text || ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="pickupDateTime">Pickup Date and Time</Label>
        <Input id="pickupDateTime" type="datetime-local" value={pickupDateTime} onChange={(e) => setPickupDateTime(e.target.value)} required placeholder="MM/DD/YYYY, HH:MM AM/PM" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="passengers">Passengers</Label>
        <Input id="passengers" type="number" value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} min="1" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="flightNumber">Flight Number (Optional)</Label>
        <Input id="flightNumber" type="text" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="bg-white" />
      </div>
      <div className="flex items-stretch gap-4">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={handleCalculateFare} 
          disabled={isCalculating}
          className="flex-1 h-16 text-sm"
        >
          {isCalculating ? 'Calculating...' : 'Calculate Fare'}
        </Button>
        {fare && (
          <div className="flex-1 flex items-center justify-center h-16 bg-gray-50 rounded-md">
            <p className="text-lg font-semibold">Estimated Fare: <span className="text-indigo-600">${fare}</span></p>
          </div>
        )}
      </div>
      <Button type="submit" disabled={!fare} className="w-full">
        {isEditMode ? 'Update Booking' : 'Book Now'}
      </Button>
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      {success && <p className="text-green-500 text-center mt-4">{success}</p>}
    </form>
  );
}
