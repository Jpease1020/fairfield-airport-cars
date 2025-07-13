'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc as fsDoc, onSnapshot as fsSnap } from 'firebase/firestore';
import { doc as fsDocDriver } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/types/booking';
import { PageContainer, PageHeader, PageContent } from '@/components/layout';
import { ProgressIndicator } from '@/components/ui/ProgressIndicator';
import { Alert } from '@/components/feedback';
import { LoadingSpinner } from '@/components/data';
import { Card, CardContent } from '@/components/ui/card';

// Status step calculation removed as it's handled by ProgressIndicator component

const statusDescriptions = {
  pending: "We've received your booking and will confirm it shortly.",
  confirmed: "Your ride is confirmed! We'll notify you when your driver is on the way.",
  completed: 'Your ride is complete. Thank you for choosing us!',
  cancelled: 'This booking has been cancelled.',
};

export default function RideStatusPage() {
  const params = useParams();
  const { id } = params;
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverLoc, setDriverLoc] = useState<{ lat:number; lng:number; updatedAt: Date } | null>(null);

  useEffect(() => {
    if (!id) return;

    const docRef = fsDoc(db, 'bookings', id as string);
    
    const unsubscribe = fsSnap(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setBooking({ id: docSnap.id, ...docSnap.data() } as Booking);
      } else {
        setError('Booking not found.');
      }
      setLoading(false);
    }, (err) => {
      console.error("Failed to listen for booking updates:", err);
      setError('Failed to load booking status.');
      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    const driverDoc = fsDocDriver(db, 'drivers', 'gregg');
    const unsubDriver = fsSnap(driverDoc, (snap)=>{
      if(snap.exists()){
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = snap.data() as any;
        if(d.lat && d.lng && d.updatedAt){
          setDriverLoc({ lat:d.lat, lng:d.lng, updatedAt: d.updatedAt.toDate() });
        }
      }
    });
    return () => unsubDriver();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner text="Loading ride status..." />
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

  const isDriverFresh = driverLoc && (Date.now() - driverLoc.updatedAt.getTime() < 2*60*1000);

  const progressSteps = [
    { id: 'pending', label: 'Pending', description: 'Booking received' },
    { id: 'confirmed', label: 'Confirmed', description: 'Ride confirmed' },
    { id: 'completed', label: 'Completed', description: 'Ride finished' },
  ];

  return (
    <PageContainer maxWidth="md" padding="lg">
      <PageHeader 
        title="Your Ride Status" 
        subtitle={new Date(booking.pickupDateTime).toLocaleString()}
      />
      <PageContent>
        <Card>
          <CardContent className="p-6">
            {booking.status === 'cancelled' ? (
              <Alert variant="error" title="Booking Cancelled">
                {statusDescriptions.cancelled}
              </Alert>
            ) : (
              <div className="space-y-6">
                <ProgressIndicator 
                  steps={progressSteps}
                  currentStep={booking.status}
                  showDescriptions={false}
                />
                
                <div className="text-center p-4 bg-gray-50 rounded-md">
                  <p className="font-semibold text-lg capitalize">{booking.status}</p>
                  <p className="text-gray-700">{statusDescriptions[booking.status]}</p>
                </div>
                
                {isDriverFresh && (
                  <div className="mt-6">
                    <h2 className="text-lg font-medium mb-2 text-center">Live Driver Location</h2>
                    <iframe
                      title="Driver live location map"
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?q=${driverLoc!.lat},${driverLoc!.lng}&z=15&output=embed`}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
}
