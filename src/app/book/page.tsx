'use client';

import { UnifiedLayout } from '@/components/layout';
import { Container, EditableText } from '@/components/ui';
import BookingForm from './booking-form';

export default function BookPage() {
  return (
    <UnifiedLayout 
      layoutType="standard"
      title={<EditableText field="booking.layout.title" defaultValue="🚗 Book Your Ride">🚗 Book Your Ride</EditableText>}
      subtitle={<EditableText field="booking.layout.subtitle" defaultValue="Professional airport transportation service">Professional airport transportation service</EditableText>}
      description={<EditableText field="booking.layout.description" defaultValue="Fill out the form below to book your reliable and comfortable ride to or from the airport.">Fill out the form below to book your reliable and comfortable ride to or from the airport.</EditableText>}
      centerContent={false}
    >
      <Container>
        <BookingForm />
      </Container>
    </UnifiedLayout>
  );
}
