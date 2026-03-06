'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { Alert, Box, Button, Container, H1, LoadingSpinner, Stack, Text, Textarea } from '@/design/ui';
import { authFetch } from '@/lib/utils/auth-fetch';
import { formatDateTimeNoSeconds } from '@/utils/formatting';

interface SmsThread {
  id: string;
  customerPhone: string;
  customerName?: string | null;
  status: 'open' | 'closed';
  unreadCount: number;
}

interface SmsThreadMessage {
  id: string;
  threadId: string | null;
  direction: 'inbound' | 'outbound';
  senderType: 'customer' | 'admin' | 'system';
  from: string;
  to: string;
  body: string;
  createdAt: string | null;
}

const MessageBubble = styled.div<{ $sender: SmsThreadMessage['senderType'] }>`
  max-width: min(88%, 540px);
  border-radius: 16px;
  padding: 12px 14px;
  background: ${({ $sender }) =>
    $sender === 'customer'
      ? 'var(--surface-secondary, #f3f4f6)'
      : $sender === 'admin'
        ? 'rgba(37, 99, 235, 0.12)'
        : 'rgba(15, 23, 42, 0.08)'};
  align-self: ${({ $sender }) => ($sender === 'customer' ? 'flex-start' : 'flex-end')};
  border: 1px solid ${({ $sender }) => ($sender === 'customer' ? 'var(--border-color)' : 'rgba(37, 99, 235, 0.25)')};
`;

const ComposerBar = styled(Box)`
  position: sticky;
  bottom: 0;
`;

const cannedReplies = [
  'Yes, I am available.',
  'What time is your flight?',
  'I am on my way.',
  'Please confirm your address.',
];

export default function AdminMessageThreadPage() {
  const router = useRouter();
  const params = useParams<{ threadId: string }>();
  const threadId = params?.threadId || '';

  const [thread, setThread] = useState<SmsThread | null>(null);
  const [messages, setMessages] = useState<SmsThreadMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadThread() {
      setLoading(true);
      setError(null);

      try {
        const response = await authFetch(`/api/admin/messages/threads/${threadId}`);
        if (!response.ok) throw new Error('Failed to load thread');
        const payload = await response.json();

        if (!cancelled) {
          setThread(payload.thread ?? null);
          setMessages(payload.messages ?? []);
        }

        authFetch(`/api/admin/messages/threads/${threadId}/read`, { method: 'POST' }).catch(() => undefined);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load thread');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (threadId) {
      loadThread();
    }

    return () => {
      cancelled = true;
    };
  }, [threadId]);

  async function reloadThread() {
    const response = await authFetch(`/api/admin/messages/threads/${threadId}`);
    if (!response.ok) throw new Error('Failed to refresh thread');
    const payload = await response.json();
    setThread(payload.thread ?? null);
    setMessages(payload.messages ?? []);
  }

  async function handleSend() {
    const trimmed = replyBody.trim();
    if (!trimmed) return;

    setSending(true);
    setError(null);

    try {
      const response = await authFetch('/api/admin/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, body: trimmed }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to send reply');
      }

      setReplyBody('');
      await reloadThread();
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Failed to send reply');
    } finally {
      setSending(false);
    }
  }

  return (
    <Container maxWidth="lg" padding="xl">
      <Stack spacing="lg">
        <Stack direction="horizontal" justify="space-between" align="center">
          <Button variant="outline" size="sm" text="Back to inbox" onClick={() => router.push('/admin/messages')} />
          <Button variant="outline" size="sm" text="Refresh" onClick={() => reloadThread().catch(() => undefined)} />
        </Stack>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <Stack spacing="xs">
              <H1>{thread?.customerName || thread?.customerPhone || 'SMS Thread'}</H1>
              {thread?.customerName && <Text color="secondary">{thread.customerPhone}</Text>}
            </Stack>

            {error && <Alert variant="error">{error}</Alert>}

            <Box variant="outlined" padding="lg">
              <Stack spacing="md">
                {messages.length === 0 ? (
                  <Text color="secondary">No messages yet.</Text>
                ) : (
                  messages.map((message) => (
                    <MessageBubble key={message.id} $sender={message.senderType}>
                      <Stack spacing="xs">
                        <Text size="sm" weight="bold">
                          {message.senderType === 'customer'
                            ? (thread?.customerName || thread?.customerPhone || 'Customer')
                            : message.senderType === 'admin'
                              ? 'Gregg'
                              : 'System'}
                        </Text>
                        <Text>{message.body}</Text>
                        <Text size="sm" color="secondary">
                          {message.createdAt ? formatDateTimeNoSeconds(message.createdAt) : 'Just now'}
                        </Text>
                      </Stack>
                    </MessageBubble>
                  ))
                )}
              </Stack>
            </Box>

            <ComposerBar variant="elevated" padding="lg">
              <Stack spacing="md">
                <Stack direction="horizontal" spacing="sm" align="center" wrap="wrap">
                  {cannedReplies.map((reply) => (
                    <Button
                      key={reply}
                      variant="outline"
                      size="sm"
                      text={reply}
                      onClick={() => setReplyBody(reply)}
                    />
                  ))}
                </Stack>
                <Textarea
                  value={replyBody}
                  onChange={(event) => setReplyBody(event.target.value)}
                  rows={4}
                  placeholder="Type your reply..."
                />
                <Stack direction="horizontal" justify="space-between" align="center">
                  <Text size="sm" color="secondary">
                    Reply sends through the business number.
                  </Text>
                  <Button
                    variant="primary"
                    size="md"
                    text={sending ? 'Sending...' : 'Send reply'}
                    onClick={handleSend}
                    disabled={sending || !replyBody.trim()}
                  />
                </Stack>
              </Stack>
            </ComposerBar>
          </>
        )}
      </Stack>
    </Container>
  );
}
