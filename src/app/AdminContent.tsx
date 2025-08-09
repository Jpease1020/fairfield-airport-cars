'use client';

import React from 'react';
import { AccessibilityEnhancer, Container, FloatingEditButton } from '@/ui';
import { PageEditorDrawer } from '@/components/app/PageEditorDrawer';
import { CommentsDrawer } from '@/components/app/CommentsDrawer';
import { CommentSystem } from '../components/business';
import { commentsService } from '@/lib/business/comments-service';
import { useAdmin } from '@/design/providers/AdminProvider';
import { useEditMode } from '@/design/providers/EditModeProvider';
import { useAuth } from '@/hooks/useAuth';
import styled from 'styled-components';

// Visual overlay; does NOT block pointer events
const AdminOverlay = styled.div<{ $isActive: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ $isActive }) => $isActive ? 'rgba(0, 0, 0, 0.1)' : 'transparent'};
  pointer-events: none;
  z-index: 9999;
  transition: background 0.2s ease;
`;

// Guard that disables most interactions in app content while allowing editable/admin controls
const AdminInteractionGuard = styled.div<{ $isActive: boolean }>`
  ${({ $isActive }) => $isActive && `
    input, select, textarea, button, a, [role="button"], [role="radio"], [role="checkbox"] {
      pointer-events: none !important;
    }

    /* Explicit allow-list for admin controls and their descendants */
    [data-admin-control="true"],
    [data-admin-control="true"] *,
    [data-editable="true"],
    [contenteditable="true"],
    [data-testid="floating-edit-button"],
    .floating-edit-button,
    .floating-edit-button * {
      pointer-events: auto !important;
    }
  `}
`;

const CommentsHandle = styled.button<{ $isOpen: boolean }>`
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  background: var(--background-card);
  border: 1px solid var(--border-color);
  border-right: none;
  padding: 8px 6px;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  z-index: 11020;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 64px;
`;

interface AdminContentProps {
  children: React.ReactNode;
}

export function AdminContent({ children }: AdminContentProps) {
  const { isAdmin } = useAdmin();
  const { editMode, commentMode, toggleEditMode, toggleCommentMode, setEditMode } = useEditMode() as any;
  const { user } = useAuth();

  const isAdminModeActive = editMode || commentMode;
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = React.useState(false);
  const [hasComments, setHasComments] = React.useState(false);

  const closeEditor = React.useCallback(() => {
    setIsEditorOpen(false);
    // Ensure edit mode is turned off when closing the drawer
    setEditMode?.(false);
  }, [setEditMode]);

  // Load comment summary to decide if we show the handle
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const summary = await commentsService.getCommentSummary();
        if (mounted) setHasComments(summary.total > 0);
      } catch {
        if (mounted) setHasComments(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <AdminOverlay $isActive={isAdminModeActive} />
      <AccessibilityEnhancer>
        <CommentSystem>
          <AdminInteractionGuard $isActive={isAdminModeActive}>
            <Container as="main" maxWidth="full" data-testid="layout-main-content" padding="none"> 
              {children}
            </Container>
          </AdminInteractionGuard>
        </CommentSystem>
      </AccessibilityEnhancer>

      {/* Comments toggle handle */}
      {isAdmin && (hasComments || commentMode) && (
        <CommentsHandle
          aria-label="Toggle comments drawer"
          onClick={() => setIsCommentsOpen((v) => !v)}
          $isOpen={isCommentsOpen}
          data-admin-control="true"
        >
          {isCommentsOpen ? '›' : '‹'}
        </CommentsHandle>
      )}
      
      <FloatingEditButton
        isAdmin={isAdmin}
        isAuthenticated={!!user}
        editMode={editMode}
        commentMode={commentMode}
        onToggleEditMode={toggleEditMode}
        onToggleCommentMode={toggleCommentMode}
      />
      {/* Admin-only content editor drawer */}
      {isAdmin && !!user && (
        <PageEditorDrawer isOpen={isEditorOpen || editMode} onClose={closeEditor} />
      )}
      {/* Admin-only comments drawer */}
      {isAdmin && !!user && (
        <CommentsDrawer isOpen={isCommentsOpen} onClose={() => setIsCommentsOpen(false)} />
      )}
    </>
  );
}