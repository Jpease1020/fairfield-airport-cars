'use client';

import React from 'react';
import { Button, Stack, Text } from '@/design/ui';
import type { ConfirmationContext } from '@/lib/chat/chat-types';

interface ConfirmationCardProps {
  confirmation: ConfirmationContext;
  onConfirm: () => void;
  onEdit: () => void;
  loading?: boolean;
}

function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function ConfirmationCard({ confirmation, onConfirm, onEdit, loading = false }: ConfirmationCardProps) {
  const { summary, expiresAt } = confirmation;

  return (
    <div
      style={{
        border: '1px solid #93c5fd',
        background: '#eff6ff',
        borderRadius: 12,
        padding: 16,
        width: '100%',
      }}
      data-testid="chat-confirmation-card"
    >
      <Stack spacing="sm">
        <Text style={{ fontWeight: 700 }}>Review your booking details</Text>
        <Text><strong>Pickup:</strong> {summary.pickupAddress}</Text>
        <Text><strong>Dropoff:</strong> {summary.dropoffAddress}</Text>
        <Text><strong>Date/Time:</strong> {formatDateTime(summary.pickupDateTime)}</Text>
        <Text><strong>Name:</strong> {summary.customerName}</Text>
        <Text><strong>Email:</strong> {summary.customerEmail}</Text>
        <Text><strong>Phone:</strong> {summary.customerPhone}</Text>
        <Text><strong>Fare:</strong> ${summary.fare}</Text>
        <Text variant="small">Confirmation expires at {formatDateTime(expiresAt)}</Text>

        <Stack direction="horizontal" spacing="sm">
          <Button
            variant="primary"
            text={loading ? 'Booking...' : 'Confirm Booking'}
            onClick={onConfirm}
            disabled={loading}
            fullWidth
            data-testid="chat-confirm-booking"
          />
          <Button
            variant="outline"
            text="Edit"
            onClick={onEdit}
            disabled={loading}
            data-testid="chat-edit-booking"
          />
        </Stack>
      </Stack>
    </div>
  );
}
