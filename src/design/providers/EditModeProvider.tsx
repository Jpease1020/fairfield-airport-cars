'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EditModeContextType {
  editMode: boolean;
  commentMode: boolean;
  setEditMode: (mode: boolean) => void;
  setCommentMode: (mode: boolean) => void;
  toggleEditMode: () => void;
  toggleCommentMode: () => void;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

interface EditModeProviderProps {
  children: ReactNode;
}

export const EditModeProvider: React.FC<EditModeProviderProps> = ({ children }) => {
  const [editMode, setEditMode] = useState(false);
  const [commentMode, setCommentMode] = useState(false);

  // Handle comment mode toggle
  const toggleCommentMode = () => {
    const newMode = !commentMode;
    
    // If turning on comment mode, turn off edit mode
    if (newMode && editMode) {
      setEditMode(false);
    }
    
    setCommentMode(newMode);
    
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
  };

  const value: EditModeContextType = {
    editMode,
    commentMode,
    setEditMode,
    setCommentMode,
    toggleEditMode,
    toggleCommentMode,
  };

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditMode = (): EditModeContextType => {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    throw new Error('useEditMode must be used within an EditModeProvider');
  }
  return context;
}; 