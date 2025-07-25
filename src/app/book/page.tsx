'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StandardLayout } from '@/components/layout/StandardLayout';
import { BookingFormSkeleton } from '@/components/ui/skeleton';
import { calculateDynamicFare } from '@/lib/services/booking-service';

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  passengers: string;
  flightNumber: string;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function BookPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    pickupTime: '',
    passengers: '1',
    flightNumber: '',
    notes: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [fare, setFare] = useState<number | null>(null);
  const [dynamicFare, setDynamicFare] = useState<number | null>(null);
  const [isCalculatingFare, setIsCalculatingFare] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.pickupLocation.trim()) newErrors.pickupLocation = 'Pickup location is required';
    if (!formData.dropoffLocation.trim()) newErrors.dropoffLocation = 'Dropoff location is required';
    if (!formData.pickupDate) newErrors.pickupDate = 'Pickup date is required';
    if (!formData.pickupTime) newErrors.pickupTime = 'Pickup time is required';

    // Validate pickup date is not in the past
    const pickupDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
    if (pickupDateTime < new Date()) {
      newErrors.pickupDate = 'Pickup date and time must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate fare with dynamic pricing
  const calculateFare = async () => {
    if (!formData.pickupLocation || !formData.dropoffLocation) {
      setErrors({ pickupLocation: 'Please enter pickup and dropoff locations to calculate fare' });
      return;
    }

    setIsCalculatingFare(true);
    setShowSkeleton(true);
    
    try {
      const response = await fetch('/api/booking/estimate-fare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: formData.pickupLocation,
          destination: formData.dropoffLocation
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        const baseFare = data.fare;
        setFare(baseFare);
        
        // Calculate dynamic fare
        const pickupDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
        const dynamicFareAmount = calculateDynamicFare(baseFare, pickupDateTime, 0); // Distance will be calculated by API
        setDynamicFare(dynamicFareAmount);
        
        setErrors({});
      } else {
        setErrors({ fare: data.error || 'Failed to calculate fare' });
      }
    } catch {
      setErrors({ fare: 'Failed to calculate fare. Please try again.' });
    } finally {
      setIsCalculatingFare(false);
      setShowSkeleton(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setShowSkeleton(true);
    
    try {
      const pickupDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
      
      const bookingData = {
        ...formData,
        pickupDateTime: pickupDateTime.toISOString(),
        passengers: parseInt(formData.passengers),
        fare: dynamicFare || fare || 0,
        status: 'pending'
      };

      const response = await fetch('/api/booking/create-booking-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to success page with booking ID
        router.push(`/success?bookingId=${data.bookingId}`);
      } else {
        setErrors({ submit: data.error || 'Failed to create booking' });
      }
    } catch {
      setErrors({ submit: 'Failed to create booking. Please try again.' });
    } finally {
      setIsLoading(false);
      setShowSkeleton(false);
    }
  };

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Show skeleton while loading
  if (showSkeleton) {
    return (
      <StandardLayout 
        title="Book Your Airport Transfer"
        subtitle="Reserve your luxury airport transportation"
      >
        <div className="booking-content">
          <BookingFormSkeleton />
        </div>
      </StandardLayout>
    );
  }

  return (
    <StandardLayout 
      title="Book Your Airport Transfer"
      subtitle="Reserve your luxury airport transportation"
    >
      <div className="booking-content">
        <section className="booking-section">
          <h2>Book Your Ride</h2>
          <p>Fill out the form below to book your airport transportation.</p>
          
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input 
                  type="text" 
                  className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input 
                  type="email" 
                  className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input 
                  type="tel" 
                  className={`form-input ${errors.phone ? 'form-input-error' : ''}`}
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Flight Number</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Enter flight number (optional)"
                  value={formData.flightNumber}
                  onChange={(e) => handleInputChange('flightNumber', e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Pickup Location *</label>
                <input 
                  type="text" 
                  className={`form-input ${errors.pickupLocation ? 'form-input-error' : ''}`}
                  placeholder="Enter pickup address"
                  value={formData.pickupLocation}
                  onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                />
                {errors.pickupLocation && <span className="error-message">{errors.pickupLocation}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Dropoff Location *</label>
                <input 
                  type="text" 
                  className={`form-input ${errors.dropoffLocation ? 'form-input-error' : ''}`}
                  placeholder="Enter destination"
                  value={formData.dropoffLocation}
                  onChange={(e) => handleInputChange('dropoffLocation', e.target.value)}
                />
                {errors.dropoffLocation && <span className="error-message">{errors.dropoffLocation}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Pickup Date *</label>
                <input 
                  type="date" 
                  className={`form-input ${errors.pickupDate ? 'form-input-error' : ''}`}
                  value={formData.pickupDate}
                  onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.pickupDate && <span className="error-message">{errors.pickupDate}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Pickup Time *</label>
                <input 
                  type="time" 
                  className={`form-input ${errors.pickupTime ? 'form-input-error' : ''}`}
                  value={formData.pickupTime}
                  onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                />
                {errors.pickupTime && <span className="error-message">{errors.pickupTime}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Number of Passengers *</label>
                <select 
                  className={`form-input ${errors.passengers ? 'form-input-error' : ''}`}
                  value={formData.passengers}
                  onChange={(e) => handleInputChange('passengers', e.target.value)}
                >
                  <option value="1">1 Passenger</option>
                  <option value="2">2 Passengers</option>
                  <option value="3">3 Passengers</option>
                  <option value="4">4 Passengers</option>
                  <option value="5">5 Passengers</option>
                  <option value="6">6 Passengers</option>
                </select>
                {errors.passengers && <span className="error-message">{errors.passengers}</span>}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Special Instructions</label>
              <textarea 
                className="form-input form-textarea"
                placeholder="Any special requirements, luggage details, or additional notes..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </div>

            {/* Enhanced Fare Calculation Section */}
            {formData.pickupLocation && formData.dropoffLocation && (
              <div className="fare-section">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={calculateFare}
                  disabled={isCalculatingFare}
                >
                  {isCalculatingFare ? 'Calculating...' : 'Calculate Fare'}
                </button>
                
                {fare && (
                  <div className="fare-display">
                    <h3>Fare Breakdown:</h3>
                    <div className="fare-details">
                      <div className="fare-row">
                        <span>Base Fare:</span>
                        <span>${fare}</span>
                      </div>
                      {dynamicFare && dynamicFare !== fare && (
                        <div className="fare-row dynamic-fare">
                          <span>Dynamic Pricing:</span>
                          <span>${dynamicFare}</span>
                        </div>
                      )}
                      <div className="fare-row total">
                        <span>Total Fare:</span>
                        <span>${dynamicFare || fare}</span>
                      </div>
                    </div>
                    <p className="fare-note">* Final fare may vary based on traffic and route</p>
                  </div>
                )}
                
                {errors.fare && <span className="error-message">{errors.fare}</span>}
              </div>
            )}

            {errors.submit && (
              <div className="error-banner">
                <span className="error-message">{errors.submit}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Booking...' : 'Book Your Ride'}
            </button>
          </form>
        </section>
      </div>
    </StandardLayout>
  );
}
