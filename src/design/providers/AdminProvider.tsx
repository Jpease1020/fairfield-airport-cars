'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/utils/firebase';

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
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

  const value: AdminContextType = {
    isAdmin,
    loading,
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