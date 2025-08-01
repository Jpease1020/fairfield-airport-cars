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
    //console.log('🔧 AdminProvider - isAdmin state changed to:', isAdmin);
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
           
      // Enable admin mode if any condition is met
      if (adminMode === 'true' || localStorageAdmin === 'true' || isDev || isLocalhost) {
        setIsAdmin(true);
        setLocalStorageChecked(true);
        
        // Set localStorage for persistence in development
        if ((isDev || isLocalhost) && !localStorageAdmin) {
          localStorage.setItem('admin-mode', 'true');
        }
      } else {
        // In development, always enable admin mode
        if (isDev || isLocalhost) {
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
      return;
    }

    const unsub = onAuthStateChanged(auth, (user: User | null) => {
      
      // ALWAYS check localStorage first - if it's true, keep admin mode regardless of Firebase
      if (typeof window !== 'undefined') {
        const localStorageAdmin = localStorage.getItem('admin-mode');
        if (localStorageAdmin === 'true') {
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
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, [localStorageChecked]);

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