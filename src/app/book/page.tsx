'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UniversalLayout } from '@/components/layout/UniversalLayout';
import { LayoutEnforcer } from '@/lib/design-system/LayoutEnforcer';
import { 
  GridSection,
  InfoCard,
  StatusMessage,
  ToastProvider,
  useToast,
  FeatureGrid
} from '@/components/ui';
import BookingForm from './booking-form';

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

function BookPageContent() {
  const { addToast } = useToast();
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast('error', 'Please fill in all required fields correctly');
      return;
    }
    
    setIsLoading(true);
    
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
        addToast('success', 'Booking created successfully!');
        // Redirect to success page with booking ID
        setTimeout(() => {
          router.push(`/success?bookingId=${data.bookingId}`);
        }, 1500);
      } else {
        setErrors({ submit: data.error || 'Failed to create booking' });
        addToast('error', data.error || 'Failed to create booking');
      }
    } catch (error) {
      setErrors({ submit: 'Failed to create booking. Please try again.' });
      addToast('error', 'Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // REFACTORED: Using structured feature data for FeatureGrid
  const features = [
    {
      icon: "⏰",
      title: "Always On Time",
      description: "We track your flight and traffic to ensure punctual service"
    },
    {
      icon: "🚗",
      title: "Premium Vehicles",
      description: "Clean, comfortable cars with professional drivers"
    },
    {
      icon: "💳",
      title: "Secure Payment",
      description: "Safe and secure online payment processing"
    }
  ];

  return (
    <LayoutEnforcer>
      <UniversalLayout 
        layoutType="standard"
        title="Book Your Airport Transfer"
        subtitle="Reserve your luxury airport transportation with professional drivers"
      >
        <GridSection variant="content" columns={1}>
          <InfoCard
            title="🚗 Book Your Ride"
            description="Complete the form below to reserve your airport transportation"
          >
            <BookingForm />
          </InfoCard>
        </GridSection>

        <GridSection variant="content" columns={1}>
          <InfoCard
            title="✨ Why Choose Us?"
            description="Professional service you can count on"
          >
            {/* REFACTORED: Using FeatureGrid instead of manual grid */}
            <FeatureGrid features={features} columns={3} />
          </InfoCard>
        </GridSection>

        {/* Error Display */}
        {errors.submit && (
          <GridSection variant="content" columns={1}>
            <StatusMessage 
              type="error" 
              message={errors.submit} 
              onDismiss={() => setErrors(prev => ({ ...prev, submit: '' }))}
            />
          </GridSection>
        )}
      </UniversalLayout>
    </LayoutEnforcer>
  );
}

export default function BookPage() {
  return (
    <ToastProvider>
      <BookPageContent />
    </ToastProvider>
  );
}
