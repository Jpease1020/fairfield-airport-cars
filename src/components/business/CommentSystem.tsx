'use client';

import { useState, useEffect, ReactNode, useCallback, useLayoutEffect, useRef } from 'react';
import styled from 'styled-components';

const FloatingCommentBox = styled.div<{ $top: number; $left: number }>`
  position: fixed;
  top: ${({ $top }) => `${$top}px`};
  left: ${({ $left }) => `${$left}px`};
  z-index: 11050;
  transform: translate(8px, 8px);
`;
import { X, MessageSquare } from 'lucide-react';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { Container, H4, Span } from '@/ui';
import { Stack, Text } from '@/ui';
import { Button } from '@/ui';
import { Textarea } from '@/ui';
import { commentsService, type CommentRecord, type CommentScope } from '@/lib/business/comments-service';
import { useAuth } from '@/hooks/useAuth';
import { useEditMode } from '@/design/providers/EditModeProvider';
// import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';

interface CommentSystemProps {
  children: ReactNode;
}

interface LocalComment {
  id: string;
  elementText: string;
  comment: string;
  createdAt: Date;
  elementSelector?: string;
}

const CommentSystem = ({ children }: CommentSystemProps) => {
  const { isAdmin } = useAdminStatus();
  const { user } = useAuth();
  const { commentMode } = (useEditMode() as any) || { commentMode: false };
  const [comments, setComments] = useState<LocalComment[]>([]);
  const [activeCommentBox, setActiveCommentBox] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [scope, setScope] = useState<CommentScope>('page');
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [computedPosition, setComputedPosition] = useState<{ top: number; left: number } | null>(null);
  const [hoveredCommentId, setHoveredCommentId] = useState<string | null>(null);
  const [commentAnchors, setCommentAnchors] = useState<Record<string, { top: number; left: number }>>({});
  const boxRef = useRef<HTMLDivElement | null>(null);
  // const { cmsData } = useCMSData();

  // Simple click handler - only when comment mode is active
  const handleClick = useCallback((e: MouseEvent) => {
    if (!isAdmin || !commentMode) return;

    // Prevent default behavior when comment mode is active
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    if (!target) return;

    // Skip only comment/admin elements (allow interacting with form controls to select them)
    const isCommentElement = 
      target.closest('.comment-box') ||
      target.closest('[data-comment-box]') ||
      target.closest('.comment-icon') ||
      target.closest('.simple-comment-icon') ||
      target.closest('[data-comment-id]') ||
      target.closest('[data-admin-control="true"]') ||
      target.closest('[role="dialog"]');

    if (isCommentElement) {
      return;
    }

    // Generate simple ID for the element
    const elementId = `comment-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const elementText = target.textContent?.trim() || target.tagName.toLowerCase();
    
    setSelectedElement(target);
    setActiveCommentBox(elementId);
    setCommentText('');
    // Mark the clicked element
    try {
      target.setAttribute('data-comment-active', 'true');
    } catch {
      // ignore
    }

    // If clicking on a blank area, anchor to upper-left of the nearest section/main; otherwise use cursor
    const isBlank = !target.textContent || target.textContent.trim() === '' || target === document.body || target === (document.documentElement as any);
    if (isBlank) {
      const container = (target.closest('main, section, [data-section], [role="main"]') as HTMLElement) || (document.querySelector('main') as HTMLElement) || (document.body as HTMLElement);
      const r = container.getBoundingClientRect();
      setClickPosition({ x: Math.max(8, r.left + 8), y: Math.max(8, r.top + 8) });
    } else {
      setClickPosition({ x: e.clientX, y: e.clientY });
    }
  }, [isAdmin, commentMode]);


  // Handle left-click on any element - only when comment mode is active
  useEffect(() => {
    if (!isAdmin || !commentMode) return;

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isAdmin, commentMode, handleClick]);

  // Position the floating comment box within the viewport (clamp/flip)
  useLayoutEffect(() => {
    if (!clickPosition || !activeCommentBox) {
      setComputedPosition(null);
      return;
    }
    const padding = 8;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    const measureAndSet = () => {
      const boxEl = boxRef.current;
      const fallbackRect = { width: 320, height: 220 } as { width: number; height: number };
      const boxRect = boxEl ? boxEl.getBoundingClientRect() : (fallbackRect as any);

      // Preferred to the right & below the click
      let left = clickPosition.x + padding;
      let top = clickPosition.y + padding;

      // Flip horizontally if overflowing right
      if (left + boxRect.width > viewportW - padding) {
        left = Math.max(padding, clickPosition.x - boxRect.width - padding);
      }
      // Flip vertically if overflowing bottom
      if (top + boxRect.height > viewportH - padding) {
        top = Math.max(padding, clickPosition.y - boxRect.height - padding);
      }

      // Final clamp within viewport bounds
      left = Math.min(Math.max(padding, left), Math.max(padding, viewportW - boxRect.width - padding));
      top = Math.min(Math.max(padding, top), Math.max(padding, viewportH - boxRect.height - padding));

      setComputedPosition({ top, left });
    };

    // Measure after paint
    window.requestAnimationFrame(measureAndSet);
    const onResize = () => window.requestAnimationFrame(measureAndSet);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [clickPosition, activeCommentBox]);

  // Load existing comments for this page (best-effort)
  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      try {
        const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
        const existing = await commentsService.getComments({ pageUrl, scope: 'page' });
        const mapped: LocalComment[] = existing.map((c) => ({
          id: c.id,
          elementText: c.elementText,
          comment: c.comment,
          createdAt: new Date(c.createdAt),
          elementSelector: c.elementSelector,
        }));
        setComments(mapped);
      } catch {
        // Non-blocking; page still works without preloaded comments
      }
    };
    load();
  }, [isAdmin]);

  function computeElementSelector(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    const classes = (element.className || '')
      .toString()
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((c) => `.${c}`)
      .join('');
    const tag = element.tagName.toLowerCase();
    return `${tag}${classes}`;
  }

  // Close comment box when clicking outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as Element;
    const isCommentBoxClick = target.closest('[data-comment-box]');
    
    if (!isCommentBoxClick) {
      setActiveCommentBox(null);
      // remove marker
      if (selectedElement) {
        try { selectedElement.removeAttribute('data-comment-active'); } catch { /* ignore */ }
      }
      setSelectedElement(null);
      setClickPosition(null);
    }
  }, [selectedElement]);

  useEffect(() => {
    if (activeCommentBox) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeCommentBox, handleClickOutside]);

  const handleAddComment = useCallback(async () => {
    if (!commentText.trim() || !selectedElement) return;

    const elementId = `comment-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const elementText = selectedElement.textContent?.trim() || selectedElement.tagName.toLowerCase();
    const elementSelector = computeElementSelector(selectedElement);
    const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
    const pageTitle = typeof document !== 'undefined' ? document.title : '';
    const createdBy = user?.email || user?.uid || 'anonymous';

    try {
      const newId = await commentsService.addComment({
        elementId,
        elementText,
        elementSelector,
        pageUrl,
        pageTitle,
        comment: commentText.trim(),
        status: 'open',
        createdBy,
        scope,
      } as Omit<CommentRecord, 'id' | 'createdAt' | 'updatedAt'>);

      const newComment: LocalComment = {
        id: newId,
        elementText,
        comment: commentText.trim(),
        createdAt: new Date(),
        elementSelector,
      };
      setComments((prev) => [newComment, ...prev]);
    } catch {
      // Fallback to local-only entry if persistence fails
      const localFallback: LocalComment = {
        id: elementId,
        elementText,
        comment: commentText.trim(),
        createdAt: new Date(),
        elementSelector,
      };
      setComments((prev) => [localFallback, ...prev]);
    } finally {
      setActiveCommentBox(null);
      // remove marker
      try { selectedElement.removeAttribute('data-comment-active'); } catch { /* ignore */ }
      setSelectedElement(null);
      setClickPosition(null);
      setCommentText('');
    }
  }, [commentText, selectedElement, user]);

  // Compute icon anchors for each comment when comments change or on scroll/resize
  useEffect(() => {
    if (!commentMode) return;
    const compute = () => {
      const next: Record<string, { top: number; left: number }> = {};
      comments.forEach((c) => {
        if (!c.elementSelector) return;
        const el = document.querySelector(c.elementSelector) as HTMLElement | null;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        next[c.id] = { top: Math.max(8, rect.top), left: Math.max(8, rect.left + rect.width) };
      });
      setCommentAnchors(next);
    };
    compute();
    window.addEventListener('scroll', compute, true);
    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('scroll', compute, true);
      window.removeEventListener('resize', compute);
    };
  }, [comments, commentMode]);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    try {
      await commentsService.deleteComment(commentId);
    } catch {
      // ignore errors; we'll still prune locally
    }
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }, []);

  // Inline controls minimal: checkbox for app-wide scope when adding

  // Don't render if not admin
  if (!isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      {/* Comment mode is controlled by FloatingEditButton via EditModeProvider */}

      {/* Comment Box */}
      {activeCommentBox && computedPosition && (
        <FloatingCommentBox $top={computedPosition.top} $left={computedPosition.left}>
          <Container variant="tooltip" padding="none">
          <Container data-comment-box variant="elevated" padding="lg" onClick={(e: any) => e.stopPropagation()}>
            <Stack direction="horizontal" align="center" justify="space-between" padding="sm">
              <H4>Add Comment</H4>
              <Button onClick={(e: any) => { e.stopPropagation(); setActiveCommentBox(null); try { selectedElement?.removeAttribute('data-comment-active'); } catch { /* ignore */ }; setSelectedElement(null); setClickPosition(null); }} variant="ghost">
                <X />
              </Button>
            </Stack>
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Enter your comment..."
                rows={4}
              />
              <Container variant="elevated" padding="sm">
                <label>
                  <input
                    type="checkbox"
                    checked={scope === 'app'}
                    onChange={(e) => setScope(e.target.checked ? 'app' : 'page')}
                  />
                  &nbsp;App-wide comment
                </label>
              </Container>
              <Stack direction="horizontal" spacing="sm" padding="sm">
                <Button onClick={(e: any) => { e.stopPropagation(); handleAddComment(); }} disabled={!commentText.trim()} variant="primary">
                  Add Comment
                </Button>
                <Button onClick={(e: any) => { e.stopPropagation(); setActiveCommentBox(null); try { selectedElement?.removeAttribute('data-comment-active'); } catch { /* ignore */ }; setSelectedElement(null); setClickPosition(null); }} variant="secondary">
                  Close
                </Button>
              </Stack>           
          </Container>
          </Container>
        </FloatingCommentBox>
      )}

      {/* Comment icons (tooltip-like) when in comment mode */}
      {commentMode && Object.keys(commentAnchors).map((id) => (
        <Container key={`wrap_${id}`} variant="default" padding="none">
          <FloatingCommentBox $top={commentAnchors[id].top} $left={commentAnchors[id].left}>
            <Container
              variant="default"
              padding="none"
              data-comment-id={id}
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
    </>
  );
};

export default CommentSystem; 