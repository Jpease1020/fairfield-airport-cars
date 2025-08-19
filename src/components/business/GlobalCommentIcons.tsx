'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Container, Stack, Button, Span, Text, Drawer, Select, Textarea, Modal } from '@/ui';
import { ChevronRight, AlertTriangle, X, MessageSquare, Edit, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { commentsService, type CommentRecord } from '@/lib/business/comments-service';
import { useCMSData } from '@/design/hooks/useCMSData';

const FloatingCommentBox = styled.div<{ $top: number; $left: number }>`
  position: fixed;
  top: ${({ $top }) => `${$top}px`};
  left: ${({ $left }) => `${$left}px`};
  z-index: 11050;
  transform: translate(8px, 8px);
`;

const CommentsDrawerHandle = styled(Container)`
  position: fixed;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  z-index: 11040;
  cursor: pointer;
  background: var(--background-card);
  border: 1px solid var(--border-color);
  border-left: none;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    left: 8px;
    box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
  }
`;

const RotatingChevron = styled(ChevronRight)<{ $isOpen: boolean }>`
  transform: ${({ $isOpen }) => $isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.2s ease;
`;

const FullWidthContainer = styled(Container)`
  width: 100%;
`;

const StyledTooltip = styled(Container)`
  transition: all 0.2s ease-in-out;
  opacity: 1;
  transform: translateY(0);
  
  &.tooltip-enter {
    opacity: 0;
    transform: translateY(5px);
  }
  
  &.tooltip-exit {
    opacity: 0;
    transform: translateY(5px);
  }
`;

const ClickableCommentButton = styled(Button)`
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    background-color: var(--background-hover);
  }
`;

const HighlightedCommentContainer = styled(FullWidthContainer)<{ $isSelected: boolean }>`
  border: ${({ $isSelected }) => $isSelected ? '2px solid var(--primary-500)' : 'none'};
  background-color: ${({ $isSelected }) => $isSelected ? 'var(--background-hover)' : 'transparent'};
  transition: all 0.2s ease;
`;

const DebugText = styled(Span)`
  font-family: monospace;
  font-size: 10px;
`;

interface GlobalCommentIconsProps {
  commentMode?: boolean;
}

export default function GlobalCommentIcons({ commentMode = false }: GlobalCommentIconsProps) {
  const { cmsData } = useCMSData();
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [commentAnchors, setCommentAnchors] = useState<Record<string, { top: number; left: number }>>({});
  const [hoveredCommentId, setHoveredCommentId] = useState<string | null>(null);
  const [orphanedComments, setOrphanedComments] = useState<CommentRecord[]>([]);
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);
  const [tooltipTimeout, setTooltipTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Comment management state
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ show: boolean; commentId: string | null }>({ show: false, commentId: null });
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

  // Load existing comments for this page
  useEffect(() => {
    const load = async () => {
      try {
        const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
        const existing = await commentsService.getComments({ pageUrl }); // Removed scope filter
        console.log('📊 Loaded comments:', existing);
        console.log('🆔 Comment IDs:', existing.map(c => ({ id: c.id, elementId: c.elementId, elementText: c.elementText })));
        setComments(existing);
      } catch {
        // Non-blocking; page still works without preloaded comments
      }
    };
    load();
  }, []);

  // Listen for new comments being added
  useEffect(() => {
    const handleCommentAdded = (e: Event) => {
      const customEvent = e as any;
      const { elementId, comment } = customEvent.detail;
      // Refresh comments to include the new one
      const load = async () => {
        try {
          const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
          const existing = await commentsService.getComments({ pageUrl }); // Removed scope filter
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

  // Cleanup tooltip timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
      }
    };
  }, [tooltipTimeout]);

  // Scroll to selected comment when drawer opens
  useEffect(() => {
    if (showCommentsDrawer && selectedCommentId) {
      // Small delay to ensure drawer is fully rendered
      const timer = setTimeout(() => {
        const commentElement = document.querySelector(`[data-comment-id="${selectedCommentId}"]`);
        if (commentElement) {
          commentElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [showCommentsDrawer, selectedCommentId]);

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
  if (!commentMode) return null;

  // Comment management functions
  const handleEditComment = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setEditingComment(commentId);
      setEditText(comment.comment);
    }
  };

  const handleSaveEdit = async (commentId: string) => {
    try {
      await commentsService.updateComment(commentId, { comment: editText });
      setEditingComment(null);
      setEditText('');
      // Refresh comments
      const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
      const existing = await commentsService.getComments({ pageUrl }); // Removed scope filter
      setComments(existing);
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  const handleDeleteComment = async (commentId: string) => {
    console.log('🗑️ Delete comment called for ID:', commentId);
    
    // Show custom confirmation modal instead of browser confirm
    setShowDeleteConfirm({ show: true, commentId });
  };

  const confirmDelete = async () => {
    const commentId = showDeleteConfirm.commentId;
    if (!commentId) return;
    
    console.log('✅ User confirmed deletion, proceeding...');
    
    try {
      console.log('📡 Calling commentsService.deleteComment...');
      await commentsService.deleteComment(commentId);
      console.log('✅ Comment deleted successfully from database');
      
      // Refresh comments
      const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
      console.log('🔄 Refreshing comments for page:', pageUrl);
      const existing = await commentsService.getComments({ pageUrl }); // Removed scope filter
      console.log('📊 Refreshed comments count:', existing.length);
      setComments(existing);
      
      // Success feedback via console instead of alert
      console.log('🎉 Comment deleted successfully!');
      
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
      // Error feedback via console instead of alert
      console.error('💥 Failed to delete comment. Check console for details.');
    } finally {
      // Close the confirmation modal
      setShowDeleteConfirm({ show: false, commentId: null });
    }
  };

  const cancelDelete = () => {
    console.log('❌ User cancelled deletion');
    setShowDeleteConfirm({ show: false, commentId: null });
  };

  const handleStatusChange = async (commentId: string, newStatus: CommentRecord['status']) => {
    setUpdatingStatus(commentId);
    try {
      await commentsService.updateComment(commentId, { status: newStatus });
      // Refresh comments
      const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '/';
      const existing = await commentsService.getComments({ pageUrl }); // Removed scope filter
      setComments(existing);
    } catch (error) {
      console.error('Error updating comment status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusIcon = (status: CommentRecord['status']) => {
    switch (status) {
      case 'open':
        return <AlertCircle size={16} />;
      case 'in-progress':
        return <Clock size={16} />;
      case 'resolved':
        return <CheckCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusDescription = (status: CommentRecord['status']) => {
    switch (status) {
      case 'open':
        return 'Needs attention';
      case 'in-progress':
        return 'Being worked on';
      case 'resolved':
        return 'Completed';
      default:
        return 'Unknown status';
    }
  };

  return (
    <>
      {/* Custom Delete Confirmation Modal */}
      <Modal 
        isOpen={showDeleteConfirm.show} 
        onClose={cancelDelete}
        size="sm"
        title="Delete Comment"
        footer={
          <Stack direction="horizontal" spacing="sm" justify="flex-end">
            <Button 
              variant="outline" 
              onClick={cancelDelete}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </Stack>
        }
      >
        <Text>
          Are you sure you want to delete this comment? This action cannot be undone.
        </Text>
      </Modal>

      {/* Comments drawer handle - small tab that sticks out from left edge */}
      {(comments.length > 0 || orphanedComments.length > 0) && (
        <CommentsDrawerHandle
          variant="default"
          padding="sm"
          data-admin-control="true"
          onClick={() => setShowCommentsDrawer(!showCommentsDrawer)}
        >
          <Stack direction="horizontal" align="center" spacing="sm">
            <RotatingChevron 
              size={16} 
              $isOpen={showCommentsDrawer}
            />
            <Span size="xs" weight="semibold">
              {comments.length + orphanedComments.length}
            </Span>
          </Stack>
        </CommentsDrawerHandle>
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
              onMouseEnter={() => {
                // Clear any existing timeout
                if (tooltipTimeout) {
                  clearTimeout(tooltipTimeout);
                }
                // Set a small delay before showing tooltip
                const timeout = setTimeout(() => setHoveredCommentId(id), 300);
                setTooltipTimeout(timeout);
              }}
              onMouseLeave={() => {
                // Clear timeout and hide tooltip immediately
                if (tooltipTimeout) {
                  clearTimeout(tooltipTimeout);
                  setTooltipTimeout(null);
                }
                setHoveredCommentId((curr) => (curr === id ? null : curr));
              }}
              onClick={() => {
                // Open the comments drawer when icon is clicked
                setShowCommentsDrawer(true);
                // Set this comment as selected for highlighting
                setSelectedCommentId(id);
                // Hide tooltip when clicking
                setHoveredCommentId(null);
                if (tooltipTimeout) {
                  clearTimeout(tooltipTimeout);
                  setTooltipTimeout(null);
                }
              }}
            >
              <Stack direction="horizontal" spacing="none">
                <ClickableCommentButton 
                  variant="ghost" 
                  size="sm" 
                  data-comment-id={id}
                >
                  <MessageSquare size={14} />
                </ClickableCommentButton>
              </Stack>
            </Container>
          </FloatingCommentBox>
          {hoveredCommentId === id && (
            <FloatingCommentBox $top={commentAnchors[id].top - 10} $left={commentAnchors[id].left + 30}>
              <StyledTooltip variant="tooltip" padding="md" role="tooltip">
                <Stack spacing="sm" align="flex-start">
                  <Span size="xs" color="muted" weight="medium">
                    {comments.find(c => c.id === id)?.elementText || 'Comment'}
                  </Span>
                  <Text size="sm" weight="medium">
                    {comments.find(c => c.id === id)?.comment || 'No comment text'}
                  </Text>
                  <Span size="xs" color="muted">
                    Status: {comments.find(c => c.id === id)?.status || 'unknown'}
                  </Span>
                </Stack>
              </StyledTooltip>
            </FloatingCommentBox>
          )}
        </Container>
      ))}

                            {/* Comments Drawer - shows all comments and orphaned comments */}
        <Drawer
          isOpen={showCommentsDrawer}
          onClose={() => {
            setShowCommentsDrawer(false);
            setSelectedCommentId(null); // Clear selection when drawer closes
          }}
          title="Page Comments"
          position="left"
          width={500}
          headerVariant="minimal"
          headerMargin="none"
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
                <Stack spacing="lg" align="stretch">
          {/* Active Comments */}
          {comments.length > 0 && (
            <FullWidthContainer variant="elevated" padding="md">
              <Stack spacing="sm" align="flex-start">
                <Span size="sm" weight="semibold">Active Comments ({comments.length})</Span>
                {comments.map((comment) => (
                  <HighlightedCommentContainer 
                    key={comment.id} 
                    $isSelected={selectedCommentId === comment.id} 
                    padding="md"
                  >
                    <Stack spacing="md" align="flex-start">
                      {/* Comment Header */}
                      <Stack direction="horizontal" align="center" justify="space-between" spacing="sm">
                        <Stack direction="horizontal" align="center" spacing="sm">
                          {getStatusIcon(comment.status)}
                          <Span size="sm" weight="medium">{comment.elementText}</Span>
                        </Stack>
                        <Stack direction="horizontal" spacing="xs">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditComment(comment.id)}
                            disabled={editingComment === comment.id}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </Stack>
                      </Stack>

                      {/* Comment Content */}
                      {editingComment === comment.id ? (
                        <Stack spacing="sm" align="stretch">
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            placeholder="Edit comment..."
                            rows={3}
                          />
                          <Stack direction="horizontal" spacing="sm">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(comment.id)}
                              disabled={!editText.trim()}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                          </Stack>
                        </Stack>
                      ) : (
                        <Text size="sm">{comment.comment}</Text>
                      )}

                      {/* Comment Metadata */}
                      <Stack spacing="xs" align="flex-start">
                        <Span size="xs" color="muted">
                          Created: {new Date(comment.createdAt).toLocaleDateString()}
                        </Span>
                        <Span size="xs" color="muted">
                          Author: {comment.createdBy}
                        </Span>
                        {/* Debug: Show actual IDs */}
                        <DebugText color="secondary">
                          Firebase ID: {comment.id}
                        </DebugText>
                        <DebugText color="secondary">
                          Element ID: {comment.elementId}
                        </DebugText>
                      </Stack>

                      {/* Status Management */}
                      <Stack spacing="sm" align="flex-start">
                        <Span size="xs" weight="medium">Status:</Span>
                        <Stack direction="horizontal" align="center" spacing="sm">
                          <Select
                            value={comment.status}
                            onChange={(e) => handleStatusChange(comment.id, e.target.value as CommentRecord['status'])}
                            disabled={updatingStatus === comment.id}
                            options={[
                              { value: 'open', label: 'Open' },
                              { value: 'in-progress', label: 'In Progress' },
                              { value: 'resolved', label: 'Resolved' }
                            ]}
                          />
                          <Span size="xs" color="muted">
                            {getStatusDescription(comment.status)}
                          </Span>
                        </Stack>
                      </Stack>
                    </Stack>
                  </HighlightedCommentContainer>
                ))}
              </Stack>
            </FullWidthContainer>
          )}
          
          {/* Orphaned Comments */}
          {orphanedComments.length > 0 && (
            <FullWidthContainer variant="elevated" padding="md">
              <Stack spacing="sm" align="flex-start">
                <Stack direction="horizontal" align="flex-start" spacing="sm">
                  <AlertTriangle size={16} color="orange" />
                  <Span size="sm" weight="semibold">Orphaned Comments ({orphanedComments.length})</Span>
                </Stack>
                <Text size="xs" color="muted">
                  These comments are for elements that can no longer be found on this page.
                </Text>
                {orphanedComments.map((comment) => (
                  <FullWidthContainer key={comment.id} variant="default" padding="sm">
                    <Stack spacing="xs" align="flex-start">
                      <Span size="sm" weight="medium">{comment.elementText}</Span>
                      <Text size="sm">{comment.comment}</Text>
                      <Span size="xs" color="muted">
                        Created: {new Date(comment.createdAt).toLocaleDateString()}
                      </Span>
                      <Stack direction="horizontal" spacing="xs">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </Stack>
                    </Stack>
                  </FullWidthContainer>
                ))}
              </Stack>
            </FullWidthContainer>
          )}
        </Stack>
       </Drawer>
    </>
  );
}
