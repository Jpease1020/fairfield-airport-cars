'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Booking } from '@/types/booking';
import { createBooking, updateBooking, isTimeSlotAvailable } from '@/lib/services/booking-service';
import { getSettings } from '@/lib/business/settings-service';
import { 
  StatusMessage,
  ToastProvider,
  useToast,
  SettingSection,
  SettingInput
} from '@/components/ui';
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

function BookingFormContent({ booking }: BookingFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
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
      addToast('error', bookingFormText?.errorCalculateBeforeBooking || "Please calculate the fare before booking.");
      return;
    }

    // Validate required fields
    if (!name || !email || !phone || !pickupLocation || !dropoffLocation || !pickupDateTime) {
      console.log('🔧 BookingForm - Missing required fields', { name, email, phone, pickupLocation, dropoffLocation, pickupDateTime });
      setError('Please fill in all required fields.');
      addToast('error', 'Please fill in all required fields.');
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
        const successMsg = bookingFormText?.successBookingUpdated || 'Booking updated successfully!';
        setSuccess(successMsg);
        addToast('success', successMsg);
        
        // Brief delay to show toast before redirect
        setTimeout(() => router.push(`/booking/${booking.id}`), 1500);
      } else {
        const finalBookingData = { ...bookingData, status: 'pending' as const };
        
        const bookingId = await createBooking(finalBookingData);
        console.log('🔧 BookingForm - Booking created successfully', bookingId);
        
        // 🔥 NEW: INTEGRATE SQUARE PAYMENT PROCESSING
        const depositAmount = Math.ceil((bookingData.depositAmount || 0) * 100); // Convert to cents
        const paymentDescription = `Deposit for airport ride from ${pickupLocation} to ${dropoffLocation}`;
        
        try {
          console.log('🔧 BookingForm - Creating Square payment session');
          const paymentResponse = await fetch('/api/payment/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId,
              amount: depositAmount,
              currency: 'USD',
              description: paymentDescription,
              buyerEmail: email
            }),
          });

          const paymentData = await paymentResponse.json();

          if (paymentResponse.ok && paymentData.paymentLinkUrl) {
            // Show success message and redirect to payment
            const successMsg = bookingFormText?.successBookingCreated || 'Booking created successfully! Redirecting to secure payment...';
            setSuccess(successMsg);
            addToast('success', successMsg);
            
            // Send confirmation SMS in background
            try {
              await fetch('/api/send-confirmation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId }),
              });
            } catch (smsError) {
              console.error('Failed to send SMS confirmation:', smsError);
              // Don't block payment flow for SMS failure
            }
            
            // Redirect to Square payment page
            console.log('🔧 BookingForm - Redirecting to payment:', paymentData.paymentLinkUrl);
            setTimeout(() => {
              window.location.href = paymentData.paymentLinkUrl;
            }, 2000);
          } else {
            throw new Error(paymentData.error || 'Failed to create payment session');
          }
        } catch (paymentError) {
          console.error('🔧 BookingForm - Payment creation failed:', paymentError);
          
          // Booking was created but payment failed - give user options
          setError('Booking created but payment setup failed. You can complete payment later.');
          addToast('warning', 'Booking saved! Please contact us to complete payment or try again later.');
          
          // Still redirect to booking page so they have their booking ID
          setTimeout(() => router.push(`/booking/${bookingId}`), 3000);
        }
      }
    } catch (error) {
      console.error('🔧 BookingForm - Error creating booking:', error);
      const errorMsg = isEditMode ? (bookingFormText?.errorUpdateBooking || 'Failed to update booking.') : (bookingFormText?.errorCreateBooking || 'Failed to create booking.');
      setError(errorMsg);
      addToast('error', errorMsg);
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
    <div className="">
      {loadError && (
        <div className="">
          <div className="">
            <div className="">
              <svg className="" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="">
              <h3 className="">
                Location autocomplete temporarily unavailable
              </h3>
              <div className="">
                <p>You can still fill out the form manually. Location suggestions will be restored shortly.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="">
        {/* Personal Information */}
        <SettingSection
          title="Personal Information"
          description="Please provide your contact details for the booking"
          icon="👤"
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--spacing-lg)'
          }}>
            <SettingInput
              id="name"
              label="Full Name"
              description="Your complete name as it appears on ID"
              value={name}
              onChange={setName}
              placeholder="Enter your full name"
              icon="👤"
            />
            
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
          </div>
          
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
          <div className="">
            <div className="">
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
                <div className="">
                  {pickupSuggestions.map((prediction) => (
                    <div
                      key={prediction.place_id}
                      className=""
                      onClick={() => handlePickupSuggestionSelect(prediction)}
                    >
                      <div className="">
                        {prediction.structured_formatting?.main_text || prediction.description}
                      </div>
                      <div className="">
                        {prediction.structured_formatting?.secondary_text || ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="relative">
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
                <div className="">
                  {dropoffSuggestions.map((prediction) => (
                    <div
                      key={prediction.place_id}
                      className=""
                      onClick={() => handleDropoffSuggestionSelect(prediction)}
                    >
                      <div className="">
                        {prediction.structured_formatting?.main_text || prediction.description}
                      </div>
                      <div className="">
                        {prediction.structured_formatting?.secondary_text || ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Pickup Date and Time - Styled like SettingInput */}
          <div style={{
            padding: 'var(--spacing-md) 0',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              marginBottom: 'var(--spacing-sm)'
            }}>
              <span style={{ fontSize: 'var(--font-size-sm)' }}>📅</span>
              <label 
                htmlFor="pickupDateTime"
                style={{
                  fontWeight: '500',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-primary)'
                }}
              >
                Pickup Date and Time
              </label>
            </div>
            
            <p style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-secondary)',
              margin: '0 0 var(--spacing-sm) 0',
              lineHeight: '1.4'
            }}>
              When do you need to be picked up?
            </p>
            
            <input
              id="pickupDateTime"
              name="pickupDateTime"
              type="datetime-local"
              value={pickupDateTime}
              onChange={(e) => setPickupDateTime(e.target.value)}
              required
              className="form-input"
              style={{ width: '100%' }}
            />
          </div>
        </SettingSection>

        {/* Additional Details */}
        <SettingSection
          title="Additional Details"
          description="Help us provide the best service for your trip"
          icon="⚙️"
        >
          <div className="">
            <div className="">
              {/* Passengers - Styled like SettingInput */}
              <div style={{
                padding: 'var(--spacing-md) 0',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  marginBottom: 'var(--spacing-sm)'
                }}>
                  <span style={{ fontSize: 'var(--font-size-sm)' }}>👥</span>
                  <label 
                    htmlFor="passengers"
                    style={{
                      fontWeight: '500',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    Passengers
                  </label>
                </div>
                
                <p style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--text-secondary)',
                  margin: '0 0 var(--spacing-sm) 0',
                  lineHeight: '1.4'
                }}>
                  Number of people traveling
                </p>
                
                <select
                  id="passengers"
                  name="passengers"
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                  className="form-input"
                  style={{ width: '100%' }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>{num} passenger{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              
              <SettingInput
                id="flightNumber"
                label="Flight Number (Optional)"
                description="We'll track your flight for delays"
                value={flightNumber}
                onChange={setFlightNumber}
                placeholder="AA1234"
                icon="✈️"
              />
            </div>
            
            {/* Special Instructions - Styled like SettingInput */}
            <div style={{
              padding: 'var(--spacing-md) 0',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-sm)',
                marginBottom: 'var(--spacing-sm)'
              }}>
                <span style={{ fontSize: 'var(--font-size-sm)' }}>📝</span>
                <label 
                  htmlFor="notes"
                  style={{
                    fontWeight: '500',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-primary)'
                  }}
                >
                  Special Instructions (Optional)
                </label>
              </div>
              
              <p style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-secondary)',
                margin: '0 0 var(--spacing-sm) 0',
                lineHeight: '1.4'
              }}>
                Let us know about any special requirements
              </p>
              
              <textarea
                id="notes"
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Any special instructions or requests?"
                className="form-input"
                style={{ 
                  width: '100%',
                  resize: 'vertical',
                  minHeight: '100px'
                }}
              />
            </div>
          </div>
        </SettingSection>

        {/* Action Buttons */}
        <SettingSection
          title="Book Your Ride"
          description="Calculate your fare and complete your booking"
          icon="💳"
        >
          <div className="">
            <button
              type="button"
              onClick={handleCalculateFare}
              disabled={isCalculating}
              className=""
            >
              {isCalculating ? (
                <span className="">
                  <svg className="" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Calculating...
                </span>
              ) : (
                'Calculate Fare'
              )}
            </button>
            {fare && (
              <div className="">
                <p className="">
                  Estimated Fare: <span className="">${fare}</span>
                </p>
              </div>
            )}
          </div>
          
          {fare && (
            <button
              type="submit"
              className=""
            >
              🚗 Book Now - ${fare}
            </button>
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
      </form>
    </div>
  );
}

export default function BookingForm(props: BookingFormProps) {
  return (
    <ToastProvider>
      <BookingFormContent {...props} />
    </ToastProvider>
  );
}
