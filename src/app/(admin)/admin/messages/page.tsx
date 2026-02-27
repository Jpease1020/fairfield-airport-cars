'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Container, Stack, Text, Alert, LoadingSpinner, H1, Box, Button, Input } from '@/design/ui';
import { authFetch } from '@/lib/utils/auth-fetch';

interface SmsMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  direction: 'inbound' | 'outbound';
  twilioMessageSid?: string;
  createdAt: string | null;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState<'all' | 'inbound' | 'outbound'>('all');
  const [resendBookingId, setResendBookingId] = useState('');
  const [resending, setResending] = useState(false);
  const [resendResult, setResendResult] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    if (direction !== 'all') params.set('direction', direction);
    authFetch(`/api/admin/sms-messages?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load messages');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setMessages(data.messages ?? []);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? 'Failed to load messages');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [direction]);

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  const handleResendConfirmation = async () => {
    const id = resendBookingId.trim();
    if (!id) {
      setResendResult('Enter a booking ID');
      return;
    }
    setResending(true);
    setResendResult(null);
    setError(null);
    try {
      const res = await authFetch('/api/notifications/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Resend failed');
      }
      setResendResult('Confirmation resent.');
      setResendBookingId('');
    } catch (e) {
      setResendResult(e instanceof Error ? e.message : 'Resend failed');
    } finally {
      setResending(false);
    }
  };

  return (
    <Container>
      <Stack spacing="lg">
        <H1>Messages</H1>
        <Text size="sm" color="secondary">SMS activity. Resend confirmation by booking ID below.</Text>

        <Box variant="outlined" padding="md">
          <Stack spacing="sm">
            <Text weight="bold">Resend confirmation</Text>
            <Stack direction="horizontal" spacing="md" align="center">
              <Input
                placeholder="Booking ID"
                value={resendBookingId}
                onChange={(e) => setResendBookingId(e.target.value)}
                style={{ width: 200 }}
              />
              <Button variant="primary" size="sm" onClick={handleResendConfirmation} disabled={resending} text={resending ? 'Sending…' : 'Resend'} />
            </Stack>
            {resendResult && <Text size="sm" color={resendResult.startsWith('Confirmation') ? 'secondary' : undefined}>{resendResult}</Text>}
          </Stack>
        </Box>

        <Stack direction="horizontal" spacing="md" align="center">
          <Text as="span" weight="bold">Filter:</Text>
          {(['all', 'inbound', 'outbound'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDirection(d)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: direction === d ? '2px solid #111' : '1px solid #ccc',
                background: direction === d ? '#f0f0f0' : '#fff',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {d}
            </button>
          ))}
        </Stack>
        {error && <Alert variant="error">{error}</Alert>}
        {loading && <LoadingSpinner />}
        {!loading && !error && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px' }}>Time</th>
                <th style={{ padding: '8px 12px' }}>Direction</th>
                <th style={{ padding: '8px 12px' }}>From</th>
                <th style={{ padding: '8px 12px' }}>To</th>
                <th style={{ padding: '8px 12px' }}>Body</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 24, color: '#6b7280' }}>
                    No messages found.
                  </td>
                </tr>
              )}
              {messages.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '8px 12px', whiteSpace: 'nowrap' }}>{formatDate(m.createdAt)}</td>
                  <td style={{ padding: '8px 12px' }}>{m.direction}</td>
                  <td style={{ padding: '8px 12px' }}>{m.from}</td>
                  <td style={{ padding: '8px 12px' }}>{m.to}</td>
                  <td style={{ padding: '8px 12px', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.body}</td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        )}
      </Stack>
    </Container>
  );
}
