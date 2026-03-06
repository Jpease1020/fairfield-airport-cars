'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { Alert, Badge, Box, Button, Container, H1, LoadingSpinner, Stack, Text } from '@/design/ui';
import { authFetch } from '@/lib/utils/auth-fetch';
import { formatDateTimeNoSeconds } from '@/utils/formatting';

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

export default function AdminMessagesPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<SmsThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadThreads() {
      setLoading(true);
      setError(null);

      try {
        const response = await authFetch('/api/admin/messages/threads');
        if (!response.ok) throw new Error('Failed to load inbox');
        const payload = await response.json();
        if (!cancelled) setThreads(payload.threads ?? []);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load inbox');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadThreads();
    return () => {
      cancelled = true;
    };
  }, []);

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
