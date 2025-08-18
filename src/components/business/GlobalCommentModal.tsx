'use client';

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Container, H4, Stack, Button, Textarea } from '@/ui';
import { X } from 'lucide-react';
import { commentsService, type CommentRecord, type CommentScope } from '@/lib/business/comments-service';
import { useAuth } from '@/hooks/useAuth';

const FloatingCommentBox = styled.div<{ $top: number; $left: number }>`
  position: fixed;
  top: ${({ $top }) => `${$top}px`};
  left: ${({ $left }) => `${$left}px`};
  z-index: 11050;
  transform: translate(8px, 8px);
`;

interface GlobalCommentModalProps {
  isAdmin: boolean;
  commentMode?: boolean;
}

export default function GlobalCommentModal({ isAdmin, commentMode = false }: GlobalCommentModalProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  // Global comment state
  const [activeCommentBox, setActiveCommentBox] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [scope, setScope] = useState<CommentScope>('page');
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [computedPosition, setComputedPosition] = useState<{ top: number; left: number } | null>(null);
  const [currentCmsId, setCurrentCmsId] = useState<string | null>(null);
  
  const boxRef = useRef<HTMLDivElement | null>(null);

  // Global click handler for comment mode
  const handleClick = useCallback((e: MouseEvent) => {
    if (!isAdmin || !commentMode) return;

    // Prevent default behavior when comment mode is active
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    if (!target) return;

    // Skip comment/admin elements
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

    // Generate element ID and get text
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

    // Position the comment box
    const isBlank = !target.textContent || target.textContent.trim() === '' || target === document.body || target === (document.documentElement as any);
    if (isBlank) {
      const container = (target.closest('main, section, [data-section], [role="main"]') as HTMLElement) || (document.querySelector('main') as HTMLElement) || (document.body as HTMLElement);
      const r = container.getBoundingClientRect();
      setClickPosition({ x: Math.max(8, r.left + 8), y: Math.max(8, r.top + 8) });
    } else {
      setClickPosition({ x: e.clientX, y: e.clientY });
    }
  }, [isAdmin, commentMode]);

  // Global click event listener
  React.useEffect(() => {
    if (!isAdmin || !commentMode) return;

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isAdmin, commentMode, handleClick]);

  // Event listener for openCommentModal events
  React.useEffect(() => {
    if (!isAdmin) return;

    const handleOpenCommentModal = (e: Event) => {
      const customEvent = e as any;
      const { cmsId, element, x, y } = customEvent.detail;
      
      // Set the selected element and position
      setSelectedElement(element);
      setActiveCommentBox(`comment-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      setCommentText('');
      setClickPosition({ x, y });
      setCurrentCmsId(cmsId); // Store the CMS ID for the comment
      
      // Mark the element as active
      try {
        element.setAttribute('data-comment-active', 'true');
      } catch {
        // ignore
      }
    };

    document.addEventListener('openCommentModal', handleOpenCommentModal);
    return () => document.removeEventListener('openCommentModal', handleOpenCommentModal);
  }, [isAdmin]);

  // Smart positioning logic
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

    window.requestAnimationFrame(measureAndSet);
    const onResize = () => window.requestAnimationFrame(measureAndSet);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [clickPosition, activeCommentBox]);

  // Close on Escape
  React.useEffect(() => {
    if (!activeCommentBox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCommentBox();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [activeCommentBox]);

  // Close comment box when clicking outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as Element;
    const isCommentBoxClick = target.closest('[data-comment-box]');
    
    if (!isCommentBoxClick) {
      closeCommentBox();
    }
  }, []);

  React.useEffect(() => {
    if (activeCommentBox) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeCommentBox, handleClickOutside]);

  const closeCommentBox = useCallback(() => {
    setActiveCommentBox(null);
    if (selectedElement) {
      try { 
        selectedElement.removeAttribute('data-comment-active'); 
      } catch { 
        /* ignore */ 
      }
    }
    setSelectedElement(null);
    setClickPosition(null);
    setCommentText('');
    setCurrentCmsId(null); // Clear the CMS ID when closing
  }, [selectedElement]);

  const handleAddComment = useCallback(async () => {
    if (!commentText.trim() || !selectedElement) return;

    // Use CMS ID if available, otherwise generate a fallback ID
    const timestamp = Date.now();
    const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
    const pageSlug = pageUrl.replace(/^\//, '').replace(/\//g, '.') || 'unknown';
    
    // Prefer CMS ID over generated ID for better integration
    const elementId = currentCmsId || `${pageSlug}.comment-${timestamp}`;
    const elementText = selectedElement.textContent?.trim() || selectedElement.tagName.toLowerCase();
    const pageTitle = typeof document !== 'undefined' ? document.title : '';
    const createdBy = user?.email || user?.uid || 'anonymous';

    try {
      // Add unique identifier to the DOM element for reliable tracking
      selectedElement.setAttribute('data-comment-id', elementId);
      
      // Prepare comment data
      const commentData = {
        elementId,
        elementText,
        elementSelector: currentCmsId || elementId, // Use CMS ID as selector when available
        pageUrl,
        pageTitle,
        comment: commentText.trim(),
        status: 'open' as const,
        createdBy,
        scope,
      } as Omit<CommentRecord, 'id' | 'createdAt'>;
      
      // Debug: Log the comment data being sent
      console.log('Saving comment with data:', commentData);
      
      // Save comment with CMS ID when available
      await commentsService.addComment(commentData);

      // Dispatch custom event to notify other components about new comment
      const event = new (window as any).CustomEvent('commentAdded', {
        detail: { elementId, comment: commentText.trim() }
      });
      document.dispatchEvent(event);

    } catch (error) {
      console.error('Failed to save comment:', error);
    } finally {
      closeCommentBox();
    }
  }, [commentText, selectedElement, user, scope, closeCommentBox]);

  // Don't render if not admin
  if (!isAdmin) return null;

  return (
    <>
      {/* Comment Box */}
      {activeCommentBox && computedPosition && (
        <FloatingCommentBox $top={computedPosition.top} $left={computedPosition.left}>
          <Container variant="tooltip" padding="none">
            <Container data-comment-box variant="elevated" padding="lg" onClick={(e: any) => e.stopPropagation()}>
              <Stack direction="horizontal" align="center" justify="space-between" padding="sm">
                <H4>Add Comment</H4>
                <Button onClick={closeCommentBox} variant="ghost">
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
                <Button onClick={handleAddComment} disabled={!commentText.trim()} variant="primary">
                  Add Comment
                </Button>
                <Button onClick={closeCommentBox} variant="secondary">
                  Close
                </Button>
              </Stack>           
            </Container>
          </Container>
        </FloatingCommentBox>
      )}
    </>
  );
}
