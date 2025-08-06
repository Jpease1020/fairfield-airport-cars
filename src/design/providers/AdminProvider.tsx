'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/utils/firebase';

interface AdminContextType {
  isAdmin: boolean;
  editMode: boolean;
  commentMode: boolean;
  setEditMode: (mode: boolean) => void;
  setCommentMode: (mode: boolean) => void;
  toggleEditMode: () => void;
  toggleCommentMode: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [commentMode, setCommentMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user has admin role in Firestore
  const checkAdminRole = async (user: User) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.role === 'admin' || 
               (userData.permissions && userData.permissions.includes('admin'));
      }
      return false;
    } catch (error) {
      // Error checking admin role - handled silently for security
      return false;
    }
  };

  // Admin detection from Firebase auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        // Check if user has admin role in Firestore
        const hasAdminRole = await checkAdminRole(user);
        setIsAdmin(hasAdminRole);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    
    return () => unsub();
  }, []);

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

  const value: AdminContextType = {
    isAdmin,
    editMode,
    commentMode,
    setEditMode,
    setCommentMode,
    toggleEditMode,
    toggleCommentMode,
  };

  // Show loading state while checking admin status
  if (loading) {
    return (
      <AdminContext.Provider value={value}>
        {children}
      </AdminContext.Provider>
    );
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}; 