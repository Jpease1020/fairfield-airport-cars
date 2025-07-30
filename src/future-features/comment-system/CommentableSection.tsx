'use client';

import { ReactNode, useState } from 'react';
import { Container } from '@/components/ui';

interface CommentableSectionProps {
  children: ReactNode;
  sectionId: string;
  sectionTitle: string;
  showCommentIcon?: boolean;
}

const CommentableSection = ({ 
  children, 
  sectionId, 
  sectionTitle
}: CommentableSectionProps) => {
  // Disabled old commenting system - using new Confluence-style system instead
  const [hasComment] = useState(false);

  return (
    <Container
      data-section-id={sectionId}
      data-section-title={sectionTitle}
    >
      {children}
      
      {/* Comment indicator (shows when comment exists) */}
      {hasComment && (
        <Container>
          💬
        </Container>
      )}
    </Container>
  );
};

export default CommentableSection; 