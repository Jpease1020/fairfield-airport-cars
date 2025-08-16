'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type InteractionMode = 'edit' | 'comment' | null;

interface InteractionContextType {
  mode: InteractionMode;
  setMode: (mode: InteractionMode | null) => void;
  isActive: boolean;
  editMode: boolean;
  commentMode: boolean;
  setEditMode: (mode: boolean) => void;
  setCommentMode: (mode: boolean) => void;
  toggleEditMode: () => void;
  toggleCommentMode: () => void;
}

const InteractionContext = createContext<InteractionContextType | undefined>(undefined);

interface InteractionModeProviderProps {
  children: ReactNode;
}

export function InteractionModeProvider({ children }: InteractionModeProviderProps) {
  const [mode, setMode] = useState<InteractionMode>(null);
  const [editMode, setEditMode] = useState(false);
  const [commentMode, setCommentMode] = useState(false);

  const isActive = mode !== null;

  // Handle comment mode toggle
  const toggleCommentMode = () => {
    const newMode = !commentMode;
    
    // If turning on comment mode, turn off edit mode
    if (newMode && editMode) {
      setEditMode(false);
      setMode(null);
    }
    
    setCommentMode(newMode);
    setMode(newMode ? 'comment' : null);
    
    if (newMode) {
      document.body.classList.add('comment-mode-active');
    } else {
      document.body.classList.remove('comment-mode-active');
    }
  };

  const toggleEditMode = () => {
    const newMode = !editMode;  
    // If turning on edit mode, turn off comment mode
    if (newMode && commentMode) {
      setCommentMode(false);
      document.body.classList.remove('comment-mode-active');
    }
    
    setEditMode(newMode);
    setMode(newMode ? 'edit' : null);
  };

  const value: InteractionContextType = {
    mode,
    setMode,
    isActive,
    editMode,
    commentMode,
    setEditMode,
    setCommentMode,
    toggleEditMode,
    toggleCommentMode,
  };

  return (
    <InteractionContext.Provider value={value}>
      {children}
    </InteractionContext.Provider>
  );
}

export function useInteractionMode() {
  const context = useContext(InteractionContext);
  if (context === undefined) {
    throw new Error('useInteractionMode must be used within an InteractionModeProvider');
  }
  return context;
}

// Backward compatibility hook alias
export const useEditMode = useInteractionMode;
