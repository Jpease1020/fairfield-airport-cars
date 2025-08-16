'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Container, Stack, Button, Span, Text, Drawer } from '@/ui';
import { MessageSquare, AlertTriangle, X } from 'lucide-react';
import { commentsService, type CommentRecord } from '@/lib/business/comments-service';

const FloatingCommentBox = styled.div<{ $top: number; $left: number }>`
  position: fixed;
  top: ${({ $top }) => `${$top}px`};
  left: ${({ $left }) => `${$left}px`};
  z-index: 11050;
  transform: translate(8px, 8px);
`;

interface GlobalCommentIconsProps {
  isAdmin: boolean;
  commentMode?: boolean;
}

export default function GlobalCommentIcons({ isAdmin, commentMode = false }: GlobalCommentIconsProps) {
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [commentAnchors, setCommentAnchors] = useState<Record<string, { top: number; left: number }>>({});
  const [hoveredCommentId, setHoveredCommentId] = useState<string | null>(null);
  const [orphanedComments, setOrphanedComments] = useState<CommentRecord[]>([]);
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);

  // Load existing comments for this page
  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      try {
        const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
        const existing = await commentsService.getComments({ pageUrl, scope: 'page' });
        setComments(existing);
      } catch {
        // Non-blocking; page still works without preloaded comments
      }
    };
    load();
  }, [isAdmin]);

  // Listen for new comments being added
  useEffect(() => {
    const handleCommentAdded = (e: Event) => {
      const customEvent = e as any;
      const { elementId, comment } = customEvent.detail;
      // Refresh comments to include the new one
      const load = async () => {
        try {
          const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
          const existing = await commentsService.getComments({ pageUrl, scope: 'page' });
          setComments(existing);
        } catch {
          // Non-blocking
        }
      };
      load();
    };

    document.addEventListener('commentAdded', handleCommentAdded);
    return () => document.removeEventListener('commentAdded', handleCommentAdded);
  }, []);

  // Compute icon anchors for each comment with element validation
  useEffect(() => {
    if (!commentMode) return;
    
    const compute = () => {
      const validAnchors: Record<string, { top: number; left: number }> = {};
      const orphaned: CommentRecord[] = [];

      comments.forEach((comment) => {
        // Try to find element by data-comment-id first (most reliable)
        let el = document.querySelector(`[data-comment-id="${comment.elementId}"]`) as HTMLElement;
        
        // Fallback: try to find by elementSelector if it's a CSS selector
        if (!el && comment.elementSelector && comment.elementSelector !== comment.elementId) {
          el = document.querySelector(comment.elementSelector) as HTMLElement;
        }
        
        // Additional fallback: try to find by CMS ID if elementSelector is a CMS path
        if (!el && comment.elementSelector && comment.elementSelector.includes('.')) {
          // Look for elements with data-cms-id that matches the elementSelector
          el = document.querySelector(`[data-cms-id="${comment.elementSelector}"]`) as HTMLElement;
        }

        if (el) {
          // Element found - position icon
          const rect = el.getBoundingClientRect();
          validAnchors[comment.id] = { 
            top: Math.max(8, rect.top), 
            left: Math.max(8, rect.left + rect.width) 
          };
        } else {
          // Element not found - mark as orphaned
          orphaned.push(comment);
        }
      });

      setCommentAnchors(validAnchors);
      setOrphanedComments(orphaned);
    };

    compute();
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute, { passive: true });
    return () => {
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
    };
  }, [comments, commentMode]);

  // Don't render if not admin or comment mode not active
  if (!isAdmin || !commentMode) return null;

  return (
    <>
      {/* Comments indicator and drawer toggle */}
      {(comments.length > 0 || orphanedComments.length > 0) && (
        <Container
          variant="default"
          padding="sm"
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 11040,
            cursor: 'pointer',
            background: 'var(--background-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
          onClick={() => setShowCommentsDrawer(true)}
        >
          <Stack direction="horizontal" align="center" spacing="sm">
            <MessageSquare size={16} />
            <Span size="sm" weight="semibold">
              Comments ({comments.length + orphanedComments.length})
            </Span>
          </Stack>
        </Container>
      )}

      {/* Comment icons (tooltip-like) when in comment mode */}
      {Object.keys(commentAnchors).map((id, index) => (
        <Container key={`wrap_${id}`} variant="default" padding="none">
          <FloatingCommentBox $top={commentAnchors[id].top} $left={commentAnchors[id].left}>
            <Container
              variant="default"
              padding="none"
              data-comment-id={id}
              data-testid={`comment-icon-${index + 1}`}
              onMouseEnter={() => setHoveredCommentId(id)}
              onMouseLeave={() => setHoveredCommentId((curr) => (curr === id ? null : curr))}
            >
              <Stack direction="horizontal" spacing="none">
                <Button variant="ghost" size="sm" data-comment-id={id}>
                  <MessageSquare size={14} />
                </Button>
              </Stack>
            </Container>
          </FloatingCommentBox>
          {hoveredCommentId === id && (
            <FloatingCommentBox $top={commentAnchors[id].top} $left={commentAnchors[id].left}>
              <Container variant="tooltip" padding="none" role="tooltip">
                <Container variant="default" padding="none">
                  <Span size="xs" color="muted">{comments.find(c => c.id === id)?.elementText}</Span>
                  <Text>{comments.find(c => c.id === id)?.comment}</Text>
                </Container>
              </Container>
            </FloatingCommentBox>
          )}
        </Container>
      ))}

      {/* Comments Drawer - shows all comments and orphaned comments */}
      <Drawer
        isOpen={showCommentsDrawer}
        onClose={() => setShowCommentsDrawer(false)}
        title="Page Comments"
        position="right"
        width={400}
        headerVariant="prominent"
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCommentsDrawer(false)}
          >
            <X size={16} />
          </Button>
        }
      >
        <Stack spacing="lg">
          {/* Active Comments */}
          {comments.length > 0 && (
            <Container variant="elevated" padding="md">
              <Stack spacing="sm">
                <Span size="sm" weight="semibold">Active Comments ({comments.length})</Span>
                {comments.map((comment) => (
                  <Container key={comment.id} variant="default" padding="sm">
                    <Stack spacing="xs">
                      <Span size="sm" weight="medium">{comment.elementText}</Span>
                      <Text size="sm">{comment.comment}</Text>
                      <Span size="xs" color="muted">
                        Created: {new Date(comment.createdAt).toLocaleDateString()}
                      </Span>
                    </Stack>
                  </Container>
                ))}
              </Stack>
            </Container>
          )}
          
          {/* Orphaned Comments */}
          {orphanedComments.length > 0 && (
            <Container variant="elevated" padding="md">
              <Stack spacing="sm">
                <Stack direction="horizontal" align="center" spacing="sm">
                  <AlertTriangle size={16} color="orange" />
                  <Span size="sm" weight="semibold">Orphaned Comments ({orphanedComments.length})</Span>
                </Stack>
                <Text size="xs" color="muted">
                  These comments are for elements that can no longer be found on this page.
                </Text>
                {orphanedComments.map((comment) => (
                  <Container key={comment.id} variant="default" padding="sm">
                    <Stack spacing="xs">
                      <Span size="sm" weight="medium">{comment.elementText}</Span>
                      <Text size="sm">{comment.comment}</Text>
                                             <Span size="xs" color="muted">
                         Created: {new Date(comment.createdAt).toLocaleDateString()}
                       </Span>
                     </Stack>
                   </Container>
                 ))}
               </Stack>
             </Container>
           )}
         </Stack>
       </Drawer>
    </>
  );
}
