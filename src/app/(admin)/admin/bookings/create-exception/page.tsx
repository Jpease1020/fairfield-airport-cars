'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Stack,
  Text,
  Button,
  Box,
  Input,
  Textarea,
  Alert,
  LoadingSpinner,
} from '@/design/ui';
import { LocationInputSection } from '@/components/booking/trip-details/LocationInputSection';
import { DateTimeSection } from '@/components/booking/trip-details/DateTimeSection';
import { FareDisplaySection } from '@/components/booking/trip-details/FareDisplaySection';
import { FlightInfoSection } from '@/components/booking/trip-details/FlightInfoSection';
import { useBooking } from '@/providers/BookingProvider';
import { useFareCalculation } from '@/hooks/useFareCalculation';

export default function CreateExceptionBookingPage() {
  const router = useRouter();
  const [exceptionCode, setExceptionCode] = useState('');
  const [exceptionReason, setExceptionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Use BookingProvider for all form state
  const {
    formData,
    updateTripDetails,
    updateCustomerInfo,
    validation,
    hasAttemptedValidation,
    setHasAttemptedValidation,
    submitBooking,
    isSubmitting,
    error,
    success,
    currentQuote,
  } = useBooking();

  // Use fare calculation hook (same as regular booking form)
  const { fare: calculatedFare, isCalculating: isCalculatingFare, error: fareError } = useFareCalculation({
    pickupLocation: formData.trip.pickup.address,
    dropoffLocation: formData.trip.dropoff.address,
    pickupCoords: formData.trip.pickup.coordinates,
    dropoffCoords: formData.trip.dropoff.coordinates,
    fareType: formData.trip.fareType,
    pickupDateTime: formData.trip.pickupDateTime,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    setHasAttemptedValidation(true);

    // Validate exception code
    if (!exceptionCode) {
      setSubmitError('Exception code is required');
      setSubmitting(false);
      return;
    }

    // Validate form data
    if (!formData.customer.name || !formData.customer.email || !formData.customer.phone) {
      setSubmitError('Please fill in all customer information');
      setSubmitting(false);
      return;
    }

    if (!formData.trip.pickup.address || !formData.trip.dropoff.address) {
      setSubmitError('Please provide both pickup and dropoff locations');
      setSubmitting(false);
      return;
    }

    if (!formData.trip.pickupDateTime) {
      setSubmitError('Please select a pickup date and time');
      setSubmitting(false);
      return;
    }

    // For exception bookings, we can use calculated fare from quote or manual entry
    // The submitBooking function will handle this automatically
    try {
      // Submit booking with exception code (bypasses service area validation)
      // Note: submitBooking will use currentQuote fare if available
      const result = await submitBooking(exceptionCode);

      if (result.success) {
        setSubmitSuccess('Exception booking created successfully! It will require approval.');
        // Redirect to bookings page after 2 seconds
        setTimeout(() => {
          router.push('/admin/bookings?status=requires_approval');
        }, 2000);
      } else {
        setSubmitError(error || 'Failed to create exception booking');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create exception booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="7xl" padding="xl">
      <Stack spacing="xl">
        <Stack spacing="sm">
          <Text size="2xl" weight="bold">
            Create Exception Booking
          </Text>
          <Text color="secondary">
            Create a booking that bypasses service area restrictions. This booking will require approval from Gregg.
          </Text>
        </Stack>

        {(submitError || error) && (
          <Alert variant="error">
            <Text>{submitError || error}</Text>
          </Alert>
        )}

        {(submitSuccess || success) && (
          <Alert variant="success">
            <Text>{submitSuccess || success}</Text>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing="xl">
            {/* Exception Details - Show first */}
            <Box variant="elevated" padding="lg">
              <Stack spacing="md">
                <Text size="lg" weight="semibold">
                  Exception Details
                </Text>
                <Stack spacing="md">
                  <Input
                    label="Exception Code"
                    type="password"
                    value={exceptionCode}
                    onChange={(e) => setExceptionCode(e.target.value)}
                    required
                    fullWidth
                    placeholder="Enter exception code"
                  />
                  <Textarea
                    label="Exception Reason"
                    value={exceptionReason}
                    onChange={(e) => setExceptionReason(e.target.value)}
                    placeholder="Explain why this booking requires an exception (e.g., VIP customer, special circumstances)..."
                    rows={4}
                    fullWidth
                  />
                </Stack>
              </Stack>
            </Box>

            {/* Trip Details - Use same components as regular booking form */}
            <Box variant="elevated" padding="lg">
              <Stack spacing="md">
                <Text size="lg" weight="semibold">
                  Trip Details
                </Text>
                <LocationInputSection
                  pickupLocation={formData.trip.pickup.address}
                  dropoffLocation={formData.trip.dropoff.address}
                  pickupCoords={formData.trip.pickup.coordinates}
                  dropoffCoords={formData.trip.dropoff.coordinates}
                  onPickupLocationChange={(address) => updateTripDetails({ pickup: { ...formData.trip.pickup, address } })}
                  onDropoffLocationChange={(address) => updateTripDetails({ dropoff: { ...formData.trip.dropoff, address } })}
                  onPickupCoordsChange={(coords) => updateTripDetails({ pickup: { ...formData.trip.pickup, coordinates: coords } })}
                  onDropoffCoordsChange={(coords) => updateTripDetails({ dropoff: { ...formData.trip.dropoff, coordinates: coords } })}
                  departureTime={formData.trip.pickupDateTime}
                  cmsData={{}}
                />
                <DateTimeSection
                  pickupDateTime={formData.trip.pickupDateTime}
                  fareType={formData.trip.fareType}
                  onDateTimeChange={(dateTime) => updateTripDetails({ pickupDateTime: dateTime })}
                  onFareTypeChange={(type) => updateTripDetails({ fareType: type })}
                  cmsData={{}}
                  error={!!validation?.fieldErrors?.['pickup-datetime-input']}
                  validation={validation}
                />
                <FareDisplaySection
                  fare={calculatedFare}
                  isCalculating={isCalculatingFare}
                  fareType={formData.trip.fareType}
                  cmsData={{}}
                  error={fareError}
                />
              </Stack>
            </Box>

            {/* Customer Information */}
            <Box variant="elevated" padding="lg">
              <Stack spacing="md">
                <Text size="lg" weight="semibold">
                  Customer Information
                </Text>
                <Stack spacing="md">
                  <Input
                    label="Name"
                    value={formData.customer.name}
                    onChange={(e) => updateCustomerInfo({ name: e.target.value })}
                    required
                    fullWidth
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={formData.customer.email}
                    onChange={(e) => updateCustomerInfo({ email: e.target.value })}
                    required
                    fullWidth
                  />
                  <Input
                    label="Phone"
                    value={formData.customer.phone}
                    onChange={(e) => updateCustomerInfo({ phone: e.target.value })}
                    required
                    fullWidth
                  />
                  <Textarea
                    label="Notes"
                    value={formData.customer.notes}
                    onChange={(e) => updateCustomerInfo({ notes: e.target.value })}
                    rows={3}
                    fullWidth
                  />
                </Stack>
              </Stack>
            </Box>

            {/* Flight Information (Optional) */}
            <Box variant="elevated" padding="lg">
              <Stack spacing="md">
                <Text size="lg" weight="semibold">
                  Flight Information (Optional)
                </Text>
                <FlightInfoSection
                  flightInfo={formData.trip.flightInfo}
                  onFlightInfoChange={(flightInfo) => updateTripDetails({ flightInfo })}
                  cmsData={{}}
                />
              </Stack>
            </Box>

            {/* Submit Button */}
            <Stack direction="horizontal" spacing="md" justify="flex-end">
              <Button
                variant="secondary"
                onClick={() => router.push('/admin/bookings')}
                disabled={submitting || isSubmitting}
                text="Cancel"
              />
              <Button
                type="submit"
                variant="primary"
                disabled={submitting || isSubmitting || !exceptionCode}
                text={submitting || isSubmitting ? 'Creating...' : 'Create Exception Booking'}
              />
            </Stack>
          </Stack>
        </form>

        {(submitting || isSubmitting) && (
          <Box>
            <Stack direction="horizontal" spacing="md" align="center">
              <LoadingSpinner />
              <Text>Creating exception booking...</Text>
            </Stack>
          </Box>
        )}
      </Stack>
    </Container>
  );
}
