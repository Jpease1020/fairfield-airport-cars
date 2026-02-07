'use client';

import React from 'react';
import InlineTextEditor from '@/components/business/InlineTextEditor';
import { ModeToggleMenu } from '@/design/components/business/ModeToggleMenu';
import { useAdmin } from '@/design/providers/AdminProvider';
import { useEditMode } from '@/design/providers/InteractionModeProvider';

interface AppContentProps {
  children: React.ReactNode;
  cmsData?: any;
}

export function AppContent({ children }: AppContentProps) {
  const { isAdmin } = useAdmin();
  const { editMode } = useEditMode();

  return (
    <>
      {children}

      {/* Inline CMS Text Editor (edit mode only) */}
      {isAdmin && <InlineTextEditor editMode={editMode} />}

      {/* Admin Mode Toggle Menu (admin only) */}
      {isAdmin && <ModeToggleMenu />}
    </>
  );
}
