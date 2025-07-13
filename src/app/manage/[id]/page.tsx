'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/types/booking';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { BookingCard } from '@/components/booking';
import { Alert } from '@/components/feedback';
import { LoadingSpinner } from '@/components/data';
import { Button } from '@/components/ui/button';

export default function ManageBookingPage() {
  const { id } = useParams();
  const router = useRouter();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(
      doc(db, 'bookings', id as string),
      (snap) => {
        if (snap.exists()) {
          setBooking({ id: snap.id, ...snap.data() } as Booking);
        } else {
          setError('Booking not found');
        }
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setError('Failed to load booking');
        setLoading(false);
      }
    );
    return () => unsub();
  }, [id]);

  const handleCancel = async () => {
    if (!booking) return;
    const confirmed = window.confirm('Are you sure you want to cancel this ride? A cancellation fee may apply.');
    if (!confirmed) return;
    try {
      const res = await fetch('/api/cancel-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg('Ride cancelled. You will receive a confirmation shortly.');
      } else {
        setActionMsg(data.error || 'Failed to cancel');
      }
    } catch {
      setActionMsg('Network error');
    }
  };

  const handleResend = async () => {
    if (!booking) return;
    try {
      const res = await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id }),
      });
      if (res.ok) setActionMsg('Confirmation sent!');
      else setActionMsg('Failed to send confirmation');
    } catch {
      setActionMsg('Network error');
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

  if (error || !booking) {
    return (
      <PageContainer>
        <Alert variant="error" title="Error">
          {error || 'Booking not found'}
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="md" padding="lg">
      <PageHeader 
        title="Manage Your Booking" 
        subtitle={`Reference: ${booking.id}`}
      />
      <PageContent>
        <BookingCard 
          booking={booking} 
          showActions={false}
        />
        
        <div className="space-y-3">
          <Button 
            onClick={handleResend}
            className="w-full"
          >
            Re-send Confirmation Email/SMS
          </Button>

          {booking.status !== 'cancelled' && (
            <Button
              variant="destructive"
              onClick={handleCancel}
              className="w-full"
            >
              Cancel Ride
            </Button>
          )}

          {booking.balanceDue > 0 && booking.status === 'completed' && (
            <Button
              variant="outline"
              className="w-full"
              onClick={async () => {
                const res = await fetch('/api/complete-payment', { 
                  method: 'POST', 
                  headers: { 'Content-Type':'application/json' }, 
                  body: JSON.stringify({ bookingId: booking.id })
                });
                if (res.ok) {
                  const { paymentLinkUrl } = await res.json();
                  window.location.href = paymentLinkUrl;
                } else {
                  setActionMsg('Failed to create balance payment link');
                }
              }}
            >
              Pay Remaining Balance (${booking.balanceDue.toFixed(2)})
            </Button>
          )}
        </div>

        {actionMsg && (
          <Alert variant="info" title="Action Result">
            {actionMsg}
          </Alert>
        )}

        <Button 
          variant="outline"
          onClick={() => router.push(`/status/${booking.id}`)}
          className="w-full"
        >
          View Status Page
        </Button>
      </PageContent>
    </PageContainer>
  );
} 