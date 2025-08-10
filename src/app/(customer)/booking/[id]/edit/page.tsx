'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Container, Text, LoadingSpinner, ActionButtonGroup, GridSection, useToast } from '@/ui';
import { getBooking } from '@/lib/services/booking-service';
import { Booking } from '@/types/booking';
import BookingForm from '../../../book/booking-form';
import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';
export default function EditBookingPage() {
  const params = useParams();
  const { id } = params;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  const { cmsData } = useCMSData();
  useEffect(() => {
    if (id) {
      const fetchBooking = async () => {
        try {
          const bookingData = await getBooking(id as string);
          if (bookingData) {
            setBooking(bookingData);
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
  }, [id]);

  if (loading) {
    return (
      <Container variant="default" padding="none">
        <GridSection variant="content" columns={1}>
          <Container>
            <LoadingSpinner />
            {getCMSField(cmsData, 'booking.edit.loading.message', 'Please wait while we fetch your booking details...')}
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
            {getCMSField(cmsData, 'booking.edit.error.description', 'This could be due to an invalid booking ID or a temporary system issue.')}
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
                label: 'Contact Support',
                onClick: () => addToast('info', 'Support: (203) 555-0123'),
                variant: 'outline',
                icon: '📞'
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
              {getCMSField(cmsData, 'booking.edit.not_found.title', '❌ Booking Not Found')}
            </Text>
            <Text>
              {getCMSField(cmsData, 'booking.edit.not_found.description', 'No booking found with the provided ID')}
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

  return (
    <Container variant="default" padding="none">
      <GridSection variant="content" columns={1}>
        <Container>
          <Text>
            {getCMSField(cmsData, 'booking.edit.title', 'Edit Booking')}
          </Text>
          <BookingForm 
            booking={booking}
          />
        </Container>
      </GridSection>
    </Container>
  );
}
