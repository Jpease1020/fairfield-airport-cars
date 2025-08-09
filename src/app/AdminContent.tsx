'use client';

import React from 'react';
import { AccessibilityEnhancer, Container, FloatingEditButton } from '@/ui';
import { PageEditorDrawer } from '@/components/app/PageEditorDrawer';
import { CommentSystem } from '../components/business';
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

interface AdminContentProps {
  children: React.ReactNode;
}

export function AdminContent({ children }: AdminContentProps) {
  const { isAdmin } = useAdmin();
  const { editMode, commentMode, toggleEditMode, toggleCommentMode, setEditMode } = useEditMode() as any;
  const { user } = useAuth();

  const isAdminModeActive = editMode || commentMode;
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);

  const closeEditor = React.useCallback(() => {
    setIsEditorOpen(false);
    // Ensure edit mode is turned off when closing the drawer
    setEditMode?.(false);
  }, [setEditMode]);

  return (
    <>
      <AdminOverlay $isActive={isAdminModeActive} />
      <AccessibilityEnhancer>
        <CommentSystem>
          <AdminInteractionGuard $isActive={isAdminModeActive}>
            <Container as="main" maxWidth="full" data-testid="layout-main-content">
              {children}
            </Container>
          </AdminInteractionGuard>
        </CommentSystem>
      </AccessibilityEnhancer>
      
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
    </>
  );
}