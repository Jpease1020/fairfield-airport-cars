'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Text, LoadingSpinner, ActionButtonGroup, GridSection, useToast, Button, Stack, H1 } from '@/design/ui';
// Use API route instead of direct import (booking-service uses Admin SDK)
import { adaptOldBookingToNew } from '@/utils/bookingAdapter';
import { Booking } from '@/types/booking';
import { BookingProvider, useBooking } from '@/providers/BookingProvider';
import { TripDetailsPhase } from '@/components/booking/TripDetailsPhase';
import { ContactInfoPhase } from '@/components/booking/ContactInfoPhase';
import { authFetch } from '@/lib/utils/auth-fetch';

interface EditBookingClientProps {
  bookingId: string;
  cmsData?: any;
}

function EditBookingContent({ bookingId, cmsData }: EditBookingClientProps) {
  // Use CMS data passed from server component
  const pageCmsData = cmsData || {};
  const router = useRouter();
  const { addToast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { formData, currentPhase, goToNextPhase, goToPreviousPhase, updateFormData, updateCustomerInfo } = useBooking();

  useEffect(() => {
    if (bookingId) {
      const fetchBooking = async () => {
        try {
          const response = await authFetch(`/api/booking/${bookingId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch booking');
          }
          const bookingData = await response.json();
          if (bookingData) {
            const adaptedBooking = adaptOldBookingToNew(bookingData);
            setBooking(adaptedBooking);
            
            // Pre-populate form with booking data
            if (adaptedBooking.trip && adaptedBooking.customer) {
              updateFormData({
                trip: {
                  pickup: adaptedBooking.trip.pickup || { address: '', coordinates: null },
                  dropoff: adaptedBooking.trip.dropoff || { address: '', coordinates: null },
                  pickupDateTime: adaptedBooking.trip.pickupDateTime 
                    ? (typeof adaptedBooking.trip.pickupDateTime === 'string' 
                        ? adaptedBooking.trip.pickupDateTime 
                        : new Date(adaptedBooking.trip.pickupDateTime).toISOString().slice(0, 16))
                    : '',
                  fareType: adaptedBooking.trip.fareType || 'personal',
                  flightInfo: adaptedBooking.trip.flightInfo || {
                    hasFlight: false,
                    airline: '',
                    flightNumber: '',
                    arrivalTime: '',
                    terminal: ''
                  },
                  fare: adaptedBooking.trip.fare || null
                },
                customer: adaptedBooking.customer
              });
            }
          } else {
            setError('Booking not found.');
          }
        } catch {
          setError('Failed to fetch booking details.');
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [bookingId, updateFormData]);

  if (loading) {
    return (
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            <LoadingSpinner />
            {pageCmsData?.['booking-edit-loading-message'] || 'Please wait while we fetch your booking details...'}
          </Container>
        </GridSection>
      </Container>
    );
  }

  if (error) {
    return (
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            {pageCmsData?.['booking-edit-error-description'] || 'This could be due to an invalid booking ID or a temporary system issue.'}
            <ActionButtonGroup buttons={[
              {
                id: 'try-again',
                label: 'Try Again',
                onClick: () => window.location.reload(),
                variant: 'primary',
                icon: '🔄'
              },
              {
                id: 'contact-support',
                label: 'Text Support',
                onClick: () => addToast('info', 'Text Support: (646) 221-6370'),
                variant: 'outline',
                icon: '💬'
              }
            ]} />
          </Container>
        </GridSection>
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            <Text>
              {pageCmsData?.['booking-edit-not_found-title'] || '❌ Booking Not Found'}
            </Text>
            <Text>
              {pageCmsData?.['booking-edit-not_found-description'] || 'No booking found with the provided ID'}
            </Text>
            <ActionButtonGroup buttons={[
              {
                id: 'go-back',
                label: 'Go Back',
                onClick: () => window.history.back(),
                variant: 'primary',
                icon: '⬅️'
              },
              {
                id: 'book-new-ride',
                label: 'Book New Ride',
                onClick: () => window.location.href = '/book',
                variant: 'outline',
                icon: '📅'
              }
            ]} />
          </Container>
        </GridSection>
      </Container>
    );
  }

  const handleSave = async () => {
    if (!booking) return;

    setSaving(true);
    try {
      // Prepare update data
      const updateData: any = {};
      
      if (formData.trip.pickup.address !== (booking.trip?.pickup?.address || booking.pickupLocation)) {
        updateData.pickup = {
          address: formData.trip.pickup.address,
          coordinates: formData.trip.pickup.coordinates
        };
      }
      
      if (formData.trip.dropoff.address !== (booking.trip?.dropoff?.address || booking.dropoffLocation)) {
        updateData.dropoff = {
          address: formData.trip.dropoff.address,
          coordinates: formData.trip.dropoff.coordinates
        };
      }
      
      const currentDateTime = booking.trip?.pickupDateTime 
        ? new Date(booking.trip.pickupDateTime).toISOString()
        : (booking.pickupDateTime ? new Date(booking.pickupDateTime).toISOString() : '');
      const newDateTime = formData.trip.pickupDateTime 
        ? new Date(formData.trip.pickupDateTime).toISOString()
        : '';
      
      if (newDateTime && newDateTime !== currentDateTime) {
        updateData.pickupDateTime = newDateTime;
      }
      
      if (formData.customer.name !== (booking.customer?.name || booking.name)) {
        updateData.customer = {
          ...updateData.customer,
          name: formData.customer.name
        };
      }
      if (formData.customer.email !== (booking.customer?.email || booking.email)) {
        updateData.customer = {
          ...updateData.customer,
          email: formData.customer.email
        };
      }
      if (formData.customer.phone !== (booking.customer?.phone || booking.phone)) {
        updateData.customer = {
          ...updateData.customer,
          phone: formData.customer.phone
        };
      }
      if (formData.customer.notes !== booking.customer?.notes) {
        updateData.customer = {
          ...updateData.customer,
          notes: formData.customer.notes
        };
      }

      const response = await authFetch(`/api/booking/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update booking');
      }

      const _result = await response.json();
      addToast('success', 'Booking updated successfully!');
      
      // Redirect to booking details page
      setTimeout(() => {
        router.push(`/booking/${bookingId}`);
      }, 1500);
    } catch (err) {
      console.error('Update error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to update booking';
      addToast('error', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="7xl" padding="xl">
      <Stack spacing="xl">
        <H1>{pageCmsData?.['booking-edit-title'] || 'Edit Booking'}</H1>
        
        {currentPhase === 'trip-details' && (
          <TripDetailsPhase cmsData={cmsData} />
        )}
        
        {currentPhase === 'contact-info' && (
          <ContactInfoPhase
            customerData={formData.customer}
            onCustomerUpdate={updateCustomerInfo}
            onBack={goToPreviousPhase}
            onContinue={goToNextPhase}
            validation={{ isValid: true, errors: [], warnings: [], fieldErrors: {} }}
            cmsData={cmsData}
          />
        )}
        
        {currentPhase === 'payment' && (
          <Stack spacing="lg">
            <Text cmsId="review-changes">{pageCmsData?.['review-changes'] || 'Review your changes and save'}</Text>
            <Stack direction="horizontal" spacing="md">
              <Button
                onClick={goToPreviousPhase}
                variant="outline"
                text="Back"
              />
              <Button
                onClick={handleSave}
                variant="primary"
                disabled={saving}
                text={saving ? 'Saving...' : 'Save Changes'}
              />
            </Stack>
          </Stack>
        )}
      </Stack>
    </Container>
  );
}

export default function EditBookingClient({ bookingId, cmsData }: EditBookingClientProps) {
  return (
    <BookingProvider>
      <EditBookingContent bookingId={bookingId} cmsData={cmsData} />
    </BookingProvider>
  );
}
