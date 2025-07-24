'use client';

import React from 'react';
import DraggableCommentSystem from './DraggableCommentSystem';
import { useComments } from '@/hooks/useComments';

interface CommentWrapperProps {
  children: React.ReactNode;
  pageId?: string;
}

export default function CommentWrapper({ children, pageId = 'global' }: CommentWrapperProps) {
  const { comments, setComments } = useComments(pageId);
  
  return (
    <>
      {children}
      <DraggableCommentSystem 
        comments={comments} 
        onCommentsChange={setComments} 
      />
    </>
  );
} 