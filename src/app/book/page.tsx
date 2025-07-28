'use client';

import { UnifiedLayout } from '@/components/layout';
import { Container, EditableText } from '@/components/ui';
import BookingForm from './booking-form';

export default function BookPage() {
  return (
    <UnifiedLayout 
      layoutType="content"
      title="Book Your Ride"
      subtitle="Professional airport transportation service"
      description="Fill out the form below to book your reliable and comfortable ride to or from the airport."
    >
      <Container>
        <BookingForm />
      </Container>
    </UnifiedLayout>
  );
}
