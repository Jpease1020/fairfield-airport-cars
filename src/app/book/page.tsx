'use client';

import { UnifiedLayout } from '@/components/layout';
import BookingForm from './booking-form';

export default function BookPage() {
  return (
    <UnifiedLayout 
      layoutType="standard"
      title="🚗 Book Your Ride"
      subtitle="Professional airport transportation service"
      description="Fill out the form below to book your reliable and comfortable ride to or from the airport."
      centerContent={false}
    >
      <div className="booking-page-container">
        <BookingForm />
      </div>
    </UnifiedLayout>
  );
}
