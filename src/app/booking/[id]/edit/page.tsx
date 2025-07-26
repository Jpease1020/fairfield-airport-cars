'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getBooking } from '@/lib/services/booking-service';
import { Booking } from '@/types/booking';
import BookingForm from '@/app/book/booking-form';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Alert } from '@/components/feedback';
import { LoadingSpinner } from '@/components/data';
import { Card, CardContent } from '@/components/ui/card';

export default function EditBookingPage() {
  const params = useParams();
  const { id } = params;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <PageContainer>
        <div className="">
          <LoadingSpinner text="Loading booking details..." />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Alert variant="error" title="Error">
          {error}
        </Alert>
      </PageContainer>
    );
  }

  if (!booking) {
    return (
      <PageContainer>
        <Alert variant="error" title="Booking Not Found">
          No booking found with the provided ID.
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="2xl" padding="lg">
      <PageHeader 
        title="Edit Your Booking" 
        subtitle="Update your ride details"
      />
      <PageContent>
        <Card>
          <CardContent className="p-8">
            <BookingForm booking={booking} />
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
}
