'use client';

import { useState, useEffect, ReactNode, useCallback } from 'react';
import { X } from 'lucide-react';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { Container, H4, Span } from '@/ui';
import { Stack, Text } from '@/ui';
import { Button } from '@/ui';
import { Textarea } from '@/ui';
import { confluenceCommentsService, type ConfluenceComment } from '@/lib/business/confluence-comments';
import { useAuth } from '@/hooks/useAuth';
// import { useCMSData, getCMSField } from '@/design/providers/CMSDesignProvider';

interface CommentSystemProps {
  children: ReactNode;
}

interface LocalComment {
  id: string;
  elementText: string;
  comment: string;
  createdAt: Date;
}

const CommentSystem = ({ children }: CommentSystemProps) => {
  const { isAdmin } = useAdminStatus();
  const { user } = useAuth();
  const [commentMode, setCommentMode] = useState(false);
  const [comments, setComments] = useState<LocalComment[]>([]);
  const [activeCommentBox, setActiveCommentBox] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  // const { cmsData } = useCMSData();

  // Simple click handler - only when comment mode is active
  const handleClick = useCallback((e: MouseEvent) => {
    if (!isAdmin || !commentMode) return;

    // Prevent default behavior when comment mode is active
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as HTMLElement;
    if (!target) return;

    // Skip comment-related elements
    const isCommentElement = 
      target.closest('.comment-box') ||
      target.closest('.comment-icon') ||
      target.closest('.simple-comment-icon') ||
      target.closest('[data-comment-id]') ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('select') ||
      target.closest('form');

    if (isCommentElement) {
      return;
    }

    // Generate simple ID for the element
    const elementId = `comment-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const elementText = target.textContent?.trim() || target.tagName.toLowerCase();
    
    setSelectedElement(target);
    setActiveCommentBox(elementId);
    setCommentText('');
  }, [isAdmin, commentMode]);

  // Handle left-click on any element - only when comment mode is active
  useEffect(() => {
    if (!isAdmin || !commentMode) return;

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isAdmin, commentMode, handleClick]);

  // Load existing comments for this page (best-effort)
  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      try {
        const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
        const existing = await confluenceCommentsService.getComments({ pageUrl });
        const mapped: LocalComment[] = existing.map((c) => ({
          id: c.id,
          elementText: c.elementText,
          comment: c.comment,
          createdAt: new Date(c.createdAt),
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
      setSelectedElement(null);
    }
  }, []);

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
      const newId = await confluenceCommentsService.addComment({
        elementId,
        elementText,
        elementSelector,
        pageUrl,
        pageTitle,
        comment: commentText.trim(),
        status: 'open',
        createdBy,
      } as Omit<ConfluenceComment, 'id' | 'createdAt' | 'updatedAt'>);

      const newComment: LocalComment = {
        id: newId,
        elementText,
        comment: commentText.trim(),
        createdAt: new Date(),
      };
      setComments((prev) => [newComment, ...prev]);
    } catch {
      // Fallback to local-only entry if persistence fails
      const localFallback: LocalComment = {
        id: elementId,
        elementText,
        comment: commentText.trim(),
        createdAt: new Date(),
      };
      setComments((prev) => [localFallback, ...prev]);
    } finally {
      setActiveCommentBox(null);
      setSelectedElement(null);
      setCommentText('');
    }
  }, [commentText, selectedElement, user]);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    try {
      await confluenceCommentsService.deleteComment(commentId);
    } catch {
      // ignore errors; we'll still prune locally
    }
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }, []);

  // Don't render if not admin
  if (!isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      {/* Simple Comment Mode Toggle Button */}
      <Container variant="elevated" padding="md">
        <Button
          onClick={() => setCommentMode(!commentMode)}
          variant={commentMode ? 'primary' : 'secondary'}
        >
          {commentMode ? '✓' : '○'} Comments
        </Button>
      </Container>

      {/* Comment Box */}
      {activeCommentBox && (
        <Container data-comment-box variant="elevated" padding="lg">
          <Container variant="elevated" padding="sm">
            <H4>Add Comment</H4>
            <Button onClick={() => setActiveCommentBox(null)} variant="ghost">
              <X />
            </Button>
          </Container>
          <Container variant="elevated" padding="sm">
            <H4>Add Comment</H4>
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Enter your comment..."
              rows={4}
            />
            <Container variant="elevated" padding="sm">
              <Button onClick={() => setActiveCommentBox(null)} variant="secondary">
                Close
              </Button>
              <Button onClick={handleAddComment} disabled={!commentText.trim()} variant="primary">
                Add Comment
              </Button>
            </Container>
          </Container>
        </Container>
      )}

      {/* Comments List (Simple) */}
      {commentMode && comments.length > 0 && (
        <Container variant="elevated" padding="md">
          <H4>Comments ({comments.length})</H4>
          <Stack spacing="sm">
            {comments.map((comment) => (
              <Container key={comment.id} variant="elevated" padding="sm">
                <Span size="xs" color="muted">{comment.elementText}</Span>
                <Text>{comment.comment}</Text>
                <Button onClick={() => handleDeleteComment(comment.id)} variant="danger" size="sm">
                  Delete
                </Button>
              </Container>
            ))}
          </Stack>
        </Container>
      )}
    </>
  );
};

export default CommentSystem; 