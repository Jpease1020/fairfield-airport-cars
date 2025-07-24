'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Booking } from '@/types/booking';
import { createBooking, updateBooking, isTimeSlotAvailable } from '@/lib/services/booking-service';
import { getSettings } from '@/lib/business/settings-service';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCMS } from '@/hooks/useCMS';
import { FormField } from '@/components/forms/FormField';

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
    // Load Google Maps with Places library
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
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

  const { isLoaded, loadError } = useGoogleMapsScript(process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '');

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
    } catch {
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
    console.log('🔧 BookingForm - Submit attempted', { fare, name, email, phone, pickupLocation, dropoffLocation });
    
    if (!fare) {
      console.log('🔧 BookingForm - No fare calculated');
      alert(bookingFormText?.errorCalculateBeforeBooking || "Please calculate the fare before booking.");
      return;
    }

    // Validate required fields
    if (!name || !email || !phone || !pickupLocation || !dropoffLocation || !pickupDateTime) {
      console.log('🔧 BookingForm - Missing required fields', { name, email, phone, pickupLocation, dropoffLocation, pickupDateTime });
      setError('Please fill in all required fields.');
      return;
    }

    const pickupDate = new Date(pickupDateTime);
    console.log('🔧 BookingForm - Checking time slot availability');
    
    try {
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

      console.log('🔧 BookingForm - Creating booking', bookingData);

      if (isEditMode && booking.id) {
        await updateBooking(booking.id, bookingData);
        setSuccess(bookingFormText?.successBookingUpdated || 'Booking updated successfully!');
        router.push(`/booking/${booking.id}`);
      } else {
        const finalBookingData = { ...bookingData, status: 'pending' as const };
        
        const bookingId = await createBooking(finalBookingData);
        console.log('🔧 BookingForm - Booking created successfully', bookingId);
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
    } catch (error) {
      console.error('🔧 BookingForm - Error creating booking:', error);
      setError(isEditMode ? (bookingFormText?.errorUpdateBooking || 'Failed to update booking.') : (bookingFormText?.errorCreateBooking || 'Failed to create booking.'));
    }
  };

  // Debug loading states
  console.log('🔧 BookingForm - Loading states:', { cmsLoading, isLoaded, loadError });
  
  // Don't wait for CMS loading - just show the form with default text
  // if (cmsLoading) return <div>{bookingFormText?.loading || 'Loading...'}</div>;
  
  // Show error but still allow form submission
  if (loadError) {
    console.warn('🔧 BookingForm - Google Maps load error:', loadError);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {loadError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Location autocomplete temporarily unavailable
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>You can still fill out the form manually. Location suggestions will be restored shortly.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label={bookingFormText?.fullNameLabel || 'Full Name'}
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Enter your full name"
        />
        <FormField
          label={bookingFormText?.emailLabel || 'Email Address'}
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
        />
      </div>
      <FormField
        label={bookingFormText?.phoneLabel || 'Phone Number'}
        id="phone"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        placeholder="(123) 456-7890"
      />
      <div>
        <label className="block mb-1 text-sm font-medium text-text-primary">{bookingFormText?.pickupLocationLabel || 'Pickup Location'}</label>
        <Input
          id="pickupLocation"
          ref={pickupInputRef}
          type="text"
          value={pickupLocation}
          onChange={(e) => handlePickupInputChange(e.target.value)}
          required
          placeholder="Enter pickup address"
          onBlur={() => setTimeout(() => setShowPickupSuggestions(false), 200)}
          onFocus={() => { if (pickupSuggestions.length > 0) setShowPickupSuggestions(true); }}
        />
        {showPickupSuggestions && pickupSuggestions.length > 0 && (
          <div className="autocomplete-dropdown absolute w-full mt-1 max-h-60 overflow-auto">
            {pickupSuggestions.map((prediction) => (
              <div
                key={prediction.place_id}
                className="suggestion-item"
                onClick={() => handlePickupSuggestionSelect(prediction)}
              >
                <div className="font-medium text-sm text-text-primary">
                  {prediction.structured_formatting?.main_text || prediction.description}
                </div>
                <div className="text-xs text-text-secondary">
                  {prediction.structured_formatting?.secondary_text || ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium text-text-primary">{bookingFormText?.dropoffLocationLabel || 'Dropoff Location'}</label>
        <Input
          id="dropoffLocation"
          ref={dropoffInputRef}
          type="text"
          value={dropoffLocation}
          onChange={(e) => handleDropoffInputChange(e.target.value)}
          required
          placeholder="Enter dropoff address"
          onBlur={() => setTimeout(() => setShowDropoffSuggestions(false), 200)}
          onFocus={() => { if (dropoffSuggestions.length > 0) setShowDropoffSuggestions(true); }}
        />
        {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
          <div className="autocomplete-dropdown absolute w-full mt-1 max-h-60 overflow-auto">
            {dropoffSuggestions.map((prediction) => (
              <div
                key={prediction.place_id}
                className="suggestion-item"
                onClick={() => handleDropoffSuggestionSelect(prediction)}
              >
                <div className="font-medium text-sm text-text-primary">
                  {prediction.structured_formatting?.main_text || prediction.description}
                </div>
                <div className="text-xs text-text-secondary">
                  {prediction.structured_formatting?.secondary_text || ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <FormField
        label={bookingFormText?.pickupDateTimeLabel || 'Pickup Date and Time'}
        id="pickupDateTime"
        type="datetime-local"
        value={pickupDateTime}
        onChange={(e) => setPickupDateTime(e.target.value)}
        required
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label={bookingFormText?.passengersLabel || 'Passengers'}
          id="passengers"
          type="number"
          min="1"
          value={passengers}
          onChange={(e) => setPassengers(Number(e.target.value))}
          required
        />
        <FormField
          label={bookingFormText?.flightNumberLabel || 'Flight Number (Optional)'}
          id="flightNumber"
          type="text"
          value={flightNumber}
          onChange={(e) => setFlightNumber(e.target.value)}
          placeholder="AA1234"
        />
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium text-text-primary">{bookingFormText?.notesLabel || 'Notes (Optional)'}</label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Any special instructions?"
        />
      </div>
      <div className="flex items-stretch gap-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleCalculateFare}
          disabled={isCalculating}
          className="flex-1 h-16"
        >
          {isCalculating ? (bookingFormText?.calculatingFareButton || 'Calculating...') : (bookingFormText?.calculateFareButton || 'Calculate Fare')}
        </Button>
        {fare && (
          <div className="flex-1 flex items-center justify-center h-16 bg-bg-secondary rounded-md">
            <p className="text-lg font-semibold">{bookingFormText?.estimatedFareLabel || 'Estimated Fare:'} <span className="text-info">${fare}</span></p>
          </div>
        )}
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={!fare || !name || !email || !phone || !pickupLocation || !dropoffLocation || !pickupDateTime}
        className="w-full py-4 text-lg font-semibold rounded-full shadow-lg hover:scale-105 transform transition-transform duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isEditMode ? (bookingFormText?.updateBookingButton || 'Update Booking') : (bookingFormText?.bookNowButton || 'Book Now')}
        {!fare && ' (Calculate fare first)'}
        {fare && (!name || !email || !phone || !pickupLocation || !dropoffLocation || !pickupDateTime) && ' (Fill required fields)'}
      </Button>
      {error && <p className="text-error text-center mt-4">{error}</p>}
      {success && <p className="text-success text-center mt-4">{success}</p>}
    </form>
  );
}
