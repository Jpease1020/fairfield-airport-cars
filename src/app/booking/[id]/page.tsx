'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBooking, deleteBooking } from '@/lib/booking-service';
import { Booking } from '@/types/booking';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { BookingCard } from '@/components/booking';
import { Alert } from '@/components/feedback';
import { LoadingSpinner } from '@/components/data';
import { Button } from '@/components/ui/button';

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
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

  const handleCancelBooking = async () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await deleteBooking(id as string);
        alert('Booking cancelled successfully.');
        router.push('/');
      } catch {
        setError('Failed to cancel booking.');
      }
    }
  };

  const handlePayment = async () => {
    if (!booking) return;

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: Math.ceil((booking.depositAmount ?? booking.fare / 2) * 100),
          currency: 'USD',
          description: `Deposit for ride from ${booking.pickupLocation} to ${booking.dropoffLocation}`,
        }),
      });

      if (response.ok) {
        const { paymentLinkUrl } = await response.json();
        window.location.href = paymentLinkUrl;
      } else {
        setError('Failed to create payment link.');
      }
    } catch {
      setError('Failed to initiate payment.');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
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
    <PageContainer maxWidth="md" padding="lg">
      <PageHeader 
        title="Booking Confirmed!" 
        subtitle="Your ride is booked successfully"
      />
      <PageContent>
        <Alert variant="success" title="Success">
          You will receive an SMS confirmation shortly. We will contact you if there are any issues.
        </Alert>
        
        <BookingCard 
          booking={booking} 
          showActions={false}
        />
        
        <div className="space-y-3">
          <Button 
            onClick={handlePayment}
            className="w-full"
            size="lg"
          >
            Pay Deposit (${(booking.depositAmount ?? booking.fare / 2).toFixed(2)})
          </Button>
          
          <Button 
            variant="outline"
            className="w-full"
            onClick={() => router.push(`/booking/${booking.id}/edit`)}
          >
            Edit Booking
          </Button>
          
          <Button 
            variant="destructive"
            className="w-full"
            onClick={handleCancelBooking}
          >
            Cancel Booking
          </Button>
        </div>
      </PageContent>
    </PageContainer>
  );
}
