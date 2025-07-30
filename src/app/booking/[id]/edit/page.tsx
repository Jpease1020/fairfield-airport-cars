'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getBooking } from '@/lib/services/booking-service';
import { Booking } from '@/types/booking';
import BookingForm from '@/app/book/booking-form';
import { Layout } from '@/components/layout';
import { GridSection, LoadingSpinner, Text, Container } from '@/components/ui';
import { Card } from '@/design/components/core/layout/card';
import { Stack } from '@/design/components/core/layout/layout/containers';

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
      <Layout>
        <GridSection variant="content" columns={1}>
          <Card variant="elevated" padding="lg">
            <Stack spacing="md">
              <Text size="lg" weight="bold">Loading...</Text>
              <Text>Fetching booking details</Text>
              <Container>
                <LoadingSpinner text="Loading booking details..." />
              </Container>
            </Stack>
          </Card>
        </GridSection>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <GridSection variant="content" columns={1}>
          <Card variant="elevated" padding="lg">
            <Stack spacing="md">
              <Text size="lg" weight="bold">❌ Error</Text>
              <Text>Failed to load booking</Text>
              <Text>
                {error}
              </Text>
            </Stack>
          </Card>
        </GridSection>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout>
        <GridSection variant="content" columns={1}>
          <Card variant="elevated" padding="lg">
            <Stack spacing="md">
              <Text size="lg" weight="bold">❌ Booking Not Found</Text>
              <Text>No booking found with the provided ID</Text>
              <Text>
                No booking found with the provided ID.
              </Text>
            </Stack>
          </Card>
        </GridSection>
      </Layout>
    );
  }

  return (
    <Layout>
      <GridSection variant="content" columns={1}>
        <Card variant="elevated" padding="lg">
          <Stack spacing="md">
            <Text size="lg" weight="bold">✏️ Edit Booking Details</Text>
            <Text>Update your ride information</Text>
            <Container>
              <BookingForm booking={booking} />
            </Container>
          </Stack>
        </Card>
      </GridSection>
    </Layout>
  );
}
