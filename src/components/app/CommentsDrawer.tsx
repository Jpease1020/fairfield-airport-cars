'use client';

import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Overlay, Container, Stack, Box, Button, Text, Select, Badge } from '@/ui';
import { commentsService, type CommentRecord, type CommentScope } from '@/lib/business/comments-service';

interface CommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DrawerBody = styled(Box)`
  width: min(560px, 100vw);
  max-height: 90vh;
  overflow-y: auto;
`;

function derivePageId(route: string): string {
  const clean = route.replace(/^\//, '').replace(/\/$/, '');
  if (!clean) return 'home';
  const [first, ...rest] = clean.split('/');
  if (first === 'booking' && rest.length > 0) return 'booking';
  if (first === 'book') return 'booking';
  return first;
}

const statusVariants: Record<CommentRecord['status'], 'default' | 'warning' | 'success'> = {
  open: 'default',
  'in-progress': 'warning',
  resolved: 'success',
};

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({ isOpen, onClose }) => {
  const route = typeof window !== 'undefined' ? window.location.pathname : '/';
  const pageId = useMemo(() => derivePageId(route), [route]);
  const [scope, setScope] = useState<CommentScope>('page');
  const [status, setStatus] = useState<CommentRecord['status'] | 'all'>('all');
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '/';

  const load = async () => {
    const list = await commentsService.getComments({
      scope,
      ...(scope === 'page' ? { pageUrl } : {}),
      ...(status === 'all' ? {} : { status }),
    });
    setComments(list);
  };

  useEffect(() => {
    if (!isOpen) return;
    load();
  }, [isOpen, scope, status, pageUrl]);

  const updateStatus = async (id: string, newStatus: CommentRecord['status']) => {
    await commentsService.updateComment(id, { status: newStatus });
    await load();
  };

  const handleDelete = async (id: string) => {
    await commentsService.deleteComment(id);
    await load();
  };

  const jumpToElement = (selector: string) => {
    if (typeof document === 'undefined') return;
    const el = selector ? document.querySelector(selector) : null;
    if (el && 'scrollIntoView' in el) {
      (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <Overlay isOpen={isOpen} onClose={onClose} variant="dropdown" position="right" closeOnBackdropClick zIndex={10990}>
      <DrawerBody as="section" variant="elevated" padding="none" data-admin-control="true">
        <Stack spacing="none">
          <Container padding="lg">
            <Stack direction="horizontal" align="center" justify="space-between">
              <Text size="lg" weight="semibold">Comments</Text>
              <Button variant="ghost" onClick={onClose}>Close</Button>
            </Stack>
          </Container>

          <Container padding="md">
            <Stack direction="horizontal" spacing="md" align="center">
              <Select
                value={scope}
                onChange={(e: any) => setScope(e.target.value)}
                options={[
                  { value: 'page', label: `Page (${pageId})` },
                  { value: 'app', label: 'App-wide' },
                ]}
              />
              <Select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'open', label: 'Open' },
                  { value: 'in-progress', label: 'In Progress' },
                  { value: 'resolved', label: 'Resolved' },
                ]}
              />
              <Button variant="outline" onClick={load}>Refresh</Button>
            </Stack>
          </Container>

          <Container padding="md">
            <Stack spacing="sm">
              {comments.map((c) => (
                <Container key={c.id} variant="elevated" padding="sm">
                  <Stack direction="horizontal" justify="space-between" align="center">
                    <Stack spacing="xs">
                      <Stack direction="horizontal" spacing="sm" align="center">
                        <Badge variant={statusVariants[c.status]} size="sm">{c.status}</Badge>
                        <Text size="sm" color="secondary">{c.pageUrl || 'app'}</Text>
                      </Stack>
                      <Text weight="semibold">{c.elementText}</Text>
                      <Text>{c.comment}</Text>
                      <Text size="xs" color="secondary">by {c.createdBy}</Text>
                    </Stack>
                    <Stack spacing="xs" align="flex-end">
                      <Stack direction="horizontal" spacing="xs">
                        <Button variant="ghost" size="sm" onClick={() => jumpToElement(c.elementSelector)}>Jump</Button>
                        <Button variant="ghost" size="sm" onClick={() => updateStatus(c.id, 'open')}>Open</Button>
                        <Button variant="ghost" size="sm" onClick={() => updateStatus(c.id, 'in-progress')}>In Progress</Button>
                        <Button variant="ghost" size="sm" onClick={() => updateStatus(c.id, 'resolved')}>Resolved</Button>
                      </Stack>
                      <Button variant="danger" size="sm" onClick={() => handleDelete(c.id)}>Delete</Button>
                    </Stack>
                  </Stack>
                </Container>
              ))}
              {comments.length === 0 && (
                <Text color="secondary">No comments found for this filter.</Text>
              )}
            </Stack>
          </Container>
        </Stack>
      </DrawerBody>
    </Overlay>
  );
};


