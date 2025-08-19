'use client';

import React from 'react';
import { Container, AdminHamburger } from '@/ui';
import InlineTextEditor from '@/components/business/InlineTextEditor';
import GlobalCommentModal from '@/components/business/GlobalCommentModal';
import GlobalCommentIcons from '@/components/business/GlobalCommentIcons';
import { useAdmin } from '@/design/providers/AdminProvider';
import { useEditMode } from '@/design/providers/InteractionModeProvider';
import { useAuth } from '@/hooks/useAuth';

interface AppContentProps {
  children: React.ReactNode;
}

export function AppContent({ children }: AppContentProps) {
  const { isAdmin } = useAdmin();
  const { editMode, commentMode, toggleEditMode, toggleCommentMode } = useEditMode();
  const { user } = useAuth();

  return (
    <>
      <Container as="main" maxWidth="full" data-testid="layout-main-content" padding="none"> 
        {children}
      </Container>
      
      {/* Inline CMS Text Editor (edit mode only) */}
      {isAdmin && <InlineTextEditor editMode={editMode} />}

      {/* Global Comment Modal (comment mode only) */}
      {isAdmin && <GlobalCommentModal commentMode={commentMode} />}

      {/* Global Comment Icons (comment mode only) */}
      {isAdmin && <GlobalCommentIcons commentMode={commentMode} />}

      {/* Admin Hamburger - only for admin users */}
      {isAdmin && (
        <AdminHamburger
          editMode={editMode}
          commentMode={commentMode}
          onToggleEditMode={toggleEditMode}
          onToggleCommentMode={toggleCommentMode}
        />
      )}
    </>
  );
}
