'use client';

import { ReactNode, useState } from 'react';

interface CommentableSectionProps {
  children: ReactNode;
  sectionId: string;
  sectionTitle: string;
  className?: string;
  showCommentIcon?: boolean;
}

const CommentableSection = ({ 
  children, 
  sectionId, 
  sectionTitle, 
  className = ''
}: CommentableSectionProps) => {
  // Disabled old commenting system - using new Confluence-style system instead
  const [hasComment] = useState(false);

  return (
    <div 
      className={`commentable-section ${className}`}
      data-section-id={sectionId}
      data-section-title={sectionTitle}
    >
      {children}
      
      {/* Comment indicator (shows when comment exists) */}
      {hasComment && (
        <div className="absolute top-2 right-2 z-50">
          <div 
            className="bg-warning text-text-inverse text-xs px-2 py-1 rounded-full shadow-lg cursor-pointer hover:bg-warning-hover transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // Using new Confluence-style commenting system instead
            }}
            title="Click to view comment"
          >
            💬
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentableSection; 