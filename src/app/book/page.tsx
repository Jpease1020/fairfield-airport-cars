'use client';

import React from 'react';
import { 
  Container,
  Stack,
  H1,
  H2,
  H3,
  H4,
  Text,
  Button,
  Grid,
  GridItem,
  Box,
  Span,
  Section,
  HeroSection,
  CustomerLayout
} from '@/design/ui';
import { EditableText } from '@/design/ui';
import BookingForm from './booking-form';

function BookPageContent() {
  return (
    <CustomerLayout>
      <Section
        title="Complete Your Booking"
        subtitle="Fill in your details below"
        data-testid="book-form-section"
      >
        <BookingForm />
      </Section>
    </CustomerLayout>
  );
}

export default BookPageContent;
