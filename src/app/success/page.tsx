'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/types/booking';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { Alert } from '@/components/feedback';
import { LoadingSpinner } from '@/components/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SuccessPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(!!bookingId);

  useEffect(() => {
    if (!bookingId) return;

    const docRef = doc(db, 'bookings', bookingId);
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setBooking({ id: snap.id, ...snap.data() } as Booking);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [bookingId]);

  if (!bookingId) {
    return (
      <PageContainer maxWidth="md" padding="lg">
        <PageHeader title="Payment Successful" />
        <PageContent>
          <Card>
            <CardContent className="p-6 text-center">
              <Alert variant="success" title="Payment Successful">
                No booking reference found, but your payment was processed.
              </Alert>
            </CardContent>
          </Card>
        </PageContent>
      </PageContainer>
    );
  }

  if (loading || !booking) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading your booking..." />
        </div>
      </PageContainer>
    );
  }

  const statusText = booking.status === 'pending' ? 'Pending Confirmation' : booking.status === 'confirmed' ? 'Confirmed' : booking.status;

  return (
    <PageContainer maxWidth="md" padding="lg">
      <PageHeader 
        title="Payment Successful!" 
        subtitle={`Booking reference: ${bookingId}`}
      />
      <PageContent>
        <Card>
          <CardContent className="p-8 text-center">
            <Alert variant="success" title="Payment Processed">
              Your payment has been successfully processed.
            </Alert>
            
            <div className="mt-6">
              <p className="text-lg font-semibold mb-4">
                Current Status: <span className="capitalize">{statusText}</span>
              </p>
              
              <Button 
                onClick={() => router.push(`/status/${bookingId}`)}
                size="lg"
              >
                View Detailed Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
};

const SuccessPage = () => {
  return (
    <Suspense fallback={
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading..." />
        </div>
      </PageContainer>
    }>
      <SuccessPageContent />
    </Suspense>
  );
};

export default SuccessPage;
