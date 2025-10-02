'use client';

import React from 'react';
import InlineTextEditor from '@/components/business/InlineTextEditor';
import GlobalCommentModal from '@/components/business/GlobalCommentModal';
import GlobalCommentIcons from '@/components/business/GlobalCommentIcons';
import { ModeToggleMenu } from '@/design/components/business/ModeToggleMenu';
import { useAdmin } from '@/design/providers/AdminProvider';
import { useEditMode } from '@/design/providers/InteractionModeProvider';

interface AppContentProps {
  children: React.ReactNode;
  cmsData?: any;
}

export function AppContent({ children }: AppContentProps) {
  const { isAdmin } = useAdmin();
  const { editMode, commentMode } = useEditMode();

  return (
    <>
      {children}
      
      {/* Inline CMS Text Editor (edit mode only) */}
      {isAdmin && <InlineTextEditor editMode={editMode} />}

      {/* Global Comment Modal (comment mode only) */}
      {isAdmin && <GlobalCommentModal commentMode={commentMode} />}

      {/* Global Comment Icons (comment mode only) */}
      {isAdmin && <GlobalCommentIcons commentMode={commentMode} />}

      {/* Admin Mode Toggle Menu (admin only) */}
      {isAdmin && <ModeToggleMenu />}
    </>
  );
}
