'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { Alert, Badge, Box, Button, Container, H1, LoadingSpinner, Stack, Text } from '@/design/ui';
import { db } from '@/lib/utils/firebase';
import { authFetch } from '@/lib/utils/auth-fetch';
import { formatDateTimeNoSeconds } from '@/utils/formatting';

const INBOX_POLL_INTERVAL_MS = 5000;
const INBOX_THREAD_LIMIT = 100;

interface SmsThread {
  id: string;
  customerPhone: string;
  customerName?: string | null;
  status: 'open' | 'closed';
  lastMessageAt: string | null;
  lastMessagePreview: string;
  unreadCount: number;
}

const ThreadButton = styled.button<{ $unread: boolean }>`
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 16px;
  text-align: left;
  background: ${({ $unread }) => ($unread ? 'rgba(37, 99, 235, 0.08)' : 'var(--surface-elevated, #fff)')};
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease;

  &:hover {
    border-color: var(--color-primary, #2563eb);
    transform: translateY(-1px);
  }
`;

const PreviewText = styled(Text)`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const EmptyState = styled(Box)`
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const toIso = (value: unknown): string | null => {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  return typeof value === 'string' ? value : null;
};

const mapThread = (doc: { id: string; data: () => Record<string, unknown> }): SmsThread => {
  const raw = doc.data();
  return {
    id: doc.id,
    customerPhone: typeof raw.customerPhone === 'string' ? raw.customerPhone : '',
    customerName: typeof raw.customerName === 'string' ? raw.customerName : null,
    status: raw.status === 'closed' ? 'closed' : 'open',
    lastMessageAt: toIso(raw.lastMessageAt),
    lastMessagePreview: typeof raw.lastMessagePreview === 'string' ? raw.lastMessagePreview : '',
    unreadCount: typeof raw.unreadCount === 'number' ? raw.unreadCount : 0,
  };
};

export default function AdminMessagesPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<SmsThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backfillState, setBackfillState] = useState<{
    loading: boolean;
    summary: string | null;
    error: string | null;
  }>({
    loading: false,
    summary: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    let pollIntervalId: number | null = null;

    async function loadThreads(options?: { silent?: boolean }) {
      const silent = options?.silent === true;
      if (!silent) {
        setLoading(true);
      }
      if (!silent) setError(null);

      try {
        const response = await authFetch('/api/admin/messages/threads');
        if (!response.ok) throw new Error('Failed to load inbox');
        const payload = await response.json();
        if (!cancelled) setThreads(payload.threads ?? []);
      } catch (loadError) {
        if (!cancelled && !silent) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load inbox');
        }
      } finally {
        if (!cancelled && !silent) setLoading(false);
      }
    }

    const startPollingFallback = () => {
      if (pollIntervalId !== null) return;
      pollIntervalId = window.setInterval(() => {
        if (document.visibilityState === 'visible') {
          loadThreads({ silent: true }).catch(() => undefined);
        }
      }, INBOX_POLL_INTERVAL_MS);
    };

    loadThreads().catch(() => undefined);

    const threadsQuery = query(
      collection(db, 'smsThreads'),
      orderBy('lastMessageAt', 'desc'),
      limit(INBOX_THREAD_LIMIT)
    );

    const unsubscribe = onSnapshot(
      threadsQuery,
      (snapshot) => {
        if (cancelled) return;
        setThreads(snapshot.docs.map((doc) => mapThread(doc as any)));
        setError(null);
        setLoading(false);

        if (pollIntervalId !== null) {
          window.clearInterval(pollIntervalId);
          pollIntervalId = null;
        }
      },
      (listenerError) => {
        console.error('Realtime SMS inbox listener failed, using polling fallback:', listenerError);
        if (cancelled) return;
        startPollingFallback();
      }
    );

    return () => {
      cancelled = true;
      unsubscribe();
      if (pollIntervalId !== null) window.clearInterval(pollIntervalId);
    };
  }, []);

  async function runBackfill() {
    setBackfillState({ loading: true, summary: null, error: null });

    try {
      const previewResponse = await authFetch('/api/admin/messages/backfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apply: false }),
      });
      const previewPayload = await previewResponse.json().catch(() => ({}));

      if (!previewResponse.ok) {
        throw new Error(previewPayload.error || 'Failed to preview SMS history backfill');
      }

      if (!previewPayload.matchedMessages) {
        setBackfillState({
          loading: false,
          summary: 'No legacy SMS history needed backfill.',
          error: null,
        });
        return;
      }

      const confirmed = window.confirm(
        `Backfill ${previewPayload.matchedMessages} legacy SMS messages into threads?`
      );
      if (!confirmed) {
        setBackfillState({
          loading: false,
          summary: `Preview found ${previewPayload.matchedMessages} messages to attach. Backfill cancelled.`,
          error: null,
        });
        return;
      }

      const applyResponse = await authFetch('/api/admin/messages/backfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apply: true }),
      });
      const applyPayload = await applyResponse.json().catch(() => ({}));

      if (!applyResponse.ok) {
        throw new Error(applyPayload.error || 'Failed to backfill SMS history');
      }

      setBackfillState({
        loading: false,
        summary: `Backfilled ${applyPayload.updatedMessages} SMS messages into threads.`,
        error: null,
      });
    } catch (backfillError) {
      setBackfillState({
        loading: false,
        summary: null,
        error: backfillError instanceof Error ? backfillError.message : 'Failed to backfill SMS history',
      });
    }
  }

  return (
    <Container maxWidth="lg" padding="xl">
      <Stack spacing="lg">
        <Stack spacing="sm">
          <H1>Messages</H1>
          <Text color="secondary">
            Gregg&apos;s SMS inbox. Open a thread to reply through the business number.
          </Text>
        </Stack>

        {error && <Alert variant="error">{error}</Alert>}

        {loading ? (
          <LoadingSpinner />
        ) : threads.length === 0 ? (
          <EmptyState variant="outlined" padding="xl">
            <Stack spacing="sm" align="center">
              <Text weight="bold">No SMS threads yet</Text>
              <Text color="secondary" align="center">
                New customer texts will appear here automatically.
              </Text>
            </Stack>
          </EmptyState>
        ) : (
          <Stack spacing="md">
            {threads.map((thread) => (
              <ThreadButton
                key={thread.id}
                type="button"
                onClick={() => router.push(`/admin/messages/${thread.id}`)}
                $unread={thread.unreadCount > 0}
              >
                <Stack spacing="sm">
                  <Stack direction="horizontal" justify="space-between" align="center">
                    <Stack spacing="xs">
                      <Text weight="bold">
                        {thread.customerName || thread.customerPhone}
                      </Text>
                      {thread.customerName && (
                        <Text size="sm" color="secondary">
                          {thread.customerPhone}
                        </Text>
                      )}
                    </Stack>
                    <Stack spacing="xs" align="flex-end">
                      <Text size="sm" color="secondary">
                        {thread.lastMessageAt ? formatDateTimeNoSeconds(thread.lastMessageAt) : 'Just now'}
                      </Text>
                      {thread.unreadCount > 0 && <Badge>{thread.unreadCount} new</Badge>}
                    </Stack>
                  </Stack>
                  <PreviewText color="secondary">
                    {thread.lastMessagePreview || 'No messages yet'}
                  </PreviewText>
                </Stack>
              </ThreadButton>
            ))}
          </Stack>
        )}

        <Box variant="outlined" padding="md">
          <Stack spacing="sm">
            <Text weight="bold">Debug view</Text>
            <Text size="sm" color="secondary">
              The flat SMS message log is still available at `/api/admin/sms-messages` for troubleshooting.
            </Text>
            {backfillState.summary && <Alert variant="success">{backfillState.summary}</Alert>}
            {backfillState.error && <Alert variant="error">{backfillState.error}</Alert>}
            <Button
              variant="outline"
              size="sm"
              text={backfillState.loading ? 'Backfilling legacy history...' : 'Backfill old SMS history'}
              onClick={() => runBackfill().catch(() => undefined)}
              disabled={backfillState.loading}
            />
            <Button
              variant="outline"
              size="sm"
              text="Refresh inbox"
              onClick={() => window.location.reload()}
            />
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
