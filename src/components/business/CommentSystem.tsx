'use client';

import { useState, useEffect, ReactNode, useCallback } from 'react';
import { X } from 'lucide-react';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { Container, H4, Span } from '@/ui';
import { Stack, Text } from '@/ui';
import { Button } from '@/ui';
import { Textarea } from '@/ui';
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

  const handleAddComment = useCallback(() => {
    if (!commentText.trim() || !selectedElement) return;

    const elementId = `comment-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const elementText = selectedElement.textContent?.trim() || selectedElement.tagName.toLowerCase();
    
    const newComment: LocalComment = {
      id: elementId,
      elementText,
      comment: commentText.trim(),
      createdAt: new Date()
    };

    setComments(prev => [...prev, newComment]);
    setActiveCommentBox(null);
    setSelectedElement(null);
    setCommentText('');
  }, [commentText, selectedElement]);

  const handleDeleteComment = useCallback((commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
  }, []);

  // Don't render if not admin
  if (!isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      {/* Simple Comment Mode Toggle Button */}
      <div className="fixed bottom-5 right-5 z-50">
        <Container
          variant="elevated"
          padding="md"
        >
          <Button
            onClick={() => setCommentMode(!commentMode)}
            variant={commentMode ? 'primary' : 'secondary'}
          >
            {commentMode ? '✓' : '○'} Comments
          </Button>
        </Container>
      </div>

      {/* Comment Box */}
      {activeCommentBox && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-lg max-h-[80vh] overflow-auto">
          <Container
            data-comment-box
            variant="elevated"
            padding="lg"
          >
            <Container variant="elevated" padding="sm">
              <H4>
                {/* {getCMSField(cmsData, 'simpleCommentSystem.commentsHeading', 'Add Comment')} */}
                Add Comment
              </H4>
              <Button
                onClick={() => setActiveCommentBox(null)}
                variant="ghost"
              >
                <X />
              </Button>
            </Container>

            {/* Add New Comment */}
            <Container variant="elevated" padding="sm">
              <H4>
                {/* {getCMSField(cmsData, 'simpleCommentSystem.addCommentHeading', 'Add Comment')} */}
                Add Comment
              </H4>
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Enter your comment..."
                rows={4}
              />
              <Container variant="elevated" padding="sm">
                <Button
                  onClick={() => setActiveCommentBox(null)}
                  variant="secondary"
                >
                  {/* {getCMSField(cmsData, 'simpleCommentSystem.closeButton', 'Close')} */}
                Close
                </Button>
                <Button
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  variant="primary"
                >
                  {/* {getCMSField(cmsData, 'simpleCommentSystem.addCommentButton', 'Add Comment')} */}
                Add Comment
                </Button>
              </Container>
            </Container>
          </Container>
        </div>
      )}

      {/* Comments List (Simple) */}
      {commentMode && comments.length > 0 && (
        <div className="fixed top-5 right-5 z-40 max-w-sm max-h-[60vh] overflow-auto">
          <Container variant="elevated" padding="md">
            <H4>Comments ({comments.length})</H4>
            <Stack spacing="sm">
              {comments.map((comment) => (
                <Container key={comment.id} variant="elevated" padding="sm">
                  <Span size="xs" color="muted">
                    {comment.elementText}
                  </Span>
                  <Text>{comment.comment}</Text>
                  <Button
                    onClick={() => handleDeleteComment(comment.id)}
                    variant="danger"
                    size="sm"
                  >
                    Delete
                  </Button>
                </Container>
              ))}
            </Stack>
          </Container>
        </div>
      )}
    </>
  );
};

export default CommentSystem; 