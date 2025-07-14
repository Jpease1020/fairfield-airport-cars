'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Booking } from '@/types/booking';
import { createBooking, updateBooking, isTimeSlotAvailable } from '@/lib/booking-service';
import { getSettings } from '@/lib/settings-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCMS } from '@/hooks/useCMS';

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
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      const checkPlaces = () => {
        if (window.google?.maps?.places) {
          setIsLoaded(true);
        } else {
          setTimeout(checkPlaces, 100);
        }
      };
      
      existingScript.addEventListener('load', checkPlaces);
      existingScript.addEventListener('error', () => setLoadError('Failed to load Google Maps'));
      return;
    }

    const script = document.createElement('script');
    // Ensure Places library is explicitly loaded with loading=async for better performance
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    
    // Create global callback function
    const initCallback = () => {
      
      // Double-check that Places is available
      if (window.google?.maps?.places) {
        setIsLoaded(true);
      } else {
        setLoadError('Places library not available after load');
      }
      
      // Clean up the global callback
      delete (window as typeof window & { initGoogleMaps?: () => void }).initGoogleMaps;
    };
    
    (window as typeof window & { initGoogleMaps?: () => void }).initGoogleMaps = initCallback;
    
    script.onerror = () => {
      setLoadError('Failed to load Google Maps script');
      delete (window as typeof window & { initGoogleMaps?: () => void }).initGoogleMaps;
    };
    
    document.head.appendChild(script);
  }, [apiKey]);

  return { isLoaded, loadError };
};

export default function BookingForm({ booking }: BookingFormProps) {
  const router = useRouter();
  const { config: cmsConfig, loading: cmsLoading } = useCMS();
  const bookingFormText = cmsConfig?.bookingForm;
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
    if (!isLoaded) {
      return;
    }

    if (!window.google?.maps?.places) {
      return;
    }

  }, [isLoaded]);

  // Function to get address predictions using the new AutocompleteSuggestion API
  const getPlacePredictions = async (input: string, callback: (predictions: google.maps.places.AutocompletePrediction[]) => void) => {
    if (!window.google?.maps?.places || !input.trim()) {
      callback([]);
      return;
    }
    try {
      const response = await fetch(`/api/places-autocomplete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input.trim() }),
      });
      if (response.ok) {
        const data = await response.json();
        callback(data.predictions || []);
      } else {
        callback([]);
      }
    } catch (error) {
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
    setPickupLocation(value);
    if (value.length > 2) {
      debouncedGetPlacePredictions(value, (predictions) => {
        setPickupSuggestions(predictions);
        setShowPickupSuggestions(true);
      });
    } else {
      setShowPickupSuggestions(false);
    }
  };

  // Handle dropoff input change
  const handleDropoffInputChange = (value: string) => {
    setDropoffLocation(value);
    if (value.length > 2) {
      debouncedGetPlacePredictions(value, (predictions) => {
        setDropoffSuggestions(predictions);
        setShowDropoffSuggestions(true);
      });
    } else {
      setShowDropoffSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handlePickupSuggestionSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    setPickupLocation(prediction.description);
    setShowPickupSuggestions(false);
  };

  const handleDropoffSuggestionSelect = (prediction: google.maps.places.AutocompletePrediction) => {
    setDropoffLocation(prediction.description);
    setShowDropoffSuggestions(false);
  };

  const handleCalculateFare = async () => {
    const pickupValue = pickupInputRef.current?.value || '';
    const dropoffValue = dropoffInputRef.current?.value || '';
    
    if (pickupValue && !pickupLocation) {
      setPickupLocation(pickupValue);
    }
    
    if (dropoffValue && !dropoffLocation) {
      setDropoffLocation(dropoffValue);
    }

    const finalPickupLocation = pickupLocation || pickupValue;
    const finalDropoffLocation = dropoffLocation || dropoffValue;

    if (!finalPickupLocation || !finalDropoffLocation) {
      alert(bookingFormText?.errorEnterLocations || "Please enter both pickup and drop-off locations.");
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
      alert(bookingFormText?.errorCalculateFare || "Could not calculate fare. Please check the addresses.");
      setFare(null);
    }
    setIsCalculating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fare) {
      alert(bookingFormText?.errorCalculateBeforeBooking || "Please calculate the fare before booking.");
      return;
    }

    const pickupDate = new Date(pickupDateTime);
    const settings = await getSettings();
    const slotFree = await isTimeSlotAvailable(pickupDate, settings.bufferMinutes);
    if (!slotFree) {
      setError(bookingFormText?.errorTimeConflict || 'Selected time conflicts with another booking. Please choose a different time.');
      return;
    }

    const bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      email,
      phone,
      pickupLocation,
      dropoffLocation,
      pickupDateTime: pickupDate,
      passengers,
      flightNumber,
      notes,
      fare: fare!,
      status: 'pending',
      depositPaid: false,
      balanceDue: fare! * (1 - settings.depositPercent / 100),
      depositAmount: fare! * (settings.depositPercent / 100),
    };

    try {
      if (isEditMode && booking.id) {
        await updateBooking(booking.id, bookingData);
        setSuccess(bookingFormText?.successBookingUpdated || 'Booking updated successfully!');
        router.push(`/booking/${booking.id}`);
      } else {
        const finalBookingData = { ...bookingData, status: 'pending' as const };
        const bookingId = await createBooking(finalBookingData);
        setSuccess(bookingFormText?.successBookingCreated || 'Booking created successfully! Sending confirmation...');
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
      setError(isEditMode ? (bookingFormText?.errorUpdateBooking || 'Failed to update booking.') : (bookingFormText?.errorCreateBooking || 'Failed to create booking.'));
    }
  };

  if (cmsLoading) return <div>{bookingFormText?.loading || 'Loading...'}</div>;
  if (loadError) return <div>{bookingFormText?.errorLoadLocations || 'Could not load locations. Please try again later.'}</div>;
  if (!isLoaded) return <div>{bookingFormText?.loading || 'Loading...'}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">{bookingFormText?.fullNameLabel || 'Full Name'}</Label>
          <Input 
            id="name" 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            className="border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-lg h-12"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">{bookingFormText?.emailLabel || 'Email Address'}</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">{bookingFormText?.phoneLabel || 'Phone Number'}</Label>
        <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="pickupLocation">{bookingFormText?.pickupLocationLabel || 'Pickup Location'}</Label>
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
        <Label htmlFor="dropoffLocation">{bookingFormText?.dropoffLocationLabel || 'Dropoff Location'}</Label>
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
        <Label htmlFor="pickupDateTime">{bookingFormText?.pickupDateTimeLabel || 'Pickup Date and Time'}</Label>
        <Input id="pickupDateTime" type="datetime-local" value={pickupDateTime} onChange={(e) => setPickupDateTime(e.target.value)} required placeholder="MM/DD/YYYY, HH:MM AM/PM" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="passengers">{bookingFormText?.passengersLabel || 'Passengers'}</Label>
        <Input id="passengers" type="number" value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} min="1" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="flightNumber">{bookingFormText?.flightNumberLabel || 'Flight Number (Optional)'}</Label>
        <Input id="flightNumber" type="text" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="notes">{bookingFormText?.notesLabel || 'Notes (Optional)'}</Label>
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
          {isCalculating ? (bookingFormText?.calculatingFareButton || 'Calculating...') : (bookingFormText?.calculateFareButton || 'Calculate Fare')}
        </Button>
        {fare && (
          <div className="flex-1 flex items-center justify-center h-16 bg-gray-50 rounded-md">
            <p className="text-lg font-semibold">{bookingFormText?.estimatedFareLabel || 'Estimated Fare:'} <span className="text-blue-600">${fare}</span></p>
          </div>
        )}
      </div>
      <Button 
        type="submit" 
        disabled={!fare} 
        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isEditMode ? (bookingFormText?.updateBookingButton || 'Update Booking') : (bookingFormText?.bookNowButton || 'Book Now')}
      </Button>
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      {success && <p className="text-green-500 text-center mt-4">{success}</p>}
    </form>
  );
}
