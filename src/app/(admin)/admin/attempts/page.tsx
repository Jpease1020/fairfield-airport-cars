'use client';

import React, { Suspense } from 'react';
import { Container, Stack, Text, LoadingSpinner } from '@/design/ui';
import { BookingAttemptTable } from '@/components/business/BookingAttemptTable';

export const dynamic = 'force-dynamic';

export default function BookingAttemptsPage() {
  return (
    <Suspense
      fallback={
        <Container>
          <Stack direction="horizontal" spacing="md" align="center">
            <LoadingSpinner />
            <Text>Loading booking attempts…</Text>
          </Stack>
        </Container>
      }
    >
      <BookingAttemptTable />
    </Suspense>
  );
}


