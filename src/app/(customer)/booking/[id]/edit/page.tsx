'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Container, Text, Button, LoadingSpinner, EditableText, ActionButtonGroup, GridSection, useToast, ToastProvider } from '@/ui';
import { getBooking } from '@/lib/services/booking-service';
import { Booking } from '@/types/booking';
import BookingForm from '../../../book/booking-form';

export default function EditBookingPage() {
  const params = useParams();
  const { id } = params;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

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
            <EditableText field="booking.edit.loading.message" defaultValue="Please wait while we fetch your booking details...">
              Please wait while we fetch your booking details...
            </EditableText>
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
            <EditableText field="booking.edit.error.description" defaultValue="This could be due to an invalid booking ID or a temporary system issue.">
              This could be due to an invalid booking ID or a temporary system issue.
            </EditableText>
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
              <EditableText field="booking.edit.not_found.title" defaultValue="❌ Booking Not Found">
                ❌ Booking Not Found
              </EditableText>
            </Text>
            <Text>
              <EditableText field="booking.edit.not_found.description" defaultValue="No booking found with the provided ID">
                No booking found with the provided ID
              </EditableText>
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
            <EditableText field="booking.edit.title" defaultValue="Edit Booking">
              Edit Booking
            </EditableText>
          </Text>
          <BookingForm 
            booking={booking}
          />
        </Container>
      </GridSection>
    </Container>
  );
}
