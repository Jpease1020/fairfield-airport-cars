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
} from '@/ui';
import { EditableText } from '@/ui';
import BookingForm from './booking-form';

function BookPageContent() {
  return (
    <Section
      title="Complete Your Booking"
      subtitle="Fill in your details below"
      data-testid="book-form-section"
    >
      <BookingForm />
    </Section>
  );
}

export default BookPageContent;
