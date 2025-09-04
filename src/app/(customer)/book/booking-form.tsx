'use client';

import React, { useState } from 'react';
import { Container, Stack, Box, Button, Text, StatusMessage, Form, ToastProvider } from '@/ui';
import { useBookingForm } from '@/hooks/useBookingForm';
import { usePaymentProcessing } from '@/hooks/usePaymentProcessing';
import { TripDetailsPhase } from '@/components/booking/TripDetailsPhase';
import { ContactInfoPhase } from '@/components/booking/ContactInfoPhase';
import { PaymentPhase } from '@/components/booking/PaymentPhase';

interface BookingFormProps {
  booking?: any;
  cmsData: any;
}

function BookingFormContent({ booking, cmsData }: BookingFormProps) {
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
    baseFare,
    tipAmount,
    tipPercent,
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
    setBaseFare,
    setTipAmount,
    setTipPercent,
    setDepositAmount,
    setIsProcessingPayment,
    setPaymentError,
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

    // Computed values
    getTotalFare,
    calculateDeposit,

    // Actions
    handleTipChange,
    goToPhase,
    goToNextPhase,
    goToPreviousPhase,
    resetForm,
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

  // State for successful booking
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const [completedBookingId, setCompletedBookingId] = useState<string | null>(null);

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
      
      // Mark booking as complete
      setIsBookingComplete(true);
      
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
              canProceed={canProceedFromTripDetails}
              cmsData={cmsData}
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
              cmsData={cmsData}
            />
          )}

          {/* Phase 3: Payment */}
          {currentPhase === 'payment' && !isBookingComplete && (
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
                setCompletedBookingId(result.bookingId || 'unknown');
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
              cmsData={cmsData}
            />
          )}

          {/* Success Confirmation Page */}
          {isBookingComplete && (
            <Box variant="elevated" padding="xl" data-testid="booking-success-confirmation">
              <Stack spacing="xl" align="center">
                <Text size="3xl" weight="bold" color="success" cmsId="booking-confirmed-title">
                  {cmsData?.['booking-confirmed-title'] || 'Booking Confirmed!'}
                </Text>
                
                                  <Text size="lg" align="center" cmsId="booking-confirmed-description">
                  {cmsData?.['booking-confirmed-description'] || `Your ride from ${pickupLocation} to ${dropoffLocation} is confirmed!`}
                </Text>

                <Box variant="outlined" padding="lg" data-testid="booking-details-summary">
                  <Stack spacing="md">
                    <Stack direction="horizontal" justify="space-between">
                      <Text weight="medium" cmsId="booking-detail-pickup">{cmsData?.['booking-detail-pickup'] || 'Pickup Location:'}</Text>
                      <Text cmsId="pickup-location-value">{pickupLocation}</Text>
                    </Stack>
                    <Stack direction="horizontal" justify="space-between">
                      <Text weight="medium" cmsId="booking-detail-dropoff">{cmsData?.['booking-detail-dropoff'] || 'Dropoff Location:'}</Text>
                      <Text cmsId="dropoff-location-value">{dropoffLocation}</Text>
                    </Stack>
                    <Stack direction="horizontal" justify="space-between">
                      <Text weight="medium" cmsId="booking-detail-datetime">{cmsData?.['booking-detail-datetime'] || 'Date & Time:'}</Text>
                      <Text cmsId="datetime-value">{new Date(pickupDateTime).toLocaleString()}</Text>
                    </Stack>
                    <Stack direction="horizontal" justify="space-between">
                      <Text weight="medium" cmsId="booking-detail-total">{cmsData?.['booking-detail-total'] || 'Total Fare:'}</Text>
                      <Text weight="bold" color="primary" cmsId="total-fare-value">${(fare || 0) + tipAmount}</Text>
                    </Stack>
                    <Stack direction="horizontal" justify="space-between">
                      <Text weight="medium" cmsId="booking-detail-deposit">{cmsData?.['booking-detail-deposit'] || 'Deposit Paid:'}</Text>
                      <Text color="success" cmsId="deposit-amount-value">${depositAmount?.toFixed(2)}</Text>
                    </Stack>
                  </Stack>
                </Box>

                <Stack spacing="md" align="center">
                  <Text size="lg" weight="medium" align="center" cmsId="whats-next-title">
                    {cmsData?.['whats-next-title'] || "What's Next?"}
                  </Text>
                  <Text size="sm" color="secondary" align="center" cmsId="whats-next-description">
                    {cmsData?.['whats-next-description'] || '• You\'ll receive a confirmation email shortly<br/>• Driver will contact you 15 minutes before pickup<br/>• Track your driver in real-time on the booking page'}
                  </Text>
                </Stack>

                <Stack direction="horizontal" spacing="md">
                  <Button
                    onClick={() => window.location.href = `/booking/${completedBookingId || 'unknown'}`}
                    variant="primary"
                    size="lg"
                    data-testid="view-booking-button"
                    cmsId="view-booking-button"
                    text={cmsData?.['view-booking-button'] || 'View My Booking'}
                  />
                  <Button
                    onClick={() => window.location.href = '/bookings'}
                    variant="outline"
                    size="lg"
                    data-testid="all-bookings-button"
                    cmsId="all-bookings-button"
                    text={cmsData?.['all-bookings-button'] || 'All My Bookings'}
                  />
                </Stack>
              </Stack>
            </Box>
          )}

          {/* Confirm Booking Button - Only show in payment phase and when not complete */}
          {currentPhase === 'payment' && !isBookingComplete && (
            <Box variant="elevated" padding="lg" data-testid="confirm-booking-section">
              <Stack spacing="md" align="center">
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  disabled={!depositAmount || isProcessingPayment || !processPaymentFunction}
                  onClick={handleProcessPayment}
                  data-testid="confirm-booking-button"
                  cmsId="confirm-booking-button"
                  text={isProcessingPayment ? cmsData?.['processing-payment'] || 'Processing...' : cmsData?.['confirm-booking'] || 'Confirm Booking'}
                />
                
                <Text size="sm" color="secondary" align="center" cmsId="confirm-booking-description">
                  {cmsData?.['confirm-booking-description'] || 'Click to complete your deposit payment and confirm your booking'}
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

