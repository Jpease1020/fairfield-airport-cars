'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getBooking } from '@/lib/services/booking-service';
import { Booking } from '@/types/booking';
import BookingForm from '@/app/book/booking-form';
import { UnifiedLayout } from '@/components/layout';
import { GridSection, InfoCard, LoadingSpinner } from '@/components/ui';

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
      <UnifiedLayout
        layoutType="standard"
        title="Edit Booking"
        subtitle="Loading booking details..."
      >
        <GridSection variant="content" columns={1}>
          <InfoCard title="Loading..." description="Fetching booking details">
            <div className="edit-booking-loading">
              <LoadingSpinner text="Loading booking details..." />
            </div>
          </InfoCard>
        </GridSection>
      </UnifiedLayout>
    );
  }

  if (error) {
    return (
      <UnifiedLayout
        layoutType="standard"
        title="Edit Booking"
        subtitle="Error occurred"
      >
        <GridSection variant="content" columns={1}>
          <InfoCard title="❌ Error" description="Failed to load booking">
            <div className="edit-booking-error">
              <p className="edit-booking-error-message">
                {error}
              </p>
            </div>
          </InfoCard>
        </GridSection>
      </UnifiedLayout>
    );
  }

  if (!booking) {
    return (
      <UnifiedLayout
        layoutType="standard"
        title="Edit Booking"
        subtitle="Booking not found"
      >
        <GridSection variant="content" columns={1}>
          <InfoCard title="❌ Booking Not Found" description="No booking found with the provided ID">
            <div className="edit-booking-not-found">
              <p className="edit-booking-not-found-message">
                No booking found with the provided ID.
              </p>
            </div>
          </InfoCard>
        </GridSection>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout
      layoutType="standard"
      title="Edit Your Booking"
      subtitle="Update your ride details"
    >
      <GridSection variant="content" columns={1}>
        <InfoCard
          title="✏️ Edit Booking Details"
          description="Update your ride information"
        >
          <div className="edit-booking-form-container">
            <BookingForm booking={booking} />
          </div>
        </InfoCard>
      </GridSection>
    </UnifiedLayout>
  );
}
