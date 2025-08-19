'use client';

import React from 'react';
import { Container, AdminHamburger } from '@/ui';
import InlineTextEditor from '@/components/business/InlineTextEditor';
import GlobalCommentModal from '@/components/business/GlobalCommentModal';
import GlobalCommentIcons from '@/components/business/GlobalCommentIcons';
import { useAdmin } from '@/design/providers/AdminProvider';
import { useEditMode } from '@/design/providers/InteractionModeProvider';

interface AppContentProps {
  children: React.ReactNode;
}

export function AppContent({ children }: AppContentProps) {
  const { isAdmin } = useAdmin();
  const { editMode, commentMode } = useEditMode();

  return (
    <>
      <Container as="main" maxWidth="full" data-testid="layout-main-content" padding="none"> 
        {children}
      </Container>
      
      {/* Inline CMS Text Editor (edit mode only) */}
      <InlineTextEditor isAdmin={isAdmin} editMode={editMode} />

      {/* Global Comment Modal (comment mode only) */}
      <GlobalCommentModal isAdmin={isAdmin} commentMode={commentMode} />

      {/* Global Comment Icons (comment mode only) */}
      <GlobalCommentIcons isAdmin={isAdmin} commentMode={commentMode} />

      <AdminHamburger />
    </>
  );
}
