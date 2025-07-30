'use client';

import { Layout } from '@/components/layout';
import { 
  Section,
  Container, 
  Stack, 
  H1, 
  Text
} from '@/components/ui';
import { EditableText } from '@/design/components/core/layout/EditableSystem';
import BookingForm from './booking-form';

export default function BookPage() {
  return (
    <Layout>
      {/* Hero Section - Matching home page styling */}
      <Section id="booking-hero-section" variant="brand" padding="xl">
        <Container maxWidth="2xl">
          <Stack spacing="2xl" align="center" gap="md">
            <H1 id="booking-hero-title" align="center">
              <EditableText field="booking.hero.title" defaultValue="Book Your Airport Ride">
                Book Your Airport Ride
              </EditableText>
            </H1>
            <Text id="booking-hero-subtitle" variant="lead" align="center">
              <EditableText field="booking.hero.description" defaultValue="Professional airport transportation service. Book your reliable ride to or from the airport in just a few minutes.">
                Professional airport transportation service. Book your reliable ride to or from the airport in just a few minutes.
              </EditableText>
            </Text>
          </Stack>
        </Container>
      </Section>

      {/* Booking Form Section - Using alternate variant for contrast */}
      <Section id="booking-form-section" variant="alternate" padding="xl">
        <Container maxWidth="xl">
          <BookingForm />
        </Container>
      </Section>
    </Layout>
  );
}
