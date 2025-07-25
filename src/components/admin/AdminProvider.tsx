'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/utils/firebase';

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
  const [localStorageChecked, setLocalStorageChecked] = useState(false);

  // Log state changes
  useEffect(() => {
    console.log('🔧 AdminProvider - isAdmin state changed to:', isAdmin);
  }, [isAdmin]);

  // Check for admin mode in localStorage and URL params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for admin mode in URL params
      const urlParams = new URLSearchParams(window.location.search);
      const adminMode = urlParams.get('admin');
      
      // Check for admin mode in localStorage
      const localStorageAdmin = localStorage.getItem('admin-mode');
      
      // Check if we're in development mode
      const isDev = process.env.NODE_ENV === 'development';
      
      // Also check if we're on localhost (fallback for development)
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.includes('localhost');
      
      console.log('🔧 AdminProvider - Initial check:', {
        adminMode,
        localStorageAdmin,
        isDev,
        isLocalhost,
        NODE_ENV: process.env.NODE_ENV
      });
      
      // Enable admin mode if any condition is met
      if (adminMode === 'true' || localStorageAdmin === 'true' || isDev || isLocalhost) {
        console.log('🔧 AdminProvider - Admin mode enabled for testing');
        setIsAdmin(true);
        setLocalStorageChecked(true);
        
        // Set localStorage for persistence in development
        if ((isDev || isLocalhost) && !localStorageAdmin) {
          console.log('🔧 AdminProvider - Setting localStorage for development');
          localStorage.setItem('admin-mode', 'true');
        }
      } else {
        // In development, always enable admin mode
        if (isDev || isLocalhost) {
          console.log('🔧 AdminProvider - Enabling admin mode for development');
          setIsAdmin(true);
          localStorage.setItem('admin-mode', 'true');
        }
        setLocalStorageChecked(true);
      }
    }
  }, []);

  // Listen for localStorage changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'admin-mode') {
          console.log('🔧 AdminProvider - localStorage admin-mode changed:', e.newValue);
          if (e.newValue === 'true') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  // Admin detection from Firebase auth (only if not already admin from localStorage)
  useEffect(() => {
    // Don't run Firebase auth check if we haven't checked localStorage yet
    if (!localStorageChecked) {
      console.log('🔧 AdminProvider - Skipping Firebase auth check, localStorage not checked yet');
      return;
    }

    const unsub = onAuthStateChanged(auth, (user: User | null) => {
      console.log('🔍 AdminProvider - Auth state changed:', user?.email);
      
      // ALWAYS check localStorage first - if it's true, keep admin mode regardless of Firebase
      if (typeof window !== 'undefined') {
        const localStorageAdmin = localStorage.getItem('admin-mode');
        if (localStorageAdmin === 'true') {
          console.log('🔧 AdminProvider - Keeping admin mode from localStorage (Firebase auth ignored)');
          setIsAdmin(true);
          return; // Exit early - don't let Firebase override this
        }
      }
      
      // Only check Firebase auth if localStorage is not 'true'
      if (user && (
        user.email === 'justin@fairfieldairportcar.com' || 
        user.email === 'gregg@fairfieldairportcar.com' ||
        user.email === 'justinpease@gmail.com'
      )) {
        console.log('✅ AdminProvider - User is admin via Firebase:', user.email);
        setIsAdmin(true);
      } else {
        console.log('❌ AdminProvider - User is not admin via Firebase:', user?.email);
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, [localStorageChecked]);

  // Handle comment mode toggle
  const toggleCommentMode = () => {
    const newMode = !commentMode;
    
    console.log('🔄 AdminProvider - Toggling comment mode:', { current: commentMode, new: newMode, editMode });
    
    // If turning on comment mode, turn off edit mode
    if (newMode && editMode) {
      console.log('🔄 AdminProvider - Disabling edit mode due to comment mode activation');
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
    
    console.log('🔄 AdminProvider - Toggling edit mode:', { current: editMode, new: newMode, commentMode });
    
    // If turning on edit mode, turn off comment mode
    if (newMode && commentMode) {
      console.log('🔄 AdminProvider - Disabling comment mode due to edit mode activation');
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