'use client';

import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Stack, Text } from '@/design/ui';
import { ConfirmationCard } from '@/components/booking/ConfirmationCard';
import type { BookingDraft, ChatMessage, ChatResponse, ConfirmationContext } from '@/lib/chat/chat-types';

const INITIAL_ASSISTANT_MESSAGE =
  'Tell me your pickup address, dropoff airport, and preferred date/time to start your booking.';

interface BookingChatProps {
  endpoint?: string;
}

export function BookingChat({ endpoint = '/api/chat/booking-assistant' }: BookingChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: INITIAL_ASSISTANT_MESSAGE },
  ]);
  const [draft, setDraft] = useState<BookingDraft>({});
  const [confirmation, setConfirmation] = useState<ConfirmationContext | undefined>();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookingId, setBookingId] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, confirmation, isLoading]);

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

  async function sendConversation(nextMessages: ChatMessage[], options?: { confirm?: boolean }) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload: Record<string, unknown> = {
        messages: nextMessages,
        draft,
      };

      if (options?.confirm && confirmation) {
        payload.confirm = {
          accepted: true,
          token: confirmation.token,
          summaryHash: confirmation.summaryHash,
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => ({}))) as Partial<ChatResponse> & {
        error?: string;
      };

      if (!response.ok) {
        setErrorMessage(data.error ?? 'Chat is currently unavailable. Please use the booking form below.');
        return;
      }

      if (typeof data.message === 'string' && data.message.trim().length) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message as string }]);
      }

      if (data.draft) {
        setDraft(data.draft as BookingDraft);
      }

      if (data.showConfirmation && data.confirmation) {
        setConfirmation(data.confirmation as ConfirmationContext);
      } else {
        setConfirmation(undefined);
      }

      if (data.bookingId) {
        setBookingId(data.bookingId);
        setConfirmation(undefined);
      }

      if (data.handoff?.reason) {
        setErrorMessage(`Manual handoff: ${data.handoff.reason}. Call ${data.handoff.phone}.`);
      }
    } catch {
      setErrorMessage('We hit a temporary issue. Please retry or use the form below.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const nextMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(nextMessages);
    setInput('');
    await sendConversation(nextMessages);
  };

  const handleConfirmBooking = async () => {
    if (!confirmation || isLoading) return;

    const nextMessages = [...messages, { role: 'user' as const, content: 'Yes, confirm this booking.' }];
    setMessages(nextMessages);
    await sendConversation(nextMessages, { confirm: true });
  };

  const handleEditBooking = () => {
    setConfirmation(undefined);
    setMessages((prev) => [...prev, { role: 'assistant', content: 'What would you like to change?' }]);
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 720,
        border: '1px solid #d1d5db',
        borderRadius: 16,
        overflow: 'hidden',
        background: '#ffffff',
      }}
      data-testid="booking-chat"
    >
      <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
        <Text style={{ fontWeight: 700 }}>Booking Assistant</Text>
        <Text variant="small">Chat to build your trip, then confirm booking.</Text>
      </div>

      <div style={{ padding: 16, height: 420, overflowY: 'auto', background: '#f9fafb' }}>
        <Stack spacing="sm">
          {messages.map((message, idx) => (
            <div
              key={`${message.role}-${idx}`}
              style={{
                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '10px 12px',
                borderRadius: 12,
                background: message.role === 'user' ? '#2563eb' : '#ffffff',
                color: message.role === 'user' ? '#ffffff' : '#111827',
                border: message.role === 'assistant' ? '1px solid #e5e7eb' : 'none',
              }}
            >
              <Text style={{ whiteSpace: 'pre-wrap' }}>{message.content}</Text>
            </div>
          ))}

          {confirmation && !bookingId && (
            <ConfirmationCard
              confirmation={confirmation}
              onConfirm={handleConfirmBooking}
              onEdit={handleEditBooking}
              loading={isLoading}
            />
          )}

          {bookingId && (
            <div
              style={{
                border: '1px solid #86efac',
                background: '#f0fdf4',
                borderRadius: 12,
                padding: 12,
              }}
            >
              <Text style={{ fontWeight: 700 }}>Booking confirmed</Text>
              <Text>Your booking ID is {bookingId}.</Text>
            </div>
          )}

          {isLoading && <Text variant="small">Assistant is working...</Text>}
          {errorMessage && <Text variant="small" style={{ color: '#b91c1c' }}>{errorMessage}</Text>}
          <div ref={scrollRef} />
        </Stack>
      </div>

      <div style={{ padding: 12, borderTop: '1px solid #e5e7eb' }}>
        <form onSubmit={handleSubmit}>
          <Stack direction="horizontal" spacing="sm" align="center">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your message"
              fullWidth
              disabled={isLoading}
              data-testid="chat-input"
            />
            <Button
              type="submit"
              text="Send"
              variant="primary"
              disabled={!canSend}
              data-testid="chat-send"
            />
          </Stack>
        </form>
      </div>
    </div>
  );
}
