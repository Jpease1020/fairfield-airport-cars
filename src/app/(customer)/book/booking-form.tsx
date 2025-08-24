'use client';

import React from 'react';
import { Container, Stack, Box, Button, Text, StatusMessage, Form, ToastProvider } from '@/ui';
import { useBookingForm } from '@/hooks/useBookingForm';
import { usePaymentProcessing } from '@/hooks/usePaymentProcessing';
import { TripDetailsPhase } from '@/components/booking/TripDetailsPhase';
import { ContactInfoPhase } from '@/components/booking/ContactInfoPhase';
import { PaymentPhase } from '@/components/booking/PaymentPhase';

interface BookingFormProps {
  booking?: any;
}

function BookingFormContent({ booking }: BookingFormProps) {
  const {
    // State
    currentPhase,
    showPaymentForm,
    bookingId,
    pickupLocation,
    dropoffLocation,
    pickupDateTime,
    fareType,
    flightInfo,
    fare,
    tipAmount,
    depositAmount,
    isProcessingPayment,
    paymentError,
    name,
    email,
    phone,
    notes,
    saveInfoForFuture,
    isCalculating,
    error,
    success,

    // Setters
    setPickupLocation,
    setDropoffLocation,
    setPickupDateTime,
    setFareType,
    setFlightInfo,
    setFare,
    setTipAmount,
    setPaymentError,
    setIsProcessingPayment,
    setName,
    setEmail,
    setPhone,
    setNotes,
    setSaveInfoForFuture,
    setIsCalculating,
    setError,
    setSuccess,
    setShowPaymentForm,
    setBookingId,

    // Actions
    handleTipChange,
    goToPhase,
    goToNextPhase,
    goToPreviousPhase,
    fillTestData,
  } = useBookingForm();

  // Payment processing hook
  const { createBooking, processPayment } = usePaymentProcessing(
    bookingId,
    depositAmount || 0,
    (result: any) => {
      console.log('Payment successful:', result);
      setSuccess('Payment processed successfully! Your booking is confirmed.');
    },
    (error: string) => {
      console.error('Payment error:', error);
      setPaymentError(error);
    }
  );

  // Store the payment processing function from SquarePaymentForm
  const [processPaymentFunction, setProcessPaymentFunction] = React.useState<(() => Promise<void>) | null>(null);

  // Handle booking creation
  const handleCreateBooking = async () => {
    try {
      const result = await createBooking({
        name,
        email,
        phone,
        pickupLocation,
        dropoffLocation,
        pickupDateTime,
        notes,
        fare,
        tipAmount,
        totalAmount: (fare || 0) + tipAmount,
        flightInfo,
        fareType,
        saveInfoForFuture,
      });

      if (result.success && result.bookingId) {
        setSuccess(result.message);
        setBookingId(result.bookingId);
        
        // Move to payment phase
        goToPhase('payment');
        
        // Delay showing payment form
        setTimeout(() => {
          setShowPaymentForm(true);
        }, 100);
      }
    } catch (error) {
      console.error('Booking creation error:', error);
      setError('Failed to create booking. Please try again.');
    }
  };

  // Handle payment processing
  const handleProcessPayment = async () => {
    try {
      setIsProcessingPayment(true);
      setError(null);
      
      // First collect the payment token from Square form
      if (!processPaymentFunction) {
        throw new Error('Payment system not ready. Please wait a moment and try again.');
      }
      
      console.log('🎯 Starting atomic booking + payment process...');
      
      // Process payment through SquarePaymentForm - this will create booking AND process payment
      await processPaymentFunction();
      
      console.log('✅ Atomic booking + payment completed successfully');
      
    } catch (error) {
      console.error('Atomic booking + payment failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to create booking and process payment. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Validation helpers
  const canProceedFromTripDetails = Boolean(pickupLocation && dropoffLocation && pickupDateTime && fare);
  const canProceedFromContactInfo = Boolean(name && email && phone);

  return (
    <Container maxWidth="7xl" padding="xl" data-testid="booking-form-container">
      {/* Test button for faster development */}
      <Stack spacing="md">
        <Button 
          onClick={fillTestData} 
          variant="outline"
          data-testid="fill-test-data-button"
        >
          🚀 Fill Test Data (Dev Only)
        </Button>
      </Stack>
      
      <Form onSubmit={(e) => e.preventDefault()} id="booking-form" data-testid="booking-form">
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
            <TripDetailsPhase
              pickupLocation={pickupLocation}
              dropoffLocation={dropoffLocation}
              pickupDateTime={pickupDateTime}
              fareType={fareType}
              flightInfo={flightInfo}
              fare={fare}
              isCalculating={isCalculating}
              setPickupLocation={setPickupLocation}
              setDropoffLocation={setDropoffLocation}
              setPickupDateTime={setPickupDateTime}
              setFareType={setFareType}
              setFlightInfo={setFlightInfo}
              setFare={setFare}
              setIsCalculating={setIsCalculating}
              goToNextPhase={goToNextPhase}
              fillTestData={fillTestData}
              canProceed={canProceedFromTripDetails}
            />
          )}

          {/* Phase 2: Contact Info Collection */}
          {currentPhase === 'contact-info' && (
            <ContactInfoPhase
              name={name}
              email={email}
              phone={phone}
              notes={notes}
              saveInfoForFuture={saveInfoForFuture}
              flightInfo={flightInfo}
              setName={setName}
              setEmail={setEmail}
              setPhone={setPhone}
              setNotes={setNotes}
              setSaveInfoForFuture={setSaveInfoForFuture}
              setFlightInfo={setFlightInfo}
              onBack={goToPreviousPhase}
              onContinue={goToNextPhase}
              canContinue={canProceedFromContactInfo}
            />
          )}

          {/* Phase 3: Payment */}
          {currentPhase === 'payment' && (
            <PaymentPhase
              pickupLocation={pickupLocation}
              dropoffLocation={dropoffLocation}
              pickupDateTime={pickupDateTime}
              fare={fare}
              tipAmount={tipAmount}
              depositAmount={depositAmount}
              bookingId={bookingId}
              isProcessingPayment={isProcessingPayment}
              paymentError={paymentError}
              showPaymentForm={showPaymentForm}
              onTipChange={handleTipChange}
              onBack={goToPreviousPhase}
              onPaymentSuccess={(result: any) => {
                console.log('Payment successful:', result);
                setSuccess('Payment processed successfully! Your booking is confirmed.');
                setIsProcessingPayment(false);
              }}
              onPaymentError={(error: string) => {
                console.error('Payment error:', error);
                setPaymentError(error);
                setIsProcessingPayment(false);
              }}
              onPaymentReady={(paymentFunction) => {
                // Use setTimeout to defer state update outside render cycle
                setTimeout(() => {
                  setProcessPaymentFunction(() => paymentFunction);
                }, 0);
              }}
              bookingData={{
                name,
                email,
                phone,
                pickupLocation,
                dropoffLocation,
                pickupDateTime,
                fare,
                flightNumber: flightInfo?.flightNumber || '',
                notes,
                tipAmount,
                totalAmount: (fare || 0) + tipAmount,
                flightInfo,
                fareType,
                saveInfoForFuture,
              }}
            />
          )}

          {/* Confirm Booking Button - Only show in payment phase */}
          {currentPhase === 'payment' && (
            <Box variant="elevated" padding="lg">
              <Stack spacing="md" align="center">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  disabled={!depositAmount || isProcessingPayment || !processPaymentFunction}
                  onClick={handleProcessPayment}
                  data-testid="confirm-booking-button"
                >
                  {isProcessingPayment ? 'Processing...' : 'Confirm Booking'}
                </Button>
                
                <Text size="sm" color="secondary" align="center">
                  Click to complete your deposit payment and confirm your booking
                </Text>
              </Stack>
            </Box>
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

