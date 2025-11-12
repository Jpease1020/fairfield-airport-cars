'use client';

import React, { useEffect, useState } from 'react';
import { Container, Stack, Text, DataTable, Badge, Alert, LoadingSpinner } from '@/design/ui';

interface BookingAttempt {
  id: string;
  stage: 'submit' | 'payment';
  status: 'success' | 'failed' | 'warning';
  reason?: string;
  bookingId?: string | null;
  payload?: Record<string, unknown>;
  createdAt?: { seconds: number; nanoseconds: number } | string;
}

const getStatusVariant = (status: BookingAttempt['status']) => {
  switch (status) {
    case 'failed':
      return 'error';
    case 'warning':
      return 'warning';
    default:
      return 'default';
  }
};

const formatTimestamp = (createdAt?: BookingAttempt['createdAt']) => {
  if (!createdAt) return '—';

  if (typeof createdAt === 'string') {
    return new Date(createdAt).toLocaleString();
  }

  const date = new Date(createdAt.seconds * 1000);
  return date.toLocaleString();
};

export const BookingAttemptTable: React.FC = () => {
  const [attempts, setAttempts] = useState<BookingAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAttempts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/booking/attempts?limit=100');
        if (!response.ok) {
          throw new Error('Failed to fetch booking attempts');
        }
        const data = await response.json();
        setAttempts(data.attempts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch booking attempts');
      } finally {
        setLoading(false);
      }
    };

    loadAttempts();
  }, []);

  if (loading) {
    return (
      <Container>
        <Stack direction="horizontal" spacing="md" align="center">
          <LoadingSpinner />
          <Text>Loading booking attempts…</Text>
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="error">
          <Text>{error}</Text>
        </Alert>
      </Container>
    );
  }

  const tableData = attempts.map((attempt) => ({
    id: attempt.id,
    createdAt: formatTimestamp(attempt.createdAt),
    stage: attempt.stage,
    status: (
      <Badge variant={getStatusVariant(attempt.status)}>
        {attempt.status.toUpperCase()}
      </Badge>
    ),
    reason: attempt.reason || '—',
    bookingId: attempt.bookingId || '—',
  }));

  return (
    <Container>
      <Stack spacing="lg">
        <Stack spacing="xs">
          <Text size="lg" weight="bold">Booking Attempts</Text>
          <Text size="sm" color="secondary">
            Failed or warning attempts are logged here so you can follow up manually.
          </Text>
        </Stack>
        <DataTable
          data={tableData}
          columns={[
            { key: 'createdAt', label: 'Timestamp' },
            { key: 'stage', label: 'Stage' },
            { key: 'status', label: 'Status' },
            { key: 'reason', label: 'Reason' },
            { key: 'bookingId', label: 'Booking ID' },
          ]}
        />
      </Stack>
    </Container>
  );
};

