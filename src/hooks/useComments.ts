'use client';

import { useState, useEffect } from 'react';

export interface Comment {
  id: string;
  text: string;
  x: number;
  y: number;
  createdAt: Date;
}

export function useComments(pageId: string) {
  const [comments, setComments] = useState<Comment[]>([]);

  // Load comments from localStorage on mount
  useEffect(() => {
    const savedComments = localStorage.getItem(`comments-${pageId}`);
    if (savedComments) {
      try {
        const parsed = JSON.parse(savedComments);
        // Convert date strings back to Date objects
        const commentsWithDates = parsed.map((comment: any) => ({
          ...comment,
          createdAt: new Date(comment.createdAt)
        }));
        setComments(commentsWithDates);
      } catch (error) {
        console.error('Failed to load comments:', error);
      }
    }
  }, [pageId]);

  // Save comments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(`comments-${pageId}`, JSON.stringify(comments));
  }, [comments, pageId]);

  const addComment = (comment: Comment) => {
    setComments(prev => [...prev, comment]);
  };

  const updateComment = (id: string, updates: Partial<Comment>) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteComment = (id: string) => {
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const clearAllComments = () => {
    setComments([]);
  };

  return {
    comments,
    addComment,
    updateComment,
    deleteComment,
    clearAllComments,
    setComments
  };
} 