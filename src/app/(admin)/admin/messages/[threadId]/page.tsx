'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { Alert, Box, Button, Container, H1, LoadingSpinner, Stack, Text, Textarea } from '@/design/ui';
import { db } from '@/lib/utils/firebase';
import { authFetch } from '@/lib/utils/auth-fetch';
import { formatDateTimeNoSeconds } from '@/utils/formatting';

const THREAD_POLL_INTERVAL_MS = 5000;

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

const MessageList = styled.div`
  max-height: min(60vh, 640px);
  overflow-y: auto;
  padding-right: 4px;
`;

const toIso = (value: unknown): string | null => {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  return typeof value === 'string' ? value : null;
};

const mapThread = (
  id: string,
  raw: Record<string, unknown>
): SmsThread => ({
  id,
  customerPhone: typeof raw.customerPhone === 'string' ? raw.customerPhone : '',
  customerName: typeof raw.customerName === 'string' ? raw.customerName : null,
  status: raw.status === 'closed' ? 'closed' : 'open',
  unreadCount: typeof raw.unreadCount === 'number' ? raw.unreadCount : 0,
});

const mapMessage = (
  doc: { id: string; data: () => Record<string, unknown> }
): SmsThreadMessage => {
  const raw = doc.data();
  return {
    id: doc.id,
    threadId: typeof raw.threadId === 'string' ? raw.threadId : null,
    direction: raw.direction === 'outbound' ? 'outbound' : 'inbound',
    senderType:
      raw.senderType === 'admin' || raw.senderType === 'system' || raw.senderType === 'customer'
        ? raw.senderType
        : raw.direction === 'outbound'
          ? 'system'
          : 'customer',
    from: typeof raw.from === 'string' ? raw.from : '',
    to: typeof raw.to === 'string' ? raw.to : '',
    body: typeof raw.body === 'string' ? raw.body : '',
    createdAt: toIso(raw.createdAt),
  };
};

export default function AdminMessageThreadPage() {
  const router = useRouter();
  const params = useParams<{ threadId: string }>();
  const threadId = params?.threadId || '';
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const autoScrollRef = useRef(true);
  const previousMessageCountRef = useRef(0);

  const [thread, setThread] = useState<SmsThread | null>(null);
  const [messages, setMessages] = useState<SmsThreadMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');

  useEffect(() => {
    let cancelled = false;
    let pollIntervalId: number | null = null;

    async function loadThread(options?: { silent?: boolean; markAsRead?: boolean }) {
      const silent = options?.silent === true;
      const markAsRead = options?.markAsRead !== false;

      if (!silent) {
        setLoading(true);
        setError(null);
      }

      try {
        const response = await authFetch(`/api/admin/messages/threads/${threadId}`);
        if (!response.ok) throw new Error('Failed to load thread');
        const payload = await response.json();

        if (!cancelled) {
          setThread(payload.thread ?? null);
          setMessages(payload.messages ?? []);
        }

        if (markAsRead) {
          authFetch(`/api/admin/messages/threads/${threadId}/read`, { method: 'POST' }).catch(() => undefined);
        }
      } catch (loadError) {
        if (!cancelled && !silent) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load thread');
        }
      } finally {
        if (!cancelled && !silent) setLoading(false);
      }
    }

    const startPollingFallback = () => {
      if (pollIntervalId !== null) return;
      pollIntervalId = window.setInterval(() => {
        if (document.visibilityState === 'visible' && threadId) {
          loadThread({ silent: true, markAsRead: false }).catch(() => undefined);
        }
      }, THREAD_POLL_INTERVAL_MS);
    };

    if (threadId) {
      loadThread({ markAsRead: true }).catch(() => undefined);
    }

    if (!threadId) {
      return () => {
        cancelled = true;
      };
    }

    let threadSnapshotReady = false;
    let messagesSnapshotReady = false;
    const completeLoading = () => {
      if (threadSnapshotReady && messagesSnapshotReady) {
        setLoading(false);
        setError(null);
        if (pollIntervalId !== null) {
          window.clearInterval(pollIntervalId);
          pollIntervalId = null;
        }
      }
    };

    const unsubscribeThread = onSnapshot(
      doc(db, 'smsThreads', threadId),
      (snapshot) => {
        if (cancelled) return;
        if (snapshot.exists()) {
          setThread(mapThread(snapshot.id, snapshot.data() as Record<string, unknown>));
        }
        threadSnapshotReady = true;
        completeLoading();
      },
      (listenerError) => {
        console.error('Realtime SMS thread listener failed, using polling fallback:', listenerError);
        if (cancelled) return;
        startPollingFallback();
      }
    );

    const unsubscribeMessages = onSnapshot(
      query(collection(db, 'smsMessages'), where('threadId', '==', threadId)),
      (snapshot) => {
        if (cancelled) return;
        const nextMessages = snapshot.docs
          .map((messageDoc) => mapMessage(messageDoc as any))
          .sort((a, b) => {
            if (!a.createdAt && !b.createdAt) return 0;
            if (!a.createdAt) return -1;
            if (!b.createdAt) return 1;
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          });
        setMessages(nextMessages);
        messagesSnapshotReady = true;
        completeLoading();
      },
      (listenerError) => {
        console.error('Realtime SMS message listener failed, using polling fallback:', listenerError);
        if (cancelled) return;
        startPollingFallback();
      }
    );

    return () => {
      cancelled = true;
      unsubscribeThread();
      unsubscribeMessages();
      if (pollIntervalId !== null) window.clearInterval(pollIntervalId);
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

  useEffect(() => {
    const container = messageListRef.current;
    if (!container) return;

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      autoScrollRef.current = distanceFromBottom < 96;
    };

    handleScroll();
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [threadId]);

  useEffect(() => {
    const container = messageListRef.current;
    if (!container) return;

    const hasNewMessage = messages.length > previousMessageCountRef.current;
    const shouldScroll = autoScrollRef.current || previousMessageCountRef.current === 0;

    if (hasNewMessage && shouldScroll) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }

    previousMessageCountRef.current = messages.length;
  }, [messages]);

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
            {error && <Alert variant="error">{error}</Alert>}

            <Box variant="outlined" padding="lg">
              <MessageList ref={messageListRef}>
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
              </MessageList>
            </Box>

            <ComposerBar variant="elevated" padding="lg">
              <Stack spacing="md">
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
